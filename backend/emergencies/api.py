"""Emergency broadcast endpoints (screen 2.3 + admin triage 3.2).

MOCK (Phase 1): SMS/WhatsApp fan-out writes BroadcastDispatch rows and logs
to the console. No real Twilio/WhatsApp calls. Claim updates are delivered
by clients polling GET /api/emergencies/{id}."""
from typing import Optional

from django.db import transaction
from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import ProProfile, User
from common import notify
from common.permissions import require_homeowner, require_pro
from emergencies.models import BroadcastDispatch, EmergencyBroadcast
from leads.models import Lead, Message
from nodes.models import Node

router = Router(tags=["emergencies"], auth=jwt_auth)

KINDS = [c[0] for c in EmergencyBroadcast.Kind.choices]


class ErrorOut(Schema):
    detail: str


class BroadcastIn(Schema):
    kind: str
    description: str
    address: str
    zip: str = ""
    budget_ceiling: float


class DispatchOut(Schema):
    id: int
    pro_id: int
    pro_name: str
    pro_trade: str
    channel: str
    status: str
    created_at: str


class BroadcastOut(Schema):
    id: int
    kind: str
    description: str
    address: str
    zip: str
    budget_ceiling: float
    status: str
    created_at: str
    claimed_by_id: Optional[int]
    claimed_by_name: Optional[str]
    claimed_at: Optional[str]
    lead_id: Optional[int]
    dispatches: list[DispatchOut]


def serialize_broadcast(broadcast: EmergencyBroadcast) -> dict:
    return {
        "id": broadcast.id,
        "kind": broadcast.kind,
        "description": broadcast.description,
        "address": broadcast.address,
        "zip": broadcast.zip,
        "budget_ceiling": float(broadcast.budget_ceiling),
        "status": broadcast.status,
        "created_at": broadcast.created_at.isoformat(),
        "claimed_by_id": broadcast.claimed_by_id,
        "claimed_by_name": (
            broadcast.claimed_by.display_name if broadcast.claimed_by else None
        ),
        "claimed_at": (
            broadcast.claimed_at.isoformat() if broadcast.claimed_at else None
        ),
        "lead_id": broadcast.lead_id,
        "dispatches": [
            {
                "id": d.id,
                "pro_id": d.pro_id,
                "pro_name": d.pro.display_name,
                "pro_trade": d.pro.primary_trade,
                "channel": d.channel,
                "status": d.status,
                "created_at": d.created_at.isoformat(),
            }
            for d in broadcast.dispatches.select_related("pro", "pro__user")
        ],
    }


def eligible_pros(node: Node, zip_code: str = ""):
    """Pros in the node, not suspended; ZIP filter is best-effort (explicit
    list match), radial pros are always included (no geo lookup in MVP)."""
    pros = ProProfile.objects.filter(
        user__node=node, is_suspended=False
    ).select_related("user")
    if zip_code:
        matched = [
            p
            for p in pros
            if p.service_mode == ProProfile.ServiceMode.RADIAL
            or not p.service_zips
            or zip_code in p.service_zips
            or p.base_zip == zip_code
        ]
        return matched
    return list(pros)


def dispatch_broadcast(broadcast: EmergencyBroadcast) -> list[BroadcastDispatch]:
    """Mock fan-out over SMS + WhatsApp to eligible pros."""
    body = (
        f"EMERGENCY ({broadcast.kind}): {broadcast.description[:80]} "
        f"near {broadcast.address} - budget up to ${broadcast.budget_ceiling}"
    )
    dispatches = []
    for pro in eligible_pros(broadcast.node, broadcast.zip):
        for channel in (
            BroadcastDispatch.Channel.SMS,
            BroadcastDispatch.Channel.WHATSAPP,
        ):
            dispatches.append(
                BroadcastDispatch.objects.create(
                    broadcast=broadcast, pro=pro, channel=channel
                )
            )
        notify.send_sms(pro.user.phone or "", body)
        notify.send_whatsapp(pro.user.phone or "", body)
    return dispatches


@router.post("", response={201: BroadcastOut, 400: ErrorOut})
def create_broadcast(request, payload: BroadcastIn):
    homeowner_profile = require_homeowner(request)
    if payload.kind not in KINDS:
        return 400, {"detail": f"kind must be one of {KINDS}"}
    if not 50 <= payload.budget_ceiling <= 1000:
        return 400, {"detail": "budget_ceiling must be between 50 and 1000."}
    node = request.auth.node or Node.objects.filter(is_active=True).first()
    if node is None:
        return 400, {"detail": "No active node available."}
    broadcast = EmergencyBroadcast.objects.create(
        node=node,
        homeowner=request.auth,
        kind=payload.kind,
        description=payload.description,
        address=payload.address,
        zip=payload.zip or homeowner_profile.default_zip,
        budget_ceiling=payload.budget_ceiling,
    )
    if node.auto_blast:
        dispatch_broadcast(broadcast)
    return 201, serialize_broadcast(broadcast)


@router.get("/open", response=list[BroadcastOut])
def open_broadcasts(request):
    """Open (unclaimed) broadcasts a pro can claim."""
    pro = require_pro(request)
    broadcasts = EmergencyBroadcast.objects.filter(
        status=EmergencyBroadcast.Status.OPEN
    )
    if pro.user.node_id:
        broadcasts = broadcasts.filter(node_id=pro.user.node_id)
    return [serialize_broadcast(b) for b in broadcasts[:25]]


@router.get("/{broadcast_id}", response=BroadcastOut)
def broadcast_detail(request, broadcast_id: int):
    """Poll endpoint for the success state (claim list updates)."""
    broadcast = EmergencyBroadcast.objects.filter(pk=broadcast_id).first()
    if broadcast is None:
        raise HttpError(404, "Broadcast not found.")
    user = request.auth
    if broadcast.homeowner_id != user.id and user.role == User.Role.HOMEOWNER:
        raise HttpError(403, "Not your broadcast.")
    return serialize_broadcast(broadcast)


@router.post(
    "/{broadcast_id}/claim",
    response={200: BroadcastOut, 404: ErrorOut, 409: ErrorOut},
)
def claim_broadcast(request, broadcast_id: int):
    """First pro to claim wins: opens a Lead + chat, sets claimed_by."""
    pro = require_pro(request)
    with transaction.atomic():
        broadcast = (
            EmergencyBroadcast.objects.select_for_update()
            .filter(pk=broadcast_id)
            .first()
        )
        if broadcast is None:
            return 404, {"detail": "Broadcast not found."}
        if broadcast.status != EmergencyBroadcast.Status.OPEN:
            return 409, {"detail": "This emergency was already claimed."}
        lead = Lead.objects.create(
            node=broadcast.node,
            homeowner=broadcast.homeowner,
            pro=pro,
            job_title=f"Emergency: {broadcast.get_kind_display()}",
            detail=broadcast.description,
        )
        lead.set_respond_by()
        lead.save(update_fields=["respond_by"])
        Message.objects.create(
            lead=lead,
            sender=broadcast.homeowner,
            body=broadcast.description,
        )
        broadcast.status = EmergencyBroadcast.Status.CLAIMED
        broadcast.claimed_by = pro
        broadcast.claimed_at = timezone.now()
        broadcast.lead = lead
        broadcast.save(
            update_fields=["status", "claimed_by", "claimed_at", "lead"]
        )
        broadcast.dispatches.filter(pro=pro).update(
            status=BroadcastDispatch.Status.CLAIMED
        )
    notify.notify_user(
        broadcast.homeowner,
        f"{pro.display_name} claimed your emergency and opened a chat.",
    )
    return 200, serialize_broadcast(broadcast)

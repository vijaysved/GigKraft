"""Prospect endpoints — gk_admin only.

Routes (all under /prospects):
  GET    /analytics     ← must be before /{id}
  POST   /bulk-status   ← must be before /{id}
  GET    /
  POST   /
  GET    /{id}
  PATCH  /{id}
  DELETE /{id}
  POST   /{id}/start-sequence
  POST   /{id}/advance-step

Public (no auth):
  GET    /pixel/{token}   — 1×1 GIF, records email open
  GET    /track/{token}   — click-tracking redirect
  POST   /track-view      — legacy page-view tracking
"""
import os
import uuid as _uuid
from datetime import timedelta
from typing import Optional

from django.http import HttpResponse, HttpResponseRedirect
from django.utils import timezone
from ninja import Router, Schema

from accounts.auth import jwt_auth
from common.permissions import require_gk_admin
from vendors.models import Prospect, ProPageView

router = Router(tags=["prospects"], auth=jwt_auth)
public_router = Router(tags=["prospects-public"])

# Smallest valid 1×1 transparent GIF
_PIXEL_GIF = bytes([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00,
    0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
    0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x00,
    0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
    0x01, 0x00, 0x3b,
])


# ── Schemas ───────────────────────────────────────────────────────────────────

class ErrorOut(Schema):
    detail: str


class StepJourney(Schema):
    step: int
    sent_at: Optional[str]
    channel: Optional[str]
    read_at: Optional[str]


class ProspectOut(Schema):
    id: int
    prospect_id: str
    name: str
    email: str
    phone: str
    role: str
    primary_zip: str
    neighborhood: str
    source: str
    status: str
    current_sequence_step: int
    last_contacted_at: Optional[str]
    signup_link_token: str
    link_clicked_at: Optional[str]
    converted_user_id: Optional[int]
    notes: str
    whatsapp_link: str
    created_at: str
    updated_at: str
    journey: list[StepJourney]


class ProspectIn(Schema):
    name: str
    email: str = ""
    phone: str = ""
    role: str = Prospect.Role.PRO
    primary_zip: str = ""
    neighborhood: str = ""
    source: str = Prospect.LeadSource.NEXTDOOR
    status: str = Prospect.Status.PROSPECT
    notes: str = ""


class ProspectPatchIn(Schema):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    primary_zip: Optional[str] = None
    neighborhood: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class BulkStatusIn(Schema):
    ids: list[int]
    status: str


class AnalyticsOut(Schema):
    total: int
    new_7_days: int
    total_emails_sent: int
    conversion_rate: float
    link_ctr: float
    by_status: dict
    by_source: dict
    by_sequence_step: dict
    recent_conversions: list[dict]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_journey(sequence_logs) -> list[dict]:
    """Build 3-step journey list from prefetched/queried OutreachLog objects."""
    result = []
    for step_num in range(1, 4):
        log = next((lg for lg in sequence_logs if lg.sequence_step == step_num), None)
        result.append({
            "step": step_num,
            "sent_at": log.sent_at.isoformat() if log else None,
            "channel": log.channel if log else None,
            "read_at": log.read_at.isoformat() if log and log.read_at else None,
        })
    return result


def _serialize(p: Prospect) -> dict:
    sequence_logs = getattr(p, "sequence_logs", [])
    return {
        "id": p.id,
        "prospect_id": p.prospect_id,
        "name": p.name,
        "email": p.email,
        "phone": p.phone,
        "role": p.role,
        "primary_zip": p.primary_zip,
        "neighborhood": p.neighborhood,
        "source": p.source,
        "status": p.status,
        "current_sequence_step": p.current_sequence_step,
        "last_contacted_at": p.last_contacted_at.isoformat() if p.last_contacted_at else None,
        "signup_link_token": str(p.signup_link_token),
        "link_clicked_at": p.link_clicked_at.isoformat() if p.link_clicked_at else None,
        "converted_user_id": p.converted_user_id,
        "notes": p.notes,
        "whatsapp_link": p.whatsapp_link,
        "created_at": p.created_at.isoformat(),
        "updated_at": p.updated_at.isoformat(),
        "journey": _build_journey(sequence_logs),
    }


def _attach_logs(p: Prospect) -> None:
    """Attach sequence_logs to a single Prospect instance (no prefetch available)."""
    from comms.models import OutreachLog
    p.sequence_logs = list(
        OutreachLog.objects.filter(prospect=p, sequence_step__gt=0).order_by("sequence_step")
    )


def _qs_with_logs():
    """Base queryset with select_related + Prefetch for sequence logs."""
    from django.db.models import Prefetch
    from comms.models import OutreachLog
    return Prospect.objects.select_related("converted_user").prefetch_related(
        Prefetch(
            "outreach_logs",
            queryset=OutreachLog.objects.filter(sequence_step__gt=0).order_by("sequence_step"),
            to_attr="sequence_logs",
        )
    )


# ── Static routes first (before parameterised /{id}) ─────────────────────────

@router.get("/analytics", response=AnalyticsOut)
def get_analytics(request):
    require_gk_admin(request)
    from comms.models import OutreachLog

    cutoff = timezone.now() - timedelta(days=7)
    total = Prospect.objects.count()
    new_7_days = Prospect.objects.filter(created_at__gte=cutoff).count()
    total_emails = OutreachLog.objects.filter(channel="email").count()
    converted = Prospect.objects.filter(status=Prospect.Status.CONVERTED).count()
    clicked = Prospect.objects.filter(link_clicked_at__isnull=False).count()

    by_status = {s: Prospect.objects.filter(status=s).count() for s, _ in Prospect.Status.choices}
    by_source = {s: Prospect.objects.filter(source=s).count() for s, _ in Prospect.LeadSource.choices}
    by_step = {
        str(i): Prospect.objects.filter(status=Prospect.Status.IN_PROGRESS, current_sequence_step=i).count()
        for i in range(4)
    }
    recent = list(
        Prospect.objects.filter(status=Prospect.Status.CONVERTED)
        .select_related("converted_user")
        .order_by("-updated_at")[:8]
    )
    return {
        "total": total,
        "new_7_days": new_7_days,
        "total_emails_sent": total_emails,
        "conversion_rate": round((converted / total * 100) if total else 0, 1),
        "link_ctr": round((clicked / total * 100) if total else 0, 1),
        "by_status": by_status,
        "by_source": by_source,
        "by_sequence_step": by_step,
        "recent_conversions": [
            {"id": p.id, "name": p.name, "source": p.source,
             "converted_user_id": p.converted_user_id, "updated_at": p.updated_at.isoformat()}
            for p in recent
        ],
    }


@router.post("/bulk-status", response={200: list[ProspectOut], 400: ErrorOut})
def bulk_update_status(request, payload: BulkStatusIn):
    require_gk_admin(request)
    valid = [s[0] for s in Prospect.Status.choices]
    if payload.status not in valid:
        return 400, {"detail": f"Invalid status '{payload.status}'."}
    Prospect.objects.filter(pk__in=payload.ids).update(status=payload.status)
    updated = list(_qs_with_logs().filter(pk__in=payload.ids))
    return 200, [_serialize(p) for p in updated]


# ── Collection ────────────────────────────────────────────────────────────────

@router.get("", response=list[ProspectOut])
def list_prospects(
    request,
    status: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
):
    require_gk_admin(request)
    qs = _qs_with_logs()
    if status:
        qs = qs.filter(status=status)
    if source:
        qs = qs.filter(source=source)
    if search:
        qs = qs.filter(name__icontains=search) | qs.filter(email__icontains=search)
    return [_serialize(p) for p in qs[:500]]


@router.post("", response={201: ProspectOut, 400: ErrorOut})
def create_prospect(request, payload: ProspectIn):
    require_gk_admin(request)
    if not payload.name.strip():
        return 400, {"detail": "name is required."}
    if not payload.email.strip() and not payload.phone.strip():
        return 400, {"detail": "email or phone is required."}
    p = Prospect.objects.create(**payload.dict())
    _attach_logs(p)
    return 201, _serialize(p)


# ── Detail / Update / Delete ──────────────────────────────────────────────────

@router.get("/{prospect_id}", response={200: ProspectOut, 404: ErrorOut})
def get_prospect(request, prospect_id: int):
    require_gk_admin(request)
    p = _qs_with_logs().filter(pk=prospect_id).first()
    if p is None:
        return 404, {"detail": "Prospect not found."}
    return 200, _serialize(p)


@router.patch("/{prospect_id}", response={200: ProspectOut, 404: ErrorOut})
def update_prospect(request, prospect_id: int, payload: ProspectPatchIn):
    require_gk_admin(request)
    p = Prospect.objects.filter(pk=prospect_id).select_related("converted_user").first()
    if p is None:
        return 404, {"detail": "Prospect not found."}
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(p, field, value)
    p.save()
    _attach_logs(p)
    return 200, _serialize(p)


@router.delete("/{prospect_id}", response={204: None, 404: ErrorOut})
def delete_prospect(request, prospect_id: int):
    require_gk_admin(request)
    p = Prospect.objects.filter(pk=prospect_id).first()
    if p is None:
        return 404, {"detail": "Prospect not found."}
    p.delete()
    return 204, None


# ── Sequence actions ──────────────────────────────────────────────────────────

@router.post("/{prospect_id}/start-sequence", response={200: ProspectOut, 400: ErrorOut, 404: ErrorOut})
def start_sequence(request, prospect_id: int):
    require_gk_admin(request)
    from comms.models import MessageTemplate, OutreachLog
    from comms.services import send_email as _send_email

    p = Prospect.objects.filter(pk=prospect_id).select_related("converted_user").first()
    if p is None:
        return 404, {"detail": "Prospect not found."}
    if p.status not in (Prospect.Status.PROSPECT, Prospect.Status.ON_HOLD):
        return 400, {"detail": f"Cannot start sequence from status '{p.status}'."}

    now = timezone.now()
    p.status = Prospect.Status.IN_PROGRESS
    p.current_sequence_step = 1
    p.last_contacted_at = now

    if p.email:
        template = MessageTemplate.objects.filter(kind="sequence_1", channel="email", is_default=True).first()
        if template:
            subject, body = template.render(p.template_vars)
            track_token = _uuid.uuid4()
            try:
                resend_id = _send_email(
                    to=p.email, subject=subject, body=body, track_token=str(track_token)
                )
                p.save(update_fields=["status", "current_sequence_step", "last_contacted_at", "updated_at"])
                OutreachLog.objects.create(
                    prospect=p, template=template, channel="email",
                    to_address=p.email, subject_sent=subject, body_sent=body,
                    resend_id=resend_id, sequence_step=1, email_track_token=track_token,
                )
                _attach_logs(p)
                return 200, _serialize(p)
            except Exception:
                pass

    p.save(update_fields=["status", "current_sequence_step", "last_contacted_at", "updated_at"])
    _attach_logs(p)
    return 200, _serialize(p)


@router.post("/{prospect_id}/advance-step", response={200: ProspectOut, 400: ErrorOut, 404: ErrorOut})
def advance_chat_step(request, prospect_id: int):
    require_gk_admin(request)
    from comms.models import OutreachLog

    p = Prospect.objects.filter(pk=prospect_id).select_related("converted_user").first()
    if p is None:
        return 404, {"detail": "Prospect not found."}

    now = timezone.now()
    if p.status == Prospect.Status.PROSPECT and p.current_sequence_step == 0:
        p.status = Prospect.Status.IN_PROGRESS
        p.current_sequence_step = 1
    elif p.status == Prospect.Status.IN_PROGRESS and p.current_sequence_step < 3:
        p.current_sequence_step += 1
    else:
        return 400, {"detail": "No further steps to advance."}

    p.last_contacted_at = now
    p.save(update_fields=["status", "current_sequence_step", "last_contacted_at", "updated_at"])

    OutreachLog.objects.create(
        prospect=p, channel="whatsapp",
        to_address=p.phone or "",
        notes=f"Chat step {p.current_sequence_step} confirmed sent.",
        sequence_step=p.current_sequence_step,
    )
    _attach_logs(p)
    return 200, _serialize(p)


# ── Public: email open pixel ──────────────────────────────────────────────────

@public_router.get("/pixel/{token}", auth=None)
def track_email_open(request, token: str):
    from comms.models import OutreachLog
    try:
        log = OutreachLog.objects.filter(
            email_track_token=_uuid.UUID(token), read_at__isnull=True
        ).first()
        if log:
            log.read_at = timezone.now()
            log.save(update_fields=["read_at"])
    except (ValueError, AttributeError):
        pass
    resp = HttpResponse(_PIXEL_GIF, content_type="image/gif")
    resp["Cache-Control"] = "no-cache, no-store, must-revalidate"
    resp["Pragma"] = "no-cache"
    return resp


# ── Public: click-tracking redirect ──────────────────────────────────────────

@public_router.get("/track/{token}", auth=None)
def track_signup_click(request, token: str):
    try:
        p = Prospect.objects.filter(signup_link_token=_uuid.UUID(token)).first()
    except (ValueError, AttributeError):
        p = None
    if p and not p.link_clicked_at:
        p.link_clicked_at = timezone.now()
        p.save(update_fields=["link_clicked_at", "updated_at"])
    signup_url = os.environ.get("SIGNUP_URL", "https://gigkraft.com/signup")
    return HttpResponseRedirect(signup_url)


# ── Public: legacy page-view tracking ────────────────────────────────────────

class TrackViewIn(Schema):
    pro_handle: str
    ref: Optional[str] = None


@public_router.post("/track-view", auth=None, response={200: dict})
def track_page_view(request, payload: TrackViewIn):
    prospect = None
    if payload.ref:
        prospect = Prospect.objects.filter(prospect_id=payload.ref).first()
    ProPageView.objects.create(pro_handle=payload.pro_handle, prospect=prospect)
    return {"ok": True}

"""Node admin endpoints (web screens 3.1-3.6)."""
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import ProProfile
from billing.models import Subscription
from common import notify
from common.permissions import require_node_manager
from emergencies.api import dispatch_broadcast, serialize_broadcast, BroadcastOut
from emergencies.models import EmergencyBroadcast
from krafts.models import Kraft
from leads.models import Lead
from nodes.models import Node, SafetyLog
from recommendations.models import Recommendation

router = Router(tags=["admin"], auth=jwt_auth)


class ErrorOut(Schema):
    detail: str


def _resolve_node(request, node: Optional[str]) -> Node:
    if node:
        found = Node.objects.filter(node_id=node).first()
        if found is None:
            raise HttpError(404, f"Unknown node: {node}")
        return found
    user = request.auth
    if user.node_id:
        return user.node
    found = Node.objects.filter(is_active=True).first()
    if found is None:
        raise HttpError(404, "No node configured.")
    return found


# --- 3.1 Metrics ---


class ChartPoint(Schema):
    label: str
    value: float


class TradeSla(Schema):
    trade: str
    pct: int


class ActivityRow(Schema):
    kind: str  # lead | kraft | emergency | rec
    text: str
    at: str


class MetricsOut(Schema):
    node_id: str
    node_name: str
    pending_triage: int
    active_pros: int
    avg_response_minutes: int
    monthly_run_rate: float
    throughput: list[ChartPoint]
    jobs_won_30d: int
    win_rate_pct: int
    repeat_rate_pct: int
    sla_pct: int
    sla_by_trade: list[TradeSla]
    activity: list[ActivityRow]


@router.get("/metrics", response=MetricsOut)
def metrics(request, node: Optional[str] = None):
    require_node_manager(request)
    n = _resolve_node(request, node)
    now = timezone.now()

    pros = ProProfile.objects.filter(user__node=n, is_suspended=False)
    pending_triage = EmergencyBroadcast.objects.filter(
        node=n, status=EmergencyBroadcast.Status.OPEN
    ).count()

    run_rate = sum(
        (
            s.monthly_value
            for s in Subscription.objects.filter(
                pro__user__node=n, status=Subscription.Status.ACTIVE
            )
        ),
        Decimal("0"),
    )

    # Throughput: leads created per week over the last 6 weeks.
    throughput = []
    for i in range(6):
        start = now - timedelta(weeks=6 - i)
        end = start + timedelta(weeks=1)
        count = Lead.objects.filter(
            node=n, created_at__gte=start, created_at__lt=end
        ).count()
        throughput.append({"label": f"W{i + 1}", "value": count})

    since30 = now - timedelta(days=30)
    leads30 = Lead.objects.filter(node=n, created_at__gte=since30)
    won30 = leads30.filter(status=Lead.Status.WON).count()
    total30 = leads30.count()

    # SLA: share of responded leads answered before respond_by.
    responded = Lead.objects.filter(
        node=n, first_response_at__isnull=False, respond_by__isnull=False
    )
    on_time = sum(
        1 for lead in responded if lead.first_response_at <= lead.respond_by
    )
    sla_pct = round(100 * on_time / responded.count()) if responded.count() else 92

    # Average response time in minutes, computed in Python (sqlite-safe).
    diffs = [
        (lead.first_response_at - lead.created_at).total_seconds() / 60
        for lead in responded
    ]
    avg_response_minutes = round(sum(diffs) / len(diffs)) if diffs else 112

    sla_by_trade = []
    for trade in (
        pros.exclude(primary_trade="")
        .values_list("primary_trade", flat=True)
        .distinct()[:6]
    ):
        trade_leads = [
            lead
            for lead in responded.filter(pro__primary_trade=trade)
        ]
        if trade_leads:
            ok = sum(
                1 for lead in trade_leads if lead.first_response_at <= lead.respond_by
            )
            pct = round(100 * ok / len(trade_leads))
        else:
            pct = 90
        sla_by_trade.append({"trade": trade, "pct": pct})

    activity = []
    for lead in Lead.objects.filter(node=n)[:4]:
        activity.append(
            {
                "kind": "lead",
                "text": f"Lead '{lead.job_title}' ({lead.get_status_display()})",
                "at": lead.created_at.isoformat(),
            }
        )
    for kraft in Kraft.objects.filter(node=n)[:3]:
        activity.append(
            {
                "kind": "kraft",
                "text": f"Kraft '{kraft.title}' {kraft.get_status_display().lower()}",
                "at": kraft.created_at.isoformat(),
            }
        )
    for b in EmergencyBroadcast.objects.filter(node=n)[:3]:
        activity.append(
            {
                "kind": "emergency",
                "text": f"Emergency ({b.get_kind_display()}) {b.status}",
                "at": b.created_at.isoformat(),
            }
        )
    activity.sort(key=lambda row: row["at"], reverse=True)

    return {
        "node_id": n.node_id,
        "node_name": n.name,
        "pending_triage": pending_triage,
        "active_pros": pros.count(),
        "avg_response_minutes": avg_response_minutes,
        "monthly_run_rate": float(run_rate),
        "throughput": throughput,
        "jobs_won_30d": won30,
        "win_rate_pct": round(100 * won30 / total30) if total30 else 0,
        "repeat_rate_pct": 18,  # MOCK: repeat-customer tracking lands later
        "sla_pct": sla_pct,
        "sla_by_trade": sla_by_trade,
        "activity": activity[:8],
    }


# --- 3.2 Triage ---


class TriageRow(Schema):
    id: int
    kind: str
    description: str
    address: str
    budget_ceiling: float
    age_minutes: int
    homeowner_name: str
    status: str


class TriageOut(Schema):
    unrouted: int
    claimed_today: int
    avg_claim_minutes: int
    rows: list[TriageRow]


@router.get("/triage", response=TriageOut)
def triage(request, node: Optional[str] = None):
    require_node_manager(request)
    n = _resolve_node(request, node)
    now = timezone.now()
    open_rows = EmergencyBroadcast.objects.filter(
        node=n, status=EmergencyBroadcast.Status.OPEN
    ).select_related("homeowner")
    claimed_today = EmergencyBroadcast.objects.filter(
        node=n,
        status=EmergencyBroadcast.Status.CLAIMED,
        claimed_at__date=now.date(),
    )
    claim_diffs = [
        (b.claimed_at - b.created_at).total_seconds() / 60
        for b in EmergencyBroadcast.objects.filter(
            node=n, claimed_at__isnull=False
        )
    ]
    return {
        "unrouted": open_rows.count(),
        "claimed_today": claimed_today.count(),
        "avg_claim_minutes": round(sum(claim_diffs) / len(claim_diffs))
        if claim_diffs
        else 0,
        "rows": [
            {
                "id": b.id,
                "kind": b.kind,
                "description": b.description,
                "address": b.address,
                "budget_ceiling": float(b.budget_ceiling),
                "age_minutes": int((now - b.created_at).total_seconds() // 60),
                "homeowner_name": (
                    f"{b.homeowner.first_name} {b.homeowner.last_name}".strip()
                    or str(b.homeowner)
                ),
                "status": b.status,
            }
            for b in open_rows
        ],
    }


@router.post("/triage/{broadcast_id}/pin", response={200: BroadcastOut, 404: ErrorOut})
def pin_triage(request, broadcast_id: int):
    """SMS-pin: mark the emergency as manually routed (removes from queue)."""
    require_node_manager(request)
    broadcast = EmergencyBroadcast.objects.filter(pk=broadcast_id).first()
    if broadcast is None:
        return 404, {"detail": "Broadcast not found."}
    broadcast.status = EmergencyBroadcast.Status.ROUTED
    broadcast.save(update_fields=["status"])
    notify.send_sms(
        broadcast.homeowner.phone or "",
        "A node manager pinned your emergency to a pro. Help is on the way.",
    )
    return 200, serialize_broadcast(broadcast)


@router.post("/triage/{broadcast_id}/blast", response={200: BroadcastOut, 404: ErrorOut})
def blast_triage(request, broadcast_id: int):
    """WhatsApp blast: re-dispatch the broadcast to eligible pros (mock)."""
    require_node_manager(request)
    broadcast = EmergencyBroadcast.objects.filter(pk=broadcast_id).first()
    if broadcast is None:
        return 404, {"detail": "Broadcast not found."}
    dispatch_broadcast(broadcast)
    return 200, serialize_broadcast(broadcast)


# --- 3.3 Safety ---


class SafetyRow(Schema):
    id: int
    pro_id: int
    pro_name: str
    pro_trade: str
    infraction: str
    severity: str
    status: str
    created_at: str


class SafetyOut(Schema):
    open_count: int
    suspended_count: int
    hygiene_score: int
    rows: list[SafetyRow]


def _serialize_safety(log: SafetyLog) -> dict:
    return {
        "id": log.id,
        "pro_id": log.pro_id,
        "pro_name": log.pro.display_name,
        "pro_trade": log.pro.primary_trade,
        "infraction": log.infraction,
        "severity": log.severity,
        "status": log.status,
        "created_at": log.created_at.isoformat(),
    }


@router.get("/safety", response=SafetyOut)
def safety(request, node: Optional[str] = None):
    require_node_manager(request)
    n = _resolve_node(request, node)
    open_logs = SafetyLog.objects.filter(
        node=n, status=SafetyLog.Status.OPEN
    ).select_related("pro", "pro__user")
    suspended = ProProfile.objects.filter(user__node=n, is_suspended=True).count()
    total = SafetyLog.objects.filter(node=n).count()
    open_count = open_logs.count()
    hygiene = round(100 * (1 - open_count / total)) if total else 100
    return {
        "open_count": open_count,
        "suspended_count": suspended,
        "hygiene_score": hygiene,
        "rows": [_serialize_safety(log) for log in open_logs],
    }


@router.post("/safety/{log_id}/dismiss", response={200: SafetyRow, 404: ErrorOut})
def dismiss_safety(request, log_id: int):
    require_node_manager(request)
    log = SafetyLog.objects.filter(pk=log_id).first()
    if log is None:
        return 404, {"detail": "Safety log not found."}
    log.status = SafetyLog.Status.DISMISSED
    log.resolved_at = timezone.now()
    log.save(update_fields=["status", "resolved_at"])
    return 200, _serialize_safety(log)


@router.post("/safety/{log_id}/suspend", response={200: SafetyRow, 404: ErrorOut})
def suspend_safety(request, log_id: int):
    require_node_manager(request)
    log = SafetyLog.objects.filter(pk=log_id).select_related("pro").first()
    if log is None:
        return 404, {"detail": "Safety log not found."}
    log.status = SafetyLog.Status.SUSPENDED
    log.resolved_at = timezone.now()
    log.save(update_fields=["status", "resolved_at"])
    log.pro.is_suspended = True
    log.pro.save(update_fields=["is_suspended"])
    notify.notify_user(log.pro.user, "Your profile was suspended by the node manager.")
    return 200, _serialize_safety(log)


# --- 3.4 Pro ledger ---


class LedgerRow(Schema):
    id: int
    name: str
    trade: str
    avatar_url: str
    krafts_verified: int
    recs_approved: int
    avg_sla_minutes: int
    plan: str
    status: str  # active | at_risk | suspended


@router.get("/pros", response=list[LedgerRow])
def pro_ledger(request, node: Optional[str] = None, q: Optional[str] = None):
    require_node_manager(request)
    n = _resolve_node(request, node)
    pros = ProProfile.objects.filter(user__node=n).select_related("user")
    if q:
        pros = [
            p
            for p in pros
            if q.lower() in p.display_name.lower()
            or q.lower() in p.primary_trade.lower()
        ]
    rows = []
    for pro in pros:
        responded = Lead.objects.filter(
            pro=pro, first_response_at__isnull=False
        )
        diffs = [
            (lead.first_response_at - lead.created_at).total_seconds() / 60
            for lead in responded
        ]
        sub = Subscription.objects.filter(pro=pro).first()
        late = [
            lead
            for lead in responded
            if lead.respond_by and lead.first_response_at > lead.respond_by
        ]
        if pro.is_suspended:
            status = "suspended"
        elif responded and len(late) / max(len(list(responded)), 1) > 0.4:
            status = "at_risk"
        else:
            status = "active"
        rows.append(
            {
                "id": pro.id,
                "name": pro.display_name,
                "trade": pro.primary_trade,
                "avatar_url": pro.avatar_url,
                "krafts_verified": pro.krafts.filter(
                    status=Kraft.Status.VERIFIED
                ).count(),
                "recs_approved": Recommendation.objects.filter(
                    pro=pro, status=Recommendation.Status.APPROVED
                ).count(),
                "avg_sla_minutes": round(sum(diffs) / len(diffs)) if diffs else 0,
                "plan": sub.plan if sub else "none",
                "status": status,
            }
        )
    return rows


# --- 3.6 Node settings + billing ---


class NodeSettingsOut(Schema):
    node_id: str
    name: str
    auto_blast: bool
    escalation_enabled: bool
    escalation_minutes: int
    default_sla_hours: int


class NodeSettingsIn(Schema):
    auto_blast: Optional[bool] = None
    escalation_enabled: Optional[bool] = None
    escalation_minutes: Optional[int] = None
    default_sla_hours: Optional[int] = None


@router.get("/node-settings", response=NodeSettingsOut)
def node_settings(request, node: Optional[str] = None):
    require_node_manager(request)
    return _resolve_node(request, node)


@router.patch("/node-settings", response=NodeSettingsOut)
def update_node_settings(
    request, payload: NodeSettingsIn, node: Optional[str] = None
):
    require_node_manager(request)
    n = _resolve_node(request, node)
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(n, field, value)
    n.save()
    return n


class BillingBreakdownRow(Schema):
    label: str
    pros: int
    amount: float


class NodeBillingOut(Schema):
    node_id: str
    monthly_run_rate: float
    active_subscriptions: int
    breakdown: list[BillingBreakdownRow]


@router.get("/billing", response=NodeBillingOut)
def node_billing(request, node: Optional[str] = None):
    require_node_manager(request)
    n = _resolve_node(request, node)
    subs = Subscription.objects.filter(
        pro__user__node=n, status=Subscription.Status.ACTIVE
    )
    breakdown = []
    total = Decimal("0")
    for plan, label in Subscription.Plan.choices:
        plan_subs = [s for s in subs if s.plan == plan]
        amount = sum((s.monthly_value for s in plan_subs), Decimal("0"))
        total += amount
        breakdown.append(
            {"label": label, "pros": len(plan_subs), "amount": float(amount)}
        )
    return {
        "node_id": n.node_id,
        "monthly_run_rate": float(total),
        "active_subscriptions": subs.count(),
        "breakdown": breakdown,
    }

"""Prospect endpoints — gk_admin only.

Routes (all under /prospects):
  GET    /analytics     ← must be before /{id}
  POST   /bulk-status   ← must be before /{id}
  POST   /bulk-preview  ← must be before /{id}
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
    link_clicked_at: Optional[str]
    email_count: int = 0
    whatsapp_count: int = 0


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
    email_bounced: bool
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


class BulkPreviewItem(Schema):
    name: str
    email: str = ""
    phone: str = ""


class BulkPreviewResult(Schema):
    index: int
    name: str
    email: str
    phone: str
    is_duplicate: bool
    existing_id: Optional[int] = None


class BulkPreviewOut(Schema):
    total: int
    new_count: int
    existing_count: int
    results: list[BulkPreviewResult]


class BulkPreviewIn(Schema):
    prospects: list[BulkPreviewItem]


class AnalyticsOut(Schema):
    total: int
    new_7_days: int
    total_emails_sent: int
    conversion_rate: float
    link_ctr: float
    by_status: dict
    by_source: dict
    by_sequence_step: dict
    by_channel: dict
    recent_conversions: list[dict]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_journey(sequence_logs) -> list[dict]:
    """Build 3-step journey list from prefetched/queried OutreachLog objects."""
    result = []
    for step_num in range(1, 4):
        step_logs = [lg for lg in sequence_logs if lg.sequence_step == step_num]
        email_count = sum(1 for lg in step_logs if lg.channel == "email")
        whatsapp_count = sum(1 for lg in step_logs if lg.channel in ("whatsapp", "sms"))
        recent = max(step_logs, key=lambda lg: lg.sent_at) if step_logs else None
        result.append({
            "step": step_num,
            "sent_at": recent.sent_at.isoformat() if recent else None,
            "channel": recent.channel if recent else None,
            "read_at": recent.read_at.isoformat() if recent and recent.read_at else None,
            "link_clicked_at": recent.link_clicked_at.isoformat() if recent and recent.link_clicked_at else None,
            "email_count": email_count,
            "whatsapp_count": whatsapp_count,
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
        "email_bounced": p.email_bounced,
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
    by_channel = {
        ch: OutreachLog.objects.filter(channel=ch).count()
        for ch in ("email", "whatsapp", "sms")
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
        "by_channel": by_channel,
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


@router.post("/bulk-preview", response={200: BulkPreviewOut})
def bulk_preview(request, payload: BulkPreviewIn):
    require_gk_admin(request)
    results = []
    for i, item in enumerate(payload.prospects):
        dup = None
        if item.email.strip():
            dup = Prospect.objects.filter(email__iexact=item.email.strip()).first()
        if dup is None and item.phone.strip():
            dup = Prospect.objects.filter(phone=item.phone.strip()).first()
        results.append(BulkPreviewResult(
            index=i,
            name=item.name,
            email=item.email,
            phone=item.phone,
            is_duplicate=dup is not None,
            existing_id=dup.pk if dup else None,
        ))
    new_count = sum(1 for r in results if not r.is_duplicate)
    return 200, BulkPreviewOut(
        total=len(results),
        new_count=new_count,
        existing_count=len(results) - new_count,
        results=results,
    )


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
        qs = qs.filter(name__icontains=search) | qs.filter(email__icontains=search) | qs.filter(phone__icontains=search)
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


# ── Lookup by GK-xxx slug (must stay above /{prospect_id: int}) ───────────────

@router.get("/by-gkid/{gk_id}", response={200: ProspectOut, 404: ErrorOut})
def get_prospect_by_gkid(request, gk_id: str):
    require_gk_admin(request)
    p = _qs_with_logs().filter(prospect_id__iexact=gk_id).first()
    if p is None:
        return 404, {"detail": "Prospect not found."}
    return 200, _serialize(p)


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


# ── Sequence helpers ─────────────────────────────────────────────────────────

def _get_template(kind: str, channel: str, source: str):
    """Return the source-specific template if one exists, else the global default."""
    from comms.models import MessageTemplate
    return (
        MessageTemplate.objects.filter(kind=kind, channel=channel, source=source, is_default=True).first()
        or MessageTemplate.objects.filter(kind=kind, channel=channel, source="", is_default=True).first()
    )


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
        template = _get_template("sequence_1", "email", p.source)
        if template:
            link_click_token = _uuid.uuid4()
            vars_ = p.template_vars_for_log(link_click_token)
            subject, body, html_body = template.render_all(vars_)
            track_token = _uuid.uuid4()
            cc = ["satish@gigkraft.com"] if p.source == "trade_school" else None
            try:
                resend_id = _send_email(
                    to=p.email, subject=subject, body=body,
                    html_body=html_body or None,
                    track_token=str(track_token), cc=cc,
                )
                p.save(update_fields=["status", "current_sequence_step", "last_contacted_at", "updated_at"])
                OutreachLog.objects.create(
                    prospect=p, template=template, channel="email",
                    to_address=p.email, subject_sent=subject, body_sent=body,
                    html_body_sent=html_body or "",
                    resend_id=resend_id, sequence_step=1, email_track_token=track_token,
                    link_click_token=link_click_token,
                )
                _attach_logs(p)
                return 200, _serialize(p)
            except Exception:
                pass

    p.save(update_fields=["status", "current_sequence_step", "last_contacted_at", "updated_at"])
    _attach_logs(p)
    return 200, _serialize(p)


class AdvanceStepIn(Schema):
    channel: str = "whatsapp"


@router.post("/{prospect_id}/advance-step", response={200: ProspectOut, 400: ErrorOut, 404: ErrorOut})
def advance_chat_step(request, prospect_id: int, data: AdvanceStepIn):
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
        prospect=p, channel=data.channel,
        to_address=p.phone or "",
        notes=f"Chat step {p.current_sequence_step} confirmed sent via {data.channel}.",
        sequence_step=p.current_sequence_step,
        link_click_token=_uuid.uuid4(),
    )
    _attach_logs(p)
    return 200, _serialize(p)


class SendStepIn(Schema):
    step: int
    channel: str = "email"
    is_resend: bool = False


@router.post("/{prospect_id}/send-step", response={200: ProspectOut, 400: ErrorOut, 404: ErrorOut, 500: ErrorOut})
def send_step(request, prospect_id: int, data: SendStepIn):
    """Send or resend a specific sequence step via email or WhatsApp log."""
    require_gk_admin(request)
    from comms.models import MessageTemplate, OutreachLog
    from comms.services import send_email as _send_email

    if data.step not in (1, 2, 3):
        return 400, {"detail": "step must be 1, 2, or 3."}

    p = Prospect.objects.filter(pk=prospect_id).select_related("converted_user").first()
    if p is None:
        return 404, {"detail": "Prospect not found."}

    now = timezone.now()
    link_click_token = _uuid.uuid4()

    if data.channel == "email":
        if not p.email:
            return 400, {"detail": "Prospect has no email address."}
        template = _get_template(f"sequence_{data.step}", "email", p.source)
        if not template:
            return 400, {"detail": f"No default email template found for step {data.step}."}
        vars_ = p.template_vars_for_log(link_click_token)
        subject, body, html_body = template.render_all(vars_)
        email_track_token = _uuid.uuid4()
        cc = ["satish@gigkraft.com"] if p.source == "trade_school" else None
        try:
            resend_id = _send_email(
                to=p.email, subject=subject, body=body,
                html_body=html_body or None,
                track_token=str(email_track_token), cc=cc,
            )
        except Exception as exc:
            return 500, {"detail": f"Email send failed: {exc}"}
        OutreachLog.objects.create(
            prospect=p, template=template, channel="email",
            to_address=p.email, subject_sent=subject, body_sent=body,
            html_body_sent=html_body or "",
            resend_id=resend_id, sequence_step=data.step,
            email_track_token=email_track_token, link_click_token=link_click_token,
        )
    else:
        OutreachLog.objects.create(
            prospect=p, channel=data.channel,
            to_address=p.phone or "",
            notes=f"Step {data.step} sent via {data.channel}.",
            sequence_step=data.step, link_click_token=link_click_token,
        )

    # Only advance current_sequence_step when this is a new (non-resend) send
    if not data.is_resend:
        if p.status == Prospect.Status.PROSPECT and data.step >= 1:
            p.status = Prospect.Status.IN_PROGRESS
            p.current_sequence_step = data.step
        elif p.status == Prospect.Status.IN_PROGRESS and data.step > p.current_sequence_step:
            p.current_sequence_step = data.step
    p.last_contacted_at = now
    p.save(update_fields=["status", "current_sequence_step", "last_contacted_at", "updated_at"])

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
    from comms.models import OutreachLog
    now = timezone.now()
    try:
        uid = _uuid.UUID(token)
    except (ValueError, AttributeError):
        uid = None

    if uid:
        # Per-message token (new path) — look up via OutreachLog first
        log = OutreachLog.objects.select_related("prospect").filter(link_click_token=uid).first()
        if log:
            if not log.link_clicked_at:
                log.link_clicked_at = now
                log.save(update_fields=["link_clicked_at"])
            # Also backfill prospect-level timestamp for backwards compat
            if log.prospect and not log.prospect.link_clicked_at:
                log.prospect.link_clicked_at = now
                log.prospect.save(update_fields=["link_clicked_at", "updated_at"])
        else:
            # Legacy path — prospect-level token for old sent messages
            p = Prospect.objects.filter(signup_link_token=uid).first()
            if p and not p.link_clicked_at:
                p.link_clicked_at = now
                p.save(update_fields=["link_clicked_at", "updated_at"])

    signup_url = os.environ.get("SIGNUP_URL", "https://gigkraft.com/signup")
    return HttpResponseRedirect(signup_url)


# ── Public: example-profile click tracking ───────────────────────────────────

GK_EXAMPLE_URL = "https://www.gigkraft.com/pros/template-pro"

@public_router.get("/track-example/{token}", auth=None)
def track_example_click(request, token: str):
    from comms.models import OutreachLog
    now = timezone.now()
    try:
        uid = _uuid.UUID(token)
    except (ValueError, AttributeError):
        uid = None

    if uid:
        log = OutreachLog.objects.filter(link_click_token=uid).first()
        if log and not log.example_clicked_at:
            log.example_clicked_at = now
            log.save(update_fields=["example_clicked_at"])

    return HttpResponseRedirect(GK_EXAMPLE_URL)


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

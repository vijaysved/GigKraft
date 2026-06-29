"""Comms endpoints — gk_admin only.

Routes (all under /comms):
  GET/POST         /templates
  PATCH/DELETE     /templates/{id}
  POST             /send-email
  GET/POST         /prospects/{id}/logs
  DELETE           /logs/{id}
"""
import uuid as _uuid
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema

from accounts.auth import jwt_auth
from common.permissions import require_gk_admin
from comms.models import MessageTemplate, OutreachLog
from comms.services import send_email as _send_email
from vendors.models import Prospect

router = Router(tags=["comms"], auth=jwt_auth)


class ErrorOut(Schema):
    detail: str


# ── MessageTemplate CRUD ──────────────────────────────────────────────────────


class TemplateOut(Schema):
    id: int
    name: str
    channel: str
    kind: str
    subject: str
    body: str
    html_body: str
    is_default: bool
    created_at: str
    updated_at: str


class TemplateIn(Schema):
    name: str
    channel: str = "email"
    kind: str = "intro"
    subject: str = ""
    body: str
    is_default: bool = False


class TemplatePatchIn(Schema):
    name: Optional[str] = None
    channel: Optional[str] = None
    kind: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    is_default: Optional[bool] = None


def _ser_template(t: MessageTemplate) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "channel": t.channel,
        "kind": t.kind,
        "subject": t.subject,
        "body": t.body,
        "html_body": t.html_body,
        "is_default": t.is_default,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }


@router.get("/templates", response=list[TemplateOut])
def list_templates(request, channel: Optional[str] = None, kind: Optional[str] = None):
    require_gk_admin(request)
    qs = MessageTemplate.objects.all()
    if channel:
        qs = qs.filter(channel=channel)
    if kind:
        qs = qs.filter(kind=kind)
    return [_ser_template(t) for t in qs]


@router.post("/templates", response={201: TemplateOut, 400: ErrorOut})
def create_template(request, payload: TemplateIn):
    require_gk_admin(request)
    if not payload.name.strip() or not payload.body.strip():
        return 400, {"detail": "name and body are required."}
    t = MessageTemplate.objects.create(**payload.dict())
    return 201, _ser_template(t)


@router.patch("/templates/{template_id}", response={200: TemplateOut, 404: ErrorOut})
def update_template(request, template_id: int, payload: TemplatePatchIn):
    require_gk_admin(request)
    t = MessageTemplate.objects.filter(pk=template_id).first()
    if t is None:
        return 404, {"detail": "Template not found."}
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(t, field, value)
    t.save()
    return 200, _ser_template(t)


@router.delete("/templates/{template_id}", response={204: None, 404: ErrorOut})
def delete_template(request, template_id: int):
    require_gk_admin(request)
    t = MessageTemplate.objects.filter(pk=template_id).first()
    if t is None:
        return 404, {"detail": "Template not found."}
    t.delete()
    return 204, None


# ── Send Email ────────────────────────────────────────────────────────────────


class SendEmailIn(Schema):
    to: str
    cc: list[str] = []
    bcc: list[str] = []
    subject: str
    body: str
    prospect_id: Optional[int] = None
    template_id: Optional[int] = None


class SendEmailOut(Schema):
    log_id: int
    resend_id: str


@router.post("/send-email", response={200: SendEmailOut, 400: ErrorOut, 500: ErrorOut})
def send_email_endpoint(request, payload: SendEmailIn):
    require_gk_admin(request)
    if not payload.to.strip() or not payload.subject.strip() or not payload.body.strip():
        return 400, {"detail": "to, subject, and body are required."}

    email_track_token = _uuid.uuid4()
    link_click_token = _uuid.uuid4()

    # Resolve prospect + template early so we can render HTML server-side
    prospect = Prospect.objects.filter(pk=payload.prospect_id).first() if payload.prospect_id else None
    template = MessageTemplate.objects.filter(pk=payload.template_id).first() if payload.template_id else None

    rendered_html: str | None = None
    if template and template.html_body and prospect:
        vars_ = prospect.template_vars_for_log(str(link_click_token))
        _, _, rendered_html = template.render_all(vars_)

    try:
        resend_id = _send_email(
            to=payload.to,
            subject=payload.subject,
            body=payload.body,
            html_body=rendered_html,
            cc=payload.cc or None,
            bcc=payload.bcc or None,
            track_token=str(email_track_token),
        )
    except Exception as exc:
        return 500, {"detail": f"Email send failed: {exc}"}

    log = OutreachLog.objects.create(
        prospect=prospect,
        template=template,
        channel="email",
        to_address=payload.to,
        cc_addresses=", ".join(payload.cc or []),
        subject_sent=payload.subject,
        body_sent=payload.body,
        resend_id=resend_id,
        email_track_token=email_track_token,
        link_click_token=link_click_token,
    )

    if prospect:
        prospect.last_contacted_at = timezone.now()
        prospect.save(update_fields=["last_contacted_at", "updated_at"])

    return 200, {"log_id": log.id, "resend_id": resend_id}


# ── Outreach Logs ─────────────────────────────────────────────────────────────


class LogOut(Schema):
    id: int
    channel: str
    to_address: str
    cc_addresses: str
    subject_sent: str
    body_sent: str
    html_body_sent: str
    resend_id: str
    notes: str
    sent_at: str
    template_id: Optional[int]
    template_name: Optional[str]
    read_at: Optional[str]
    link_clicked_at: Optional[str]


class LogIn(Schema):
    channel: str = "whatsapp"
    to_address: str = ""
    subject_sent: str = ""
    body_sent: str = ""
    notes: str = ""
    template_id: Optional[int] = None


def _ser_log(log: OutreachLog) -> dict:
    return {
        "id": log.id,
        "channel": log.channel,
        "to_address": log.to_address,
        "cc_addresses": log.cc_addresses,
        "subject_sent": log.subject_sent,
        "body_sent": log.body_sent,
        "html_body_sent": log.html_body_sent,
        "resend_id": log.resend_id,
        "notes": log.notes,
        "sent_at": log.sent_at.isoformat(),
        "template_id": log.template_id,
        "template_name": log.template.name if log.template_id else None,
        "read_at": log.read_at.isoformat() if log.read_at else None,
        "link_clicked_at": log.link_clicked_at.isoformat() if log.link_clicked_at else None,
    }


@router.get("/prospects/{prospect_id}/logs", response={200: list[LogOut], 404: ErrorOut})
def list_logs(request, prospect_id: int):
    require_gk_admin(request)
    if not Prospect.objects.filter(pk=prospect_id).exists():
        return 404, {"detail": "Prospect not found."}
    logs = OutreachLog.objects.filter(prospect_id=prospect_id).select_related("template")
    return 200, [_ser_log(lg) for lg in logs]


@router.post("/prospects/{prospect_id}/logs", response={201: LogOut, 404: ErrorOut})
def add_log(request, prospect_id: int, payload: LogIn):
    require_gk_admin(request)
    prospect = Prospect.objects.filter(pk=prospect_id).first()
    if prospect is None:
        return 404, {"detail": "Prospect not found."}

    template = None
    if payload.template_id:
        template = MessageTemplate.objects.filter(pk=payload.template_id).first()

    log = OutreachLog.objects.create(
        prospect=prospect,
        template=template,
        channel=payload.channel,
        to_address=payload.to_address,
        subject_sent=payload.subject_sent,
        body_sent=payload.body_sent,
        notes=payload.notes,
    )

    prospect.last_contacted_at = timezone.now()
    prospect.save(update_fields=["last_contacted_at", "updated_at"])

    return 201, _ser_log(log)


@router.delete("/logs/{log_id}", response={204: None, 404: ErrorOut})
def delete_log(request, log_id: int):
    require_gk_admin(request)
    log = OutreachLog.objects.filter(pk=log_id).first()
    if log is None:
        return 404, {"detail": "Log not found."}
    log.delete()
    return 204, None

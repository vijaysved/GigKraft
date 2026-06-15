"""Vendor CRM endpoints — gk_admin only.

Routes:
  /vendors/templates          — EmailTemplate CRUD
  /vendors/{id}/communications — VendorCommunication log
  /vendors                    — VendorContact CRUD + bulk ops
"""
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from common.permissions import require_gk_admin
from vendors.models import EmailTemplate, VendorCommunication, VendorContact

router = Router(tags=["vendors"], auth=jwt_auth)


class ErrorOut(Schema):
    detail: str


# ── EmailTemplate ─────────────────────────────────────────────────────────────


class TemplateOut(Schema):
    id: int
    name: str
    kind: str
    subject: str
    body: str
    is_default: bool
    created_at: str
    updated_at: str


class TemplateIn(Schema):
    name: str
    kind: str = EmailTemplate.Kind.INTRO
    subject: str
    body: str
    is_default: bool = False


class TemplatePatchIn(Schema):
    name: Optional[str] = None
    kind: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    is_default: Optional[bool] = None


class TemplatePreviewOut(Schema):
    subject: str
    body: str
    mailto_link: str


def _serialize_template(t: EmailTemplate) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "kind": t.kind,
        "subject": t.subject,
        "body": t.body,
        "is_default": t.is_default,
        "created_at": t.created_at.isoformat(),
        "updated_at": t.updated_at.isoformat(),
    }


@router.get("/templates", response=list[TemplateOut])
def list_templates(request, kind: Optional[str] = None):
    require_gk_admin(request)
    qs = EmailTemplate.objects.all()
    if kind:
        qs = qs.filter(kind=kind)
    return [_serialize_template(t) for t in qs]


@router.post("/templates", response={201: TemplateOut, 400: ErrorOut})
def create_template(request, payload: TemplateIn):
    require_gk_admin(request)
    if not payload.name.strip():
        return 400, {"detail": "name is required."}
    t = EmailTemplate.objects.create(**payload.dict())
    return 201, _serialize_template(t)


@router.get("/templates/{template_id}", response={200: TemplateOut, 404: ErrorOut})
def get_template(request, template_id: int):
    require_gk_admin(request)
    t = EmailTemplate.objects.filter(pk=template_id).first()
    if t is None:
        return 404, {"detail": "Template not found."}
    return 200, _serialize_template(t)


@router.patch("/templates/{template_id}", response={200: TemplateOut, 404: ErrorOut})
def update_template(request, template_id: int, payload: TemplatePatchIn):
    require_gk_admin(request)
    t = EmailTemplate.objects.filter(pk=template_id).first()
    if t is None:
        return 404, {"detail": "Template not found."}
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(t, field, value)
    t.save()
    return 200, _serialize_template(t)


@router.delete("/templates/{template_id}", response={204: None, 404: ErrorOut})
def delete_template(request, template_id: int):
    require_gk_admin(request)
    t = EmailTemplate.objects.filter(pk=template_id).first()
    if t is None:
        return 404, {"detail": "Template not found."}
    t.delete()
    return 204, None


@router.get(
    "/templates/{template_id}/preview/{vendor_id}",
    response={200: TemplatePreviewOut, 404: ErrorOut},
)
def preview_template(request, template_id: int, vendor_id: int):
    """Render a template with a specific vendor's variables."""
    require_gk_admin(request)
    t = EmailTemplate.objects.filter(pk=template_id).first()
    if t is None:
        return 404, {"detail": "Template not found."}
    v = VendorContact.objects.filter(pk=vendor_id).first()
    if v is None:
        return 404, {"detail": "Vendor not found."}
    subject, body = t.render(v)
    return 200, {"subject": subject, "body": body, "mailto_link": t.mailto_link(v)}


# ── VendorCommunication ───────────────────────────────────────────────────────


class CommunicationOut(Schema):
    id: int
    vendor_id: int
    template_id: Optional[int]
    template_name: Optional[str]
    channel: str
    subject_sent: str
    body_sent: str
    notes: str
    sent_at: str


class CommunicationIn(Schema):
    template_id: Optional[int] = None
    channel: str = VendorCommunication.Channel.EMAIL
    subject_sent: str = ""
    body_sent: str = ""
    notes: str = ""
    sent_at: Optional[str] = None
    # When true, also move vendor status → "contacted" if still "new"
    advance_status: bool = True


def _serialize_comm(c: VendorCommunication) -> dict:
    return {
        "id": c.id,
        "vendor_id": c.vendor_id,
        "template_id": c.template_id,
        "template_name": c.template.name if c.template_id else None,
        "channel": c.channel,
        "subject_sent": c.subject_sent,
        "body_sent": c.body_sent,
        "notes": c.notes,
        "sent_at": c.sent_at.isoformat(),
    }


@router.get("/{vendor_id}/communications", response={200: list[CommunicationOut], 404: ErrorOut})
def list_communications(request, vendor_id: int):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=vendor_id).first()
    if v is None:
        return 404, {"detail": "Vendor not found."}
    comms = v.communications.select_related("template").all()
    return 200, [_serialize_comm(c) for c in comms]


@router.post(
    "/{vendor_id}/communications",
    response={201: CommunicationOut, 400: ErrorOut, 404: ErrorOut},
)
def log_communication(request, vendor_id: int, payload: CommunicationIn):
    """Log that an outreach was sent.

    - Sets vendor.last_contact_date to today.
    - Optionally advances vendor status from 'new' → 'contacted'.
    """
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=vendor_id).first()
    if v is None:
        return 404, {"detail": "Vendor not found."}

    template = None
    subject = payload.subject_sent
    body = payload.body_sent

    if payload.template_id:
        template = EmailTemplate.objects.filter(pk=payload.template_id).first()
        if template is None:
            return 400, {"detail": "Template not found."}
        # If caller didn't pre-render, render now
        if not subject and not body:
            subject, body = template.render(v)

    sent_at = timezone.now()
    if payload.sent_at:
        from django.utils.dateparse import parse_datetime
        parsed = parse_datetime(payload.sent_at)
        if parsed:
            sent_at = parsed

    comm = VendorCommunication.objects.create(
        vendor=v,
        template=template,
        channel=payload.channel,
        subject_sent=subject,
        body_sent=body,
        notes=payload.notes,
        sent_at=sent_at,
    )

    # Update vendor last_contact_date
    v.last_contact_date = sent_at.date()
    if payload.advance_status and v.status == VendorContact.Status.NEW:
        v.status = VendorContact.Status.CONTACTED
    v.save(update_fields=["last_contact_date", "status", "updated_at"])

    return 201, _serialize_comm(comm)


@router.delete(
    "/{vendor_id}/communications/{comm_id}",
    response={204: None, 404: ErrorOut},
)
def delete_communication(request, vendor_id: int, comm_id: int):
    require_gk_admin(request)
    c = VendorCommunication.objects.filter(pk=comm_id, vendor_id=vendor_id).first()
    if c is None:
        return 404, {"detail": "Communication log not found."}
    c.delete()
    return 204, None


# ── VendorContact CRUD ────────────────────────────────────────────────────────


class VendorOut(Schema):
    id: int
    vendor_id: str
    business_name: str
    contact_person: str
    category: str
    lead_source: str
    phone: str
    email: str
    nextdoor_profile_url: str
    status: str
    preferred_channel: str
    last_contact_date: Optional[str]
    notes: str
    whatsapp_link: str
    email_link: str
    created_at: str
    updated_at: str


class VendorIn(Schema):
    business_name: str = ""
    contact_person: str
    category: str = ""
    lead_source: str = VendorContact.LeadSource.NEXTDOOR
    phone: str = ""
    email: str = ""
    nextdoor_profile_url: str = ""
    status: str = VendorContact.Status.NEW
    preferred_channel: str = VendorContact.PreferredChannel.WHATSAPP
    last_contact_date: Optional[str] = None
    notes: str = ""


class VendorPatchIn(Schema):
    business_name: Optional[str] = None
    contact_person: Optional[str] = None
    category: Optional[str] = None
    lead_source: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    nextdoor_profile_url: Optional[str] = None
    status: Optional[str] = None
    preferred_channel: Optional[str] = None
    last_contact_date: Optional[str] = None
    notes: Optional[str] = None


class BulkStatusIn(Schema):
    ids: list[int]
    status: str


def _serialize(v: VendorContact) -> dict:
    return {
        "id": v.id,
        "vendor_id": v.vendor_id,
        "business_name": v.business_name,
        "contact_person": v.contact_person,
        "category": v.category,
        "lead_source": v.lead_source,
        "phone": v.phone,
        "email": v.email,
        "nextdoor_profile_url": v.nextdoor_profile_url,
        "status": v.status,
        "preferred_channel": v.preferred_channel,
        "last_contact_date": v.last_contact_date.isoformat() if v.last_contact_date else None,
        "notes": v.notes,
        "whatsapp_link": v.whatsapp_link,
        "email_link": v.email_link,
        "created_at": v.created_at.isoformat(),
        "updated_at": v.updated_at.isoformat(),
    }


@router.get("", response=list[VendorOut])
def list_vendors(
    request,
    status: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
):
    require_gk_admin(request)
    qs = VendorContact.objects.all()
    if status:
        qs = qs.filter(status=status)
    if source:
        qs = qs.filter(lead_source=source)
    if search:
        qs = qs.filter(contact_person__icontains=search) | qs.filter(
            business_name__icontains=search
        )
    return [_serialize(v) for v in qs[:500]]


@router.post("", response={201: VendorOut, 400: ErrorOut})
def create_vendor(request, payload: VendorIn):
    require_gk_admin(request)
    if not payload.contact_person.strip():
        return 400, {"detail": "contact_person is required."}
    v = VendorContact.objects.create(**payload.dict())
    return 201, _serialize(v)


@router.get("/{vendor_id}", response={200: VendorOut, 404: ErrorOut})
def get_vendor(request, vendor_id: int):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=vendor_id).first()
    if v is None:
        return 404, {"detail": "Vendor not found."}
    return 200, _serialize(v)


@router.patch("/{vendor_id}", response={200: VendorOut, 404: ErrorOut})
def update_vendor(request, vendor_id: int, payload: VendorPatchIn):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=vendor_id).first()
    if v is None:
        return 404, {"detail": "Vendor not found."}
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(v, field, value)
    v.save()
    return 200, _serialize(v)


@router.delete("/{vendor_id}", response={204: None, 404: ErrorOut})
def delete_vendor(request, vendor_id: int):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=vendor_id).first()
    if v is None:
        return 404, {"detail": "Vendor not found."}
    v.delete()
    return 204, None


@router.post("/bulk-status", response={200: list[VendorOut], 400: ErrorOut})
def bulk_update_status(request, payload: BulkStatusIn):
    require_gk_admin(request)
    valid_statuses = [s[0] for s in VendorContact.Status.choices]
    if payload.status not in valid_statuses:
        return 400, {"detail": f"Invalid status '{payload.status}'."}
    VendorContact.objects.filter(pk__in=payload.ids).update(status=payload.status)
    updated = VendorContact.objects.filter(pk__in=payload.ids)
    return 200, [_serialize(v) for v in updated]

"""Prospect (vendor contact) endpoints — gk_admin only.

All template management and email sending has moved to the comms app.

New public endpoint (no auth):
  POST /vendors/track-view   — record a page view for /pros/{handle}, optionally link to prospect via ref
"""
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema

from accounts.auth import jwt_auth
from common.permissions import require_gk_admin
from vendors.models import ProPageView, VendorContact

router = Router(tags=["prospects"], auth=jwt_auth)
public_router = Router(tags=["prospects-public"])


class ErrorOut(Schema):
    detail: str


class ProspectOut(Schema):
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
    last_seen: Optional[str]
    tags: list[str]
    page_view_count: int
    notes: str
    whatsapp_link: str
    email_link: str
    created_at: str
    updated_at: str


class ProspectIn(Schema):
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
    tags: list[str] = []
    notes: str = ""


class ProspectPatchIn(Schema):
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
    tags: Optional[list[str]] = None
    notes: Optional[str] = None


class BulkStatusIn(Schema):
    ids: list[int]
    status: str


class BulkIntroIn(Schema):
    ids: list[int]
    template_id: Optional[int] = None  # if None, use default intro email template


class BulkIntroResultItem(Schema):
    prospect_id: int
    vendor_id: str
    email: str
    sent: bool
    error: str


class ProspectStatsOut(Schema):
    total: int
    new_7_days: int
    total_emails_sent: int
    total_page_views: int


class TrackViewIn(Schema):
    pro_handle: str
    ref: Optional[str] = None  # vendor_id like GK-001


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
        "last_seen": v.last_seen.isoformat() if v.last_seen else None,
        "tags": v.tags or [],
        "page_view_count": v.page_views.count(),
        "notes": v.notes,
        "whatsapp_link": v.whatsapp_link,
        "email_link": v.email_link,
        "created_at": v.created_at.isoformat(),
        "updated_at": v.updated_at.isoformat(),
    }


@router.get("/stats", response=ProspectStatsOut)
def get_stats(request):
    require_gk_admin(request)
    from django.utils import timezone
    from datetime import timedelta
    from comms.models import OutreachLog

    cutoff = timezone.now() - timedelta(days=7)
    total = VendorContact.objects.count()
    new_7_days = VendorContact.objects.filter(created_at__gte=cutoff).count()
    total_emails = OutreachLog.objects.filter(channel="email").count()
    total_views = ProPageView.objects.count()
    return {
        "total": total,
        "new_7_days": new_7_days,
        "total_emails_sent": total_emails,
        "total_page_views": total_views,
    }


@router.get("", response=list[ProspectOut])
def list_prospects(
    request,
    status: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    tag: Optional[str] = None,
):
    require_gk_admin(request)
    qs = VendorContact.objects.prefetch_related("page_views").all()
    if status:
        qs = qs.filter(status=status)
    if source:
        qs = qs.filter(lead_source=source)
    if search:
        qs = qs.filter(contact_person__icontains=search) | qs.filter(
            business_name__icontains=search
        )
    if tag:
        qs = qs.filter(tags__contains=[tag])
    return [_serialize(v) for v in qs[:500]]


@router.post("", response={201: ProspectOut, 400: ErrorOut})
def create_prospect(request, payload: ProspectIn):
    require_gk_admin(request)
    if not payload.contact_person.strip():
        return 400, {"detail": "contact_person is required."}
    v = VendorContact.objects.create(**payload.dict())
    return 201, _serialize(v)


@router.get("/{prospect_id}", response={200: ProspectOut, 404: ErrorOut})
def get_prospect(request, prospect_id: int):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=prospect_id).prefetch_related("page_views").first()
    if v is None:
        return 404, {"detail": "Prospect not found."}
    return 200, _serialize(v)


@router.patch("/{prospect_id}", response={200: ProspectOut, 404: ErrorOut})
def update_prospect(request, prospect_id: int, payload: ProspectPatchIn):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=prospect_id).prefetch_related("page_views").first()
    if v is None:
        return 404, {"detail": "Prospect not found."}
    data = payload.dict(exclude_unset=True)
    for field, value in data.items():
        if value is not None or field == "tags":
            setattr(v, field, value)
    v.save()
    return 200, _serialize(v)


@router.delete("/{prospect_id}", response={204: None, 404: ErrorOut})
def delete_prospect(request, prospect_id: int):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=prospect_id).first()
    if v is None:
        return 404, {"detail": "Prospect not found."}
    v.delete()
    return 204, None


@router.post("/bulk-status", response={200: list[ProspectOut], 400: ErrorOut})
def bulk_update_status(request, payload: BulkStatusIn):
    require_gk_admin(request)
    valid = [s[0] for s in VendorContact.Status.choices]
    if payload.status not in valid:
        return 400, {"detail": f"Invalid status '{payload.status}'."}
    VendorContact.objects.filter(pk__in=payload.ids).update(status=payload.status)
    updated = VendorContact.objects.filter(pk__in=payload.ids).prefetch_related("page_views")
    return 200, [_serialize(v) for v in updated]


@router.post("/bulk-intro", response={200: list[BulkIntroResultItem], 400: ErrorOut})
def bulk_send_intro(request, payload: BulkIntroIn):
    """Send the default intro email template to a list of prospects."""
    require_gk_admin(request)
    from comms.models import MessageTemplate, OutreachLog
    from comms.services import send_email as _send_email

    # Find template
    if payload.template_id:
        template = MessageTemplate.objects.filter(pk=payload.template_id, channel="email").first()
    else:
        template = (
            MessageTemplate.objects.filter(channel="email", kind="intro", is_default=True).first()
            or MessageTemplate.objects.filter(channel="email", kind="intro").first()
        )

    if template is None:
        return 400, {"detail": "No intro email template found. Create one in the Templates tab."}

    prospects = VendorContact.objects.filter(pk__in=payload.ids)
    results = []

    for prospect in prospects:
        if not prospect.email:
            results.append({
                "prospect_id": prospect.id,
                "vendor_id": prospect.vendor_id,
                "email": "",
                "sent": False,
                "error": "No email address",
            })
            continue

        subject, body = template.render(prospect.template_vars)
        try:
            resend_id = _send_email(to=prospect.email, subject=subject, body=body)
            OutreachLog.objects.create(
                prospect=prospect,
                template=template,
                channel="email",
                to_address=prospect.email,
                subject_sent=subject,
                body_sent=body,
                resend_id=resend_id,
            )
            prospect.last_contact_date = timezone.now().date()
            if prospect.status == "new":
                prospect.status = "contacted"
            prospect.save(update_fields=["status", "last_contact_date", "updated_at"])
            results.append({
                "prospect_id": prospect.id,
                "vendor_id": prospect.vendor_id,
                "email": prospect.email,
                "sent": True,
                "error": "",
            })
        except Exception as exc:
            results.append({
                "prospect_id": prospect.id,
                "vendor_id": prospect.vendor_id,
                "email": prospect.email,
                "sent": False,
                "error": str(exc),
            })

    return 200, results


# ── Public tracking endpoint (no auth) ───────────────────────────────────────

@public_router.post("/track-view")
def track_page_view(request, payload: TrackViewIn):
    """Record a visit to /pros/{handle}. Called from the frontend on page load.
    If ref=GK-001 is provided, links the view to that prospect and updates last_seen.
    """
    prospect = None
    if payload.ref:
        prospect = VendorContact.objects.filter(vendor_id=payload.ref).first()

    ProPageView.objects.create(pro_handle=payload.pro_handle, prospect=prospect)

    if prospect:
        prospect.last_seen = timezone.now()
        prospect.save(update_fields=["last_seen", "updated_at"])

    return {"ok": True}

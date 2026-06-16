"""Prospect (vendor contact) endpoints — gk_admin only.

All template management and email sending has moved to the comms app.
"""
from typing import Optional

from ninja import Router, Schema

from accounts.auth import jwt_auth
from common.permissions import require_gk_admin
from vendors.models import VendorContact

router = Router(tags=["prospects"], auth=jwt_auth)


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


@router.get("", response=list[ProspectOut])
def list_prospects(
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
    v = VendorContact.objects.filter(pk=prospect_id).first()
    if v is None:
        return 404, {"detail": "Prospect not found."}
    return 200, _serialize(v)


@router.patch("/{prospect_id}", response={200: ProspectOut, 404: ErrorOut})
def update_prospect(request, prospect_id: int, payload: ProspectPatchIn):
    require_gk_admin(request)
    v = VendorContact.objects.filter(pk=prospect_id).first()
    if v is None:
        return 404, {"detail": "Prospect not found."}
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
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
    updated = VendorContact.objects.filter(pk__in=payload.ids)
    return 200, [_serialize(v) for v in updated]

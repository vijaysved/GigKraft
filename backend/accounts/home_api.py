"""Homeowner account hub endpoints (screen 2.6) + notification prefs + public waitlist."""
from typing import Optional

from ninja import Router, Schema

from accounts.auth import jwt_auth
from accounts.models import Address, NotificationPref, ProProfile, SavedPro, WaitlistEntry
from accounts.pros_api import ProOut, serialize_pro
from common.permissions import require_homeowner
from krafts.models import Kraft, KraftPhoto
from leads.models import Lead
from recommendations.models import Recommendation

router = Router(tags=["home"], auth=jwt_auth)
prefs_router = Router(tags=["me"], auth=jwt_auth)
waitlist_router = Router(tags=["waitlist"])


class ErrorOut(Schema):
    detail: str


class OkOut(Schema):
    ok: bool


# --- Account summary ---


class HomeStatsOut(Schema):
    jobs_hired: int
    saved_pros: int
    recs_given: int


class HomeAccountOut(Schema):
    name: str
    email: Optional[str]
    phone: Optional[str]
    avatar_url: str
    primary_address: Optional[str]
    default_zip: str
    address_count: int
    stats: HomeStatsOut


@router.get("/account", response=HomeAccountOut)
def home_account(request):
    profile = require_homeowner(request)
    user = request.auth
    primary = profile.addresses.filter(is_primary=True).first() or (
        profile.addresses.first()
    )
    jobs_hired = Lead.objects.filter(
        homeowner=user, status__in=[Lead.Status.WON, Lead.Status.SCHEDULED]
    ).count()
    recs_given = Recommendation.objects.filter(
        lead__homeowner=user,
        status__in=[
            Recommendation.Status.SUBMITTED,
            Recommendation.Status.APPROVED,
        ],
    ).count()
    return {
        "name": f"{user.first_name} {user.last_name}".strip() or str(user),
        "email": user.email,
        "phone": user.phone,
        "avatar_url": profile.avatar_url,
        "primary_address": primary.line1 if primary else None,
        "default_zip": profile.default_zip,
        "address_count": profile.addresses.count(),
        "stats": {
            "jobs_hired": jobs_hired,
            "saved_pros": profile.saved_pros.count(),
            "recs_given": recs_given,
        },
    }


# --- Profile setup (onboarding) ---


class HomeProfilePatchIn(Schema):
    default_zip: Optional[str] = None
    preferred_trade: Optional[str] = None
    avatar_url: Optional[str] = None


class HomeProfileOut(Schema):
    default_zip: str
    preferred_trade: str
    avatar_url: str


@router.patch("/profile", response=HomeProfileOut)
def patch_home_profile(request, payload: HomeProfilePatchIn):
    profile = require_homeowner(request)
    update_fields = []
    if payload.default_zip is not None:
        profile.default_zip = payload.default_zip.strip()
        update_fields.append("default_zip")
    if payload.preferred_trade is not None:
        profile.preferred_trade = payload.preferred_trade.strip()
        update_fields.append("preferred_trade")
    if payload.avatar_url is not None:
        profile.avatar_url = payload.avatar_url
        update_fields.append("avatar_url")
    if update_fields:
        profile.save(update_fields=update_fields)
    return {"default_zip": profile.default_zip, "preferred_trade": profile.preferred_trade, "avatar_url": profile.avatar_url}


# --- Saved pros ---


@router.get("/saved-pros", response=list[ProOut])
def list_saved_pros(request):
    profile = require_homeowner(request)
    saved = profile.saved_pros.select_related("pro", "pro__user", "pro__user__node")
    return [serialize_pro(s.pro) for s in saved]


@router.post("/saved-pros/{pro_id}", response={201: OkOut, 404: ErrorOut})
def save_pro(request, pro_id: int):
    profile = require_homeowner(request)
    pro = ProProfile.objects.filter(pk=pro_id).first()
    if pro is None:
        return 404, {"detail": "Pro not found."}
    SavedPro.objects.get_or_create(homeowner=profile, pro=pro)
    return 201, {"ok": True}


@router.delete("/saved-pros/{pro_id}", response={200: OkOut, 404: ErrorOut})
def unsave_pro(request, pro_id: int):
    profile = require_homeowner(request)
    deleted, _ = SavedPro.objects.filter(homeowner=profile, pro_id=pro_id).delete()
    if not deleted:
        return 404, {"detail": "Pro was not saved."}
    return 200, {"ok": True}


# --- Past jobs ---


class HomeJobOut(Schema):
    lead_id: int
    job_title: str
    pro_id: Optional[int]
    pro_name: Optional[str]
    status: str
    completed_at: Optional[str]
    created_at: str
    invoice_total: Optional[float]
    after_photo_url: Optional[str]
    recommended: bool


@router.get("/jobs", response=list[HomeJobOut])
def home_jobs(request):
    """Past leads/quotes with invoice amounts (screen 2.6 'Past jobs')."""
    require_homeowner(request)
    user = request.auth
    leads = (
        Lead.objects.filter(homeowner=user)
        .select_related("pro", "pro__user")
        .prefetch_related("quotes")
    )
    rows = []
    for lead in leads[:50]:
        accepted = [q for q in lead.quotes.all() if q.accepted]
        invoice_total = float(accepted[-1].total) if accepted else None
        after_url = None
        if lead.pro:
            photo = (
                KraftPhoto.objects.filter(
                    kraft__pro=lead.pro,
                    kraft__status=Kraft.Status.VERIFIED,
                    kind=KraftPhoto.Kind.AFTER,
                )
                .order_by("kraft__created_at")
                .first()
            )
            after_url = photo.image_url if photo else None
        recommended = Recommendation.objects.filter(
            lead=lead,
            status__in=[
                Recommendation.Status.SUBMITTED,
                Recommendation.Status.APPROVED,
            ],
        ).exists()
        rows.append(
            {
                "lead_id": lead.id,
                "job_title": lead.job_title,
                "pro_id": lead.pro_id,
                "pro_name": lead.pro.display_name if lead.pro else None,
                "status": lead.status,
                "completed_at": (
                    lead.completed_at.isoformat() if lead.completed_at else None
                ),
                "created_at": lead.created_at.isoformat(),
                "invoice_total": invoice_total,
                "after_photo_url": after_url,
                "recommended": recommended,
            }
        )
    return rows


# --- Addresses ---


class AddressOut(Schema):
    id: int
    label: str
    line1: str
    zip: str
    is_primary: bool


class AddressIn(Schema):
    label: str = ""
    line1: str
    zip: str
    is_primary: bool = False


class AddressPatchIn(Schema):
    label: Optional[str] = None
    line1: Optional[str] = None
    zip: Optional[str] = None
    is_primary: Optional[bool] = None


def _serialize_address(address: Address) -> dict:
    return {
        "id": address.id,
        "label": address.label,
        "line1": address.line1,
        "zip": address.zip,
        "is_primary": address.is_primary,
    }


@router.get("/addresses", response=list[AddressOut])
def list_addresses(request):
    profile = require_homeowner(request)
    return [_serialize_address(a) for a in profile.addresses.all()]


@router.post("/addresses", response={201: AddressOut})
def create_address(request, payload: AddressIn):
    profile = require_homeowner(request)
    address = Address.objects.create(
        homeowner=profile,
        label=payload.label,
        line1=payload.line1,
        zip=payload.zip,
        is_primary=payload.is_primary,
    )
    if payload.is_primary:
        profile.addresses.exclude(pk=address.pk).update(is_primary=False)
    return 201, _serialize_address(address)


@router.patch("/addresses/{address_id}", response={200: AddressOut, 404: ErrorOut})
def update_address(request, address_id: int, payload: AddressPatchIn):
    profile = require_homeowner(request)
    address = profile.addresses.filter(pk=address_id).first()
    if address is None:
        return 404, {"detail": "Address not found."}
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(address, field, value)
    address.save()
    if address.is_primary:
        profile.addresses.exclude(pk=address.pk).update(is_primary=False)
    return 200, _serialize_address(address)


@router.delete("/addresses/{address_id}", response={200: OkOut, 404: ErrorOut})
def delete_address(request, address_id: int):
    profile = require_homeowner(request)
    deleted, _ = profile.addresses.filter(pk=address_id).delete()
    if not deleted:
        return 404, {"detail": "Address not found."}
    return 200, {"ok": True}


# --- Notification prefs (any role; lives under /api/me) ---


class NotifPrefOut(Schema):
    sms_alerts: bool
    whatsapp_dispatch: bool
    weekly_digest: bool


class NotifPrefIn(Schema):
    sms_alerts: Optional[bool] = None
    whatsapp_dispatch: Optional[bool] = None
    weekly_digest: Optional[bool] = None


@prefs_router.get("/notif-prefs", response=NotifPrefOut)
def get_notif_prefs(request):
    pref, _ = NotificationPref.objects.get_or_create(user=request.auth)
    return pref


@prefs_router.patch("/notif-prefs", response=NotifPrefOut)
def update_notif_prefs(request, payload: NotifPrefIn):
    pref, _ = NotificationPref.objects.get_or_create(user=request.auth)
    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(pref, field, value)
    pref.save()
    return pref


# ---------------------------------------------------------------------------
# Public waitlist (no auth)
# ---------------------------------------------------------------------------

class WaitlistIn(Schema):
    email: str
    name: str = ""
    google_sub: str = ""
    user_type: str = "general"
    zipcode: str = ""


class WaitlistOut(Schema):
    ok: bool
    already_registered: bool = False


@waitlist_router.post("/", response=WaitlistOut)
def join_waitlist(request, data: WaitlistIn):
    email = data.email.lower().strip()
    if not email:
        return WaitlistOut(ok=False)
    _, created = WaitlistEntry.objects.get_or_create(
        email=email,
        defaults={
            "name": data.name,
            "google_sub": data.google_sub,
            "user_type": data.user_type,
            "zipcode": data.zipcode,
        },
    )
    return WaitlistOut(ok=True, already_registered=not created)

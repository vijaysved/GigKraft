"""Referrals API — public referrer pages, follow flow, referral send, dashboard."""
import csv
import hashlib
import io
import secrets
import uuid
from datetime import timedelta
from typing import Optional

from django.db import transaction
from django.utils import timezone
from ninja import File, Router, Schema, UploadedFile
from ninja.errors import HttpError

from accounts.auth import jwt_auth, optional_jwt
from accounts.models import HomeownerProfile, ProProfile, User
from common.notify import send_sms
from common.permissions import require_referrer
from referrals.models import (
    FriendInvite,
    ProInvite,
    ReferralRequest,
    ReferralSent,
    ReferrerFollower,
    ReferrerPro,
    ReferrerProfile,
    UploadedContact,
)

public_router = Router(tags=["referrals"])
router = Router(tags=["referrals"], auth=jwt_auth)

COOKIE_NAME = "gk_follower_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_referrer_profile(slug: str) -> ReferrerProfile:
    profile = ReferrerProfile.objects.select_related("user").filter(slug=slug).first()
    if not profile:
        raise HttpError(404, "Referrer not found.")
    return profile


def _get_follower_from_cookie(request, referrer_user) -> Optional[ReferrerFollower]:
    token = request.COOKIES.get(COOKIE_NAME)
    if not token:
        return None
    return ReferrerFollower.objects.filter(referrer=referrer_user, cookie_token=token).first()


def _build_pro_card(rp: ReferrerPro, follower: Optional[ReferrerFollower]) -> dict:
    pro = rp.pro
    invite = rp.pro_invite

    if pro:
        name = pro.display_name
        trade = pro.primary_trade
        city = pro.base_zip  # using zip as city proxy
        phone = pro.user.phone or ""
        email = pro.user.email or ""
        avatar_url = pro.avatar_url or ""
        responds_in = f"{pro.response_hours}h" if pro.response_hours else None
        is_licensed = pro.licensed
        is_insured = pro.insured
        is_on_platform = True
        is_pending = False
    else:
        name = invite.name if invite else ""
        trade = invite.trade if invite else ""
        city = ""
        phone = invite.phone if invite else ""
        email = invite.email if invite else ""
        avatar_url = ""
        responds_in = None
        is_licensed = False
        is_insured = False
        is_on_platform = False
        is_pending = True

    request_status = None
    tap_to_call = False
    if follower:
        req = ReferralRequest.objects.filter(
            follower=follower, referrer_pro=rp
        ).exclude(status=ReferralRequest.Status.DECLINED).order_by("-created_at").first()
        if req:
            request_status = req.status
            if req.status == ReferralRequest.Status.SENT:
                tap_to_call = True

    return {
        "id": rp.pk,
        "name": name,
        "trade": trade,
        "city": city,
        "phone": phone,
        "email": email,
        "avatar_url": avatar_url,
        "endorsement": rp.endorsement,
        "responds_in": responds_in,
        "is_licensed": is_licensed,
        "is_insured": is_insured,
        "is_on_platform": is_on_platform,
        "is_pending": is_pending,
        "tap_to_call": tap_to_call,
        "request_status": request_status,
    }


def _dispatch_referral(request_obj: ReferralRequest):
    """Send both SMS messages and create ReferralSent. Assumes phone is verified."""
    follower = request_obj.follower
    rp = request_obj.referrer_pro
    referrer_user = request_obj.referrer

    note_follower = request_obj.pending_note_to_follower
    note_pro = request_obj.pending_note_to_pro

    # Resolve pro contact
    pro_phone = ""
    pro_name = ""
    if rp:
        if rp.pro:
            pro_phone = rp.pro.user.phone or ""
            pro_name = rp.pro.display_name
        elif rp.pro_invite:
            pro_phone = rp.pro_invite.phone
            pro_name = rp.pro_invite.name

    # Build and send SMS to follower
    follower_body = f"{note_follower}\n\n{pro_name}: {pro_phone}".strip()
    send_sms(follower.phone, follower_body)
    follower_sms_status = "sent"

    # Build and send SMS to pro
    pro_body = f"{note_pro}\n\n{follower.name}: {follower.phone}".strip()
    send_sms(pro_phone, pro_body)
    pro_sms_status = "sent"

    with transaction.atomic():
        request_obj.status = ReferralRequest.Status.SENT
        request_obj.otp_code_hash = ""
        request_obj.otp_expires_at = None
        request_obj.save(update_fields=["status", "otp_code_hash", "otp_expires_at"])

        sent = ReferralSent.objects.create(
            referral_request=request_obj,
            referrer=referrer_user,
            follower=follower,
            referrer_pro=rp,
            note_to_follower=note_follower,
            note_to_pro=note_pro,
            follower_sms_status=follower_sms_status,
            pro_sms_status=pro_sms_status,
        )

        # Increment counters
        ReferrerProfile.objects.filter(user=referrer_user).update(
            referral_count=models_F("referral_count") + 1
        )
        ReferrerFollower.objects.filter(pk=follower.pk).update(
            referrals_received=models_F("referrals_received") + 1
        )
        if rp:
            ReferrerPro.objects.filter(pk=rp.pk).update(
                referral_count=models_F("referral_count") + 1
            )

    return sent


# Use F() from django.db.models
from django.db.models import F as models_F


# ---------------------------------------------------------------------------
# Public schemas
# ---------------------------------------------------------------------------

class CheckSlugOut(Schema):
    available: bool
    suggestion: Optional[str] = None


class ProCardOut(Schema):
    id: int
    name: str
    trade: str
    city: str
    phone: str
    email: str
    avatar_url: str
    endorsement: str
    responds_in: Optional[str] = None
    is_licensed: bool
    is_insured: bool
    is_on_platform: bool
    is_pending: bool
    tap_to_call: bool
    request_status: Optional[str] = None


class FollowerStateOut(Schema):
    follower_id: int
    name: str


class ReferrerPublicOut(Schema):
    slug: str
    display_name: str
    bio: str
    avatar_url: str
    follower_count: int
    referral_count: int
    pros: list[ProCardOut]
    follower_state: Optional[FollowerStateOut] = None
    is_owner: bool
    phone: Optional[str] = None
    email: Optional[str] = None


class FollowIn(Schema):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None


class FollowOut(Schema):
    follower_id: int
    token: str


class ReferralRequestIn(Schema):
    referrer_pro_id: Optional[int] = None
    job_description: Optional[str] = None


class ReferralRequestCreatedOut(Schema):
    request_id: int
    status: str


class ProSearchResultOut(Schema):
    user_id: int
    handle: str
    name: str
    trade: str
    city: str
    avatar_url: str
    is_verified: bool
    is_pro: bool = True


# ---------------------------------------------------------------------------
# Dashboard schemas
# ---------------------------------------------------------------------------

class ReferrerProfileOut(Schema):
    slug: str
    bio: str
    avatar_url: str
    default_zip: str
    page_url: str
    slug_locked: bool = False
    notify_email: bool = True
    notify_sms: bool = False


class ReferrerStatsOut(Schema):
    follower_count: int
    pending_request_count: int
    referral_count: int


class ReferrerDashboardOut(Schema):
    profile: ReferrerProfileOut
    stats: ReferrerStatsOut


class UpdateProfileIn(Schema):
    slug: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    default_zip: Optional[str] = None
    notify_email: Optional[bool] = None
    notify_sms: Optional[bool] = None


class ReferrerProDashboardOut(Schema):
    id: int
    name: str
    trade: str
    phone: str
    email: str
    avatar_url: str
    endorsement: str
    show_on_page: bool
    display_order: int
    referral_count: int
    is_on_platform: bool
    is_pending: bool
    invite_status: Optional[str] = None
    added_at: str


class AddProIn(Schema):
    pro_handle: str
    endorsement: Optional[str] = None


class UpdateProIn(Schema):
    endorsement: Optional[str] = None
    show_on_page: Optional[bool] = None


class ReorderProsIn(Schema):
    ordered_ids: list[int]


class InviteProIn(Schema):
    name: str
    trade: str = ""
    phone: Optional[str] = None
    email: Optional[str] = None
    note: Optional[str] = None
    channel: str = ""


class InviteProOut(Schema):
    invite_id: int
    referrer_pro_id: int
    token: str
    referrer_slug: str


class InviteProResendOut(Schema):
    ok: bool
    token: str
    referrer_slug: str


class ProInvitePreviewOut(Schema):
    referrer_slug: str
    referrer_name: str
    pro_name: str
    pro_id: int


class FriendInviteeIn(Schema):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None


class InviteFriendIn(Schema):
    invitees: list[FriendInviteeIn]


class InviteFriendOut(Schema):
    sent_count: int
    invite_ids: list[int]


class InviteFriendSingleIn(Schema):
    name: str
    phone: str
    channel: str = ""


class InviteFriendSingleOut(Schema):
    invite_id: int
    token: str
    referrer_slug: str


class FriendInviteResendOut(Schema):
    ok: bool
    token: str
    referrer_slug: str


class InviteListProOut(Schema):
    invite_id: int
    name: str
    trade: str
    phone: str
    channel: str
    status: str
    click_count: int
    invited_at: str
    last_resent_at: Optional[str] = None


class InviteListFriendOut(Schema):
    invite_id: int
    name: str
    phone: str
    channel: str
    status: str
    click_count: int
    invited_at: str
    last_resent_at: Optional[str] = None


class InviteListOut(Schema):
    pro_invites: list[InviteListProOut]
    friend_invites: list[InviteListFriendOut]


class MatchedContactOut(Schema):
    contact_id: int
    contact_name: str
    pro_id: int
    pro_handle: str
    pro_name: str
    trade: str
    already_on_list: bool


class UploadContactsOut(Schema):
    scanned: int
    matched: list[MatchedContactOut]
    unmatched_count: int


class AddMatchedContactsIn(Schema):
    pro_ids: list[int]


class AddMatchedContactsOut(Schema):
    added_count: int
    skipped_count: int


class ReferralRequestDetailOut(Schema):
    id: int
    follower_name: str
    follower_phone: str
    pro_name: Optional[str] = None
    pro_trade: Optional[str] = None
    job_description: str
    status: str
    created_at: str


class SendReferralIn(Schema):
    referrer_pro_id: int
    note_to_follower: str
    note_to_pro: str


class SendReferralOut(Schema):
    otp_required: bool
    referral_sent_id: Optional[int] = None
    message: Optional[str] = None


class VerifyOtpIn(Schema):
    otp: str


class VerifyOtpOut(Schema):
    verified: bool
    referral_sent_id: Optional[int] = None
    error: Optional[str] = None


class FollowerOut(Schema):
    id: int
    name: str
    phone: str
    email: str
    followed_at: str
    referrals_received: int


class FollowersPageOut(Schema):
    total: int
    results: list[FollowerOut]


class ReferralSentSummaryOut(Schema):
    id: int
    follower_name: str
    pro_name: str
    sent_at: str


class ActivityPageOut(Schema):
    total: int
    results: list[ReferralSentSummaryOut]


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

@public_router.get("/check-slug", response=CheckSlugOut)
def check_slug(request, slug: str):
    taken = ReferrerProfile.objects.filter(slug=slug).exists()
    suggestion = None
    if taken:
        base = slug[:28]
        i = 2
        while ReferrerProfile.objects.filter(slug=f"{base}-{i}").exists():
            i += 1
        suggestion = f"{base}-{i}"
    return {"available": not taken, "suggestion": suggestion}


@public_router.get("/pros/search", response=list[ProSearchResultOut])
def search_pros(request, q: str, trade: Optional[str] = None):
    if len(q) < 2:
        return []
    qs = ProProfile.objects.select_related("user").filter(
        is_suspended=False, is_template=False
    )
    from django.db.models import Q as DQ
    qs = qs.filter(
        DQ(handle__icontains=q)
        | DQ(business_name__icontains=q)
        | DQ(primary_trade__icontains=q)
        | DQ(user__first_name__icontains=q)
        | DQ(user__last_name__icontains=q)
    )
    if trade:
        qs = qs.filter(primary_trade__icontains=trade)
    results = []
    for pro in qs[:20]:
        results.append({
            "user_id": pro.user_id,
            "handle": pro.handle or "",
            "name": pro.display_name,
            "trade": pro.primary_trade,
            "city": pro.base_zip,
            "avatar_url": pro.avatar_url,
            "is_verified": pro.is_verified,
        })
    return results


@public_router.get("/{slug}", response=ReferrerPublicOut, auth=optional_jwt)
def referrer_public_page(request, slug: str):
    profile = _get_referrer_profile(slug)

    follower = None
    token = request.COOKIES.get(COOKIE_NAME)
    if token:
        follower = ReferrerFollower.objects.filter(
            referrer=profile.user, cookie_token=token
        ).first()

    pros_qs = ReferrerPro.objects.select_related(
        "pro", "pro__user", "pro_invite"
    ).filter(referrer=profile.user, show_on_page=True)

    authed_user = getattr(request, "auth", None)
    is_owner = bool(authed_user and authed_user == profile.user)

    # Fall back to any other profile that has a picture
    avatar_url = profile.avatar_url
    if not avatar_url:
        ho = HomeownerProfile.objects.filter(user=profile.user).only("avatar_url").first()
        if ho and ho.avatar_url:
            avatar_url = ho.avatar_url
    if not avatar_url:
        pp = ProProfile.objects.filter(user=profile.user).only("avatar_url").first()
        if pp and pp.avatar_url:
            avatar_url = pp.avatar_url
    # Backfill so future requests skip this lookup
    if avatar_url and not profile.avatar_url:
        profile.avatar_url = avatar_url
        profile.save(update_fields=["avatar_url"])

    return {
        "slug": profile.slug,
        "display_name": f"{profile.user.first_name} {profile.user.last_name}".strip() or str(profile.user),
        "bio": profile.bio,
        "avatar_url": avatar_url,
        "follower_count": profile.follower_count,
        "referral_count": profile.referral_count,
        "pros": [_build_pro_card(rp, follower) for rp in pros_qs],
        "follower_state": {"follower_id": follower.pk, "name": follower.name} if follower else None,
        "is_owner": is_owner,
        "phone": profile.user.phone if authed_user else None,
        "email": profile.user.email if authed_user else None,
    }


@public_router.post("/{slug}/follow", response=FollowOut)
def follow_referrer(request, slug: str, payload: FollowIn, response):
    if not payload.phone and not payload.email:
        raise HttpError(422, "Phone or email is required.")

    profile = _get_referrer_profile(slug)
    referrer = profile.user

    # Idempotency: return existing token if already following
    existing = None
    if payload.phone:
        existing = ReferrerFollower.objects.filter(referrer=referrer, phone=payload.phone).first()
    if not existing and payload.email:
        existing = ReferrerFollower.objects.filter(referrer=referrer, email=payload.email).first()

    if existing:
        response.set_cookie(COOKIE_NAME, existing.cookie_token, max_age=COOKIE_MAX_AGE, httponly=True, samesite="Lax")
        return {"follower_id": existing.pk, "token": existing.cookie_token}

    token = uuid.uuid4().hex
    with transaction.atomic():
        follower = ReferrerFollower.objects.create(
            referrer=referrer,
            name=payload.name,
            phone=payload.phone or "",
            email=payload.email or "",
            cookie_token=token,
        )
        ReferrerProfile.objects.filter(user=referrer).update(
            follower_count=models_F("follower_count") + 1
        )

    # Notify referrer
    referrer_phone = referrer.phone or ""
    if referrer_phone:
        send_sms(referrer_phone, f"{payload.name} started following your page on GigKraft.")

    response.set_cookie(COOKIE_NAME, token, max_age=COOKIE_MAX_AGE, httponly=True, samesite="Lax")
    return {"follower_id": follower.pk, "token": token}


@public_router.post("/{slug}/request", response={201: ReferralRequestCreatedOut, 403: dict, 409: dict})
def submit_referral_request(request, slug: str, payload: ReferralRequestIn):
    profile = _get_referrer_profile(slug)
    follower = _get_follower_from_cookie(request, profile.user)
    if not follower:
        return 403, {"detail": "You must follow this referrer before requesting a referral."}

    rp = None
    if payload.referrer_pro_id:
        rp = ReferrerPro.objects.filter(pk=payload.referrer_pro_id, referrer=profile.user).first()
        if not rp:
            raise HttpError(404, "Pro not found on this referrer's page.")

    # Uniqueness check: one PENDING/OTP_PENDING per (follower, referrer_pro)
    existing = ReferralRequest.objects.filter(
        referrer=profile.user,
        follower=follower,
        referrer_pro=rp,
        status__in=[ReferralRequest.Status.PENDING, ReferralRequest.Status.OTP_PENDING],
    ).first()
    if existing:
        return 409, {"detail": "A referral request for this pro is already pending."}

    req = ReferralRequest.objects.create(
        referrer=profile.user,
        follower=follower,
        referrer_pro=rp,
        job_description=payload.job_description or "",
    )

    # Notify referrer via SMS
    pro_label = rp.display_name if rp else "a pro"
    referrer_phone = profile.user.phone or ""
    if referrer_phone:
        send_sms(
            referrer_phone,
            f"{follower.name} requested a referral for {pro_label}. "
            f"Review at gigkraft.com/us/me/refer",
        )

    return 201, {"request_id": req.pk, "status": req.status}


# ---------------------------------------------------------------------------
# Authenticated dashboard endpoints
# ---------------------------------------------------------------------------

@router.get("/me", response=ReferrerDashboardOut)
def dashboard(request):
    profile = require_referrer(request)
    pending_count = ReferralRequest.objects.filter(
        referrer=request.auth,
        status__in=[ReferralRequest.Status.PENDING, ReferralRequest.Status.OTP_PENDING],
    ).count()
    return {
        "profile": {
            "slug": profile.slug,
            "bio": profile.bio,
            "avatar_url": profile.avatar_url,
            "default_zip": profile.default_zip,
            "page_url": f"gigkraft.com/us/{profile.slug}/refer",
            "slug_locked": profile.slug_locked,
            "notify_email": profile.notify_email,
            "notify_sms": profile.notify_sms,
        },
        "stats": {
            "follower_count": profile.follower_count,
            "pending_request_count": pending_count,
            "referral_count": profile.referral_count,
        },
    }


@router.patch("/me/profile", response={200: ReferrerProfileOut, 409: dict})
def update_profile(request, payload: UpdateProfileIn):
    profile = require_referrer(request)
    data = payload.dict(exclude_unset=True)

    if "slug" in data and data["slug"] != profile.slug:
        if profile.slug_locked:
            return 409, {"detail": "Slug is locked and cannot be changed."}
        new_slug = data["slug"]
        if ReferrerProfile.objects.exclude(pk=profile.pk).filter(slug=new_slug).exists():
            base = new_slug[:28]
            i = 2
            while ReferrerProfile.objects.filter(slug=f"{base}-{i}").exists():
                i += 1
            return 409, {"detail": "Slug taken.", "suggestion": f"{base}-{i}"}
        profile.slug = new_slug
        profile.slug_locked = True

    for field in ("bio", "avatar_url", "default_zip"):
        if field in data:
            setattr(profile, field, data[field])

    if "notify_email" in data:
        profile.notify_email = data["notify_email"]
    if "notify_sms" in data:
        profile.notify_sms = data["notify_sms"]

    profile.save()
    return 200, {
        "slug": profile.slug,
        "bio": profile.bio,
        "avatar_url": profile.avatar_url,
        "default_zip": profile.default_zip,
        "page_url": f"gigkraft.com/us/{profile.slug}/refer",
        "slug_locked": profile.slug_locked,
        "notify_email": profile.notify_email,
        "notify_sms": profile.notify_sms,
    }


def _serialize_referrer_pro(rp: ReferrerPro) -> dict:
    if rp.pro:
        name = rp.pro.display_name
        trade = rp.pro.primary_trade
        phone = rp.pro.user.phone or ""
        email = rp.pro.user.email or ""
        avatar_url = rp.pro.avatar_url
        is_on_platform = True
        is_pending = False
        invite_status = None
    elif rp.pro_invite:
        name = rp.pro_invite.name
        trade = rp.pro_invite.trade
        phone = rp.pro_invite.phone
        email = rp.pro_invite.email
        avatar_url = ""
        is_on_platform = False
        is_pending = rp.pro_invite.status == ProInvite.Status.PENDING
        invite_status = rp.pro_invite.status
    else:
        name = trade = phone = email = avatar_url = ""
        is_on_platform = False
        is_pending = False
        invite_status = None

    return {
        "id": rp.pk,
        "name": name,
        "trade": trade,
        "phone": phone,
        "email": email,
        "avatar_url": avatar_url,
        "endorsement": rp.endorsement,
        "show_on_page": rp.show_on_page,
        "display_order": rp.display_order,
        "referral_count": rp.referral_count,
        "is_on_platform": is_on_platform,
        "is_pending": is_pending,
        "invite_status": invite_status,
        "added_at": rp.added_at.isoformat(),
    }


@router.get("/me/pros", response=list[ReferrerProDashboardOut])
def list_my_pros(request):
    profile = require_referrer(request)
    pros = ReferrerPro.objects.select_related("pro", "pro__user", "pro_invite").filter(
        referrer=request.auth
    )
    return [_serialize_referrer_pro(rp) for rp in pros]


@router.post("/me/pros", response={201: ReferrerProDashboardOut, 404: dict, 409: dict})
def add_pro(request, payload: AddProIn):
    profile = require_referrer(request)
    pro = ProProfile.objects.select_related("user").filter(handle=payload.pro_handle).first()
    if not pro:
        return 404, {"detail": "Pro not found."}
    if ReferrerPro.objects.filter(referrer=request.auth, pro=pro).exists():
        return 409, {"detail": "This pro is already on your page."}

    # Set display_order to end of list
    max_order = ReferrerPro.objects.filter(referrer=request.auth).count()
    rp = ReferrerPro.objects.create(
        referrer=request.auth,
        pro=pro,
        endorsement=payload.endorsement or "",
        display_order=max_order,
    )
    return 201, _serialize_referrer_pro(rp)


@router.patch("/me/pros/reorder", response={200: dict})
def reorder_pros(request, payload: ReorderProsIn):
    profile = require_referrer(request)
    owned_ids = set(
        ReferrerPro.objects.filter(referrer=request.auth).values_list("pk", flat=True)
    )
    for pid in payload.ordered_ids:
        if pid not in owned_ids:
            raise HttpError(403, f"Pro {pid} does not belong to your page.")

    for order, pid in enumerate(payload.ordered_ids):
        ReferrerPro.objects.filter(pk=pid).update(display_order=order)
    return 200, {"ok": True}


@router.get("/me/pros/lookup", response={200: ProSearchResultOut, 404: dict})
def lookup_pro_by_contact(request, phone: Optional[str] = None, email: Optional[str] = None):
    """Find a pro (or member) by exact phone or email match."""
    require_referrer(request)
    if not phone and not email:
        raise HttpError(422, "Phone or email is required.")
    from django.db.models import Q as DQ
    from accounts.models import User as GkUser
    q = DQ()
    if phone:
        q |= DQ(user__phone=phone)
    if email:
        q |= DQ(user__email__iexact=email)
    pro = ProProfile.objects.select_related("user").filter(
        q, is_suspended=False, is_template=False
    ).first()
    if pro:
        return 200, {
            "user_id": pro.user_id,
            "handle": pro.handle or "",
            "name": pro.display_name,
            "trade": pro.primary_trade or "",
            "city": pro.base_zip or "",
            "avatar_url": pro.avatar_url or "",
            "is_verified": pro.is_verified,
            "is_pro": True,
        }
    # No ProProfile — check if a User account exists with that contact
    uq = DQ()
    if phone:
        uq |= DQ(phone=phone)
    if email:
        uq |= DQ(email__iexact=email)
    user = GkUser.objects.filter(uq).first()
    if user:
        full_name = f"{user.first_name} {user.last_name}".strip() or user.email or phone or "Member"
        return 200, {
            "user_id": user.pk,
            "handle": "",
            "name": full_name,
            "trade": "",
            "city": "",
            "avatar_url": "",
            "is_verified": False,
            "is_pro": False,
        }
    return 404, {"detail": "No account found with that contact."}


@router.patch("/me/pros/{rp_id}", response={200: ReferrerProDashboardOut, 404: dict})
def update_pro(request, rp_id: int, payload: UpdateProIn):
    profile = require_referrer(request)
    rp = ReferrerPro.objects.select_related("pro", "pro__user", "pro_invite").filter(
        pk=rp_id, referrer=request.auth
    ).first()
    if not rp:
        return 404, {"detail": "Not found."}

    data = payload.dict(exclude_unset=True)
    if "endorsement" in data:
        rp.endorsement = data["endorsement"]
    if "show_on_page" in data:
        rp.show_on_page = data["show_on_page"]
    rp.save()
    return 200, _serialize_referrer_pro(rp)


@router.delete("/me/pros/{rp_id}", response={204: None, 404: dict})
def remove_pro(request, rp_id: int):
    profile = require_referrer(request)
    deleted, _ = ReferrerPro.objects.filter(pk=rp_id, referrer=request.auth).delete()
    if not deleted:
        return 404, {"detail": "Not found."}
    return 204, None


@router.post("/me/invite-pro", response={201: InviteProOut, 422: dict})
def invite_pro(request, payload: InviteProIn):
    profile = require_referrer(request)
    if not payload.phone and not payload.email:
        return 422, {"detail": "Phone or email is required."}

    invite = ProInvite.objects.create(
        invited_by=request.auth,
        name=payload.name,
        trade=payload.trade,
        phone=payload.phone or "",
        email=payload.email or "",
        note=payload.note or "",
        channel=payload.channel,
    )

    max_order = ReferrerPro.objects.filter(referrer=request.auth).count()
    rp = ReferrerPro.objects.create(
        referrer=request.auth,
        pro_invite=invite,
        display_order=max_order,
    )

    return 201, {
        "invite_id": invite.pk,
        "referrer_pro_id": rp.pk,
        "token": invite.token,
        "referrer_slug": profile.slug,
    }


@router.post("/me/invite-pro/{invite_id}/resend", response={200: InviteProResendOut, 404: dict, 429: dict})
def resend_pro_invite(request, invite_id: int):
    profile = require_referrer(request)
    invite = ProInvite.objects.filter(pk=invite_id, invited_by=request.auth).first()
    if not invite:
        return 404, {"detail": "Invite not found."}

    # Rate limit: once per 24h based on last_resent_at (or invited_at for first resend)
    last = invite.last_resent_at or invite.invited_at
    if last and (timezone.now() - last).total_seconds() < 86400:
        seconds_left = int(86400 - (timezone.now() - last).total_seconds())
        hours_left = round(seconds_left / 3600, 1)
        return 429, {"detail": f"Resend available in {hours_left}h."}

    invite.last_resent_at = timezone.now()
    invite.save(update_fields=["last_resent_at"])

    return 200, {
        "ok": True,
        "token": invite.token,
        "referrer_slug": profile.slug,
    }


@router.post("/me/invite-friend", response=InviteFriendOut)
def invite_friend(request, payload: InviteFriendIn):
    """Legacy batch endpoint — kept for backward compat. New code uses /me/invite-friend-single."""
    profile = require_referrer(request)
    if len(payload.invitees) > 10:
        raise HttpError(422, "Maximum 10 invitees per request.")

    invite_ids = []
    for inv in payload.invitees:
        if not inv.phone and not inv.email:
            continue
        fi = FriendInvite.objects.create(
            referrer=request.auth,
            name=inv.name,
            phone=inv.phone or "",
            email=inv.email or "",
        )
        invite_ids.append(fi.pk)

    return {"sent_count": len(invite_ids), "invite_ids": invite_ids}


@router.post("/me/invite-friend-single", response={201: InviteFriendSingleOut, 422: dict})
def invite_friend_single(request, payload: InviteFriendSingleIn):
    """Single friend invite — creates a tracked FriendInvite with a unique token.
    Frontend builds the WhatsApp/SMS deep link using the returned token + referrer_slug."""
    profile = require_referrer(request)
    if not payload.phone:
        return 422, {"detail": "Phone is required."}

    fi = FriendInvite.objects.create(
        referrer=request.auth,
        name=payload.name,
        phone=payload.phone,
        channel=payload.channel,
    )
    return 201, {
        "invite_id": fi.pk,
        "token": fi.token,
        "referrer_slug": profile.slug,
    }


@router.post("/me/invite-friend-single/{invite_id}/resend", response={200: FriendInviteResendOut, 404: dict, 429: dict})
def resend_friend_invite(request, invite_id: int):
    profile = require_referrer(request)
    fi = FriendInvite.objects.filter(pk=invite_id, referrer=request.auth).first()
    if not fi:
        return 404, {"detail": "Invite not found."}

    last = fi.last_resent_at or fi.invited_at
    if last and (timezone.now() - last).total_seconds() < 86400:
        seconds_left = int(86400 - (timezone.now() - last).total_seconds())
        hours_left = round(seconds_left / 3600, 1)
        return 429, {"detail": f"Resend available in {hours_left}h."}

    fi.last_resent_at = timezone.now()
    fi.save(update_fields=["last_resent_at"])

    return 200, {
        "ok": True,
        "token": fi.token,
        "referrer_slug": profile.slug,
    }


# ---------------------------------------------------------------------------
# Pro-invite: preview, click, claim (public + auth)
# ---------------------------------------------------------------------------

@public_router.get("/pro-invite/preview/{token}", response={200: ProInvitePreviewOut, 404: dict}, auth=None)
def pro_invite_preview(request, token: str):
    """Public. Returns context for the claim landing page — used to highlight the right pro card."""
    invite = ProInvite.objects.select_related("invited_by__referrer_profile").filter(token=token).first()
    if not invite:
        return 404, {"detail": "Invite not found."}
    rp = invite.referrer_pro.filter().first()
    profile = getattr(invite.invited_by, "referrer_profile", None)
    referrer_name = f"{invite.invited_by.first_name} {invite.invited_by.last_name}".strip() or "GigKraft User"
    return 200, {
        "referrer_slug": profile.slug if profile else "",
        "referrer_name": referrer_name,
        "pro_name": invite.name,
        "pro_id": rp.pk if rp else 0,
    }


@public_router.post("/pro-invite/click/{token}", response={200: dict}, auth=None)
def pro_invite_click(request, token: str):
    """Public. Fire-and-forget — atomically increments click_count."""
    from django.db.models import F as _F
    ProInvite.objects.filter(token=token).update(click_count=_F("click_count") + 1)
    return 200, {}


@router.post("/pro-invite/claim/{token}", response={200: dict, 400: dict, 404: dict, 409: dict})
def claim_pro_invite(request, token: str):
    """Auth required. Links the authenticated user to the ProInvite and creates a ProProfile."""
    invite = ProInvite.objects.select_related("invited_by__referrer_profile").filter(
        token=token, status=ProInvite.Status.PENDING
    ).first()
    if not invite:
        existing = ProInvite.objects.filter(token=token).first()
        if existing and existing.status == ProInvite.Status.CLAIMED:
            return 409, {"detail": "This invite has already been claimed."}
        return 404, {"detail": "Invite not found or already used."}

    user = request.auth

    # Set role to PRO if not already a pro
    if user.role != User.Role.PRO:
        user.role = User.Role.PRO
        if not user.first_name and " " in invite.name:
            parts = invite.name.split(" ", 1)
            user.first_name, user.last_name = parts[0], parts[1]
        elif not user.first_name:
            user.first_name = invite.name
        user.save(update_fields=["role", "first_name", "last_name"])

    profile, _ = ProProfile.objects.get_or_create(user=user)
    handle = profile.handle or ""

    with transaction.atomic():
        invite.status = ProInvite.Status.CLAIMED
        invite.claimed_at = timezone.now()
        invite.claimed_by = user
        invite.save(update_fields=["status", "claimed_at", "claimed_by"])

        # Upgrade the pending ReferrerPro card to a live on-platform card
        rp = invite.referrer_pro.filter().first()
        if rp and not rp.pro:
            rp.pro = profile
            rp.pro_invite = None
            rp.save(update_fields=["pro", "pro_invite"])

    return 200, {"pro_handle": handle}


# ---------------------------------------------------------------------------
# Friend-invite: click, claim (public + auth)
# ---------------------------------------------------------------------------

@public_router.post("/friend-invite/click/{token}", response={200: dict}, auth=None)
def friend_invite_click(request, token: str):
    """Public. Fire-and-forget — atomically increments click_count."""
    from django.db.models import F as _F
    FriendInvite.objects.filter(token=token).update(click_count=_F("click_count") + 1)
    return 200, {}


@router.post("/friend-invite/claim/{token}", response={200: dict, 404: dict, 409: dict})
def claim_friend_invite(request, token: str, response):
    """Auth required. Auto-follows the referrer and marks the FriendInvite as converted."""
    fi = FriendInvite.objects.select_related("referrer__referrer_profile").filter(
        token=token, followed_at__isnull=True
    ).first()
    if not fi:
        existing = FriendInvite.objects.filter(token=token).first()
        if existing and existing.followed_at:
            return 409, {"detail": "This invite has already been used."}
        return 404, {"detail": "Invite not found."}

    referrer_profile = getattr(fi.referrer, "referrer_profile", None)
    if not referrer_profile:
        return 404, {"detail": "Referrer not found."}

    user = request.auth

    # Generate a cookie token for the new follower record
    cookie_token = uuid.uuid4().hex

    with transaction.atomic():
        follower, created = ReferrerFollower.objects.get_or_create(
            referrer=fi.referrer,
            phone=fi.phone,
            defaults={
                "name": fi.name,
                "phone": fi.phone,
                "cookie_token": cookie_token,
                "user": user,
            },
        )
        if not created and not follower.user:
            follower.user = user
            follower.save(update_fields=["user"])

        fi.followed_at = timezone.now()
        fi.follower = follower
        fi.save(update_fields=["followed_at", "follower"])

    # Set follower cookie so the page recognises them immediately
    response.set_cookie(
        COOKIE_NAME,
        follower.cookie_token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        samesite="Lax",
    )

    return 200, {"referrer_slug": referrer_profile.slug}


# ---------------------------------------------------------------------------
# Invites dashboard list
# ---------------------------------------------------------------------------

@router.get("/me/invites", response=InviteListOut)
def list_invites(request):
    """Returns non-archived pro and friend invites for the dashboard."""
    profile = require_referrer(request)

    pro_invites = ProInvite.objects.filter(
        invited_by=request.auth, is_archived=False
    ).order_by("-invited_at")
    friend_invites = FriendInvite.objects.filter(
        referrer=request.auth, is_archived=False
    ).order_by("-invited_at")

    def fmt_dt(dt):
        return dt.isoformat() if dt else None

    return {
        "pro_invites": [
            {
                "invite_id": i.pk,
                "name": i.name,
                "trade": i.trade,
                "phone": i.phone,
                "channel": i.channel,
                "status": i.status,
                "click_count": i.click_count,
                "invited_at": fmt_dt(i.invited_at),
                "last_resent_at": fmt_dt(i.last_resent_at),
            }
            for i in pro_invites
        ],
        "friend_invites": [
            {
                "invite_id": i.pk,
                "name": i.name,
                "phone": i.phone,
                "channel": i.channel,
                "status": "followed" if i.followed_at else "pending",
                "click_count": i.click_count,
                "invited_at": fmt_dt(i.invited_at),
                "last_resent_at": fmt_dt(i.last_resent_at),
            }
            for i in friend_invites
        ],
    }


@router.post("/me/invite-pro/{invite_id}/archive", response={200: dict, 404: dict})
def archive_pro_invite(request, invite_id: int):
    profile = require_referrer(request)
    updated = ProInvite.objects.filter(pk=invite_id, invited_by=request.auth).update(is_archived=True)
    if not updated:
        return 404, {"detail": "Invite not found."}
    return 200, {"ok": True}


@router.post("/me/invite-friend-single/{invite_id}/archive", response={200: dict, 404: dict})
def archive_friend_invite(request, invite_id: int):
    profile = require_referrer(request)
    updated = FriendInvite.objects.filter(pk=invite_id, referrer=request.auth).update(is_archived=True)
    if not updated:
        return 404, {"detail": "Invite not found."}
    return 200, {"ok": True}


@router.post("/me/upload-contacts", response=UploadContactsOut)
def upload_contacts(request, file: UploadedFile = File(...)):
    profile = require_referrer(request)

    content = file.read().decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))

    # Normalise headers: accept name/phone/email in any case
    rows = []
    for i, row in enumerate(reader):
        if i >= 500:
            break
        normalised = {k.strip().lower(): v.strip() for k, v in row.items()}
        name = normalised.get("name", "")
        phone = normalised.get("phone", "") or normalised.get("mobile", "")
        email = normalised.get("email", "")
        if name:
            rows.append({"name": name, "phone": phone, "email": email})

    # Bulk create UploadedContact rows
    contacts = UploadedContact.objects.bulk_create([
        UploadedContact(
            uploaded_by=request.auth,
            raw_name=r["name"],
            raw_phone=r["phone"],
            raw_email=r["email"],
        )
        for r in rows
    ])

    # Match by phone or email to ProProfile
    phones = [r["phone"] for r in rows if r["phone"]]
    emails = [r["email"] for r in rows if r["email"]]
    from django.db.models import Q as DQ
    matched_pros = ProProfile.objects.select_related("user").filter(
        DQ(user__phone__in=phones) | DQ(user__email__in=emails)
    )
    phone_to_pro = {p.user.phone: p for p in matched_pros if p.user.phone}
    email_to_pro = {p.user.email: p for p in matched_pros if p.user.email}

    already_on_list = set(
        ReferrerPro.objects.filter(referrer=request.auth).values_list("pro_id", flat=True)
    )

    matched_out = []
    for contact in contacts:
        pro = phone_to_pro.get(contact.raw_phone) or email_to_pro.get(contact.raw_email)
        if pro:
            contact.matched_pro = pro
            matched_out.append({
                "contact_id": contact.pk,
                "contact_name": contact.raw_name,
                "pro_id": pro.pk,
                "pro_handle": pro.handle or "",
                "pro_name": pro.display_name,
                "trade": pro.primary_trade,
                "already_on_list": pro.pk in already_on_list,
            })

    # Bulk update matched_pro on contacts
    ids_to_update = [m["contact_id"] for m in matched_out]
    if ids_to_update:
        pro_map = {m["contact_id"]: m["pro_id"] for m in matched_out}
        for contact in contacts:
            if contact.pk in pro_map:
                UploadedContact.objects.filter(pk=contact.pk).update(
                    matched_pro_id=pro_map[contact.pk]
                )

    return {
        "scanned": len(rows),
        "matched": matched_out,
        "unmatched_count": len(rows) - len(matched_out),
    }


@router.post("/me/upload-contacts/add", response=AddMatchedContactsOut)
def add_matched_contacts(request, payload: AddMatchedContactsIn):
    profile = require_referrer(request)
    added = 0
    skipped = 0
    max_order = ReferrerPro.objects.filter(referrer=request.auth).count()

    pros = ProProfile.objects.select_related("user").filter(pk__in=payload.pro_ids)
    for pro in pros:
        _, created = ReferrerPro.objects.get_or_create(
            referrer=request.auth,
            pro=pro,
            defaults={"display_order": max_order},
        )
        if created:
            added += 1
            max_order += 1
        else:
            skipped += 1

    return {"added_count": added, "skipped_count": skipped}


@router.get("/me/requests", response=list[ReferralRequestDetailOut])
def list_requests(request, status: str = "pending"):
    profile = require_referrer(request)
    if status == "all":
        qs = ReferralRequest.objects.filter(referrer=request.auth)
    else:
        qs = ReferralRequest.objects.filter(referrer=request.auth, status=status)

    qs = qs.select_related("follower", "referrer_pro", "referrer_pro__pro", "referrer_pro__pro_invite").order_by("-created_at")
    results = []
    for req in qs:
        rp = req.referrer_pro
        results.append({
            "id": req.pk,
            "follower_name": req.follower.name,
            "follower_phone": req.follower.phone,
            "pro_name": rp.display_name if rp else None,
            "pro_trade": rp.trade if rp else None,
            "job_description": req.job_description,
            "status": req.status,
            "created_at": req.created_at.isoformat(),
        })
    return results


@router.post("/me/requests/{req_id}/send", response={200: SendReferralOut, 404: dict})
def send_referral(request, req_id: int, payload: SendReferralIn):
    profile = require_referrer(request)
    req_obj = ReferralRequest.objects.select_related(
        "follower", "referrer_pro", "referrer_pro__pro", "referrer_pro__pro_invite"
    ).filter(pk=req_id, referrer=request.auth).first()
    if not req_obj:
        return 404, {"detail": "Request not found."}

    rp = ReferrerPro.objects.select_related("pro", "pro__user", "pro_invite").filter(
        pk=payload.referrer_pro_id, referrer=request.auth
    ).first()
    if not rp:
        raise HttpError(404, "Pro not found on your page.")

    req_obj.referrer_pro = rp
    req_obj.pending_note_to_follower = payload.note_to_follower
    req_obj.pending_note_to_pro = payload.note_to_pro
    req_obj.save(update_fields=["referrer_pro", "pending_note_to_follower", "pending_note_to_pro"])

    follower = req_obj.follower

    if not follower.phone_verified:
        # Send OTP to follower to verify phone
        otp = str(secrets.randbelow(900000) + 100000)
        req_obj.set_otp(otp)
        req_obj.status = ReferralRequest.Status.OTP_PENDING
        req_obj.save(update_fields=["otp_code_hash", "otp_expires_at", "status"])

        masked = follower.phone[-4:] if follower.phone else "????"
        if follower.phone:
            send_sms(follower.phone, f"Your GigKraft verification code: {otp}. Valid for 15 minutes.")

        return 200, {
            "otp_required": True,
            "referral_sent_id": None,
            "message": f"We sent a verification code to {follower.name}'s number ending in {masked}.",
        }

    sent = _dispatch_referral(req_obj)
    return 200, {"otp_required": False, "referral_sent_id": sent.pk, "message": None}


@router.post("/me/requests/{req_id}/verify-follower-otp", response={200: VerifyOtpOut, 404: dict})
def verify_follower_otp(request, req_id: int, payload: VerifyOtpIn):
    profile = require_referrer(request)
    req_obj = ReferralRequest.objects.select_related(
        "follower", "referrer_pro", "referrer_pro__pro", "referrer_pro__pro_invite"
    ).filter(pk=req_id, referrer=request.auth, status=ReferralRequest.Status.OTP_PENDING).first()
    if not req_obj:
        return 404, {"detail": "No OTP-pending request found."}

    if req_obj.otp_expires_at and timezone.now() > req_obj.otp_expires_at:
        req_obj.status = ReferralRequest.Status.EXPIRED
        req_obj.save(update_fields=["status"])
        return 200, {"verified": False, "error": "expired"}

    if not req_obj.check_otp(payload.otp):
        return 200, {"verified": False, "error": "invalid"}

    # Mark phone verified
    ReferrerFollower.objects.filter(pk=req_obj.follower_id).update(phone_verified=True)
    req_obj.follower.phone_verified = True

    sent = _dispatch_referral(req_obj)
    return 200, {"verified": True, "referral_sent_id": sent.pk, "error": None}


@router.post("/me/requests/{req_id}/decline", response={200: dict, 404: dict})
def decline_request(request, req_id: int):
    profile = require_referrer(request)
    updated = ReferralRequest.objects.filter(
        pk=req_id, referrer=request.auth
    ).update(status=ReferralRequest.Status.DECLINED)
    if not updated:
        return 404, {"detail": "Request not found."}
    return 200, {"ok": True}


@router.get("/me/followers", response=FollowersPageOut)
def list_followers(request, page: int = 1, page_size: int = 20):
    profile = require_referrer(request)
    qs = ReferrerFollower.objects.filter(referrer=request.auth).order_by("-followed_at")
    total = qs.count()
    offset = (page - 1) * page_size
    results = [
        {
            "id": f.pk,
            "name": f.name,
            "phone": f.phone,
            "email": f.email,
            "followed_at": f.followed_at.isoformat(),
            "referrals_received": f.referrals_received,
        }
        for f in qs[offset: offset + page_size]
    ]
    return {"total": total, "results": results}


@router.get("/me/activity", response=ActivityPageOut)
def referral_activity(request, page: int = 1, page_size: int = 20):
    profile = require_referrer(request)
    qs = ReferralSent.objects.select_related(
        "follower", "referrer_pro"
    ).filter(referrer=request.auth).order_by("-sent_at")
    total = qs.count()
    offset = (page - 1) * page_size
    results = [
        {
            "id": s.pk,
            "follower_name": s.follower.name,
            "pro_name": s.referrer_pro.display_name if s.referrer_pro else "",
            "sent_at": s.sent_at.isoformat(),
        }
        for s in qs[offset: offset + page_size]
    ]
    return {"total": total, "results": results}

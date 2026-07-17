import csv
import io
import os
import secrets
from typing import Optional

import stripe
from django.db.models import F, Q
from django.utils import timezone
from ninja import File, Router, Schema
from ninja.errors import HttpError
from ninja.files import UploadedFile

from accounts import services as account_services
from accounts.auth import jwt_auth, optional_jwt
from accounts.models import ProProfile, User
from billing.models import COMMUNITY_PLAN_PRICES, CommunitySubscription, StripeSettings
from common import notify
from common.permissions import require_referrer
from communities.models import (
    Community,
    CommunityAnalyticsEvent,
    CommunityMember,
    CommunityReferral,
)
from comms.services import send_email
from leads.models import Lead, Message
from nodes.models import Node
from recommendations.models import Recommendation
from referrals.api import _log_invite_event, _normalize_tags, _serialize_referrer_pro
from referrals.models import InviteEvent, ReferrerPro

public_router = Router(tags=["communities"])
me_router = Router(tags=["communities"], auth=jwt_auth)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class ErrorOut(Schema):
    detail: str


class CommunityProOut(Schema):
    id: int
    pro_id: Optional[int] = None
    display_name: str
    trade: str
    avatar_url: Optional[str] = None
    handle: Optional[str] = None
    endorsement: str
    tags: list[str] = []
    is_off_platform: bool
    phone: Optional[str] = None
    email: Optional[str] = None
    # Popularity/Quality-of-Work card metrics — design-specs/11.ContactCardUpdate.md.
    popularity_score: Optional[int] = None
    quality_score: Optional[int] = None
    recommended_count: int = 0
    used_count: int = 0
    review_count: int = 0
    schedule_adherence_pct: Optional[int] = None
    professionalism_cleanliness_pct: Optional[int] = None
    pricing_transparency_pct: Optional[int] = None
    communication_quality_pct: Optional[int] = None
    rehire_intent_pct: Optional[int] = None
    # Member-submitted suggestions attribute the endorsement to the submitting
    # Member instead of the Lead — design-specs/13.RecommendAPro-LandingIntent.md §5.
    submitted_by_name: Optional[str] = None
    # True when the authenticated viewer owns this pro's account, or has a Lead
    # or Recommendation tied to it (hired/reviewed) — powers the "Self" filter.
    is_related_to_viewer: bool = False


class CommunityOut(Schema):
    slug: str
    name: str
    description: str
    cover_image_url: str
    theme: str
    lead_name: str
    lead_avatar_url: Optional[str] = None
    status: str
    is_read_only: bool
    is_publicly_visible: bool
    pro_count: int
    member_count: int = 0
    page_views: int = 0
    link_copy_count: int = 0
    viewer_status: Optional[str] = None  # None=anon, "none"|"pending"|"member"|"moderator"|"owner"
    pros: list[CommunityProOut] = []


class CommunityMemberOut(Schema):
    id: int
    name: str
    phone: str
    email: str
    status: str
    role: str
    click_count: int
    invited_at: str
    joined_at: Optional[str] = None
    last_resent_at: Optional[str] = None
    avatar_url: Optional[str] = None


class ManagedCommunityOut(Schema):
    slug: str
    name: str
    description: str
    cover_image_url: str
    theme: str
    status: str
    is_read_only: bool
    viewer_role: str  # "owner" | "moderator"
    short_code: str
    short_link_click_count: int


class CreateCommunityIn(Schema):
    name: str
    description: str = ""


class UpdateCommunityIn(Schema):
    name: Optional[str] = None
    description: Optional[str] = None
    slug: Optional[str] = None
    cover_image_url: Optional[str] = None
    theme: Optional[str] = None


class AddMemberIn(Schema):
    name: str
    phone: str = ""
    email: str = ""


class AddMembersIn(Schema):
    members: list[AddMemberIn]


class AddMembersOut(Schema):
    added: int
    skipped: int


class RoleIn(Schema):
    role: str  # "moderator" | "member"


class ToggleProIn(Schema):
    referrer_pro_id: Optional[int] = None
    pro_id: Optional[int] = None


class AddOffPlatformProIn(Schema):
    name: str
    trade: str = ""
    phone: str = ""
    email: str = ""
    endorsement: str = ""


class RecommendProIn(Schema):
    name: str
    trade: str = ""
    phone: str = ""
    email: str = ""
    url: str = ""
    endorsement: str = ""


class PendingProRecommendationOut(Schema):
    id: int
    name: str
    trade: str
    phone: str
    email: str
    url: str
    endorsement: str
    submitted_by_name: str


class LinkPreviewIn(Schema):
    url: str


class LinkPreviewOut(Schema):
    title: str
    description: str
    image: str
    created_at: str


class JoinPreviewOut(Schema):
    name: str
    phone: str
    email: str
    status: str
    community_name: str
    community_slug: str


class JoinIn(Schema):
    otp_code: Optional[str] = None
    google_id_token: Optional[str] = None


class RequestProIn(Schema):
    community_pro_id: int
    seeker_name: str
    seeker_phone: str
    address: str = ""
    job_title: str
    detail: str = ""


class MessageOwnerIn(Schema):
    body: str
    guest_name: str = ""


class CommunityAnalyticsOut(Schema):
    page_views: int
    requests_submitted: int
    member_count: int
    invited_count: int
    joined_count: int
    pro_count: int


class CheckoutIn(Schema):
    plan: str


class CheckoutOut(Schema):
    url: str


class SubscriptionStatusOut(Schema):
    has_community: bool
    has_active_subscription: bool
    community_slug: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    stripe_mode: str


class CommunityInvoiceOut(Schema):
    id: int
    amount: float
    status: str
    period_label: str
    issued_at: str


class CommunityBillingOut(Schema):
    plan: Optional[str] = None
    plan_label: Optional[str] = None
    status: Optional[str] = None
    renews_at: Optional[str] = None
    card_last4: str = ""
    monthly_value: Optional[float] = None
    invoices: list[CommunityInvoiceOut] = []


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _lead_avatar_url(lead: User) -> Optional[str]:
    referrer_profile = getattr(lead, "referrer_profile", None)
    if referrer_profile and referrer_profile.avatar_url:
        return referrer_profile.avatar_url
    homeowner_profile = getattr(lead, "homeowner_profile", None)
    if homeowner_profile and homeowner_profile.avatar_url:
        return homeowner_profile.avatar_url
    return None


def _related_referrer_pro_ids(pros_qs, authed_user: Optional[User]) -> set[int]:
    """ReferrerPro ids the given viewer is related to: they own the pro's
    account, or they have a Lead or Recommendation tied to it (hired/reviewed).
    Scoped to the rows already fetched in `pros_qs` to avoid a per-row query."""
    if not authed_user:
        return set()

    rp_ids = [rp.pk for rp in pros_qs]
    pro_ids = [rp.pro_id for rp in pros_qs if rp.pro_id]

    owned_rp_ids = set(
        ReferrerPro.objects.filter(pk__in=rp_ids, pro__user_id=authed_user.id).values_list("pk", flat=True)
    )
    hired_pro_ids = set(
        Lead.objects.filter(homeowner=authed_user, pro_id__in=pro_ids).values_list("pro_id", flat=True)
    )
    hired_rp_ids = set(
        Lead.objects.filter(homeowner=authed_user, referrer_pro_id__in=rp_ids).values_list("referrer_pro_id", flat=True)
    )
    reviewed_pro_ids = set(
        Recommendation.objects.filter(rater=authed_user, pro_id__in=pro_ids).values_list("pro_id", flat=True)
    )
    reviewed_rp_ids = set(
        Recommendation.objects.filter(rater=authed_user, referrer_pro_id__in=rp_ids).values_list("referrer_pro_id", flat=True)
    )

    related_by_pro = hired_pro_ids | reviewed_pro_ids
    return {
        rp.pk for rp in pros_qs
        if rp.pk in owned_rp_ids or rp.pk in hired_rp_ids or rp.pk in reviewed_rp_ids or rp.pro_id in related_by_pro
    }


def _serialize_pro(rp: ReferrerPro, related_rp_ids: Optional[set[int]] = None) -> dict:
    pro = rp.pro
    return {
        "id": rp.pk,
        "pro_id": rp.pro_id,
        "display_name": rp.display_name,
        "trade": rp.trade,
        "avatar_url": pro.avatar_url if pro else None,
        "handle": pro.handle if pro else None,
        "endorsement": rp.endorsement,
        "tags": rp.tags or [],
        "is_off_platform": rp.is_off_platform,
        "phone": (pro.user.phone if pro else rp.pro_invite.phone if rp.pro_invite else "") or None,
        "email": (pro.user.email if pro else rp.pro_invite.email if rp.pro_invite else "") or None,
        # Popularity/Quality-of-Work card metrics. On-platform pros score via
        # ProProfile; off-platform pros score via ReferrerPro's own cached
        # fields instead (design-specs/12.OffPlatformProRatings.md §3.1) —
        # no "recommended" (favorites) sub-metric applies to off-platform.
        "popularity_score": pro.popularity_score if pro else rp.popularity_score,
        "quality_score": pro.quality_score if pro else rp.quality_score,
        "recommended_count": pro.recommended_count if pro else 0,
        "used_count": pro.used_count if pro else rp.used_count,
        "review_count": pro.review_count if pro else rp.review_count,
        "schedule_adherence_pct": pro.schedule_adherence_pct if pro else rp.schedule_adherence_pct,
        "professionalism_cleanliness_pct": pro.professionalism_cleanliness_pct if pro else rp.professionalism_cleanliness_pct,
        "pricing_transparency_pct": pro.pricing_transparency_pct if pro else rp.pricing_transparency_pct,
        "communication_quality_pct": pro.communication_quality_pct if pro else rp.communication_quality_pct,
        "rehire_intent_pct": pro.rehire_intent_pct if pro else rp.rehire_intent_pct,
        "submitted_by_name": rp.submitted_by.first_name if rp.submitted_by else None,
        "is_related_to_viewer": rp.pk in related_rp_ids if related_rp_ids else False,
    }


def _serialize_managed(community: Community, role: str) -> dict:
    return {
        "slug": community.slug,
        "name": community.name,
        "description": community.description,
        "cover_image_url": community.cover_image_url,
        "theme": community.theme,
        "status": community.status,
        "is_read_only": community.is_read_only,
        "viewer_role": role,
        "short_code": community.short_code,
        "short_link_click_count": community.short_link_click_count,
    }


def _serialize_member(m: CommunityMember) -> dict:
    return {
        "id": m.pk,
        "name": m.name,
        "phone": m.phone,
        "email": m.email,
        "status": m.status,
        "role": m.role,
        "click_count": m.click_count,
        "invited_at": m.invited_at.isoformat(),
        "joined_at": m.joined_at.isoformat() if m.joined_at else None,
        "last_resent_at": m.last_resent_at.isoformat() if m.last_resent_at else None,
        "avatar_url": _lead_avatar_url(m.user) if m.user_id else None,
    }


def _get_community_or_404(slug: str) -> Community:
    community = Community.objects.select_related("lead").filter(slug=slug).first()
    if not community:
        raise HttpError(404, "Community not found.")
    return community


def _managed_community(request) -> tuple[Community, str]:
    """Resolve the caller's managed Community + role ('owner'|'moderator'). 403s otherwise."""
    community = Community.objects.filter(lead=request.auth).first()
    if community:
        return community, "owner"
    membership = (
        CommunityMember.objects.select_related("community")
        .filter(
            user=request.auth,
            role=CommunityMember.Role.MODERATOR,
            status=CommunityMember.Status.JOINED,
        )
        .first()
    )
    if membership:
        return membership.community, "moderator"
    raise HttpError(403, "You don't manage a Community.")


def _member_community(request, slug: str) -> Community:
    """Resolve a Community the caller is a joined or pending-approval Member/Moderator
    of — OR owns — for the Recommend-a-Pro flow (design-specs/13.RecommendAPro-LandingIntent.md).
    PENDING counts too: the frontend self-serve-joins the caller right before this call,
    and a brand-new (not pre-vetted) joiner lands PENDING until the owner approves them.
    Broader than _managed_community, which deliberately excludes plain Members."""
    community = _get_community_or_404(slug)
    if request.auth.pk == community.lead_id:
        return community
    is_member = CommunityMember.objects.filter(
        community=community,
        user=request.auth,
        status__in=[CommunityMember.Status.JOINED, CommunityMember.Status.PENDING],
    ).exists()
    if not is_member:
        raise HttpError(403, "You must be a Community Member to do this.")
    return community


def _require_owner(request) -> Community:
    community = Community.objects.filter(lead=request.auth).first()
    if not community:
        raise HttpError(403, "Only the Community owner can do this.")
    return community


def _viewer_status(community: Community, user) -> Optional[str]:
    if user is None:
        return None
    if user.pk == community.lead_id:
        return "owner"
    membership = CommunityMember.objects.filter(community=community, user=user).first()
    if membership and membership.status == CommunityMember.Status.JOINED:
        return membership.role  # "member" | "moderator"
    if membership and membership.status == CommunityMember.Status.PENDING:
        return "pending"
    return "none"


def _resolve_node():
    return Node.objects.filter(is_active=True).first()


# ---------------------------------------------------------------------------
# Public endpoints — literal paths first (so they aren't swallowed by /{slug})
# ---------------------------------------------------------------------------


@public_router.post("/checkout", response={200: CheckoutOut, 400: ErrorOut}, auth=jwt_auth)
def create_community_checkout(request, payload: CheckoutIn):
    """Start a Stripe Checkout session for a Referrer starting a Community subscription."""
    require_referrer(request)
    user = request.auth

    if payload.plan not in COMMUNITY_PLAN_PRICES:
        return 400, {"detail": "plan must be 'monthly' or 'annual'."}

    existing = Community.objects.filter(lead=user).first()
    if existing and CommunitySubscription.objects.filter(
        community=existing, status=CommunitySubscription.Status.ACTIVE
    ).exists():
        return 400, {"detail": "You already have an active Community subscription."}

    cfg = StripeSettings.get()
    price_id = cfg.community_price_id(payload.plan)
    if not price_id:
        return 400, {"detail": f"No Stripe price ID configured for the '{payload.plan}' Community plan ({cfg.effective_mode} mode). Set it in GK Admin → Stripe."}

    stripe.api_key = cfg.secret_key
    if not stripe.api_key:
        return 400, {"detail": f"Stripe secret key not set for {cfg.effective_mode} mode."}

    app_url = os.environ.get("APP_URL", "http://localhost:5173")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{app_url}/us/me/community/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{app_url}/us/me/community/checkout?cancelled=1",
            metadata={"user_id": str(user.id), "plan": payload.plan, "product": "community"},
        )
    except stripe.StripeError as e:
        return 400, {"detail": str(e.user_message or e)}

    return 200, {"url": session.url}


@public_router.get("/subscription", response=SubscriptionStatusOut, auth=jwt_auth)
def community_subscription_status(request):
    user = request.auth
    stripe_mode = StripeSettings.get().effective_mode
    community = Community.objects.filter(lead=user).first()
    if not community:
        return {"has_community": False, "has_active_subscription": False, "stripe_mode": stripe_mode}
    sub = CommunitySubscription.objects.filter(community=community).first()
    return {
        "has_community": True,
        "has_active_subscription": bool(sub and sub.status == CommunitySubscription.Status.ACTIVE),
        "community_slug": community.slug,
        "plan": sub.plan if sub else None,
        "status": sub.status if sub else None,
        "stripe_mode": stripe_mode,
    }


@public_router.get("/check-slug", auth=None)
def check_slug_available(request, slug: str):
    import re
    cleaned = re.sub(r"[^a-z0-9-]+", "-", slug.lower().strip()).strip("-")
    if not cleaned:
        return {"available": False, "reason": "invalid"}
    taken = Community.objects.filter(slug=cleaned).exists()
    return {"available": not taken, "slug": cleaned}


class CopyLinkOut(Schema):
    link_copy_count: int


@public_router.post("/{slug}/copy-link", response={200: CopyLinkOut, 404: ErrorOut}, auth=None)
def log_copy_link(request, slug: str):
    """Fired when a visitor taps 'Copy page link' — powers the copied-count shown on the page."""
    community = _get_community_or_404(slug)
    CommunityAnalyticsEvent.objects.create(
        community=community, event_type=CommunityAnalyticsEvent.EventType.LINK_COPIED
    )
    count = community.analytics_events.filter(
        event_type=CommunityAnalyticsEvent.EventType.LINK_COPIED
    ).count()
    return 200, {"link_copy_count": count}


@public_router.get("/{slug}", response={200: CommunityOut, 404: ErrorOut}, auth=optional_jwt)
def get_community(request, slug: str):
    community = (
        Community.objects.select_related(
            "lead", "lead__referrer_profile", "lead__homeowner_profile", "subscription"
        )
        .filter(slug=slug)
        .first()
    )
    if not community:
        return 404, {"detail": "Community not found."}

    CommunityAnalyticsEvent.objects.create(
        community=community, event_type=CommunityAnalyticsEvent.EventType.PAGE_VIEW
    )

    authed_user = request.auth if isinstance(request.auth, User) else None
    viewer_status = _viewer_status(community, authed_user)

    if not community.is_publicly_visible:
        return 200, {
            "slug": community.slug,
            "name": community.name,
            "description": community.description,
            "cover_image_url": community.cover_image_url,
            "theme": community.theme,
            "lead_name": f"{community.lead.first_name} {community.lead.last_name}".strip(),
            "lead_avatar_url": _lead_avatar_url(community.lead),
            "status": community.status,
            "is_read_only": community.is_read_only,
            "is_publicly_visible": False,
            "pro_count": 0,
            "viewer_status": viewer_status,
            "pros": [],
        }

    pros_qs = list(
        ReferrerPro.objects.select_related("pro", "pro__user", "pro_invite", "submitted_by").filter(
            community=community, show_on_community=True
        )
    )
    related_rp_ids = _related_referrer_pro_ids(pros_qs, authed_user)
    return 200, {
        "slug": community.slug,
        "name": community.name,
        "description": community.description,
        "cover_image_url": community.cover_image_url,
        "theme": community.theme,
        "lead_name": f"{community.lead.first_name} {community.lead.last_name}".strip(),
        "lead_avatar_url": _lead_avatar_url(community.lead),
        "status": community.status,
        "is_read_only": community.is_read_only,
        "is_publicly_visible": True,
        "pro_count": len(pros_qs),
        "member_count": community.members.filter(status=CommunityMember.Status.JOINED).count(),
        "page_views": community.analytics_events.filter(
            event_type=CommunityAnalyticsEvent.EventType.PAGE_VIEW
        ).count(),
        "link_copy_count": community.analytics_events.filter(
            event_type=CommunityAnalyticsEvent.EventType.LINK_COPIED
        ).count(),
        "viewer_status": viewer_status,
        "pros": [_serialize_pro(rp, related_rp_ids) for rp in pros_qs],
    }


@public_router.get("/{slug}/members", response={200: list[CommunityMemberOut], 403: ErrorOut, 404: ErrorOut}, auth=jwt_auth)
def list_public_members(request, slug: str):
    community = _get_community_or_404(slug)
    status = _viewer_status(community, request.auth)
    if status not in ("owner", "moderator", "member"):
        return 403, {"detail": "You must be a joined Member to view the roster."}
    members = community.members.filter(status=CommunityMember.Status.JOINED)
    return 200, [_serialize_member(m) for m in members]


@public_router.get("/{slug}/join/{token}", response={200: JoinPreviewOut, 404: ErrorOut}, auth=None)
def preview_join(request, slug: str, token: str):
    member = CommunityMember.objects.select_related("community").filter(
        community__slug=slug, token=token
    ).first()
    if not member:
        return 404, {"detail": "Invite not found."}
    CommunityMember.objects.filter(pk=member.pk).update(click_count=F("click_count") + 1)
    return 200, {
        "name": member.name,
        "phone": member.phone,
        "email": member.email,
        "status": member.status,
        "community_name": member.community.name,
        "community_slug": member.community.slug,
    }


@public_router.post("/{slug}/join/{token}/send-otp", response={200: dict, 400: ErrorOut, 404: ErrorOut}, auth=None)
def send_join_otp(request, slug: str, token: str):
    member = CommunityMember.objects.filter(community__slug=slug, token=token).first()
    if not member:
        return 404, {"detail": "Invite not found."}
    if not member.phone:
        return 400, {"detail": "This invite has no phone number on file."}
    code = f"{secrets.randbelow(1000000):06d}"
    member.set_otp(code)
    member.save(update_fields=["otp_code_hash", "otp_expires_at"])
    notify.send_sms(member.phone, f"Your GigKraft verification code: {code}. Valid for 15 minutes.")
    return 200, {"sent": True}


@public_router.post("/{slug}/join/{token}", response={200: dict, 400: ErrorOut, 404: ErrorOut}, auth=optional_jwt)
def join_community(request, slug: str, token: str, payload: JoinIn):
    member = CommunityMember.objects.select_related("community").filter(
        community__slug=slug, token=token
    ).first()
    if not member:
        return 404, {"detail": "Invite not found."}
    if member.community.is_read_only:
        return 400, {"detail": "This Community is archived and no longer accepting new members."}

    linked_user = None
    if payload.google_id_token:
        try:
            email, first_name, last_name, picture_url = account_services.verify_google_token(payload.google_id_token)
        except account_services.AuthProviderUnavailable as exc:
            return 400, {"detail": str(exc)}
        if email is None:
            return 400, {"detail": "Invalid Google id_token."}
        linked_user, _ = account_services.get_or_create_google_user(
            email, role=User.Role.MEMBER, first_name=first_name, last_name=last_name, picture_url=picture_url
        )
    elif payload.otp_code:
        if not member.check_otp(payload.otp_code):
            return 400, {"detail": "Invalid or expired code."}
        member.phone_verified = True
        if member.phone:
            linked_user = User.objects.filter(phone=member.phone).first()
    else:
        return 400, {"detail": "Provide otp_code or google_id_token."}

    member.status = CommunityMember.Status.JOINED
    member.joined_at = timezone.now()
    if linked_user:
        member.user = linked_user
    member.save(update_fields=["status", "joined_at", "phone_verified", "user"])

    _log_invite_event(InviteEvent.Scenario.COMMUNITY_MEMBER, member.pk, InviteEvent.EventType.JOINED)
    notify.notify_user(member.community.lead, f"{member.name} joined {member.community.name}!")
    CommunityAnalyticsEvent.objects.create(
        community=member.community,
        event_type=CommunityAnalyticsEvent.EventType.MEMBER_JOINED,
        metadata={"member_id": member.pk},
    )
    return 200, {"status": member.status}


@public_router.post("/{slug}/join", response={200: dict, 400: ErrorOut, 404: ErrorOut}, auth=jwt_auth)
def join_community_self(request, slug: str):
    """Self-serve join request for an already-authenticated visitor — no invite token required.

    Distinct from POST /{slug}/join/{token} above, which is for pre-known invitees the
    owner already added to the directory (and therefore already vetted) — those still
    auto-join. A brand-new self-serve request instead lands as PENDING until the
    owner/moderator approves it via POST /me/community/members/{id}/approve.
    """
    community = _get_community_or_404(slug)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and no longer accepting new members."}
    user = request.auth
    if user.pk == community.lead_id:
        return 400, {"detail": "You already own this Community."}

    member = CommunityMember.objects.filter(community=community, user=user).first()
    pre_vetted = False
    if not member and user.phone:
        member = CommunityMember.objects.filter(community=community, phone=user.phone, user__isnull=True).first()
        pre_vetted = member is not None
    if not member and user.email:
        member = CommunityMember.objects.filter(community=community, email=user.email, user__isnull=True).first()
        pre_vetted = member is not None

    name = f"{user.first_name} {user.last_name}".strip() or user.phone or user.email or "Member"

    # A phone/email-matched row found above is still unlinked (user__isnull=True was
    # part of that query) — link it now, even if its status already reads JOINED/PENDING
    # and we're about to return early. Otherwise the row stays permanently unlinked and
    # every later user=request.auth membership check (e.g. Recommend-a-Pro) 403s forever.
    if member and member.user_id is None:
        member.user = user
        if not member.name:
            member.name = name
        member.save(update_fields=["user", "name"])

    if member and member.status == CommunityMember.Status.JOINED:
        return 200, {"status": member.status}
    if member and member.status == CommunityMember.Status.PENDING:
        return 200, {"status": member.status}

    # Owner-added invitees (status=INVITED, added via Add Members) are already vetted —
    # let them straight in. Everyone else (new or previously-declined) needs approval.
    target_status = CommunityMember.Status.JOINED if pre_vetted else CommunityMember.Status.PENDING

    if member:
        member.user = user
        member.status = target_status
        if target_status == CommunityMember.Status.JOINED:
            member.joined_at = member.joined_at or timezone.now()
        if not member.name:
            member.name = name
        member.save(update_fields=["user", "status", "joined_at", "name"])
    else:
        member = CommunityMember.objects.create(
            community=community,
            user=user,
            name=name,
            phone=user.phone or "",
            email=user.email or "",
            status=target_status,
            role=CommunityMember.Role.MEMBER,
            joined_at=timezone.now() if target_status == CommunityMember.Status.JOINED else None,
        )

    if target_status == CommunityMember.Status.JOINED:
        _log_invite_event(InviteEvent.Scenario.COMMUNITY_MEMBER, member.pk, InviteEvent.EventType.JOINED)
        notify.notify_user(community.lead, f"{member.name} joined {community.name}!")
        CommunityAnalyticsEvent.objects.create(
            community=community,
            event_type=CommunityAnalyticsEvent.EventType.MEMBER_JOINED,
            metadata={"member_id": member.pk},
        )
    else:
        notify.notify_user(community.lead, f"{member.name} wants to join {community.name} — review their request.")

    return 200, {"status": member.status}


@public_router.post("/{slug}/request-pro", response={201: dict, 400: ErrorOut}, auth=jwt_auth)
def request_pro(request, slug: str, payload: RequestProIn):
    community = _get_community_or_404(slug)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and no longer accepting requests."}

    rp = ReferrerPro.objects.filter(
        pk=payload.community_pro_id, community=community, show_on_community=True, pro__isnull=False
    ).select_related("pro").first()
    if not rp:
        return 400, {"detail": "Pro not found on this Community's list."}

    pro = rp.pro
    node = pro.user.node or _resolve_node()
    if node is None:
        return 400, {"detail": "No active node available."}

    lead = Lead.objects.create(
        node=node,
        homeowner=request.auth,
        pro=pro,
        job_title=payload.job_title,
        detail=f"{payload.detail}\n\nAddress: {payload.address}".strip() if payload.address else payload.detail,
        thread_type=Lead.ThreadType.REQUEST,
    )
    lead.set_respond_by()
    lead.save(update_fields=["respond_by"])
    CommunityReferral.objects.create(community=community, lead=lead)
    CommunityAnalyticsEvent.objects.create(
        community=community,
        event_type=CommunityAnalyticsEvent.EventType.REQUEST_SUBMITTED,
        metadata={"pro_id": pro.pk, "lead_id": lead.pk},
    )
    notify.notify_user(pro.user, f"New request: {lead.job_title}. Found via {community.name}.")
    notify.notify_user(
        community.lead,
        f"{request.auth.first_name} just booked {pro.display_name} through {community.name}!",
    )
    return 201, {"lead_id": lead.pk}


@public_router.post("/{slug}/request-intro", response={201: dict, 400: ErrorOut}, auth=jwt_auth)
def request_intro(request, slug: str, payload: RequestProIn):
    community = _get_community_or_404(slug)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and no longer accepting requests."}

    rp = ReferrerPro.objects.filter(
        pk=payload.community_pro_id, community=community, show_on_community=True, pro__isnull=True
    ).first()
    if not rp:
        return 400, {"detail": "Off-platform pro not found on this Community's list."}

    node = _resolve_node()
    if node is None:
        return 400, {"detail": "No active node available."}

    lead = Lead.objects.create(
        node=node,
        homeowner=request.auth,
        pro=None,
        referrer_pro=rp,
        job_title=payload.job_title,
        detail=f"{payload.detail}\n\nAddress: {payload.address}".strip() if payload.address else payload.detail,
        thread_type=Lead.ThreadType.REQUEST,
        is_escrow=True,
    )
    CommunityReferral.objects.create(community=community, lead=lead)
    CommunityAnalyticsEvent.objects.create(
        community=community,
        event_type=CommunityAnalyticsEvent.EventType.REQUEST_SUBMITTED,
        metadata={"referrer_pro_id": rp.pk, "lead_id": lead.pk, "escrow": True},
    )
    contact = rp.pro_invite.email if rp.pro_invite else ""
    if contact:
        try:
            send_email(
                to=contact,
                subject=f"You have a job waiting on GigKraft — via {community.name}",
                body=f"Hi {rp.display_name}! A member of {community.name} has a '{lead.job_title}' job waiting for you. "
                f"Claim it: https://gigkraft.com/claim/{lead.pk}",
            )
        except Exception:
            pass
    return 201, {"lead_id": lead.pk, "escrow": True}


ANON_OWNER_MESSAGE_HOURLY_CAP = 5


@public_router.post("/{slug}/message-owner", response={201: dict, 400: ErrorOut}, auth=optional_jwt)
def message_owner(request, slug: str, payload: MessageOwnerIn):
    """Send a message that lands as a real Lead/chat thread in the owner's inbox.

    Authenticated visitors send as themselves; anonymous visitors must supply
    guest_name and are attributed to the shared 'anonymous@gigkraft.internal'
    sentinel user (same pattern as leads.api.create_anonymous_lead), so no
    per-visitor account is created just to send one message.
    """
    community = _get_community_or_404(slug)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and no longer accepting messages."}
    if not payload.body.strip():
        return 400, {"detail": "Please write a message."}

    authed_user = request.auth if isinstance(request.auth, User) else None
    if authed_user and authed_user.id == community.lead_id:
        return 400, {"detail": "You can't message yourself."}

    if authed_user:
        sender = authed_user
        sender_name = f"{sender.first_name} {sender.last_name}".strip() or sender.phone or "A visitor"
    else:
        if not payload.guest_name.strip():
            return 400, {"detail": "Please tell us your name."}
        sender_name = payload.guest_name.strip()
        since = timezone.now() - timezone.timedelta(hours=1)
        recent_count = CommunityAnalyticsEvent.objects.filter(
            community=community,
            event_type=CommunityAnalyticsEvent.EventType.OWNER_MESSAGE_ANON,
            created_at__gte=since,
        ).count()
        if recent_count >= ANON_OWNER_MESSAGE_HOURLY_CAP:
            return 400, {"detail": "Too many messages right now — please try again later or sign in."}
        sender, _ = User.objects.get_or_create(
            email="anonymous@gigkraft.internal",
            defaults={"first_name": "Anonymous", "role": User.Role.HOMEOWNER, "is_active": True},
        )
        CommunityAnalyticsEvent.objects.create(
            community=community, event_type=CommunityAnalyticsEvent.EventType.OWNER_MESSAGE_ANON
        )

    node = community.lead.node or _resolve_node()
    if node is None:
        return 400, {"detail": "No active node available."}

    lead = Lead.objects.create(
        node=node,
        homeowner=sender,
        pro=None,
        recipient=community.lead,
        job_title=f"Message from {sender_name} via {community.name}"[:120],
        thread_type=Lead.ThreadType.CHAT,
    )
    Message.objects.create(lead=lead, sender=sender, body=payload.body.strip())
    notify.notify_user(community.lead, f"New message from {sender_name} via {community.name}.")
    return 201, {"lead_id": lead.pk}


@public_router.post("/{slug}/recommend-pro", response={201: dict, 400: ErrorOut, 403: ErrorOut}, auth=jwt_auth)
def recommend_pro(request, slug: str, payload: RecommendProIn):
    """A joined Member suggests a pro for the Community's list — lands pending
    Owner/Moderator approval rather than going straight onto the public page.
    design-specs/13.RecommendAPro-LandingIntent.md."""
    community = _member_community(request, slug)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and no longer accepting suggestions."}
    if not payload.name.strip():
        return 400, {"detail": "Please enter the pro's name."}
    phone = payload.phone.strip()
    email = payload.email.strip()
    if not phone and not email:
        return 400, {"detail": "Provide either a phone number or email for the pro you're suggesting."}
    url = payload.url.strip()
    if url and not (url.startswith("http://") or url.startswith("https://")):
        return 400, {"detail": "Enter a valid website link (starting with http:// or https://)."}

    from referrals.models import ProInvite

    dup_filter = Q()
    if phone:
        dup_filter |= Q(pro_invite__phone=phone)
    if email:
        dup_filter |= Q(pro_invite__email=email)
    if ReferrerPro.objects.filter(community=community, pro_invite__isnull=False).filter(dup_filter).exists():
        return 400, {"detail": "This pro is already on the list."}

    invite = ProInvite.objects.create(
        invited_by=community.lead,
        name=payload.name.strip(),
        trade=payload.trade.strip(),
        phone=phone,
        email=email,
        url=url,
    )
    max_order = ReferrerPro.objects.filter(referrer=community.lead).count()
    rp = ReferrerPro.objects.create(
        referrer=community.lead,
        pro_invite=invite,
        community=community,
        show_on_page=False,
        show_on_community=False,
        pending_approval=True,
        submitted_by=request.auth,
        endorsement=payload.endorsement.strip()[:200],
        display_order=max_order,
    )

    notify.notify_user(
        community.lead, f"{request.auth.first_name} suggested a new pro for {community.name}: {rp.display_name}."
    )
    moderators = CommunityMember.objects.filter(
        community=community, role=CommunityMember.Role.MODERATOR, status=CommunityMember.Status.JOINED, user__isnull=False
    ).select_related("user")
    for mod in moderators:
        notify.notify_user(
            mod.user, f"{request.auth.first_name} suggested a new pro for {community.name}: {rp.display_name}."
        )

    return 201, {"id": rp.pk}


@public_router.post("/{slug}/link-preview", response={200: LinkPreviewOut, 400: ErrorOut}, auth=jwt_auth)
def link_preview(request, slug: str, payload: LinkPreviewIn):
    """Best-effort metadata fetch for the optional URL field on the
    Recommend-a-Pro form — lets a Member preview how the link would look
    before submitting. Gated to joined Members, same as recommend_pro, to
    limit the server-side-fetch surface."""
    _member_community(request, slug)
    from communities.link_preview import LinkPreviewError, fetch_link_preview

    try:
        return 200, fetch_link_preview(payload.url)
    except LinkPreviewError as e:
        return 400, {"detail": str(e)}


# ---------------------------------------------------------------------------
# Authenticated management endpoints — /api/me/community
# ---------------------------------------------------------------------------


@me_router.get("", response={200: ManagedCommunityOut, 404: ErrorOut})
def get_my_community(request):
    community, role = _managed_community(request)
    return 200, _serialize_managed(community, role)


@me_router.post("", response={201: ManagedCommunityOut, 400: ErrorOut})
def create_my_community(request, payload: CreateCommunityIn):
    """Name the Lead's Community (Workflow 1 step 4).

    The webhook creates a placeholder `Community` row on checkout completion
    (it needs to exist before `CommunitySubscription` can FK to it), so this
    is really "set the name for the first time" rather than a bare create —
    get_or_create keeps it safe to call even if the webhook race hasn't landed yet.
    """
    require_referrer(request)
    community, _created = Community.objects.get_or_create(
        lead=request.auth, defaults={"name": payload.name.strip() or "My Community"}
    )
    community.name = payload.name.strip() or community.name
    community.description = (payload.description or "")[:200]
    community.save()
    return 201, _serialize_managed(community, "owner")


@me_router.patch("", response={200: ManagedCommunityOut, 400: ErrorOut})
def update_my_community(request, payload: UpdateCommunityIn):
    community = _require_owner(request)
    data = payload.dict(exclude_unset=True)
    if "name" in data and data["name"]:
        community.name = data["name"]
    if "description" in data:
        community.description = (data["description"] or "")[:200]
    if "cover_image_url" in data:
        community.cover_image_url = data["cover_image_url"] or ""
    if "theme" in data:
        community.theme = data["theme"] or ""
    if "slug" in data and data["slug"]:
        import re
        cleaned = re.sub(r"[^a-z0-9-]+", "-", data["slug"].lower().strip()).strip("-")
        if not cleaned:
            return 400, {"detail": "Invalid slug."}
        if Community.objects.exclude(pk=community.pk).filter(slug=cleaned).exists():
            return 400, {"detail": "That slug is already taken."}
        community.slug = cleaned
    community.save()
    return 200, _serialize_managed(community, "owner")


@me_router.get("/billing", response=CommunityBillingOut)
def community_billing(request):
    community = _require_owner(request)
    sub = CommunitySubscription.objects.filter(community=community).first()
    if not sub:
        return {"invoices": []}
    return {
        "plan": sub.plan,
        "plan_label": sub.get_plan_display(),
        "status": sub.status,
        "renews_at": sub.renews_at.isoformat() if sub.renews_at else None,
        "card_last4": sub.card_last4,
        "monthly_value": float(sub.monthly_value),
        "invoices": [
            {
                "id": inv.id,
                "amount": float(inv.amount),
                "status": inv.status,
                "period_label": inv.period_label,
                "issued_at": inv.issued_at.isoformat(),
            }
            for inv in sub.invoices.all()[:24]
        ],
    }


@me_router.post("/downgrade", response={200: dict, 400: ErrorOut})
def downgrade_my_community(request):
    community = _require_owner(request)
    sub = CommunitySubscription.objects.filter(community=community).first()
    if sub and sub.stripe_subscription_id:
        try:
            cfg = StripeSettings.get()
            stripe.api_key = cfg.secret_key
            stripe.Subscription.delete(sub.stripe_subscription_id)
        except Exception:
            pass
    if sub:
        sub.status = CommunitySubscription.Status.CANCELLED
        sub.save(update_fields=["status", "updated_at"])
    community.status = Community.Status.ARCHIVED
    community.save(update_fields=["status", "updated_at"])
    if request.auth.role == User.Role.COMMUNITY_LEAD:
        request.auth.role = User.Role.REFERRER
        request.auth.save(update_fields=["role"])
    notify.notify_user(
        request.auth,
        f"Your Community is now archived — the page stays live for {community.name}'s members, "
        f"but is read-only until you resubscribe.",
    )
    return 200, {"status": community.status}


@me_router.get("/members", response=list[CommunityMemberOut])
def list_my_members(request):
    community, _role = _managed_community(request)
    members = community.members.select_related("user__referrer_profile", "user__homeowner_profile").all()
    return [_serialize_member(m) for m in members]


class PendingRatingOut(Schema):
    id: int
    referrer_pro_id: int
    pro_name: str
    rater_name: str
    stars: Optional[int]
    text: str
    created_at: str


@me_router.get("/pending-ratings", response=list[PendingRatingOut])
def list_pending_ratings(request):
    """Off-platform pros' card-click ratings awaiting approval before they
    count toward that pro's public score — design-specs/12.OffPlatformProRatings.md
    §4/§9 #3. Approve/hide via the existing /api/recommendations/{id}/approve|hide."""
    community, _role = _managed_community(request)
    recs = (
        Recommendation.objects.filter(
            referrer_pro__community=community, status=Recommendation.Status.SUBMITTED
        )
        .select_related("referrer_pro", "rater")
        .order_by("-created_at")
    )
    return [
        {
            "id": r.id,
            "referrer_pro_id": r.referrer_pro_id,
            "pro_name": r.referrer_pro.display_name,
            "rater_name": r.rater.first_name if r.rater else r.client_name,
            "stars": r.stars,
            "text": r.text,
            "created_at": r.created_at.isoformat(),
        }
        for r in recs
    ]


@me_router.get("/pending-pro-recommendations", response=list[PendingProRecommendationOut])
def list_pending_pro_recommendations(request):
    """Member-submitted pro suggestions awaiting Owner/Moderator approval —
    design-specs/13.RecommendAPro-LandingIntent.md §4."""
    community, _role = _managed_community(request)
    rows = (
        ReferrerPro.objects.filter(community=community, pending_approval=True)
        .select_related("pro_invite", "submitted_by")
        .order_by("-added_at")
    )
    return [
        {
            "id": rp.pk,
            "name": rp.display_name,
            "trade": rp.trade,
            "phone": rp.pro_invite.phone if rp.pro_invite else "",
            "email": rp.pro_invite.email if rp.pro_invite else "",
            "url": rp.pro_invite.url if rp.pro_invite else "",
            "endorsement": rp.endorsement,
            "submitted_by_name": rp.submitted_by.first_name if rp.submitted_by else "",
            "created_at": rp.added_at.isoformat(),
        }
        for rp in rows
    ]


@me_router.post("/pending-pro-recommendations/{referrer_pro_id}/approve", response={200: CommunityProOut, 404: ErrorOut})
def approve_pro_recommendation(request, referrer_pro_id: int):
    community, _role = _managed_community(request)
    rp = ReferrerPro.objects.filter(
        pk=referrer_pro_id, community=community, pending_approval=True
    ).select_related("pro", "pro_invite", "submitted_by").first()
    if not rp:
        return 404, {"detail": "Pending suggestion not found."}
    rp.show_on_community = True
    rp.pending_approval = False
    rp.save(update_fields=["show_on_community", "pending_approval"])
    if rp.submitted_by:
        notify.notify_user(rp.submitted_by, f"Your suggestion, {rp.display_name}, is now live on {community.name}!")
    return 200, _serialize_pro(rp)


@me_router.post("/pending-pro-recommendations/{referrer_pro_id}/decline", response={200: dict, 404: ErrorOut})
def decline_pro_recommendation(request, referrer_pro_id: int):
    community, _role = _managed_community(request)
    rp = ReferrerPro.objects.filter(
        pk=referrer_pro_id, community=community, pending_approval=True
    ).select_related("submitted_by").first()
    if not rp:
        return 404, {"detail": "Pending suggestion not found."}
    rp.pending_approval = False
    rp.save(update_fields=["pending_approval"])
    if rp.submitted_by:
        notify.notify_user(
            rp.submitted_by, f"{community.name}'s owner didn't add your suggestion, {rp.display_name}, to the list."
        )
    return 200, {"ok": True}


@me_router.post("/members", response={201: AddMembersOut, 400: ErrorOut})
def add_members(request, payload: AddMembersIn):
    community, _role = _managed_community(request)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and read-only."}
    added = 0
    skipped = 0
    for m in payload.members:
        if not m.name.strip() or (not m.phone.strip() and not m.email.strip()):
            skipped += 1
            continue
        existing = None
        if m.phone.strip():
            from common.phone import normalize_phone
            existing = CommunityMember.objects.filter(
                community=community, phone=normalize_phone(m.phone)
            ).first()
        if not existing and m.email.strip():
            existing = CommunityMember.objects.filter(community=community, email=m.email.strip()).first()
        if existing:
            skipped += 1
            continue
        member = CommunityMember.objects.create(
            community=community, name=m.name.strip(), phone=m.phone.strip(), email=m.email.strip()
        )
        _log_invite_event(InviteEvent.Scenario.COMMUNITY_MEMBER, member.pk, InviteEvent.EventType.SENT)
        join_url = f"https://gigkraft.com/community/{community.slug}/join/{member.token}"
        body = f"{request.auth.first_name} added you to the {community.name} directory on GigKraft. Tap to join: {join_url}"
        if member.phone:
            notify.send_sms(member.phone, body)
        if member.email:
            try:
                send_email(to=member.email, subject=f"Join {community.name} on GigKraft", body=body)
            except Exception:
                pass
        added += 1
    return 201, {"added": added, "skipped": skipped}


@me_router.post("/members/upload", response={201: AddMembersOut, 400: ErrorOut})
def upload_members(request, file: UploadedFile = File(...)):
    community, _role = _managed_community(request)
    if community.is_read_only:
        return 400, {"detail": "This Community is archived and read-only."}
    content = file.read().decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))
    members_in = []
    for i, row in enumerate(reader):
        if i >= 500:
            break
        normalised = {k.strip().lower(): v.strip() for k, v in row.items()}
        name = normalised.get("name", "")
        phone = normalised.get("phone", "") or normalised.get("mobile", "")
        email = normalised.get("email", "")
        if name:
            members_in.append(AddMemberIn(name=name, phone=phone, email=email))
    status_code, out = add_members(request, AddMembersIn(members=members_in))
    return status_code, out


@me_router.post("/members/{member_id}/resend", response={200: dict, 404: ErrorOut, 429: ErrorOut})
def resend_member_invite(request, member_id: int):
    community, _role = _managed_community(request)
    member = CommunityMember.objects.filter(pk=member_id, community=community).first()
    if not member:
        return 404, {"detail": "Member not found."}
    last = member.last_resent_at or member.invited_at
    if last and (timezone.now() - last) < timezone.timedelta(hours=24):
        return 429, {"detail": "This invite was already resent in the last 24 hours."}
    join_url = f"https://gigkraft.com/community/{community.slug}/join/{member.token}"
    body = f"Reminder: {request.auth.first_name} added you to the {community.name} directory on GigKraft. Tap to join: {join_url}"
    if member.phone:
        notify.send_sms(member.phone, body)
    if member.email:
        try:
            send_email(to=member.email, subject=f"Join {community.name} on GigKraft", body=body)
        except Exception:
            pass
    member.last_resent_at = timezone.now()
    member.save(update_fields=["last_resent_at"])
    _log_invite_event(InviteEvent.Scenario.COMMUNITY_MEMBER, member.pk, InviteEvent.EventType.RESENT)
    return 200, {"ok": True}


@me_router.delete("/members/{member_id}", response={204: None, 404: ErrorOut})
def remove_member(request, member_id: int):
    community, _role = _managed_community(request)
    member = CommunityMember.objects.filter(pk=member_id, community=community).first()
    if not member:
        return 404, {"detail": "Member not found."}
    member.delete()
    return 204, None


@me_router.post("/members/{member_id}/approve", response={200: CommunityMemberOut, 404: ErrorOut})
def approve_member(request, member_id: int):
    community, _role = _managed_community(request)
    member = CommunityMember.objects.filter(
        pk=member_id, community=community, status=CommunityMember.Status.PENDING
    ).first()
    if not member:
        return 404, {"detail": "Pending request not found."}
    member.status = CommunityMember.Status.JOINED
    member.joined_at = timezone.now()
    member.save(update_fields=["status", "joined_at"])

    _log_invite_event(InviteEvent.Scenario.COMMUNITY_MEMBER, member.pk, InviteEvent.EventType.JOINED)
    notify.notify_user(member.user or request.auth, f"You're in! {request.auth.first_name} approved your request to join {community.name}.")
    CommunityAnalyticsEvent.objects.create(
        community=community,
        event_type=CommunityAnalyticsEvent.EventType.MEMBER_JOINED,
        metadata={"member_id": member.pk},
    )
    return 200, _serialize_member(member)


@me_router.post("/members/{member_id}/decline", response={200: CommunityMemberOut, 404: ErrorOut})
def decline_member(request, member_id: int):
    community, _role = _managed_community(request)
    member = CommunityMember.objects.filter(
        pk=member_id, community=community, status=CommunityMember.Status.PENDING
    ).first()
    if not member:
        return 404, {"detail": "Pending request not found."}
    member.status = CommunityMember.Status.DECLINED
    member.save(update_fields=["status"])
    return 200, _serialize_member(member)


@me_router.post("/members/{member_id}/role", response={200: CommunityMemberOut, 400: ErrorOut, 404: ErrorOut})
def set_member_role(request, member_id: int, payload: RoleIn):
    community = _require_owner(request)
    if payload.role not in (CommunityMember.Role.MODERATOR, CommunityMember.Role.MEMBER):
        return 400, {"detail": "role must be 'moderator' or 'member'."}
    member = CommunityMember.objects.filter(
        pk=member_id, community=community, status=CommunityMember.Status.JOINED
    ).first()
    if not member:
        return 404, {"detail": "Joined member not found."}
    member.role = payload.role
    member.save(update_fields=["role"])
    if payload.role == CommunityMember.Role.MODERATOR:
        notify.notify_user(member.user or request.auth, f"{request.auth.first_name} made you a moderator of {community.name}.")
        if member.phone:
            notify.send_sms(member.phone, f"{request.auth.first_name} made you a moderator of {community.name}.")
    return 200, _serialize_member(member)


class CommunityProCandidateOut(Schema):
    id: int
    name: str
    trade: str
    phone: str
    email: str
    avatar_url: str
    endorsement: str
    tags: list[str] = []
    is_on_platform: bool
    on_this_community: bool
    # A Member-submitted suggestion awaiting Owner/Moderator approval — distinct from
    # `is_pending` (dropped here), which means an off-platform invite hasn't been claimed.
    pending_approval: bool = False


@me_router.get("/pros/candidates", response=list[CommunityProCandidateOut])
def list_pro_candidates(request):
    """All of the Lead's personal-page pros, with `on_this_community` computed
    against *this* Community specifically. `ReferrerPro.show_on_community`
    defaults to True on every row regardless of `community` — including pros
    never added to any community — so it can't be used directly to say whether
    a pro is actually on this page; it only means something once `community_id`
    matches."""
    community, _role = _managed_community(request)
    rows = ReferrerPro.objects.select_related("pro", "pro__user", "pro_invite").filter(referrer=community.lead)
    out = []
    for rp in rows:
        data = _serialize_referrer_pro(rp)
        data["on_this_community"] = rp.community_id == community.pk and rp.show_on_community
        data["pending_approval"] = rp.pending_approval
        out.append(data)
    return out


@me_router.post("/pros/toggle", response={200: CommunityProOut, 400: ErrorOut, 404: ErrorOut})
def toggle_community_pro(request, payload: ToggleProIn):
    community, _role = _managed_community(request)
    if payload.referrer_pro_id:
        rp = ReferrerPro.objects.filter(pk=payload.referrer_pro_id, referrer=community.lead).first()
        if not rp:
            return 404, {"detail": "Pro not found on your personal page."}
        if rp.community_id == community.pk:
            rp.show_on_community = not rp.show_on_community
        else:
            rp.community = community
            rp.show_on_community = True
        rp.save(update_fields=["community", "show_on_community"])
        return 200, _serialize_pro(rp)
    if payload.pro_id:
        pro = ProProfile.objects.filter(pk=payload.pro_id).first()
        if not pro:
            return 404, {"detail": "Pro not found."}
        rp, created = ReferrerPro.objects.get_or_create(
            referrer=community.lead, pro=pro,
            defaults={"community": community, "show_on_page": False, "show_on_community": True},
        )
        if not created:
            rp.community = community
            rp.show_on_community = True
            rp.save(update_fields=["community", "show_on_community"])
        return 200, _serialize_pro(rp)
    return 400, {"detail": "Provide referrer_pro_id or pro_id."}


@me_router.post("/pros/off-platform", response={201: CommunityProOut, 400: ErrorOut})
def add_off_platform_pro(request, payload: AddOffPlatformProIn):
    community, _role = _managed_community(request)
    if not payload.phone and not payload.email:
        return 400, {"detail": "Provide either a phone number or email for the off-platform pro."}
    from referrals.models import ProInvite

    invite = ProInvite.objects.create(
        invited_by=community.lead,
        name=payload.name,
        trade=payload.trade,
        phone=payload.phone,
        email=payload.email,
    )
    max_order = ReferrerPro.objects.filter(referrer=community.lead).count()
    rp = ReferrerPro.objects.create(
        referrer=community.lead,
        pro_invite=invite,
        community=community,
        show_on_page=False,
        show_on_community=True,
        endorsement=payload.endorsement,
        display_order=max_order,
    )
    return 201, _serialize_pro(rp)


class BulkImportProRowIn(Schema):
    name: str
    trade: str = ""
    phone: str = ""
    email: str = ""
    endorsement: str = ""
    tags: list[str] = []


class BulkImportProsIn(Schema):
    rows: list[BulkImportProRowIn]


class BulkImportProsOut(Schema):
    added: int
    skipped: int


@me_router.post("/pros/bulk-import", response={201: BulkImportProsOut, 400: ErrorOut})
def bulk_import_pros(request, payload: BulkImportProsIn):
    """CSV/paste bulk import — same off-platform-pro creation as add_off_platform_pro,
    looped, skipping rows with no contact info or ones that dupe an existing off-platform
    entry on this referrer's list (matched by phone or email)."""
    community, _role = _managed_community(request)
    from referrals.models import ProInvite

    existing_phones = set(
        ReferrerPro.objects.filter(referrer=community.lead, pro_invite__isnull=False)
        .exclude(pro_invite__phone="").values_list("pro_invite__phone", flat=True)
    )
    existing_emails = set(
        ReferrerPro.objects.filter(referrer=community.lead, pro_invite__isnull=False)
        .exclude(pro_invite__email="").values_list("pro_invite__email", flat=True)
    )

    added = 0
    skipped = 0
    max_order = ReferrerPro.objects.filter(referrer=community.lead).count()
    for row in payload.rows[:500]:
        name = row.name.strip()
        phone = row.phone.strip()
        email = row.email.strip()
        if not name or (not phone and not email):
            skipped += 1
            continue
        if (phone and phone in existing_phones) or (email and email in existing_emails):
            skipped += 1
            continue

        invite = ProInvite.objects.create(
            invited_by=community.lead, name=name, trade=row.trade.strip(), phone=phone, email=email,
        )
        ReferrerPro.objects.create(
            referrer=community.lead, pro_invite=invite, community=community,
            show_on_page=False, show_on_community=True, endorsement=row.endorsement.strip(),
            tags=_normalize_tags(row.tags) if row.tags else [],
            display_order=max_order,
        )
        max_order += 1
        added += 1
        if phone: existing_phones.add(phone)
        if email: existing_emails.add(email)

    return 201, {"added": added, "skipped": skipped}


@me_router.get("/analytics", response=CommunityAnalyticsOut)
def community_analytics(request):
    community, _role = _managed_community(request)
    events = community.analytics_events.all()
    members = community.members.all()
    return {
        "page_views": events.filter(event_type=CommunityAnalyticsEvent.EventType.PAGE_VIEW).count(),
        "requests_submitted": events.filter(event_type=CommunityAnalyticsEvent.EventType.REQUEST_SUBMITTED).count(),
        "member_count": members.count(),
        "invited_count": members.filter(status=CommunityMember.Status.INVITED).count(),
        "joined_count": members.filter(status=CommunityMember.Status.JOINED).count(),
        "pro_count": ReferrerPro.objects.filter(community=community, show_on_community=True).count(),
    }

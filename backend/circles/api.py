import re
from typing import Optional

from django.db.models import Q
from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import ProProfile
from circles.models import Circle, CircleAnalyticsEvent, CircleFollow, CirclePro, CircleReferral
from circles.ranking import build_tiered_results
from circles.search import map_query
from circles.serializers import serialize_circle, serialize_circle_pro
from common import notify
from common.permissions import require_homeowner
from leads.models import Lead
from nodes.models import Node

public_router = Router(tags=["circles"])
router = Router(tags=["circles"], auth=jwt_auth)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class CircleProOut(Schema):
    id: int
    pro_id: Optional[int]
    display_name: str
    primary_trade: Optional[str]
    avatar_url: Optional[str]
    handle: Optional[str] = None
    bio: Optional[str] = None
    off_platform_phone: Optional[str] = None
    off_platform_email: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    zip_code: Optional[str] = None
    endorsement: str
    status: str
    is_off_platform: bool
    skill_tags: list[str] = []
    krafts_verified: int = 0
    recs_approved: int = 0
    circles_count: int = 0


class CircleOut(Schema):
    slug: str
    curator_name: str
    curator_avatar_url: Optional[str]
    pro_count: int
    follow_status: Optional[str]  # null=anon, "none"/"pending"/"approved"/"rejected"/"curator"
    pros: list[CircleProOut]


class CircleSearchResultOut(Schema):
    tier: int
    tier_label: str
    circle_pro_id: Optional[int]
    pro_id: Optional[int]
    display_name: str
    primary_trade: str
    avatar_url: Optional[str]
    endorsement: Optional[str]
    status: str
    is_off_platform: bool
    relevance_score: float


class RequestProIn(Schema):
    circle_pro_id: Optional[int] = None
    pro_id: Optional[int] = None
    seeker_name: str
    seeker_phone: str
    address: str = ""
    job_title: str
    detail: str = ""


class RequestIntroIn(Schema):
    circle_pro_id: int
    seeker_name: str
    seeker_phone: str
    address: str = ""
    job_title: str
    detail: str = ""


class AddOnPlatformProIn(Schema):
    pro_id: int
    endorsement: str = ""


class AddOffPlatformProIn(Schema):
    name: str
    skill: str = ""
    phone: str = ""
    email: str = ""
    endorsement: str = ""


class ProLookupOut(Schema):
    id: int
    handle: Optional[str]
    display_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    primary_trade: Optional[str]
    skill_tags: list[str]
    krafts_verified: int
    recs_approved: int


class UpdateEndorsementIn(Schema):
    endorsement: str


class SetSlugIn(Schema):
    slug: str


class CircleAnalyticsOut(Schema):
    page_views: int
    searches: int
    requests_submitted: int
    referrals_attributed: int


class CircleFollowRequestOut(Schema):
    id: int
    follower_name: str
    follower_email: str
    status: str
    created_at: str


class ApproveFollowIn(Schema):
    status: str  # "approved" or "rejected"


class ErrorOut(Schema):
    detail: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _send_off_platform_invitation(cp: CirclePro, lead: Lead, circle: Circle) -> None:
    """Email the off-platform pro with a link to claim the waiting escrowed lead."""
    contact = cp.off_platform_phone or cp.off_platform_email
    if not contact:
        return
    curator_name = f"{circle.curator.first_name} {circle.curator.last_name}".strip()
    claim_url = f"https://gigkraft.com/claim/{lead.pk}"
    body = (
        f"Hi {cp.off_platform_name}! Your client {curator_name} recommended you on Gigkraft. "
        f"A neighbor has a '{lead.job_title}' job waiting for you. "
        f"Tap here to view it and claim the intro: {claim_url}"
    )
    try:
        from comms.services import send_email

        if cp.off_platform_email:
            send_email(
                to=cp.off_platform_email,
                subject=f"You have a job waiting on Gigkraft — referred by {curator_name}",
                body=body,
            )
    except Exception:
        pass


def _resolve_node():
    return Node.objects.filter(is_active=True).first()


def _get_user_from_request(request):
    """Try to resolve an authenticated user from the Bearer token, or return None."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:]
    return jwt_auth.authenticate(request, token)


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------


@public_router.get("/check-slug", auth=None)
def check_slug_available(request, slug: str):
    """Returns whether a given handle/slug is available. Safe path — not a slug param."""
    cleaned = re.sub(r"[^a-z0-9-]+", "-", slug.lower().strip()).strip("-")
    if not cleaned:
        return {"available": False, "reason": "invalid"}
    taken = Circle.objects.filter(slug=cleaned).exists()
    return {"available": not taken, "slug": cleaned}


@public_router.get("/{slug}", response={200: CircleOut, 404: ErrorOut}, auth=None)
def get_circle(request, slug: str):
    circle = Circle.objects.filter(slug=slug, is_active=True).first()
    if not circle:
        return 404, {"detail": "Circle not found."}

    CircleAnalyticsEvent.objects.create(
        circle=circle, event_type=CircleAnalyticsEvent.EventType.PAGE_VIEW
    )

    # Try to resolve authenticated user from token (optional auth)
    user = _get_user_from_request(request)

    follow_status = None
    include_pros = False

    if user is not None:
        if user.pk == circle.curator_id:
            follow_status = "curator"
            include_pros = True
        else:
            follow = CircleFollow.objects.filter(circle=circle, follower=user).first()
            if follow is None:
                follow_status = "none"
            elif follow.status == CircleFollow.Status.APPROVED:
                follow_status = "approved"
                include_pros = True
            elif follow.status == CircleFollow.Status.REJECTED:
                follow_status = "rejected"
            else:
                follow_status = "pending"

    return 200, serialize_circle(circle, include_pros=include_pros, follow_status=follow_status)


@public_router.get("/{slug}/search", response=list[CircleSearchResultOut], auth=None)
def search_circle(request, slug: str, q: str):
    circle = Circle.objects.filter(slug=slug, is_active=True).first()
    if not circle:
        return []
    CircleAnalyticsEvent.objects.create(
        circle=circle,
        event_type=CircleAnalyticsEvent.EventType.SEARCH,
        metadata={"query": q},
    )
    matched_categories = map_query(q)
    seeker = getattr(request, "auth", None)
    return build_tiered_results(circle, matched_categories, seeker=seeker)


@public_router.post("/{slug}/request-pro", response={201: dict, 400: ErrorOut})
def request_pro(request, slug: str, payload: RequestProIn):
    if not getattr(request, "auth", None):
        return 400, {"detail": "Login required to submit a request."}

    circle = Circle.objects.filter(slug=slug, is_active=True).first()
    if not circle:
        return 400, {"detail": "Circle not found."}

    # Resolve pro from circle_pro_id (Tier 1) or pro_id (Tier 3)
    pro = None
    if payload.circle_pro_id:
        cp = CirclePro.objects.filter(
            pk=payload.circle_pro_id, circle=circle, pro__isnull=False
        ).select_related("pro").first()
        if cp:
            pro = cp.pro
    if pro is None and payload.pro_id:
        pro = ProProfile.objects.filter(pk=payload.pro_id).first()
    if pro is None:
        return 400, {"detail": "Pro not found."}

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
    CircleReferral.objects.create(circle=circle, lead=lead)
    CircleAnalyticsEvent.objects.create(
        circle=circle,
        event_type=CircleAnalyticsEvent.EventType.REQUEST_SUBMITTED,
        metadata={"pro_id": pro.pk, "lead_id": lead.pk},
    )
    curator_first = circle.curator.first_name
    notify.notify_user(pro.user, f"New request: {lead.job_title}. Via {curator_first}'s Circle.")
    notify.notify_user(circle.curator, f"{request.auth.first_name} just booked {pro.display_name} through your Circle!")
    return 201, {"lead_id": lead.pk}


@public_router.post("/{slug}/request-intro", response={201: dict, 400: ErrorOut})
def request_intro(request, slug: str, payload: RequestIntroIn):
    if not getattr(request, "auth", None):
        return 400, {"detail": "Login required to submit a request."}

    circle = Circle.objects.filter(slug=slug, is_active=True).first()
    if not circle:
        return 400, {"detail": "Circle not found."}

    circle_pro = CirclePro.objects.filter(
        pk=payload.circle_pro_id, circle=circle, pro__isnull=True
    ).first()
    if not circle_pro:
        return 400, {"detail": "Off-platform pro not found in this circle."}

    node = _resolve_node()
    if node is None:
        return 400, {"detail": "No active node available."}

    lead = Lead.objects.create(
        node=node,
        homeowner=request.auth,
        pro=None,
        job_title=payload.job_title,
        detail=f"{payload.detail}\n\nAddress: {payload.address}".strip() if payload.address else payload.detail,
        thread_type=Lead.ThreadType.REQUEST,
        is_escrow=True,
    )
    CircleReferral.objects.create(circle=circle, lead=lead)
    CircleAnalyticsEvent.objects.create(
        circle=circle,
        event_type=CircleAnalyticsEvent.EventType.REQUEST_SUBMITTED,
        metadata={"circle_pro_id": circle_pro.pk, "lead_id": lead.pk, "escrow": True},
    )
    _send_off_platform_invitation(circle_pro, lead, circle)
    circle_pro.invitation_sent_at = timezone.now()
    circle_pro.status = CirclePro.Status.PENDING
    circle_pro.save(update_fields=["invitation_sent_at", "status", "updated_at"])
    return 201, {"lead_id": lead.pk, "escrow": True}


# ---------------------------------------------------------------------------
# Curator (authenticated homeowner) endpoints
# ---------------------------------------------------------------------------


@router.get("/me/find-pro", response={200: ProLookupOut, 404: ErrorOut})
def find_pro_for_circle(request, name: str = "", email: str = "", phone: str = ""):
    """Search for a registered pro by name, email, or phone for circle curation."""
    require_homeowner(request)
    if not name.strip() and not email.strip() and not phone.strip():
        return 404, {"detail": "Provide at least one search field."}

    from django.db.models import Count, Q as DQ
    from krafts.models import Kraft
    from recommendations.models import Recommendation

    qs = ProProfile.objects.filter(is_suspended=False, is_template=False).select_related("user")

    filters = DQ()
    if email.strip():
        filters |= DQ(user__email__iexact=email.strip())
    if phone.strip():
        digits = re.sub(r"\D", "", phone.strip())
        if digits:
            filters |= DQ(user__phone__icontains=digits)
    if name.strip():
        for part in name.strip().split():
            filters |= (
                DQ(user__first_name__icontains=part)
                | DQ(user__last_name__icontains=part)
                | DQ(business_name__icontains=part)
            )

    pro = qs.filter(filters).first()
    if pro is None:
        return 404, {"detail": "No pro found."}

    krafts_verified = pro.krafts.filter(status=Kraft.Status.VERIFIED).count()
    recs_approved = Recommendation.objects.filter(
        pro=pro, status=Recommendation.Status.APPROVED
    ).count()

    return 200, {
        "id": pro.id,
        "handle": pro.handle,
        "display_name": pro.display_name,
        "avatar_url": pro.avatar_url,
        "bio": pro.bio or None,
        "primary_trade": pro.primary_trade or None,
        "skill_tags": pro.skill_tags or [],
        "krafts_verified": krafts_verified,
        "recs_approved": recs_approved,
    }


@router.get("/me", response={200: CircleOut, 404: ErrorOut})
def get_my_circle(request):
    require_homeowner(request)
    circle = Circle.objects.filter(curator=request.auth).first()
    if not circle:
        return 404, {"detail": "No circle found."}
    return 200, serialize_circle(circle, include_pros=True, follow_status="curator")


@router.post("/me", response={201: CircleOut, 400: ErrorOut})
def create_my_circle(request, payload: SetSlugIn):
    """Create the curator's Circle with a user-chosen slug (first-time setup only)."""
    require_homeowner(request)
    if Circle.objects.filter(curator=request.auth).exists():
        return 400, {"detail": "You already have a Circle."}
    slug = re.sub(r"[^a-z0-9-]+", "-", payload.slug.lower().strip()).strip("-")
    if not slug:
        return 400, {"detail": "Invalid handle. Use letters, numbers, and hyphens only."}
    if Circle.objects.filter(slug=slug).exists():
        return 400, {"detail": "That handle is already taken. Please choose a different one."}
    circle = Circle(curator=request.auth, slug=slug)
    circle.save()
    return 201, serialize_circle(circle, include_pros=True, follow_status="curator")


@router.post("/me/pros", response={201: CircleProOut, 400: ErrorOut})
def add_on_platform_pro(request, payload: AddOnPlatformProIn):
    require_homeowner(request)
    circle = Circle.objects.get(curator=request.auth)
    pro = ProProfile.objects.filter(pk=payload.pro_id).first()
    if not pro:
        return 400, {"detail": "Pro not found."}
    if CirclePro.objects.filter(circle=circle, pro=pro).exists():
        return 400, {"detail": "This pro is already in your Circle."}
    cp = CirclePro.objects.create(
        circle=circle, pro=pro, endorsement=payload.endorsement
    )
    return 201, serialize_circle_pro(cp)


@router.post("/me/pros/off-platform", response={201: CircleProOut, 400: ErrorOut})
def add_off_platform_pro(request, payload: AddOffPlatformProIn):
    require_homeowner(request)
    circle = Circle.objects.get(curator=request.auth)
    if not payload.phone and not payload.email:
        return 400, {"detail": "Provide either a phone number or email for the off-platform pro."}
    cp = CirclePro.objects.create(
        circle=circle,
        pro=None,
        off_platform_name=payload.name,
        off_platform_skill=payload.skill,
        off_platform_phone=payload.phone,
        off_platform_email=payload.email,
        endorsement=payload.endorsement,
        status=CirclePro.Status.PENDING,
    )
    return 201, serialize_circle_pro(cp)


@router.patch("/me/pros/{circle_pro_id}", response={200: CircleProOut, 404: ErrorOut})
def update_endorsement(request, circle_pro_id: int, payload: UpdateEndorsementIn):
    require_homeowner(request)
    circle = Circle.objects.get(curator=request.auth)
    cp = CirclePro.objects.filter(pk=circle_pro_id, circle=circle).first()
    if not cp:
        return 404, {"detail": "Pro not found in your Circle."}
    cp.endorsement = payload.endorsement
    cp.save(update_fields=["endorsement", "updated_at"])
    return 200, serialize_circle_pro(cp)


@router.delete("/me/pros/{circle_pro_id}", response={204: None, 404: ErrorOut})
def remove_pro_from_circle(request, circle_pro_id: int):
    require_homeowner(request)
    circle = Circle.objects.get(curator=request.auth)
    cp = CirclePro.objects.filter(pk=circle_pro_id, circle=circle).first()
    if not cp:
        return 404, {"detail": "Pro not found in your Circle."}
    cp.delete()
    return 204, None


@router.get("/me/analytics", response=CircleAnalyticsOut)
def get_circle_analytics(request):
    require_homeowner(request)
    circle = Circle.objects.get(curator=request.auth)
    events = circle.analytics_events.all()
    return {
        "page_views": events.filter(event_type=CircleAnalyticsEvent.EventType.PAGE_VIEW).count(),
        "searches": events.filter(event_type=CircleAnalyticsEvent.EventType.SEARCH).count(),
        "requests_submitted": events.filter(event_type=CircleAnalyticsEvent.EventType.REQUEST_SUBMITTED).count(),
        "referrals_attributed": circle.referrals.count(),
    }


@router.get("/me/follow-requests", response=list[CircleFollowRequestOut])
def list_follow_requests(request):
    require_homeowner(request)
    circle = Circle.objects.filter(curator=request.auth).first()
    if not circle:
        return []
    follows = circle.follow_requests.select_related("follower").all()
    return [
        {
            "id": f.pk,
            "follower_name": f"{f.follower.first_name} {f.follower.last_name}".strip() or f.follower.email,
            "follower_email": f.follower.email,
            "status": f.status,
            "created_at": f.created_at.isoformat(),
        }
        for f in follows
    ]


@router.patch("/me/follow-requests/{follow_id}", response={200: dict, 400: ErrorOut, 404: ErrorOut})
def update_follow_request(request, follow_id: int, payload: ApproveFollowIn):
    require_homeowner(request)
    circle = Circle.objects.filter(curator=request.auth).first()
    if not circle:
        return 404, {"detail": "Circle not found."}
    follow = CircleFollow.objects.filter(pk=follow_id, circle=circle).first()
    if not follow:
        return 404, {"detail": "Follow request not found."}
    if payload.status not in ("approved", "rejected"):
        return 400, {"detail": "Status must be 'approved' or 'rejected'."}
    follow.status = payload.status
    follow.save(update_fields=["status", "updated_at"])
    if payload.status == "approved":
        curator_name = f"{circle.curator.first_name} {circle.curator.last_name}".strip() or "the curator"
        notify.notify_user(
            follow.follower,
            f"Your request to follow {curator_name}'s Circle was approved! You can now view their trusted pros.",
        )
    return 200, {"status": follow.status}


@router.post("/{slug}/follow", response={201: dict, 200: dict, 400: ErrorOut})
def request_follow(request, slug: str):
    circle = Circle.objects.filter(slug=slug, is_active=True).first()
    if not circle:
        return 400, {"detail": "Circle not found."}
    if request.auth.pk == circle.curator_id:
        return 400, {"detail": "You cannot follow your own Circle."}

    follow, created = CircleFollow.objects.get_or_create(
        circle=circle,
        follower=request.auth,
        defaults={"status": CircleFollow.Status.PENDING},
    )

    if not created and follow.status == CircleFollow.Status.REJECTED:
        follow.status = CircleFollow.Status.PENDING
        follow.save(update_fields=["status", "updated_at"])
        return 200, {"status": follow.status}

    if created:
        follower_name = f"{request.auth.first_name} {request.auth.last_name}".strip() or request.auth.email
        curator_name = f"{circle.curator.first_name} {circle.curator.last_name}".strip() or "your"
        notify.notify_user(
            circle.curator,
            f"{follower_name} wants to follow your Circle. Approve or reject in your dashboard.",
        )

    return (201 if created else 200), {"status": follow.status}


@router.post("/claim-lead/{lead_id}", response={200: dict, 400: ErrorOut})
def claim_escrowed_lead(request, lead_id: int):
    """
    Explicit claim path: authenticated user asserts they are the off-platform
    pro who was invited. Supplements the post_save signal (which fires
    automatically when ProProfile is created with a matching email).
    """
    user = request.auth

    # Find the escrowed lead and its referral in one hit
    try:
        lead = Lead.objects.select_related("circle_referral__circle").get(
            pk=lead_id, is_escrow=True
        )
    except Lead.DoesNotExist:
        return 400, {"detail": "Lead not found or already claimed."}

    referral = getattr(lead, "circle_referral", None)
    if not referral:
        return 400, {"detail": "This lead is not a Circle referral."}

    # Find the matching CirclePro by email (phone is secondary for now)
    circle_pro = CirclePro.objects.filter(
        circle=referral.circle,
        pro__isnull=True,
    ).filter(
        Q(off_platform_email=user.email or "")
    ).first()

    if not circle_pro:
        return 400, {"detail": "Your account email doesn't match the invited pro. Contact the homeowner to verify."}

    # Resolve ProProfile — may not exist yet if user is still a 'member'
    pro_profile = ProProfile.objects.filter(user=user).first()
    if not pro_profile:
        return 400, {"detail": "no_pro_profile"}

    # Claim: link lead and CirclePro
    lead.pro = pro_profile
    lead.is_escrow = False
    lead.save(update_fields=["pro", "is_escrow", "updated_at"])

    circle_pro.pro = pro_profile
    circle_pro.status = CirclePro.Status.CLAIMED
    circle_pro.save(update_fields=["pro", "status", "updated_at"])

    notify.notify_user(
        referral.circle.curator,
        f"{pro_profile.display_name} just joined Gigkraft and claimed your Circle intro!",
    )
    return 200, {"lead_id": lead.pk}

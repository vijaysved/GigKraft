"""Magic-link recommendations (screens 1.7, 1.8, 2.5).

The review endpoints are public (token-authenticated by the unguessable
signed token in the URL). MOCK (Phase 1): the link is returned in the API
response and logged; no real SMS/WhatsApp/email is sent."""
from typing import Optional

from datetime import timedelta

from django.utils import timezone

LINK_TTL_DAYS = 30
from ninja import Router, Schema

from accounts.auth import jwt_auth
from accounts.models import ProProfile
from common import notify
from common.permissions import require_pro
from leads.models import Lead
from recommendations.models import Recommendation, generate_token
from referrals.models import ReferrerPro

router = Router(tags=["recommendations"])
public_router = Router(tags=["recommendations"])

CHANNELS = [c[0] for c in Recommendation.Channel.choices]


class ErrorOut(Schema):
    detail: str


class RecommendationOut(Schema):
    id: int
    client_name: str
    client_contact: str
    channel: str
    stars: Optional[int]
    text: str
    photo_urls: list[str]
    status: str
    token: str
    magic_link: str
    job_title: Optional[str]
    created_at: str
    submitted_at: Optional[str]
    expires_at: str


class RequestIn(Schema):
    client_name: str
    client_contact: str = ""
    channel: str = "sms"
    lead_id: Optional[int] = None


class ReviewContextOut(Schema):
    pro_name: str
    pro_trade: str
    client_name: str
    job_title: Optional[str]
    status: str


class ReviewSubmitIn(Schema):
    stars: int
    text: str = ""
    photo_urls: list[str] = []


class RateProIn(Schema):
    """Card-click rating (design-specs/12.OffPlatformProRatings.md §4) —
    the logged-in rater's identity comes from the JWT, not this payload.
    Exactly one of pro_id/referrer_pro_id must be set."""
    pro_id: Optional[int] = None
    referrer_pro_id: Optional[int] = None
    stars: int
    text: str = ""  # pre-encoded via encodeRecText on the frontend, same as the magic-link flow


def magic_link(rec: Recommendation) -> str:
    # Deep link consumed by the mobile review screen (2.5).
    return f"gigkraft://review/{rec.token}"


def serialize_rec(rec: Recommendation) -> dict:
    return {
        "id": rec.id,
        "client_name": rec.client_name,
        "client_contact": rec.client_contact,
        "channel": rec.channel,
        "stars": rec.stars,
        "text": rec.text,
        "photo_urls": rec.photo_urls or [],
        "status": rec.status,
        "token": rec.token,
        "magic_link": magic_link(rec),
        "job_title": rec.lead.job_title if rec.lead else None,
        "created_at": rec.created_at.isoformat(),
        "submitted_at": rec.submitted_at.isoformat() if rec.submitted_at else None,
        "expires_at": (rec.created_at + timedelta(days=LINK_TTL_DAYS)).isoformat(),
    }


@router.post(
    "/request", response={201: RecommendationOut, 400: ErrorOut}, auth=jwt_auth
)
def request_recommendation(request, payload: RequestIn):
    """Pro sends a magic review link to a past client (screen 1.7)."""
    pro = require_pro(request)
    if payload.channel not in CHANNELS:
        return 400, {"detail": f"channel must be one of {CHANNELS}"}

    # One active link per contact (non-expired, not yet approved/hidden).
    contact = payload.client_contact.strip()
    if contact:
        expiry_cutoff = timezone.now() - timedelta(days=LINK_TTL_DAYS)
        existing = Recommendation.objects.filter(
            pro=pro,
            client_contact__iexact=contact,
            created_at__gte=expiry_cutoff,
            status__in=[
                Recommendation.Status.SENT,
                Recommendation.Status.OPENED,
                Recommendation.Status.SUBMITTED,
            ],
        ).first()
        if existing:
            return 400, {
                "detail": (
                    f"An active review link already exists for {contact}. "
                    "It expires 30 days after it was created."
                )
            }

    lead = None
    if payload.lead_id:
        lead = Lead.objects.filter(pk=payload.lead_id, pro=pro).first()
        if lead is None:
            return 400, {"detail": "Unknown lead for this pro."}
    rec = Recommendation.objects.create(
        pro=pro,
        lead=lead,
        client_name=payload.client_name,
        client_contact=payload.client_contact,
        channel=payload.channel,
    )
    # MOCK: log the outbound link instead of sending SMS/WhatsApp/email.
    link = magic_link(rec)
    if rec.channel == Recommendation.Channel.WHATSAPP:
        notify.send_whatsapp(rec.client_contact, f"Review {pro.display_name}: {link}")
    elif rec.channel == Recommendation.Channel.SMS:
        notify.send_sms(rec.client_contact, f"Review {pro.display_name}: {link}")
    else:
        notify.notify_user(rec.client_contact, f"Review link (email): {link}")
    return 201, serialize_rec(rec)


@router.get(
    "/review/{token}",
    response={200: ReviewContextOut, 404: ErrorOut},
    auth=None,
)
def review_context(request, token: str):
    """Public: load the review screen context from a magic link (2.5)."""
    rec = (
        Recommendation.objects.filter(token=token)
        .select_related("pro", "pro__user", "referrer_pro", "lead")
        .first()
    )
    if rec is None:
        return 404, {"detail": "Invalid or expired review link."}
    if rec.status == Recommendation.Status.SENT:
        rec.status = Recommendation.Status.OPENED
        rec.save(update_fields=["status"])
    target = rec.pro or rec.referrer_pro
    return 200, {
        "pro_name": target.display_name,
        "pro_trade": target.primary_trade if rec.pro else target.trade,
        "client_name": rec.client_name,
        "job_title": rec.lead.job_title if rec.lead else None,
        "status": rec.status,
    }


@router.post(
    "/review/{token}",
    response={200: RecommendationOut, 400: ErrorOut, 404: ErrorOut},
    auth=None,
)
def submit_review(request, token: str, payload: ReviewSubmitIn):
    """Public: submit stars + text + optional photos via the magic link."""
    rec = Recommendation.objects.filter(token=token).first()
    if rec is None:
        return 404, {"detail": "Invalid or expired review link."}
    if rec.status in (
        Recommendation.Status.SUBMITTED,
        Recommendation.Status.APPROVED,
    ):
        return 400, {"detail": "This review was already submitted."}
    if not 1 <= payload.stars <= 5:
        return 400, {"detail": "stars must be between 1 and 5."}
    rec.stars = payload.stars
    rec.text = payload.text
    rec.photo_urls = payload.photo_urls
    rec.status = Recommendation.Status.SUBMITTED
    rec.submitted_at = timezone.now()
    rec.save()
    notify.notify_user(
        rec.pro.user, f"New recommendation from {rec.client_name} to moderate."
    )
    return 200, serialize_rec(rec)


@router.get("", response=list[RecommendationOut], auth=jwt_auth)
def list_recommendations(request, status: Optional[str] = None):
    """Pro's own recommendations; ?status=submitted for the moderation
    queue (screen 1.8)."""
    pro = require_pro(request)
    recs = Recommendation.objects.filter(pro=pro).select_related("lead")
    if status:
        recs = recs.filter(status__in=[s for s in status.split(",") if s])
    return [serialize_rec(r) for r in recs[:100]]


@router.post(
    "/rate",
    response={200: RecommendationOut, 400: ErrorOut, 404: ErrorOut},
    auth=jwt_auth,
)
def rate_pro(request, payload: RateProIn):
    """Card-click rating, for a logged-in user, of either an on-platform pro
    or an off-platform referred contact (design-specs/12.OffPlatformProRatings.md
    §4). Re-rating the same target edits the rater's existing Recommendation
    instead of creating a duplicate."""
    if bool(payload.pro_id) == bool(payload.referrer_pro_id):
        return 400, {"detail": "Provide exactly one of pro_id or referrer_pro_id."}
    if not 1 <= payload.stars <= 5:
        return 400, {"detail": "stars must be between 1 and 5."}

    pro = None
    referrer_pro = None
    if payload.pro_id:
        pro = ProProfile.objects.filter(pk=payload.pro_id).first()
        if pro is None:
            return 404, {"detail": "Pro not found."}
    else:
        referrer_pro = ReferrerPro.objects.filter(pk=payload.referrer_pro_id, pro__isnull=True).first()
        if referrer_pro is None:
            return 404, {"detail": "Referred pro not found."}

    rater_name = f"{request.auth.first_name} {request.auth.last_name}".strip() or "GigKraft user"
    rec, _created = Recommendation.objects.update_or_create(
        rater=request.auth, pro=pro, referrer_pro=referrer_pro,
        defaults={
            "client_name": rater_name,
            "stars": payload.stars,
            "text": payload.text,
            "status": Recommendation.Status.SUBMITTED,
            "submitted_at": timezone.now(),
            "token": generate_token(),
        },
    )
    if pro:
        notify.notify_user(pro.user, f"New rating from {rater_name} to moderate.")
    return 200, serialize_rec(rec)


def _can_moderate(request, rec: Recommendation) -> bool:
    """Who may approve/hide a Recommendation before it counts toward scores.
    On-platform: the pro themselves. Off-platform: whoever added them
    (the referrer), or the Community's Owner/Moderators if community-scoped
    — §4/§9 #3 of the off-platform spec."""
    if rec.pro_id:
        return rec.pro.user_id == request.auth.id
    rp = rec.referrer_pro
    if rp is None:
        return False
    if rp.referrer_id == request.auth.id:
        return True
    if rp.community_id:
        from communities.api import _viewer_status
        return _viewer_status(rp.community, request.auth) in ("owner", "moderator")
    return False


@router.post(
    "/{rec_id}/approve",
    response={200: RecommendationOut, 400: ErrorOut, 403: ErrorOut, 404: ErrorOut},
    auth=jwt_auth,
)
def approve_recommendation(request, rec_id: int):
    """Approve -> the recommendation counts toward the pro's public scores."""
    rec = Recommendation.objects.select_related("pro__user", "referrer_pro__community").filter(pk=rec_id).first()
    if rec is None:
        return 404, {"detail": "Recommendation not found."}
    if not _can_moderate(request, rec):
        return 403, {"detail": "You don't have permission to moderate this recommendation."}
    if rec.status != Recommendation.Status.SUBMITTED:
        return 400, {"detail": "Only submitted recommendations can be approved."}
    rec.status = Recommendation.Status.APPROVED
    rec.save(update_fields=["status"])
    return 200, serialize_rec(rec)


@router.post(
    "/{rec_id}/hide",
    response={200: RecommendationOut, 403: ErrorOut, 404: ErrorOut},
    auth=jwt_auth,
)
def hide_recommendation(request, rec_id: int):
    rec = Recommendation.objects.select_related("pro__user", "referrer_pro__community").filter(pk=rec_id).first()
    if rec is None:
        return 404, {"detail": "Recommendation not found."}
    if not _can_moderate(request, rec):
        return 403, {"detail": "You don't have permission to moderate this recommendation."}
    rec.status = Recommendation.Status.HIDDEN
    rec.save(update_fields=["status"])
    return 200, serialize_rec(rec)


# ── Public endpoints (no auth) ────────────────────────────────────────────────

class PublicRecOut(Schema):
    id: int
    client_name: str   # first 5 chars only
    stars: Optional[int]
    text: str
    submitted_at: Optional[str]


@public_router.get(
    "/by-handle/{handle}",
    response={200: list[PublicRecOut], 404: ErrorOut},
    auth=None,
)
def public_recommendations(request, handle: str):
    """Return approved recommendations for a pro's public profile."""
    pro = ProProfile.objects.filter(handle=handle.lower()).first()
    if pro is None:
        return 404, {"detail": "Pro not found."}
    recs = (
        Recommendation.objects.filter(pro=pro, status=Recommendation.Status.APPROVED)
        .order_by("-submitted_at")[:50]
    )
    return 200, [
        {
            "id": r.id,
            "client_name": r.client_name[:5],
            "stars": r.stars,
            "text": r.text,
            "submitted_at": r.submitted_at.isoformat() if r.submitted_at else None,
        }
        for r in recs
    ]

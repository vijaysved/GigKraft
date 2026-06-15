"""Pro profile endpoints: onboarding (1.2-1.5), service area, discovery
(2.1/2.2/1.13), public handle lookup, and performance stats (1.11)."""
import hashlib
import re
from builtins import range as builtin_range
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.db.models import Avg, Q
from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import ProProfile
from common.permissions import require_pro
from krafts.models import Kraft
from leads.models import Lead, Quote
from recommendations.models import Recommendation

router = Router(tags=["pros"], auth=jwt_auth)
public_router = Router(tags=["pros"])

ZIP_RE = re.compile(r"^\d{5}(-\d{4})?$")
HANDLE_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$|^[a-z0-9]{2,30}$")


def validate_zip(value: str) -> str:
    value = value.strip()
    if not ZIP_RE.match(value):
        raise HttpError(400, f"Invalid ZIP code: {value!r}")
    return value


class ErrorOut(Schema):
    detail: str


class ProStatsSummary(Schema):
    krafts_verified: int
    recs_approved: int
    avg_stars: Optional[float]


class ProOut(Schema):
    id: int
    handle: Optional[str]
    name: str
    business_name: str
    primary_trade: str
    skill_tags: list[str]
    bio: str
    base_zip: str
    service_mode: str
    service_zips: list[str]
    service_center_zip: str
    service_radius_miles: int
    response_hours: int
    licensed: bool
    license_number: str
    insured: bool
    availability: str
    wallpaper_id: int
    wallpaper_url: str
    avatar_url: str
    is_verified: bool
    is_suspended: bool
    node_id: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    stats: ProStatsSummary


def serialize_pro(pro: ProProfile) -> dict:
    approved = Recommendation.objects.filter(
        pro=pro, status=Recommendation.Status.APPROVED
    )
    return {
        "id": pro.id,
        "handle": pro.handle,
        "name": pro.display_name,
        "business_name": pro.business_name,
        "primary_trade": pro.primary_trade,
        "skill_tags": pro.skill_tags or [],
        "bio": pro.bio,
        "base_zip": pro.base_zip,
        "service_mode": pro.service_mode,
        "service_zips": pro.service_zips or [],
        "service_center_zip": pro.service_center_zip,
        "service_radius_miles": pro.service_radius_miles,
        "response_hours": pro.response_hours,
        "licensed": pro.licensed,
        "license_number": pro.license_number,
        "insured": pro.insured,
        "availability": pro.availability,
        "wallpaper_id": pro.wallpaper_id,
        "wallpaper_url": pro.wallpaper_url,
        "avatar_url": pro.avatar_url,
        "is_verified": pro.is_verified,
        "is_suspended": pro.is_suspended,
        "node_id": pro.user.node.node_id if pro.user.node_id else None,
        "email": pro.user.email,
        "phone": pro.user.phone,
        "stats": {
            "krafts_verified": pro.krafts.filter(
                status=Kraft.Status.VERIFIED
            ).count(),
            "recs_approved": approved.count(),
            "avg_stars": approved.aggregate(avg=Avg("stars"))["avg"],
        },
    }


class ProProfileIn(Schema):
    """Partial update for onboarding screens 1.3-1.5."""

    business_name: Optional[str] = None
    primary_trade: Optional[str] = None
    skill_tags: Optional[list[str]] = None
    bio: Optional[str] = None
    response_hours: Optional[int] = None
    licensed: Optional[bool] = None
    license_number: Optional[str] = None
    insured: Optional[bool] = None
    availability: Optional[str] = None
    wallpaper_id: Optional[int] = None
    wallpaper_url: Optional[str] = None
    avatar_url: Optional[str] = None


class HandleIn(Schema):
    handle: str


class ServiceAreaIn(Schema):
    """Service area (screen 1.2): ZIP list + radius only, no map."""

    base_zip: Optional[str] = None
    service_mode: Optional[str] = None  # explicit | radial
    service_zips: Optional[list[str]] = None  # up to 3
    service_center_zip: Optional[str] = None
    service_radius_miles: Optional[int] = None


@router.get("/me", response=ProOut)
def my_pro_profile(request):
    pro = require_pro(request)
    if not pro.handle:
        pro.save()  # triggers _generate_handle
    return serialize_pro(pro)


@router.patch("/me", response=ProOut)
def update_pro_profile(request, payload: ProProfileIn):
    pro = require_pro(request)
    data = payload.dict(exclude_unset=True)
    if "bio" in data and data["bio"] is not None and len(data["bio"]) > 500:
        raise HttpError(400, "Bio must be 500 characters or fewer.")
    if "availability" in data and data["availability"] not in (
        None,
        ProProfile.Availability.FULL,
        ProProfile.Availability.PART,
    ):
        raise HttpError(400, "availability must be 'full' or 'part'.")
    for field, value in data.items():
        if value is not None:
            setattr(pro, field, value)
    pro.save()
    return serialize_pro(pro)


@router.patch("/me/service-area", response=ProOut)
def update_service_area(request, payload: ServiceAreaIn):
    pro = require_pro(request)
    data = payload.dict(exclude_unset=True)

    if data.get("service_mode") is not None:
        if data["service_mode"] not in (
            ProProfile.ServiceMode.EXPLICIT,
            ProProfile.ServiceMode.RADIAL,
        ):
            raise HttpError(400, "service_mode must be 'explicit' or 'radial'.")
        pro.service_mode = data["service_mode"]
    if data.get("base_zip") is not None:
        pro.base_zip = validate_zip(data["base_zip"])
    if data.get("service_zips") is not None:
        zips = [validate_zip(z) for z in data["service_zips"]]
        if len(zips) > 3:
            raise HttpError(400, "At most 3 service ZIPs are allowed.")
        pro.service_zips = zips
    if data.get("service_center_zip") is not None:
        pro.service_center_zip = validate_zip(data["service_center_zip"])
    if data.get("service_radius_miles") is not None:
        radius = data["service_radius_miles"]
        if not 1 <= radius <= 100:
            raise HttpError(400, "service_radius_miles must be 1-100.")
        pro.service_radius_miles = radius
    pro.save()
    return serialize_pro(pro)


@router.patch("/me/handle", response={200: ProOut, 400: ErrorOut, 409: ErrorOut})
def update_handle(request, payload: HandleIn):
    pro = require_pro(request)
    handle = payload.handle.lower().strip()
    if not HANDLE_RE.match(handle):
        return 400, {"detail": "Handle must be 2–30 characters: lowercase letters, numbers, and hyphens only."}
    if ProProfile.objects.exclude(pk=pro.pk).filter(handle=handle).exists():
        return 409, {"detail": "That handle is already taken."}
    pro.handle = handle
    pro.save()
    return 200, serialize_pro(pro)


@router.get("", response=list[ProOut])
def list_pros(
    request,
    node: Optional[str] = None,
    trade: Optional[str] = None,
    zip: Optional[str] = None,
    q: Optional[str] = None,
):
    """Discovery / B2B search (1.13). Filters by node, trade and ZIP."""
    pros = ProProfile.objects.filter(is_suspended=False).select_related(
        "user", "user__node"
    )
    if node:
        pros = pros.filter(user__node__node_id=node)
    elif request.auth.node_id:
        pros = pros.filter(user__node_id=request.auth.node_id)
    if trade:
        pros = pros.filter(primary_trade__iexact=trade)
    if zip:
        pros = pros.filter(
            Q(base_zip=zip)
            | Q(service_center_zip=zip)
            | Q(service_zips__icontains=zip)
        )
    if q:
        pros = pros.filter(
            Q(user__first_name__icontains=q)
            | Q(user__last_name__icontains=q)
            | Q(business_name__icontains=q)
            | Q(primary_trade__icontains=q)
            | Q(skill_tags__icontains=q)
        )
    return [serialize_pro(p) for p in pros[:50]]


@router.get("/{pro_id}", response={200: ProOut, 404: ErrorOut})
def pro_detail(request, pro_id: int):
    pro = (
        ProProfile.objects.filter(pk=pro_id)
        .select_related("user", "user__node")
        .first()
    )
    if pro is None:
        return 404, {"detail": "Pro not found."}
    return 200, serialize_pro(pro)


# --- Performance & analytics (screen 1.11) ---

RANGE_DAYS = {"7d": 7, "30d": 30, "90d": 90}


class StatDelta(Schema):
    value: int
    delta_pct: int


class RevenuePoint(Schema):
    label: str
    amount: float


class ProPerformanceOut(Schema):
    range: str
    profile_views: StatDelta
    search_appearances: StatDelta
    link_clicks: StatDelta
    won_jobs: StatDelta
    revenue_total: float
    revenue_points: list[RevenuePoint]
    conversion_pct: int
    avg_response_minutes: int
    sla_target_hours: int


def _pseudo(seed: str, low: int, high: int) -> int:
    """Deterministic mock metric (Phase 1): stable per pro+range+name."""
    digest = hashlib.sha256(seed.encode()).hexdigest()
    span = high - low + 1
    return low + int(digest[:8], 16) % span


def _accepted_total(pro, start, end=None) -> Decimal:
    quotes = Quote.objects.filter(lead__pro=pro, accepted=True, created_at__gte=start)
    if end is not None:
        quotes = quotes.filter(created_at__lt=end)
    return sum((q.total for q in quotes), Decimal("0"))


@router.get("/me/stats", response=ProPerformanceOut)
def my_performance(request, range: str = "30d"):
    pro = require_pro(request)
    if range not in RANGE_DAYS:
        raise HttpError(400, "range must be one of 7d, 30d, 90d.")
    days = RANGE_DAYS[range]
    since = timezone.now() - timedelta(days=days)

    won_count = Lead.objects.filter(
        pro=pro, status=Lead.Status.WON, updated_at__gte=since
    ).count()
    revenue = _accepted_total(pro, since)

    # Weekly revenue buckets (oldest first).
    buckets = max(4, min(12, days // 7))
    points = []
    now = timezone.now()
    for i in builtin_range(buckets):
        start = now - timedelta(days=(buckets - i) * 7)
        end = start + timedelta(days=7)
        total = _accepted_total(pro, start, end)
        points.append({"label": f"W{i + 1}", "amount": float(total)})

    # MOCK (Phase 1): impression-style metrics are deterministic pseudo-data
    # until real tracking lands.
    seed = f"{pro.id}:{range}"
    views = _pseudo(seed + ":views", 40 * days // 7, 90 * days // 7)
    appearances = _pseudo(seed + ":appear", 100 * days // 7, 240 * days // 7)
    clicks = _pseudo(seed + ":clicks", 10 * days // 7, 40 * days // 7)
    total_leads = Lead.objects.filter(pro=pro, created_at__gte=since).count()
    conversion = (
        round(100 * won_count / total_leads) if total_leads else
        _pseudo(seed + ":conv", 22, 48)
    )

    return {
        "range": range,
        "profile_views": {"value": views, "delta_pct": _pseudo(seed + ":d1", -8, 24)},
        "search_appearances": {
            "value": appearances,
            "delta_pct": _pseudo(seed + ":d2", -6, 30),
        },
        "link_clicks": {"value": clicks, "delta_pct": _pseudo(seed + ":d3", -10, 18)},
        "won_jobs": {"value": won_count, "delta_pct": _pseudo(seed + ":d4", -5, 40)},
        "revenue_total": float(revenue),
        "revenue_points": points,
        "conversion_pct": conversion,
        "avg_response_minutes": _pseudo(seed + ":resp", 30, 150),
        "sla_target_hours": pro.response_hours,
    }


# --- Public endpoints (no auth required) ---

@public_router.get("/by-handle/{handle}", response={200: ProOut, 404: ErrorOut}, auth=None)
def pro_by_handle(request, handle: str):
    pro = (
        ProProfile.objects.filter(handle=handle.lower())
        .select_related("user", "user__node")
        .first()
    )
    if pro is None:
        return 404, {"detail": "Pro not found."}
    return 200, serialize_pro(pro)

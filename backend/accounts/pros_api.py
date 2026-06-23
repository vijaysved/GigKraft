"""Pro profile endpoints: onboarding (1.2-1.5), service area, discovery
(2.1/2.2/1.13), public handle lookup, and performance stats (1.11)."""
import hashlib
import re
from builtins import range as builtin_range
from datetime import timedelta
from decimal import Decimal
from typing import Optional

from django.db.models import Avg, Q
from django.db.utils import OperationalError
from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import KraftClick, KraftImpression, ProProfile, ProProfileView
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
    if pro.is_template:
        raise HttpError(403, "Template profiles cannot be modified via this endpoint.")
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
    if pro.is_template:
        raise HttpError(403, "Template profile handles cannot be changed.")
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


# --- Analytics tracking (fire-and-forget, no auth required) ---

# ── Public: pro directory search (no auth) ───────────────────────────────────

@public_router.get("/search", auth=None, response=list[ProOut])
def search_pros_public(
    request,
    q: Optional[str] = None,
    trade: Optional[str] = None,
    zip: Optional[str] = None,
):
    """Public pro discovery — no auth required, no node scoping."""
    pros = ProProfile.objects.filter(is_suspended=False).select_related("user", "user__node")
    if trade:
        pros = pros.filter(primary_trade__iexact=trade)
    if zip:
        pros = pros.filter(
            Q(base_zip=zip) | Q(service_center_zip=zip) | Q(service_zips__icontains=zip)
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


class ProfileViewIn(Schema):
    pro_handle: str
    viewer_zip: str = ""


class KraftEventIn(Schema):
    kraft_id: int
    pro_handle: str


@public_router.post("/track/profile-view", auth=None, response={200: dict})
def track_profile_view(request, payload: ProfileViewIn):
    pro = ProProfile.objects.filter(handle=payload.pro_handle).first()
    if not pro:
        return 200, {}
    viewer = request.user if request.user.is_authenticated else None
    viewer_zip = ""
    if viewer:
        hp = getattr(viewer, "homeowner_profile", None)
        viewer_zip = (hp.default_zip if hp else "") or ""
    ProProfileView.objects.create(pro=pro, viewer=viewer, viewer_zip=viewer_zip)
    return 200, {}


@public_router.post("/track/kraft-impression", auth=None, response={200: dict})
def track_kraft_impression(request, payload: KraftEventIn):
    pro = ProProfile.objects.filter(handle=payload.pro_handle).first()
    kraft = Kraft.objects.filter(id=payload.kraft_id).first()
    if not pro or not kraft:
        return 200, {}
    viewer = request.user if request.user.is_authenticated else None
    KraftImpression.objects.create(kraft=kraft, pro=pro, viewer=viewer)
    return 200, {}


@public_router.post("/track/kraft-click", auth=None, response={200: dict})
def track_kraft_click(request, payload: KraftEventIn):
    pro = ProProfile.objects.filter(handle=payload.pro_handle).first()
    kraft = Kraft.objects.filter(id=payload.kraft_id).first()
    if not pro or not kraft:
        return 200, {}
    viewer = request.user if request.user.is_authenticated else None
    KraftClick.objects.create(kraft=kraft, pro=pro, viewer=viewer)
    return 200, {}


# --- Dashboard endpoint (Tab 1: My Performance) ---

class KraftEngagementOut(Schema):
    kraft_id: int
    title: str
    impressions: int
    clicks: int
    ctr_pct: int


class TimelinePoint(Schema):
    label: str
    visitors: int
    requests: int


class DashboardOut(Schema):
    range: str
    joined_at: str
    total_visitors: int
    visitors_delta_pct: int
    neighbors: int
    neighbors_delta_pct: int
    project_requests: int
    requests_delta_pct: int
    conversion_pct: int
    timeline: list[TimelinePoint]
    krafts: list[KraftEngagementOut]


def _delta_pct(current: int, prior: int) -> int:
    if prior == 0:
        return 0
    return round(100 * (current - prior) / prior)


def _empty_dashboard(pro, range: str) -> dict:
    return {
        "range": range,
        "joined_at": pro.created_at.strftime("%B %d, %Y"),
        "total_visitors": 0,
        "visitors_delta_pct": 0,
        "neighbors": 0,
        "neighbors_delta_pct": 0,
        "project_requests": 0,
        "requests_delta_pct": 0,
        "conversion_pct": 0,
        "timeline": [],
        "krafts": [],
    }


@router.get("/me/dashboard", response=DashboardOut)
def my_dashboard(request, range: str = "30d"):
    if range not in RANGE_DAYS:
        raise HttpError(400, "range must be one of 7d, 30d, 90d.")
    pro = require_pro(request)
    joined_at = pro.created_at.strftime("%B %d, %Y")
    days = RANGE_DAYS[range]
    now = timezone.now()
    since = now - timedelta(days=days)
    prior_since = since - timedelta(days=days)

    try:
        views_qs = ProProfileView.objects.filter(pro=pro)
        current_views = views_qs.filter(created_at__gte=since).count()
        prior_views = views_qs.filter(created_at__gte=prior_since, created_at__lt=since).count()

        current_neighbors = views_qs.filter(
            created_at__gte=since, viewer__isnull=False,
            viewer_zip=pro.base_zip,
        ).count() if pro.base_zip else 0
        prior_neighbors = views_qs.filter(
            created_at__gte=prior_since, created_at__lt=since,
            viewer__isnull=False, viewer_zip=pro.base_zip,
        ).count() if pro.base_zip else 0

        leads_qs = Lead.objects.filter(pro=pro)
        current_reqs = leads_qs.filter(created_at__gte=since).count()
        prior_reqs = leads_qs.filter(created_at__gte=prior_since, created_at__lt=since).count()

        conversion = round(100 * current_reqs / current_views) if current_views else 0

        # Weekly timeline buckets (oldest → newest)
        buckets = max(4, min(12, days // 7))
        timeline = []
        for i in builtin_range(buckets):
            start = now - timedelta(days=(buckets - i) * 7)
            end = start + timedelta(days=7)
            timeline.append({
                "label": f"W{i + 1}",
                "visitors": views_qs.filter(created_at__gte=start, created_at__lt=end).count(),
                "requests": leads_qs.filter(created_at__gte=start, created_at__lt=end).count(),
            })

        # Per-Kraft engagement
        krafts_data = []
        for k in Kraft.objects.filter(pro=pro):
            imp = KraftImpression.objects.filter(kraft=k, created_at__gte=since).count()
            clk = KraftClick.objects.filter(kraft=k, created_at__gte=since).count()
            krafts_data.append({
                "kraft_id": k.id,
                "title": k.title,
                "impressions": imp,
                "clicks": clk,
                "ctr_pct": round(100 * clk / imp) if imp else 0,
            })

    except OperationalError:
        return _empty_dashboard(pro, range)

    return {
        "range": range,
        "joined_at": joined_at,
        "total_visitors": current_views,
        "visitors_delta_pct": _delta_pct(current_views, prior_views),
        "neighbors": current_neighbors,
        "neighbors_delta_pct": _delta_pct(current_neighbors, prior_neighbors),
        "project_requests": current_reqs,
        "requests_delta_pct": _delta_pct(current_reqs, prior_reqs),
        "conversion_pct": conversion,
        "timeline": timeline,
        "krafts": krafts_data,
    }


# --- Market endpoint (Tab 2: Market & Comparison) ---

class ZipBreakdownRow(Schema):
    zip: str
    visitors: int
    requests: int


class MarketShareOut(Schema):
    available: bool
    pro_count: int
    required_count: int
    my_lead_pct: float
    avg_lead_pct: float


class MarketOut(Schema):
    range: str
    joined_at: str
    zip_breakdown: list[ZipBreakdownRow]
    market_share: MarketShareOut


def _empty_market(pro, range: str) -> dict:
    return {
        "range": range,
        "joined_at": pro.created_at.strftime("%B %d, %Y"),
        "zip_breakdown": [],
        "market_share": {"available": False, "pro_count": 0, "required_count": 5, "my_lead_pct": 0.0, "avg_lead_pct": 0.0},
    }


@router.get("/me/market", response=MarketOut)
def my_market(request, range: str = "30d"):
    if range not in RANGE_DAYS:
        raise HttpError(400, "range must be one of 7d, 30d, 90d.")
    pro = require_pro(request)
    joined_at = pro.created_at.strftime("%B %d, %Y")
    days = RANGE_DAYS[range]
    since = timezone.now() - timedelta(days=days)

    try:
        # Zip breakdown of visitors
        from django.db.models import Count
        zip_rows = (
            ProProfileView.objects
            .filter(pro=pro, created_at__gte=since)
            .exclude(viewer_zip="")
            .values("viewer_zip")
            .annotate(visitors=Count("id"))
            .order_by("-visitors")[:10]
        )
        zips_seen = {r["viewer_zip"] for r in zip_rows}
        req_by_zip: dict[str, int] = {}
        if zips_seen:
            from leads.models import Lead as LeadModel
            for lead in LeadModel.objects.filter(pro=pro, created_at__gte=since).select_related("homeowner__homeowner_profile"):
                hp = getattr(getattr(lead, "homeowner", None), "homeowner_profile", None)
                if hp and hp.default_zip in zips_seen:
                    req_by_zip[hp.default_zip] = req_by_zip.get(hp.default_zip, 0) + 1

        zip_breakdown = [
            {"zip": r["viewer_zip"], "visitors": r["visitors"], "requests": req_by_zip.get(r["viewer_zip"], 0)}
            for r in zip_rows
        ]

        # Market share
        REQUIRED = 5
        trade = pro.primary_trade
        base_zip = pro.base_zip
        peers = (
            ProProfile.objects
            .filter(primary_trade=trade)
            .filter(Q(base_zip=base_zip) | Q(service_zips__icontains=base_zip))
            .exclude(pk=pro.pk)
            if trade and base_zip else ProProfile.objects.none()
        )
        peer_count = peers.count()

        if peer_count >= REQUIRED:
            my_leads = Lead.objects.filter(pro=pro, created_at__gte=since).count()
            peer_lead_counts = [
                Lead.objects.filter(pro=p, created_at__gte=since).count()
                for p in peers[:20]
            ]
            total_peer_leads = sum(peer_lead_counts)
            avg_peer = total_peer_leads / len(peer_lead_counts) if peer_lead_counts else 0
            all_leads = my_leads + total_peer_leads
            my_pct = round(100 * my_leads / all_leads, 1) if all_leads else 0.0
            avg_pct = round(100 * avg_peer / (all_leads / (len(peer_lead_counts) + 1)), 1) if all_leads else 0.0
            market_share = {"available": True, "pro_count": peer_count, "required_count": REQUIRED, "my_lead_pct": my_pct, "avg_lead_pct": avg_pct}
        else:
            market_share = {"available": False, "pro_count": peer_count, "required_count": REQUIRED, "my_lead_pct": 0.0, "avg_lead_pct": 0.0}

    except OperationalError:
        return _empty_market(pro, range)

    return {"range": range, "joined_at": joined_at, "zip_breakdown": zip_breakdown, "market_share": market_share}


# --- Public endpoints (no auth required) ---

@public_router.get("/og/{handle}", auth=None)
def og_preview(request, handle: str):
    """Return OG-tagged HTML for social crawlers; instantly redirects browsers to the SPA."""
    import html as _html
    import json
    from django.http import HttpResponse

    pro = (
        ProProfile.objects.filter(handle=handle.lower())
        .select_related("user")
        .first()
    )
    if pro is None:
        return HttpResponse("<h1>Not Found</h1>", status=404, content_type="text/html")

    name     = _html.escape(pro.user.get_full_name() or handle)
    trade    = _html.escape(pro.primary_trade or "Pro on gigKraft.com")
    bio_raw  = (pro.bio or "").strip()
    bio_line = _html.escape(bio_raw[:120] + ("…" if len(bio_raw) > 120 else ""))
    desc     = f"{trade} · {bio_line}" if bio_line else trade
    avatar   = _html.escape(pro.avatar_url or "")
    profile_url = f"https://gigkraft.com/pros/{handle}"
    redirect_js = json.dumps(profile_url)

    og_image_tags = (
        f'  <meta property="og:image" content="{avatar}">\n'
        f'  <meta name="twitter:image" content="{avatar}">\n'
    ) if avatar else ""

    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{name} · gigKraft.com</title>
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="gigKraft.com">
  <meta property="og:title" content="{name} on gigKraft.com">
  <meta property="og:description" content="{desc}">
  <meta property="og:url" content="{profile_url}">
{og_image_tags}  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="400">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="{name} on gigKraft.com">
  <meta name="twitter:description" content="{desc}">
  <meta http-equiv="refresh" content="0; url={profile_url}">
  <link rel="canonical" href="{profile_url}">
</head>
<body>
  <script>window.location.replace({redirect_js})</script>
  <a href="{profile_url}">View {name}'s profile on gigKraft.com</a>
</body>
</html>"""
    return HttpResponse(body, content_type="text/html; charset=utf-8")


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

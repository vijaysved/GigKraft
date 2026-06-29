import re
from typing import Optional

import requests as _http
from django.conf import settings
from django.core.cache import cache
from ninja import Router, Schema

from common.models import SitePageView, SiteSettings

router = Router(tags=["system"])
public_router = Router(tags=["system-public"])


class HealthOut(Schema):
    status: str
    debug: bool
    mocks: dict
    google_client_id_set: bool
    settings_module: str


@router.get("/health", response=HealthOut, auth=None)
def health(request):
    """Liveness check; also reports which integrations are mocked."""
    return {
        "status": "ok",
        "debug": settings.DEBUG,
        "mocks": {
            "twilio": settings.MOCK_TWILIO,
            "stripe": settings.MOCK_STRIPE,
            "s3": settings.MOCK_S3,
            "fcm": settings.MOCK_FCM,
            "whatsapp": settings.MOCK_WHATSAPP,
            "resend": getattr(settings, "MOCK_RESEND", True),
            "resend_api_key_set": bool(getattr(settings, "RESEND_API_KEY", "")),
        },
        "google_client_id_set": bool(settings.GOOGLE_CLIENT_ID),
        "settings_module": __import__("os").environ.get("DJANGO_SETTINGS_MODULE", "unknown"),
    }


class PublicSiteInfoOut(Schema):
    template_pro_url_local: str
    template_pro_url_prod: str
    template_member_url_local: str
    template_member_url_prod: str


@router.get("/public/site-info", response=PublicSiteInfoOut, auth=None)
def public_site_info(request):
    """Public — returns template profile URLs for both environments."""
    cfg = SiteSettings.get()
    return PublicSiteInfoOut(
        template_pro_url_local=cfg.template_pro_url_local,
        template_pro_url_prod=cfg.template_pro_url_prod,
        template_member_url_local=cfg.template_member_url_local,
        template_member_url_prod=cfg.template_member_url_prod,
    )


# ── Public: site page view tracking ──────────────────────────────────────────

class TrackPageViewIn(Schema):
    url: str
    referrer: Optional[str] = ""


def _client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return forwarded.split(",")[0].strip() if forwarded else request.META.get("REMOTE_ADDR", "")


class GeoZipOut(Schema):
    zip: str
    city: str
    state: str


@public_router.get("/public/geo/zip", response={200: GeoZipOut, 404: dict}, auth=None)
def get_geo_zip(request):
    """Detect the caller's ZIP code from their IP address. Cached 24 h per IP."""
    ip = _client_ip(request)
    cache_key = f"geo_ip:{ip}"
    cached = cache.get(cache_key)
    if cached:
        return 200, cached
    try:
        resp = _http.get(
            f"http://ip-api.com/json/{ip}?fields=status,city,regionCode,zip",
            timeout=3,
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success" and re.match(r"^\d{5}$", data.get("zip", "")):
                result = GeoZipOut(
                    zip=data["zip"],
                    city=data.get("city", ""),
                    state=data.get("regionCode", ""),
                )
                cache.set(cache_key, result, 60 * 60 * 24)
                return 200, result
    except Exception:
        pass
    return 404, {"detail": "Could not detect location."}


class LocationInfoOut(Schema):
    zip: str
    city: str
    state: str
    pros_count: int


@public_router.get("/public/location/{zip}", response={200: LocationInfoOut, 404: dict}, auth=None)
def get_location_info(request, zip: str):
    """Return city/state and live pro count for a ZIP — used for clean-URL OG tags."""
    if not re.match(r"^\d{5}$", zip):
        return 404, {"detail": "Invalid ZIP."}
    cache_key = f"location_info:{zip}"
    cached = cache.get(cache_key)
    if cached:
        # Refresh pro count on every call (don't cache it long)
        from accounts.models import ProProfile
        cached["pros_count"] = ProProfile.objects.filter(
            is_suspended=False,
        ).filter(
            __import__("django.db.models", fromlist=["Q"]).Q(base_zip=zip)
            | __import__("django.db.models", fromlist=["Q"]).Q(service_center_zip=zip)
        ).count()
        return 200, cached

    # Resolve city/state from zippopotam.us (same service used in pros_api radius helpers)
    try:
        resp = _http.get(f"https://api.zippopotam.us/us/{zip}", timeout=3)
        if resp.status_code == 200:
            place = resp.json()["places"][0]
            city = place.get("place name", "")
            state = place.get("state abbreviation", "")
            from accounts.models import ProProfile
            from django.db.models import Q
            pros_count = ProProfile.objects.filter(is_suspended=False).filter(
                Q(base_zip=zip) | Q(service_center_zip=zip)
            ).count()
            result = {"zip": zip, "city": city, "state": state, "pros_count": pros_count}
            cache.set(cache_key, result, 60 * 60 * 6)  # cache city/state 6 h
            return 200, result
    except Exception:
        pass
    return 404, {"detail": "ZIP not found."}


@public_router.post("/track/page-view", response={200: dict}, auth=None)
def track_site_page_view(request, payload: TrackPageViewIn):
    """Records a visit to a site-config demo/marketing page."""
    if getattr(request, "auth", None):
        return {"ok": True, "skipped": True}
    SitePageView.objects.create(
        url=payload.url,
        referrer=(payload.referrer or "")[:500],
    )
    return {"ok": True, "skipped": False}

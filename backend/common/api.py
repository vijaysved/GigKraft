from typing import Optional

from django.conf import settings
from ninja import Router, Schema

from common.models import SitePageView, SiteSettings

router = Router(tags=["system"])
public_router = Router(tags=["system-public"])


class HealthOut(Schema):
    status: str
    debug: bool
    mocks: dict
    google_client_id_set: bool


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
        },
        "google_client_id_set": bool(settings.GOOGLE_CLIENT_ID),
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

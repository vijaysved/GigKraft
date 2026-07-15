from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from billing.webhook import stripe_webhook
from comms.resend_webhook import resend_webhook
from communities.views import community_cover_image, community_short_link, community_social_preview
from config.api import api
from referrals.views import referrer_pro_short_link, referrer_short_link, referrer_social_preview
from vendors.views import go_example, go_signup

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
    # Raw views — outside Ninja so they receive the unmodified request body.
    path("api/stripe/webhook", stripe_webhook),
    path("api/comms/resend-webhook", resend_webhook),
    # Social preview: serves OG meta tags to WhatsApp/social bots; JS-redirects real users to SPA.
    path("us/<str:slug>/refer", referrer_social_preview),
    # Short referrer-page link (counts real clicks, then redirects to the full /us/<slug>/refer URL).
    path("r/<str:code>", referrer_short_link),
    # Short per-pro link (same as above, but click-tracked separately per pro on the page).
    path("p/<str:code>", referrer_pro_short_link),
    # Short Community page link ("group").
    path("g/<str:code>", community_short_link),
    # Social preview: serves OG meta tags (Community logo/name) to bots for the full page URL.
    path("community/<str:slug>", community_social_preview),
    # Serves a Community's cover image as a real URL when it's stored as a data: URI.
    path("community/<str:slug>/og-image", community_cover_image),
    # Short tracked-link redirects for prospect outreach (WhatsApp/SMS/email).
    path("go/example/<str:token>", go_example),
    path("go/<str:token>", go_signup),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

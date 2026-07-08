from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from billing.webhook import stripe_webhook
from comms.resend_webhook import resend_webhook
from config.api import api
from referrals.views import referrer_social_preview
from vendors.views import go_example, go_signup

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
    # Raw views — outside Ninja so they receive the unmodified request body.
    path("api/stripe/webhook", stripe_webhook),
    path("api/comms/resend-webhook", resend_webhook),
    # Social preview: serves OG meta tags to WhatsApp/social bots; JS-redirects real users to SPA.
    path("us/<str:slug>/refer", referrer_social_preview),
    # Short tracked-link redirects for prospect outreach (WhatsApp/SMS/email).
    path("go/example/<str:token>", go_example),
    path("go/<str:token>", go_signup),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from billing.webhook import stripe_webhook
from config.api import api
from referrals.views import referrer_social_preview

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
    # Raw view — must be outside Ninja so stripe.Webhook.construct_event gets the raw body.
    path("api/stripe/webhook", stripe_webhook),
    # Social preview: serves OG meta tags to WhatsApp/social bots; JS-redirects real users to SPA.
    path("us/<str:slug>/refer", referrer_social_preview),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

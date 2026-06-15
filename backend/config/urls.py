from django.contrib import admin
from django.urls import path

from billing.webhook import stripe_webhook
from config.api import api

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
    # Raw view — must be outside Ninja so stripe.Webhook.construct_event gets the raw body.
    path("api/stripe/webhook", stripe_webhook),
]

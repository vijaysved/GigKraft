"""Stripe webhook handler.

Mounted as a raw Django view (not through Ninja) at /api/stripe/webhook
so we can access the raw request body required for signature verification.
"""
import json
import logging
import os

import stripe
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

logger = logging.getLogger(__name__)


def _update_subscription_in_database(user_id: str, pro_id: str, stripe_subscription_id: str):
    """Activate the pro's subscription record after a successful payment.

    TODO: also provision any feature gates (e.g. lead-unlock quota) tied to the plan.
    """
    from billing.models import Subscription

    try:
        sub = Subscription.objects.get(pro_id=pro_id)
    except Subscription.DoesNotExist:
        logger.warning("Webhook: no Subscription row for pro_id=%s", pro_id)
        return

    sub.status = Subscription.Status.ACTIVE
    sub.stripe_subscription_id = stripe_subscription_id
    sub.save(update_fields=["status", "stripe_subscription_id", "updated_at"])
    logger.info(
        "Webhook: activated subscription for user=%s pro=%s sub=%s",
        user_id, pro_id, stripe_subscription_id,
    )


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature", "")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

    if not webhook_secret:
        logger.error("STRIPE_WEBHOOK_SECRET is not set")
        return HttpResponse("Webhook secret not configured", status=500)

    try:
        from billing.models import StripeSettings
        stripe.api_key = StripeSettings.get().secret_key
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError:
        logger.warning("Stripe webhook: invalid payload")
        return HttpResponse("Invalid payload", status=400)
    except stripe.error.SignatureVerificationError:
        logger.warning("Stripe webhook: invalid signature")
        return HttpResponse("Invalid signature", status=400)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = metadata.get("user_id", "")
        pro_id = metadata.get("pro_id", "")
        stripe_subscription_id = session.get("subscription", "")

        if user_id and pro_id:
            _update_subscription_in_database(user_id, pro_id, stripe_subscription_id)
        else:
            logger.warning("Webhook checkout.session.completed missing metadata: %s", metadata)

    elif event["type"] == "customer.subscription.deleted":
        # TODO: mark subscription as cancelled in the database
        logger.info("Stripe subscription deleted: %s", event["data"]["object"].get("id"))

    elif event["type"] == "invoice.payment_failed":
        # TODO: mark subscription as past_due and notify the pro
        logger.info("Stripe payment failed for subscription: %s", event["data"]["object"].get("subscription"))

    return JsonResponse({"received": True})

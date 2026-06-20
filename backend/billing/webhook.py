"""Stripe webhook handler.

Mounted as a raw Django view (not through Ninja) at /api/stripe/webhook
so we can access the raw request body required for signature verification.
"""
import datetime
import logging
import os

import stripe
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

logger = logging.getLogger(__name__)


def _handle_checkout_completed(session: dict) -> None:
    from billing.emails import send_invoice_email, send_welcome_email
    from billing.models import BillingInvoice, PLAN_PRICES, Subscription
    from accounts.models import User
    from accounts.services import ensure_role_profile

    metadata = session.get("metadata", {})
    user_id = metadata.get("user_id", "")
    pro_id = metadata.get("pro_id", "")
    plan = metadata.get("plan", "monthly")
    stripe_subscription_id = session.get("subscription", "")
    stripe_customer_id = session.get("customer", "")

    if not (user_id and pro_id and stripe_subscription_id):
        logger.warning(
            "Webhook checkout.session.completed: missing required fields metadata=%s", metadata
        )
        return

    # Idempotency: skip if this exact Stripe subscription is already recorded
    if Subscription.objects.filter(
        pro_id=pro_id, stripe_subscription_id=stripe_subscription_id
    ).exists():
        logger.info(
            "Webhook: duplicate checkout.session.completed pro_id=%s sub=%s — skipped",
            pro_id, stripe_subscription_id,
        )
        return

    # Retrieve Stripe subscription for renewal date and card last4
    renews_at = None
    card_last4 = ""
    try:
        stripe_sub = stripe.Subscription.retrieve(
            stripe_subscription_id,
            expand=["default_payment_method"],
        )
        ts = stripe_sub.get("current_period_end")
        if ts:
            renews_at = datetime.date.fromtimestamp(int(ts))
        pm = stripe_sub.get("default_payment_method")
        if isinstance(pm, dict):
            card_last4 = pm.get("card", {}).get("last4", "")
    except Exception:
        logger.exception("Could not retrieve Stripe subscription %s", stripe_subscription_id)

    sub, created = Subscription.objects.get_or_create(
        pro_id=pro_id,
        defaults={
            "plan": plan,
            "status": Subscription.Status.ACTIVE,
            "stripe_subscription_id": stripe_subscription_id,
            "stripe_customer_id": stripe_customer_id,
            "renews_at": renews_at,
            "card_last4": card_last4,
        },
    )

    if not created:
        sub.status = Subscription.Status.ACTIVE
        sub.stripe_subscription_id = stripe_subscription_id
        sub.stripe_customer_id = stripe_customer_id
        sub.plan = plan
        if renews_at:
            sub.renews_at = renews_at
        if card_last4:
            sub.card_last4 = card_last4
        sub.save(update_fields=[
            "status", "stripe_subscription_id", "stripe_customer_id",
            "plan", "renews_at", "card_last4", "updated_at",
        ])

    logger.info(
        "Webhook: activated subscription user=%s pro=%s sub=%s plan=%s created=%s",
        user_id, pro_id, stripe_subscription_id, plan, created,
    )

    # Create invoice row — idempotent by period_label per subscription
    today = datetime.date.today()
    period_label = today.strftime("%B %Y")
    if not BillingInvoice.objects.filter(subscription=sub, period_label=period_label).exists():
        amount = PLAN_PRICES.get(plan, PLAN_PRICES["monthly"])
        BillingInvoice.objects.create(
            subscription=sub,
            amount=amount,
            status=BillingInvoice.Status.PAID,
            period_label=period_label,
            issued_at=today,
        )

    # Upgrade user role to pro when they subscribe (member → pro)
    try:
        paying_user = User.objects.get(pk=int(user_id))
        if paying_user.role == User.Role.MEMBER:
            paying_user.role = User.Role.PRO
            paying_user.save(update_fields=["role"])
            ensure_role_profile(paying_user)
    except Exception:
        logger.exception("Role upgrade failed for user_id=%s", user_id)

    # Send emails — failures must not break the 200 response to Stripe
    try:
        user = User.objects.get(pk=int(user_id))
        plan_label = "Pro Vault Monthly" if plan == "monthly" else "Pro Vault Annual"
        amount_str = f"${PLAN_PRICES.get(plan, PLAN_PRICES['monthly'])}"
        renewal_str = renews_at.strftime("%B %d, %Y") if renews_at else "—"

        send_invoice_email(
            to=user.email or "",
            plan_label=plan_label,
            amount=amount_str,
            renewal_date=renewal_str,
        )
        if created:
            send_welcome_email(to=user.email or "", first_name=user.first_name or "")
    except Exception:
        logger.exception("Email error for user_id=%s — webhook still returning 200", user_id)


def _handle_subscription_deleted(stripe_sub_id: str) -> None:
    from billing.models import Subscription

    updated = Subscription.objects.filter(stripe_subscription_id=stripe_sub_id).update(
        status=Subscription.Status.CANCELLED
    )
    logger.info("Webhook: subscription deleted sub=%s rows_updated=%d", stripe_sub_id, updated)


def _handle_payment_failed(stripe_sub_id: str) -> None:
    from billing.emails import send_payment_failed_email
    from billing.models import Subscription

    subs = list(
        Subscription.objects.filter(stripe_subscription_id=stripe_sub_id)
        .select_related("pro__user")
    )
    for sub in subs:
        sub.status = Subscription.Status.PAST_DUE
        sub.save(update_fields=["status", "updated_at"])
        try:
            user = sub.pro.user
            send_payment_failed_email(to=user.email or "", first_name=user.first_name or "")
        except Exception:
            logger.exception("payment_failed email error sub_pk=%d", sub.pk)

    logger.info("Webhook: payment failed sub=%s rows_updated=%d", stripe_sub_id, len(subs))


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

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(obj)
    elif event_type == "customer.subscription.deleted":
        stripe_sub_id = obj.get("id", "")
        if stripe_sub_id:
            _handle_subscription_deleted(stripe_sub_id)
    elif event_type == "invoice.payment_failed":
        stripe_sub_id = obj.get("subscription", "")
        if stripe_sub_id:
            _handle_payment_failed(stripe_sub_id)

    return JsonResponse({"received": True})

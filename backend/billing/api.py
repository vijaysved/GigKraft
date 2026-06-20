"""Pro subscription endpoints (screen 1.12, 'Vault').

MOCK (Phase 1): Stripe is mocked. Subscriptions exist only as local model
state; coupons apply a discount percentage; no real payments occur.

Phase 2: Real Stripe checkout added via /billing/checkout. Webhook handling
lives in billing/webhook.py (mounted as a raw Django view at /api/stripe/webhook)."""
import os
from datetime import timedelta
from typing import Optional

import stripe
from django.utils import timezone
from ninja import Router, Schema

from accounts.auth import jwt_auth
from billing.models import BillingInvoice, Coupon, PLAN_PRICES, Subscription, StripeSettings
from common.permissions import require_pro

router = Router(tags=["billing"], auth=jwt_auth)


class ErrorOut(Schema):
    detail: str


class SubscriptionOut(Schema):
    plan: str
    plan_label: str
    status: str
    renews_at: Optional[str]
    card_last4: str
    monthly_value: float
    coupon_code: str
    discount_pct: int
    stripe_subscription_id: str


class SubscriptionStatusOut(Schema):
    has_active_subscription: bool
    subscription: Optional[SubscriptionOut]
    stripe_mode: str  # "test" | "live"


class CouponIn(Schema):
    code: str


class InvoiceOut(Schema):
    id: int
    amount: float
    status: str
    period_label: str
    issued_at: str


def _get_or_create_subscription(pro) -> Subscription:
    sub, created = Subscription.objects.get_or_create(
        pro=pro,
        defaults={
            "plan": Subscription.Plan.MONTHLY,
            "status": Subscription.Status.ACTIVE,
            "renews_at": (timezone.now() + timedelta(days=30)).date(),
            "card_last4": "8832",  # MOCK card on file
            "stripe_customer_id": f"cus_mock_{pro.id}",
            "stripe_subscription_id": f"sub_mock_{pro.id}",
        },
    )
    return sub


def _is_real_subscription(sub: Subscription) -> bool:
    """True only if this row was created by a real Stripe webhook (not the old auto-create mock)."""
    sid = sub.stripe_subscription_id
    return bool(sid) and not sid.startswith("sub_mock_")


def serialize_subscription(sub: Subscription) -> dict:
    return {
        "plan": sub.plan,
        "plan_label": sub.get_plan_display(),
        "status": sub.status,
        "renews_at": sub.renews_at.isoformat() if sub.renews_at else None,
        "card_last4": sub.card_last4,
        "monthly_value": float(sub.monthly_value),
        "coupon_code": sub.coupon_code,
        "discount_pct": sub.discount_pct,
        "stripe_subscription_id": sub.stripe_subscription_id,
    }


@router.get("/subscription", response=SubscriptionStatusOut)
def my_subscription(request):
    pro = require_pro(request)
    sub = Subscription.objects.filter(pro=pro).first()
    stripe_mode = StripeSettings.get().effective_mode
    if sub is None or not _is_real_subscription(sub):
        return {"has_active_subscription": False, "subscription": None, "stripe_mode": stripe_mode}
    return {
        "has_active_subscription": sub.status == Subscription.Status.ACTIVE,
        "subscription": serialize_subscription(sub),
        "stripe_mode": stripe_mode,
    }


class PlanIn(Schema):
    plan: str  # monthly | annual


@router.post("/plan", response={200: SubscriptionOut, 400: ErrorOut})
def switch_plan(request, payload: PlanIn):
    pro = require_pro(request)
    if payload.plan not in PLAN_PRICES:
        return 400, {"detail": "plan must be 'monthly' or 'annual'."}
    sub = _get_or_create_subscription(pro)
    sub.plan = payload.plan
    days = 365 if payload.plan == Subscription.Plan.ANNUAL else 30
    sub.renews_at = (timezone.now() + timedelta(days=days)).date()
    sub.save()
    return 200, serialize_subscription(sub)


@router.post("/coupon", response={200: SubscriptionOut, 400: ErrorOut})
def apply_coupon(request, payload: CouponIn):
    pro = require_pro(request)
    coupon = Coupon.objects.filter(
        code__iexact=payload.code.strip(), is_active=True
    ).first()
    if coupon is None:
        return 400, {"detail": "Invalid or expired coupon code."}
    sub = _get_or_create_subscription(pro)
    sub.coupon_code = coupon.code
    sub.discount_pct = coupon.discount_pct
    sub.save(update_fields=["coupon_code", "discount_pct"])
    return 200, serialize_subscription(sub)


@router.get("/history", response=list[InvoiceOut])
def billing_history(request):
    pro = require_pro(request)
    sub = Subscription.objects.filter(pro=pro).first()
    if sub is None:
        return []
    return [
        {
            "id": inv.id,
            "amount": float(inv.amount),
            "status": inv.status,
            "period_label": inv.period_label,
            "issued_at": inv.issued_at.isoformat(),
        }
        for inv in sub.invoices.all()[:24]
    ]


# ---------------------------------------------------------------------------
# Real Stripe checkout
# ---------------------------------------------------------------------------

class CheckoutIn(Schema):
    plan: str  # "monthly" | "annual"


class CheckoutOut(Schema):
    url: str


class CheckoutError(Schema):
    detail: str


@router.post("/checkout", response={200: CheckoutOut, 400: CheckoutError})
def create_checkout_session(request, payload: CheckoutIn):
    """Start a Stripe Checkout session for the authenticated pro."""
    pro = require_pro(request)
    user = request.auth

    if payload.plan not in ("monthly", "annual"):
        return 400, {"detail": "plan must be 'monthly' or 'annual'."}

    cfg = StripeSettings.get()
    price_id = cfg.price_id(payload.plan)
    if not price_id:
        return 400, {"detail": f"No Stripe price ID configured for the '{payload.plan}' plan ({cfg.effective_mode} mode). Set it in GK Admin → Stripe."}

    stripe.api_key = cfg.secret_key
    if not stripe.api_key:
        return 400, {"detail": f"Stripe secret key not set for {cfg.effective_mode} mode. Add it to the server environment variables."}

    app_url = os.environ.get("APP_URL", "http://localhost:5173")

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=f"{app_url}/pro/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{app_url}/pro/account?tab=billing&cancelled=1",
            metadata={"user_id": str(user.id), "pro_id": str(pro.id), "plan": payload.plan},
        )
    except stripe.StripeError as e:
        return 400, {"detail": str(e.user_message or e)}

    return 200, {"url": session.url}


# ---------------------------------------------------------------------------
# Billing config (used by ProBillingTestPage)
# ---------------------------------------------------------------------------

class BillingConfigOut(Schema):
    stripe_mode: str
    webhook_secret_set: bool
    resend_mock: bool


@router.get("/config", response=BillingConfigOut)
def billing_config(request):
    require_pro(request)
    from django.conf import settings
    cfg = StripeSettings.get()
    return {
        "stripe_mode": cfg.effective_mode,
        "webhook_secret_set": bool(os.environ.get("STRIPE_WEBHOOK_SECRET")),
        "resend_mock": getattr(settings, "MOCK_RESEND", True),
    }


# ---------------------------------------------------------------------------
# Subscription reset (test mode only — for ProBillingTestPage E2E re-testing)
# ---------------------------------------------------------------------------

@router.delete("/subscription/reset", response={200: dict, 403: ErrorOut})
def reset_subscription(request):
    """Delete the pro's subscription row so the checkout flow can be re-tested.
    Only available when Stripe is in test mode."""
    cfg = StripeSettings.get()
    if cfg.effective_mode != "test":
        return 403, {"detail": "Subscription reset is only available in test mode."}
    pro = require_pro(request)
    deleted, _ = Subscription.objects.filter(pro=pro).delete()
    return 200, {"deleted": deleted}

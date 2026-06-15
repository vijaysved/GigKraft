"""Pro subscription endpoints (screen 1.12, 'Vault').

MOCK (Phase 1): Stripe is mocked. Subscriptions exist only as local model
state; coupons apply a discount percentage; no real payments occur."""
from datetime import timedelta
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema

from accounts.auth import jwt_auth
from billing.models import BillingInvoice, Coupon, PLAN_PRICES, Subscription
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
    }


@router.get("/subscription", response=SubscriptionOut)
def my_subscription(request):
    pro = require_pro(request)
    return serialize_subscription(_get_or_create_subscription(pro))


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
    sub = _get_or_create_subscription(pro)
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

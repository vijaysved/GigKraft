from decimal import Decimal

from django.db import models

# MOCK (Phase 1): Stripe is mocked; these models only track local state.
PLAN_PRICES = {
    "monthly": Decimal("19.99"),
    "annual": Decimal("199.00"),
}


class Subscription(models.Model):
    """A pro's Vault subscription (mock Stripe, screen 1.12)."""

    class Plan(models.TextChoices):
        MONTHLY = "monthly", "Pro Vault Monthly"
        ANNUAL = "annual", "Pro Vault Annual"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"
        CANCELLED = "cancelled", "Cancelled"

    pro = models.OneToOneField(
        "accounts.ProProfile", on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.CharField(max_length=10, choices=Plan.choices, default=Plan.MONTHLY)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    renews_at = models.DateField(null=True, blank=True)
    card_last4 = models.CharField(max_length=4, blank=True, default="")
    coupon_code = models.CharField(max_length=40, blank=True, default="")
    discount_pct = models.PositiveSmallIntegerField(default=0)
    stripe_customer_id = models.CharField(max_length=40, blank=True, default="")
    stripe_subscription_id = models.CharField(max_length=40, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Subscription<{self.pro_id} {self.plan} {self.status}>"

    @property
    def monthly_value(self):
        base = PLAN_PRICES[self.plan]
        monthly = base if self.plan == self.Plan.MONTHLY else base / 12
        if self.discount_pct:
            monthly = monthly * (100 - self.discount_pct) / 100
        return monthly.quantize(Decimal("0.01"))


class BillingInvoice(models.Model):
    """Billing history rows for the Vault screen (mock Stripe)."""

    class Status(models.TextChoices):
        PAID = "paid", "Paid"
        OPEN = "open", "Open"
        VOID = "void", "Void"

    subscription = models.ForeignKey(
        Subscription, on_delete=models.CASCADE, related_name="invoices"
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PAID
    )
    period_label = models.CharField(max_length=40, blank=True, default="")
    issued_at = models.DateField()

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return f"BillingInvoice#{self.pk} {self.amount} [{self.status}]"


class Coupon(models.Model):
    code = models.CharField(max_length=40, unique=True)
    discount_pct = models.PositiveSmallIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} (-{self.discount_pct}%)"

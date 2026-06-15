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


class StripeSettings(models.Model):
    """Singleton row — always use StripeSettings.get() to read.

    The STRIPE_MODE environment variable always wins over the DB value.
    Set STRIPE_MODE=test in local .env and STRIPE_MODE=live in Railway
    so the environment controls the mode, not a manual DB toggle.
    """

    class Mode(models.TextChoices):
        TEST = "test", "Test"
        LIVE = "live", "Live"

    mode = models.CharField(max_length=4, choices=Mode.choices, default=Mode.TEST)

    # Price IDs per environment (set via GK Admin UI)
    test_price_monthly = models.CharField(max_length=100, blank=True, default="")
    test_price_annual = models.CharField(max_length=100, blank=True, default="")
    live_price_monthly = models.CharField(max_length=100, blank=True, default="")
    live_price_annual = models.CharField(max_length=100, blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    class Meta:
        verbose_name = "Stripe Settings"
        verbose_name_plural = "Stripe Settings"

    def __str__(self):
        return f"StripeSettings [{self.effective_mode}]"

    @classmethod
    def get(cls) -> "StripeSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    @property
    def effective_mode(self) -> str:
        """STRIPE_MODE env var overrides the DB value."""
        import os
        env_mode = os.environ.get("STRIPE_MODE", "").lower()
        if env_mode in ("test", "live"):
            return env_mode
        return self.mode

    @property
    def secret_key(self) -> str:
        import os
        if self.effective_mode == "live":
            return os.environ.get("STRIPE_SECRET_KEY", "")
        return os.environ.get("STRIPE_TEST_SECRET_KEY", "")

    def price_id(self, plan: str) -> str:
        """Return the active price ID for the given plan ('monthly'|'annual')."""
        if self.effective_mode == "test":
            return self.test_price_monthly if plan == "monthly" else self.test_price_annual
        return self.live_price_monthly if plan == "monthly" else self.live_price_annual

from decimal import Decimal

from django.db import models

# MOCK (Phase 1): Stripe is mocked; these models only track local state.
PLAN_PRICES = {
    "monthly": Decimal("19.99"),
    "annual": Decimal("199.00"),
}

COMMUNITY_PLAN_PRICES = {
    "monthly": Decimal("9.99"),
    "annual": Decimal("99.99"),
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
        Subscription, null=True, blank=True, on_delete=models.CASCADE, related_name="invoices"
    )
    community_subscription = models.ForeignKey(
        "CommunitySubscription", null=True, blank=True, on_delete=models.CASCADE, related_name="invoices"
    )
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PAID
    )
    period_label = models.CharField(max_length=40, blank=True, default="")
    issued_at = models.DateField()

    class Meta:
        ordering = ["-issued_at"]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(subscription__isnull=False, community_subscription__isnull=True)
                    | models.Q(subscription__isnull=True, community_subscription__isnull=False)
                ),
                name="billing_invoice_exactly_one_subscription",
            ),
        ]

    def __str__(self):
        return f"BillingInvoice#{self.pk} {self.amount} [{self.status}]"


class CommunitySubscription(models.Model):
    """A Community Lead's Community Directory subscription — parallel to
    `Subscription` (Pro Vault) rather than reusing it, since that model is
    hard-FK'd to `ProProfile`, not to a Referrer/Community."""

    class Plan(models.TextChoices):
        MONTHLY = "monthly", "Community Monthly"
        ANNUAL = "annual", "Community Annual"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PAST_DUE = "past_due", "Past due"
        CANCELLED = "cancelled", "Cancelled"

    community = models.OneToOneField(
        "communities.Community", on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.CharField(max_length=10, choices=Plan.choices, default=Plan.MONTHLY)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    renews_at = models.DateField(null=True, blank=True)
    past_due_since = models.DateTimeField(null=True, blank=True)
    card_last4 = models.CharField(max_length=4, blank=True, default="")
    stripe_customer_id = models.CharField(max_length=40, blank=True, default="")
    stripe_subscription_id = models.CharField(max_length=40, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    GRACE_PERIOD_DAYS = 7

    def __str__(self):
        return f"CommunitySubscription<{self.community_id} {self.plan} {self.status}>"

    @property
    def monthly_value(self) -> Decimal:
        base = COMMUNITY_PLAN_PRICES[self.plan]
        monthly = base if self.plan == self.Plan.MONTHLY else base / 12
        return monthly.quantize(Decimal("0.01"))

    @property
    def is_publicly_visible(self) -> bool:
        if self.status == self.Status.ACTIVE:
            return True
        if self.status == self.Status.PAST_DUE and self.past_due_since:
            from django.utils import timezone
            return (timezone.now() - self.past_due_since).days < self.GRACE_PERIOD_DAYS
        return False


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

    # Community Directory price IDs per environment (set via GK Admin UI)
    test_price_community_monthly = models.CharField(max_length=100, blank=True, default="")
    test_price_community_annual = models.CharField(max_length=100, blank=True, default="")
    live_price_community_monthly = models.CharField(max_length=100, blank=True, default="")
    live_price_community_annual = models.CharField(max_length=100, blank=True, default="")

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

    def community_price_id(self, plan: str) -> str:
        """Return the active Community Directory price ID for the given plan."""
        if self.effective_mode == "test":
            return self.test_price_community_monthly if plan == "monthly" else self.test_price_community_annual
        return self.live_price_community_monthly if plan == "monthly" else self.live_price_community_annual

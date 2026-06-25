import re

from django.db import models


class Circle(models.Model):
    curator = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="circle",
        limit_choices_to={"role": "homeowner"},
    )
    slug = models.SlugField(max_length=80, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["slug"]

    def __str__(self):
        return f"Circle<{self.slug}>"

    def _generate_slug(self) -> str:
        parts = [self.curator.first_name, self.curator.last_name]
        base = "-".join(p for p in parts if p).lower() or "circle"
        base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:70]
        slug = base
        suffix = 1
        while Circle.objects.exclude(pk=self.pk).filter(slug=slug).exists():
            slug = f"{base}-{suffix}"
            suffix += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_slug()
        super().save(*args, **kwargs)


class CirclePro(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PENDING = "pending", "Pending (off-platform, not yet joined)"
        CLAIMED = "claimed", "Claimed (off-platform pro has registered)"

    circle = models.ForeignKey(
        Circle, on_delete=models.CASCADE, related_name="pros"
    )
    pro = models.ForeignKey(
        "accounts.ProProfile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="circle_memberships",
    )
    off_platform_name = models.CharField(max_length=120, blank=True, default="")
    off_platform_skill = models.CharField(max_length=80, blank=True, default="")
    off_platform_phone = models.CharField(max_length=30, blank=True, default="")
    off_platform_email = models.EmailField(blank=True, default="")

    endorsement = models.CharField(max_length=160, blank=True, default="")
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    invitation_sent_at = models.DateTimeField(null=True, blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["added_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["circle", "pro"],
                condition=models.Q(pro__isnull=False),
                name="unique_circle_pro",
            )
        ]

    def __str__(self):
        label = self.pro.display_name if self.pro else self.off_platform_name
        return f"CirclePro<{self.circle.slug} → {label}>"

    @property
    def display_name(self) -> str:
        return self.pro.display_name if self.pro else self.off_platform_name

    @property
    def is_off_platform(self) -> bool:
        return self.pro is None


class CircleReferral(models.Model):
    circle = models.ForeignKey(
        Circle, on_delete=models.CASCADE, related_name="referrals"
    )
    lead = models.OneToOneField(
        "leads.Lead",
        on_delete=models.CASCADE,
        related_name="circle_referral",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"CircleReferral<circle={self.circle.slug} lead={self.lead_id}>"


class CircleFollow(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    circle = models.ForeignKey(
        Circle, on_delete=models.CASCADE, related_name="follow_requests"
    )
    follower = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="circle_follows",
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("circle", "follower")]
        ordering = ["-created_at"]

    def __str__(self):
        return f"CircleFollow<{self.follower} → {self.circle.slug} [{self.status}]>"


class CircleAnalyticsEvent(models.Model):
    class EventType(models.TextChoices):
        PAGE_VIEW = "page_view", "Page View"
        SEARCH = "search", "Search"
        REQUEST_SUBMITTED = "request_submitted", "Request Submitted"

    circle = models.ForeignKey(
        Circle, on_delete=models.CASCADE, related_name="analytics_events"
    )
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["circle", "event_type", "created_at"]),
        ]

    def __str__(self):
        return f"CircleEvent<{self.circle.slug} {self.event_type}>"

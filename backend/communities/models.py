import re

from django.db import models
from django.utils import timezone

from common.phone import normalize_phone
from referrals.models import _generate_short_code, _generate_token, _hash_otp


class Community(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived (voluntary downgrade — read-only forever)"

    lead = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="community",
        limit_choices_to={"role__in": ["referrer", "community_lead", "homeowner"]},
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=80, unique=True, db_index=True)
    description = models.CharField(max_length=200, blank=True, default="")
    cover_image_url = models.TextField(blank=True, default="")
    # Free-text theme id, same convention as User.theme — the frontend owns the
    # enum of valid ids and falls back to a default for unknown/blank values.
    theme = models.CharField(max_length=32, blank=True, default="")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    # Shareable page-level short link — same click-tracking pattern as ReferrerProfile.short_code
    short_code = models.CharField(max_length=10, unique=True, db_index=True, blank=True, default="")
    short_link_click_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Community<{self.slug}>"

    def _generate_slug(self) -> str:
        base = re.sub(r"[^a-z0-9]+", "-", self.name.lower()).strip("-")[:70] or "community"
        slug = base
        suffix = 1
        while Community.objects.exclude(pk=self.pk).filter(slug=slug).exists():
            slug = f"{base}-{suffix}"
            suffix += 1
        return slug

    def _generate_unique_short_code(self) -> str:
        code = _generate_short_code()
        while Community.objects.exclude(pk=self.pk).filter(short_code=code).exists():
            code = _generate_short_code()
        return code

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_slug()
        if not self.short_code:
            self.short_code = self._generate_unique_short_code()
        super().save(*args, **kwargs)

    @property
    def is_publicly_visible(self) -> bool:
        """True while ACTIVE and subscription is in good standing or grace period;
        also True while ARCHIVED (read-only, but never hidden — see is_read_only)."""
        if self.status == self.Status.ARCHIVED:
            return True
        sub = getattr(self, "subscription", None)
        return bool(sub and sub.is_publicly_visible)

    @property
    def is_read_only(self) -> bool:
        """Archived Communities stay visible but reject new joins/requests/edits."""
        return self.status == self.Status.ARCHIVED


class CommunityMember(models.Model):
    class Status(models.TextChoices):
        INVITED = "invited", "Invited"
        PENDING = "pending", "Pending Approval"
        JOINED = "joined", "Joined"
        DECLINED = "declined", "Declined"

    class Role(models.TextChoices):
        MEMBER = "member", "Member"
        MODERATOR = "moderator", "Moderator"
        # Owner is never a row here — it's Community.lead directly (see spec §2).

    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="members"
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.INVITED)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MEMBER)
    token = models.CharField(max_length=64, unique=True, db_index=True, default=_generate_token)
    # Set true once the member verifies via phone OTP — independent of `user`,
    # since joining via phone alone never requires a full GigKraft account.
    phone_verified = models.BooleanField(default=False)
    otp_code_hash = models.CharField(max_length=64, blank=True, default="")
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    click_count = models.PositiveIntegerField(default=0)
    user = models.ForeignKey(
        "accounts.User",
        null=True, blank=True, on_delete=models.SET_NULL,
        related_name="community_memberships",
    )
    invited_at = models.DateTimeField(auto_now_add=True)
    last_resent_at = models.DateTimeField(null=True, blank=True)
    joined_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-invited_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["community", "phone"],
                condition=models.Q(phone__gt=""),
                name="unique_community_member_phone",
            ),
            models.UniqueConstraint(
                fields=["community", "email"],
                condition=models.Q(email__gt=""),
                name="unique_community_member_email",
            ),
            models.UniqueConstraint(
                fields=["community", "user"],
                condition=models.Q(user__isnull=False),
                name="unique_community_member_user",
            ),
        ]

    def save(self, *args, **kwargs):
        if self.phone:
            self.phone = normalize_phone(self.phone)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"CommunityMember<{self.role}:{self.name} @ {self.community.slug}>"

    @property
    def is_moderator_or_owner(self) -> bool:
        return self.role == self.Role.MODERATOR

    def set_otp(self, code: str):
        self.otp_code_hash = _hash_otp(code)
        self.otp_expires_at = timezone.now() + timezone.timedelta(minutes=15)

    def check_otp(self, code: str) -> bool:
        if not self.otp_expires_at or timezone.now() > self.otp_expires_at:
            return False
        return self.otp_code_hash == _hash_otp(code)


class CommunityReferral(models.Model):
    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="referrals"
    )
    lead = models.OneToOneField(
        "leads.Lead", on_delete=models.CASCADE, related_name="community_referral"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"CommunityReferral<{self.community.slug} lead={self.lead_id}>"


class CommunityAnalyticsEvent(models.Model):
    class EventType(models.TextChoices):
        PAGE_VIEW = "page_view", "Page View"
        REQUEST_SUBMITTED = "request_submitted", "Request Submitted"
        MEMBER_JOINED = "member_joined", "Member Joined"
        OWNER_MESSAGE_ANON = "owner_message_anon", "Anonymous Message to Owner"
        LINK_COPIED = "link_copied", "Page Link Copied"

    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="analytics_events"
    )
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["community", "event_type", "created_at"])]

    def __str__(self):
        return f"CommunityEvent<{self.community.slug} {self.event_type}>"

import hashlib
import re
import secrets
import uuid

from django.db import models
from django.utils import timezone


def _generate_token():
    return uuid.uuid4().hex


def _hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


class ReferrerProfile(models.Model):
    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="referrer_profile"
    )
    slug = models.SlugField(max_length=30, unique=True, db_index=True)
    bio = models.CharField(max_length=160, blank=True, default="")
    avatar_url = models.TextField(blank=True, default="")
    default_zip = models.CharField(max_length=10, blank=True, default="")
    referral_count = models.PositiveIntegerField(default=0)
    follower_count = models.PositiveIntegerField(default=0)
    slug_locked = models.BooleanField(default=False)
    notify_email = models.BooleanField(default=True)
    notify_sms = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["slug"])]

    def __str__(self):
        return f"ReferrerProfile<{self.user}>"

    def _generate_slug(self) -> str:
        parts = [self.user.first_name, self.user.last_name]
        base = "-".join(p for p in parts if p).lower() or "referrer"
        base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:28]
        slug = base
        suffix = 1
        while ReferrerProfile.objects.exclude(pk=self.pk).filter(slug=slug).exists():
            slug = f"{base}-{suffix}"
            suffix += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_slug()
        super().save(*args, **kwargs)


class ProInvite(models.Model):
    """Off-platform pro invited by a referrer to join GigKraft."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CLAIMED = "claimed", "Claimed"
        EXPIRED = "expired", "Expired"

    invited_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="pro_invites_sent"
    )
    name = models.CharField(max_length=100)
    trade = models.CharField(max_length=60)
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    note = models.TextField(blank=True, default="")
    token = models.CharField(max_length=64, unique=True, db_index=True, default=_generate_token)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    invited_at = models.DateTimeField(auto_now_add=True)
    claimed_at = models.DateTimeField(null=True, blank=True)
    claimed_by = models.ForeignKey(
        "accounts.User",
        null=True, blank=True, on_delete=models.SET_NULL,
        related_name="claimed_pro_invites",
    )

    def __str__(self):
        return f"ProInvite<{self.name} by {self.invited_by}>"


class ReferrerPro(models.Model):
    """A pro on a referrer's page — either on-platform (pro FK) or off-platform (pro_invite FK)."""

    referrer = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="referrer_pros"
    )
    pro = models.ForeignKey(
        "accounts.ProProfile",
        null=True, blank=True, on_delete=models.SET_NULL,
        related_name="referrer_memberships",
    )
    pro_invite = models.ForeignKey(
        ProInvite,
        null=True, blank=True, on_delete=models.SET_NULL,
        related_name="referrer_pro",
    )
    endorsement = models.CharField(max_length=200, blank=True, default="")
    show_on_page = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    referral_count = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "added_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["referrer", "pro"],
                condition=models.Q(pro__isnull=False),
                name="unique_referrer_pro",
            ),
            models.UniqueConstraint(
                fields=["referrer", "pro_invite"],
                condition=models.Q(pro_invite__isnull=False),
                name="unique_referrer_pro_invite",
            ),
        ]

    def __str__(self):
        return f"ReferrerPro<{self.referrer} → {self.display_name}>"

    @property
    def display_name(self) -> str:
        if self.pro:
            return self.pro.display_name
        if self.pro_invite:
            return self.pro_invite.name
        return ""

    @property
    def trade(self) -> str:
        if self.pro:
            return self.pro.primary_trade
        if self.pro_invite:
            return self.pro_invite.trade
        return ""

    @property
    def is_off_platform(self) -> bool:
        return self.pro is None


class ReferrerFollower(models.Model):
    """Anonymous (cookie-based) follower of a referrer's page."""

    referrer = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="referrer_followers"
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    # One UUID stored in gk_follower_token cookie; not unique — same token can appear
    # across multiple referrers (one row per referrer followed per device).
    cookie_token = models.CharField(max_length=64, db_index=True)
    phone_verified = models.BooleanField(default=False)
    user = models.ForeignKey(
        "accounts.User",
        null=True, blank=True, on_delete=models.SET_NULL,
        related_name="following_referrers",
    )
    referrals_received = models.PositiveIntegerField(default=0)
    followed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["referrer", "cookie_token"])]
        constraints = [
            models.UniqueConstraint(
                fields=["referrer", "phone"],
                condition=models.Q(phone__gt=""),
                name="unique_referrer_follower_phone",
            ),
            models.UniqueConstraint(
                fields=["referrer", "email"],
                condition=models.Q(email__gt=""),
                name="unique_referrer_follower_email",
            ),
        ]

    def __str__(self):
        return f"ReferrerFollower<{self.name} → {self.referrer}>"


class ReferralRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        OTP_PENDING = "otp_pending", "OTP Pending"
        SENT = "sent", "Sent"
        DECLINED = "declined", "Declined"
        EXPIRED = "expired", "Expired"

    referrer = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="referral_requests"
    )
    follower = models.ForeignKey(
        ReferrerFollower, on_delete=models.CASCADE, related_name="requests"
    )
    referrer_pro = models.ForeignKey(
        ReferrerPro, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="requests",
    )
    job_description = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    otp_code_hash = models.CharField(max_length=64, blank=True, default="")
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    # Staged note content while awaiting OTP verification
    pending_note_to_follower = models.TextField(blank=True, default="")
    pending_note_to_pro = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["referrer", "follower", "referrer_pro"],
                condition=models.Q(status__in=["pending", "otp_pending"]),
                name="unique_active_request_per_pro",
            ),
        ]

    def __str__(self):
        return f"ReferralRequest<{self.follower.name} → {self.referrer} [{self.status}]>"

    def set_otp(self, code: str):
        self.otp_code_hash = _hash_otp(code)
        self.otp_expires_at = timezone.now() + timezone.timedelta(minutes=15)

    def check_otp(self, code: str) -> bool:
        if not self.otp_expires_at or timezone.now() > self.otp_expires_at:
            return False
        return self.otp_code_hash == _hash_otp(code)


class ReferralSent(models.Model):
    referral_request = models.OneToOneField(
        ReferralRequest, on_delete=models.CASCADE, related_name="sent"
    )
    referrer = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="referrals_sent"
    )
    follower = models.ForeignKey(
        ReferrerFollower, on_delete=models.CASCADE, related_name="referrals_received_records"
    )
    referrer_pro = models.ForeignKey(
        ReferrerPro, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="referrals_sent",
    )
    note_to_follower = models.TextField()
    note_to_pro = models.TextField()
    follower_sms_status = models.CharField(max_length=20, default="pending")
    pro_sms_status = models.CharField(max_length=20, default="pending")
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"ReferralSent<req={self.referral_request_id} at {self.sent_at}>"


class FriendInvite(models.Model):
    """Invite sent by a referrer to a friend asking them to follow the referrer's page."""

    referrer = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="friend_invites_sent"
    )
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    invited_at = models.DateTimeField(auto_now_add=True)
    followed_at = models.DateTimeField(null=True, blank=True)
    follower = models.ForeignKey(
        ReferrerFollower, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="from_friend_invite",
    )

    def __str__(self):
        return f"FriendInvite<{self.name} from {self.referrer}>"


class UploadedContact(models.Model):
    """Raw contact from a CSV/phone upload; deactivated after 30 days but never deleted."""

    uploaded_by = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="uploaded_contacts"
    )
    raw_name = models.CharField(max_length=100)
    raw_phone = models.CharField(max_length=20, blank=True, default="")
    raw_email = models.EmailField(blank=True, default="")
    matched_pro = models.ForeignKey(
        "accounts.ProProfile",
        null=True, blank=True, on_delete=models.SET_NULL,
        related_name="contact_matches",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    deactivated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["uploaded_by", "is_active"])]

    def __str__(self):
        return f"UploadedContact<{self.raw_name} by {self.uploaded_by}>"

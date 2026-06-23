import re

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.db.models import Q
from django.utils import timezone

from accounts.managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Single user model for all roles (pro, homeowner, node_manager).

    Identity rules:
    - Pros and homeowners sign in with phone OTP (mocked in Phase 1).
    - Node managers sign in with Google (mocked in Phase 1) or email/password.
    Therefore both email and phone are optional, but at least one is required.
    """

    class Role(models.TextChoices):
        VISITOR = "visitor", "Visitor"
        MEMBER = "member", "Member"
        PRO = "pro", "Pro"
        HOMEOWNER = "homeowner", "Homeowner"
        NODE_MANAGER = "node_manager", "Node Manager"
        GK_ADMIN = "gk_admin", "GK Admin"

    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices)
    # Additional roles beyond the primary role (e.g. a pro who is also a homeowner).
    extra_roles = models.JSONField(default=list, blank=True)
    node = models.ForeignKey(
        "nodes.Node",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="users",
    )
    first_name = models.CharField(max_length=150, blank=True, default="")
    last_name = models.CharField(max_length=150, blank=True, default="")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(email__isnull=False) | Q(phone__isnull=False),
                name="user_has_email_or_phone",
            ),
        ]

    def __str__(self):
        return self.email or self.phone or f"user:{self.pk}"


class ProProfile(models.Model):
    """Pro-specific data, including the ZIP list + radius service area."""

    class ServiceMode(models.TextChoices):
        EXPLICIT = "explicit", "Specific ZIPs"
        RADIAL = "radial", "Center + radius"

    class Availability(models.TextChoices):
        FULL = "full", "Full-time"
        PART = "part", "Part-time"

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="pro_profile"
    )
    business_name = models.CharField(max_length=200, blank=True, default="")
    primary_trade = models.CharField(max_length=40, blank=True, default="")
    skill_tags = models.JSONField(default=list, blank=True)
    bio = models.CharField(max_length=500, blank=True, default="")
    # Service area: ZIP list + radius only (no map UI anywhere).
    base_zip = models.CharField(max_length=10, blank=True, default="")
    service_mode = models.CharField(
        max_length=10, choices=ServiceMode.choices, default=ServiceMode.EXPLICIT
    )
    service_zips = models.JSONField(default=list, blank=True)  # up to 3 in UI
    service_center_zip = models.CharField(max_length=10, blank=True, default="")
    service_radius_miles = models.PositiveIntegerField(default=25)
    # Credentials + SLA promise.
    response_hours = models.PositiveSmallIntegerField(default=4)
    licensed = models.BooleanField(default=False)
    license_number = models.CharField(max_length=60, blank=True, default="")
    insured = models.BooleanField(default=False)
    availability = models.CharField(
        max_length=10, choices=Availability.choices, default=Availability.FULL
    )
    # Public profile handle (e.g. "john-smith" → /pros/john-smith).
    # Auto-generated from name on first save if left blank.
    handle = models.SlugField(max_length=30, unique=True, null=True, blank=True)
    # Visual customization.
    wallpaper_id = models.PositiveSmallIntegerField(default=0)
    wallpaper_url = models.TextField(blank=True, default="")  # custom upload/URL; overrides wallpaper_id when set
    avatar_url = models.TextField(blank=True, default="")
    # Admin flags.
    is_verified = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)
    # Subscription plan surface for the admin ledger ("monthly"/"annual").
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _generate_handle(self) -> str:
        """Derive a unique slug from the pro's name or trade."""
        parts = [self.user.first_name, self.user.last_name]
        base = "-".join(p for p in parts if p).lower() or self.primary_trade or "pro"
        base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:28]
        handle = base
        suffix = 1
        while ProProfile.objects.exclude(pk=self.pk).filter(handle=handle).exists():
            handle = f"{base}-{suffix}"
            suffix += 1
        return handle

    def save(self, *args, **kwargs):
        if not self.handle:
            self.handle = self._generate_handle()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"ProProfile<{self.user}>"

    @property
    def display_name(self):
        full = f"{self.user.first_name} {self.user.last_name}".strip()
        return self.business_name or full or str(self.user)


class HomeownerProfile(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="homeowner_profile"
    )
    default_zip = models.CharField(max_length=10, blank=True, default="")
    preferred_trade = models.CharField(max_length=40, blank=True, default="")
    dispatch_opt_in = models.BooleanField(default=True)
    avatar_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"HomeownerProfile<{self.user}>"


class Address(models.Model):
    """Saved addresses for the homeowner account hub (screen 2.6)."""

    homeowner = models.ForeignKey(
        HomeownerProfile, on_delete=models.CASCADE, related_name="addresses"
    )
    label = models.CharField(max_length=40, blank=True, default="")
    line1 = models.CharField(max_length=200)
    zip = models.CharField(max_length=10)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "id"]

    def __str__(self):
        return f"{self.label or 'Address'}: {self.line1}"


class SavedPro(models.Model):
    """Homeowner's saved pros (screen 2.6)."""

    homeowner = models.ForeignKey(
        HomeownerProfile, on_delete=models.CASCADE, related_name="saved_pros"
    )
    pro = models.ForeignKey(
        ProProfile, on_delete=models.CASCADE, related_name="saved_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["homeowner", "pro"], name="unique_saved_pro"
            ),
        ]


class ProProfileView(models.Model):
    """Fired each time any visitor loads a pro's public profile page."""

    pro = models.ForeignKey(ProProfile, on_delete=models.CASCADE, related_name="profile_views")
    viewer = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    viewer_zip = models.CharField(max_length=10, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["pro", "created_at"])]


class KraftImpression(models.Model):
    """Fired for each Kraft card rendered on a pro's public profile page."""

    kraft = models.ForeignKey("krafts.Kraft", on_delete=models.CASCADE, related_name="impressions")
    pro = models.ForeignKey(ProProfile, on_delete=models.CASCADE, related_name="kraft_impressions")
    viewer = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["pro", "created_at"]), models.Index(fields=["kraft", "created_at"])]


class KraftClick(models.Model):
    """Fired when a visitor explicitly opens a Kraft item."""

    kraft = models.ForeignKey("krafts.Kraft", on_delete=models.CASCADE, related_name="clicks")
    pro = models.ForeignKey(ProProfile, on_delete=models.CASCADE, related_name="kraft_clicks")
    viewer = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["pro", "created_at"]), models.Index(fields=["kraft", "created_at"])]


class WaitlistEntry(models.Model):
    """Marketing site waitlist — captured via Google Sign-In on the public site."""

    class UserType(models.TextChoices):
        GENERAL = "general", "General"
        PRO = "pro", "Pro"
        ENTERPRISE = "enterprise", "Enterprise"

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True, default="")
    google_sub = models.CharField(max_length=200, blank=True, default="")
    user_type = models.CharField(
        max_length=20, choices=UserType.choices, default=UserType.GENERAL
    )
    zipcode = models.CharField(max_length=10, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Waitlist entries"

    def __str__(self):
        return f"{self.email} ({self.user_type})"


class NotificationPref(models.Model):
    """Dispatch alert toggles (screen 2.6)."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="notif_pref"
    )
    sms_alerts = models.BooleanField(default=True)
    whatsapp_dispatch = models.BooleanField(default=True)
    weekly_digest = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"NotificationPref<{self.user}>"

import os
import uuid

from django.db import models


class Prospect(models.Model):
    class Status(models.TextChoices):
        PROSPECT = "prospect", "Prospect"
        INTERESTED = "interested", "Interested"
        IN_PROGRESS = "in_progress", "In Progress"
        CONVERTED = "converted", "Converted"
        ON_HOLD = "on_hold", "On Hold"
        ABANDONED = "abandoned", "Abandoned"
        ARCHIVED = "archived", "Archived"

    class LeadSource(models.TextChoices):
        NEXTDOOR = "nextdoor", "Nextdoor"
        CRAIGSLIST = "craigslist", "Craigslist"
        WHATSAPP = "whatsapp", "WhatsApp"
        DIRECT = "direct", "Direct"
        TRADE_SCHOOL = "trade_school", "Trade School"

    class Role(models.TextChoices):
        PRO = "pro", "Pro"
        HOMEOWNER = "homeowner", "Homeowner"

    prospect_id = models.CharField(max_length=12, unique=True, blank=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=30, blank=True, default="")
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.PRO)
    primary_zip = models.CharField(max_length=10, blank=True, default="")
    neighborhood = models.CharField(max_length=200, blank=True, default="")
    source = models.CharField(max_length=20, choices=LeadSource.choices, default=LeadSource.NEXTDOOR)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROSPECT)
    current_sequence_step = models.PositiveSmallIntegerField(default=0)
    email_bounced = models.BooleanField(default=False)
    last_contacted_at = models.DateTimeField(null=True, blank=True)
    signup_link_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    link_clicked_at = models.DateTimeField(null=True, blank=True)
    signup_link_click_count = models.PositiveIntegerField(default=0)
    converted_user = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="converted_prospects",
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["status", "current_sequence_step", "last_contacted_at"],
                name="prospect_seq_idx",
            )
        ]

    def save(self, *args, **kwargs):
        if not self.prospect_id:
            last = (
                Prospect.objects.exclude(prospect_id="")
                .order_by("-id")
                .values_list("id", flat=True)
                .first()
            )
            next_num = (last or 0) + 1
            self.prospect_id = f"GK-{next_num:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.prospect_id} {self.name}"

    @property
    def template_vars(self) -> dict:
        return self.template_vars_for_log(None)

    def template_vars_for_log(self, link_click_token) -> dict:
        base_url = os.environ.get("BACKEND_URL", "https://gigkraft.com")
        token = link_click_token if link_click_token else self.signup_link_token
        signup_link = f"{base_url}/go/{token}"
        example_link = f"{base_url}/go/example/{token}"
        return {
            "name": self.name,
            "source": self.get_source_display(),
            "primaryZip": self.primary_zip,
            "neighborhood": self.neighborhood or self.primary_zip,
            "signup_link": signup_link,
            "example_link": example_link,
            # legacy keys for existing manual templates
            "prospect_id": self.prospect_id,
            "contact_person": self.name,
            "business_name": self.name,
            "category": "professional",
        }

    @property
    def tracked_signup_url(self) -> str:
        base_url = os.environ.get("BACKEND_URL", "https://gigkraft.com")
        return f"{base_url}/go/{self.signup_link_token}"

    @property
    def tracked_example_url(self) -> str:
        base_url = os.environ.get("BACKEND_URL", "https://gigkraft.com")
        return f"{base_url}/go/example/{self.signup_link_token}"


class ProPageView(models.Model):
    """Tracks visits to /pros/{handle}, optionally linked to a prospect."""

    pro_handle = models.CharField(max_length=30, db_index=True)
    prospect = models.ForeignKey(
        Prospect,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="page_views",
    )
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-viewed_at"]

    def __str__(self):
        return f"View of /pros/{self.pro_handle} at {self.viewed_at.date()}"

import urllib.parse

from django.db import models


class VendorContact(models.Model):
    """A prospective pro discovered via Nextdoor or WhatsApp, tracked through
    the GigKraft outreach pipeline."""

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        IN_CONVERSATION = "in_conversation", "In Conversation"
        FOLLOW_UP = "follow_up", "Follow-up Needed"
        ONBOARDED = "onboarded", "Onboarded"
        NOT_INTERESTED = "not_interested", "Not Interested"

    class LeadSource(models.TextChoices):
        NEXTDOOR = "nextdoor", "Nextdoor"
        WHATSAPP_FRIENDS = "whatsapp_friends", "WhatsApp (Friends)"
        WHATSAPP_FAMILY = "whatsapp_family", "WhatsApp (Family)"
        REFERRAL = "referral", "Referral"
        OTHER = "other", "Other"

    class PreferredChannel(models.TextChoices):
        WHATSAPP = "whatsapp", "WhatsApp"
        SMS = "sms", "SMS"
        EMAIL = "email", "Email"
        NEXTDOOR_DM = "nextdoor_dm", "Nextdoor DM"

    vendor_id = models.CharField(max_length=12, unique=True, blank=True)
    business_name = models.CharField(max_length=200, blank=True, default="")
    contact_person = models.CharField(max_length=200)
    category = models.CharField(max_length=80, blank=True, default="")
    lead_source = models.CharField(max_length=20, choices=LeadSource.choices, default=LeadSource.NEXTDOOR)
    phone = models.CharField(max_length=30, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    nextdoor_profile_url = models.URLField(blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    preferred_channel = models.CharField(
        max_length=15, choices=PreferredChannel.choices, default=PreferredChannel.WHATSAPP,
    )
    last_contact_date = models.DateField(null=True, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.vendor_id:
            last = (
                VendorContact.objects.exclude(vendor_id="")
                .order_by("-id")
                .values_list("id", flat=True)
                .first()
            )
            next_num = (last or 0) + 1
            self.vendor_id = f"GK-{next_num:03d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vendor_id} {self.contact_person}"

    @property
    def template_vars(self) -> dict:
        return {
            "prospect_id": self.vendor_id,
            "contact_person": self.contact_person,
            "business_name": self.business_name or self.contact_person,
            "category": self.category or "professional",
        }

    @property
    def whatsapp_link(self) -> str:
        if not self.phone:
            return ""
        digits = "".join(c for c in self.phone if c.isdigit() or c == "+")
        msg = urllib.parse.quote(
            "Hi! I'm reaching out from GigKraft — a platform that connects skilled "
            "professionals with local homeowners. I came across your work and think "
            "you'd be a great fit. Would you be open to a quick chat?"
        )
        return f"https://wa.me/{digits}?text={msg}"

    @property
    def email_link(self) -> str:
        if not self.email:
            return ""
        subject = urllib.parse.quote("Your work deserves its own space — GigKraft")
        body = urllib.parse.quote(
            "Hi,\n\nI'm reaching out from GigKraft — a platform where pros like you "
            "can store and share their project portfolio without depending on other platforms.\n\n"
            "Would you be open to a quick chat?\n\nBest,\nVijay / GigKraft"
        )
        return f"mailto:{self.email}?subject={subject}&body={body}"


class ProPageView(models.Model):
    """Tracks visits to /pros/{handle}, optionally linked to a prospect via ?ref=GK-XXX."""

    pro_handle = models.CharField(max_length=30, db_index=True)
    prospect = models.ForeignKey(
        VendorContact,
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

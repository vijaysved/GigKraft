import urllib.parse

from django.db import models
from django.utils import timezone


class VendorContact(models.Model):
    """A prospective vendor/pro discovered via Nextdoor or WhatsApp, being
    tracked through the GigKraft outreach pipeline."""

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
    lead_source = models.CharField(
        max_length=20, choices=LeadSource.choices, default=LeadSource.NEXTDOOR
    )
    phone = models.CharField(max_length=30, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    nextdoor_profile_url = models.URLField(blank=True, default="")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.NEW
    )
    preferred_channel = models.CharField(
        max_length=15,
        choices=PreferredChannel.choices,
        default=PreferredChannel.WHATSAPP,
    )
    last_contact_date = models.DateField(null=True, blank=True)
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
            "vendor_id": self.vendor_id,
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
        subject = urllib.parse.quote("Partnership with GigKraft")
        body = urllib.parse.quote(
            "Hi,\n\nI'm reaching out from GigKraft — a platform that connects skilled "
            "professionals with local homeowners in your area.\n\n"
            "I came across your work and think you'd be a great fit for our network. "
            "Would you be open to a quick chat about joining?\n\n"
            "Best,\nGigKraft Team"
        )
        return f"mailto:{self.email}?subject={subject}&body={body}"


class EmailTemplate(models.Model):
    """Reusable outreach email templates with {{placeholder}} variable support.

    Supported variables: {{contact_person}}, {{business_name}},
    {{category}}, {{vendor_id}}
    """

    class Kind(models.TextChoices):
        INTRO = "intro", "Intro"
        REMINDER = "reminder", "Reminder"
        ONBOARDING = "onboarding", "Onboarding"
        OTHER = "other", "Other"

    name = models.CharField(max_length=120)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.INTRO)
    subject = models.CharField(max_length=300)
    body = models.TextField()
    is_default = models.BooleanField(
        default=False,
        help_text="Mark one intro and one reminder template as the default for quick-send.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["kind", "name"]

    def __str__(self):
        return f"[{self.kind}] {self.name}"

    def render(self, vendor: "VendorContact") -> tuple[str, str]:
        """Return (rendered_subject, rendered_body) with variables substituted."""
        vars_ = vendor.template_vars
        subject = self.subject
        body = self.body
        for key, val in vars_.items():
            subject = subject.replace("{{" + key + "}}", val)
            body = body.replace("{{" + key + "}}", val)
        return subject, body

    def mailto_link(self, vendor: "VendorContact") -> str:
        if not vendor.email:
            return ""
        subject, body = self.render(vendor)
        return (
            f"mailto:{vendor.email}"
            f"?subject={urllib.parse.quote(subject)}"
            f"&body={urllib.parse.quote(body)}"
        )


class VendorCommunication(models.Model):
    """A logged outreach event — one row per message sent to a vendor."""

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"
        SMS = "sms", "SMS"
        NEXTDOOR_DM = "nextdoor_dm", "Nextdoor DM"
        PHONE = "phone", "Phone Call"
        OTHER = "other", "Other"

    vendor = models.ForeignKey(
        VendorContact, on_delete=models.CASCADE, related_name="communications"
    )
    template = models.ForeignKey(
        EmailTemplate,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="communications",
    )
    channel = models.CharField(
        max_length=15, choices=Channel.choices, default=Channel.EMAIL
    )
    subject_sent = models.CharField(max_length=300, blank=True, default="")
    body_sent = models.TextField(blank=True, default="")
    notes = models.TextField(blank=True, default="")
    sent_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"Comm#{self.pk} → {self.vendor} via {self.channel} on {self.sent_at.date()}"

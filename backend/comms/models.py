import uuid

from django.db import models
from django.utils import timezone


class MessageTemplate(models.Model):
    """Reusable outreach templates for email and WhatsApp.

    Supports {{contact_person}}, {{business_name}}, {{category}}, {{prospect_id}}
    as substitution variables in subject and body.
    """

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"

    class Kind(models.TextChoices):
        INTRO = "intro", "Intro"
        REMINDER = "reminder", "Reminder"
        ONBOARDING = "onboarding", "Onboarding"
        OTHER = "other", "Other"
        SEQUENCE_1 = "sequence_1", "Sequence Step 1"
        SEQUENCE_2 = "sequence_2", "Sequence Step 2"
        SEQUENCE_3 = "sequence_3", "Sequence Step 3"

    name = models.CharField(max_length=120)
    channel = models.CharField(max_length=10, choices=Channel.choices, default=Channel.EMAIL)
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.INTRO)
    source = models.CharField(max_length=32, blank=True, default="", db_index=True)
    subject = models.CharField(max_length=300, blank=True, default="")  # email only
    body = models.TextField()
    html_body = models.TextField(blank=True, default="")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["channel", "kind", "name"]

    def __str__(self):
        return f"[{self.channel}][{self.kind}] {self.name}"

    def render(self, vars_: dict) -> tuple[str, str]:
        """Return (rendered_subject, rendered_body) with variables substituted."""
        subject = self.subject
        body = self.body
        for key, val in vars_.items():
            subject = subject.replace("{{" + key + "}}", val)
            body = body.replace("{{" + key + "}}", val)
        return subject, body

    def render_all(self, vars_: dict) -> tuple[str, str, str]:
        """Return (rendered_subject, rendered_body, rendered_html_body)."""
        subject, body = self.render(vars_)
        html_body = self.html_body
        for key, val in vars_.items():
            html_body = html_body.replace("{{" + key + "}}", val)
        return subject, body, html_body


class OutreachLog(models.Model):
    """One logged outreach event per prospect — email sent, WhatsApp noted, etc."""

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"
        SMS = "sms", "SMS"
        OTHER = "other", "Other"

    prospect = models.ForeignKey(
        "vendors.Prospect",
        on_delete=models.CASCADE,
        related_name="outreach_logs",
        null=True,
        blank=True,
    )
    template = models.ForeignKey(
        MessageTemplate,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="logs",
    )
    channel = models.CharField(max_length=10, choices=Channel.choices, default=Channel.EMAIL)
    to_address = models.CharField(max_length=300, blank=True, default="")
    cc_addresses = models.CharField(max_length=500, blank=True, default="")
    subject_sent = models.CharField(max_length=300, blank=True, default="")
    body_sent = models.TextField(blank=True, default="")
    html_body_sent = models.TextField(blank=True, default="")
    resend_id = models.CharField(max_length=100, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    sent_at = models.DateTimeField(default=timezone.now)
    sequence_step = models.PositiveSmallIntegerField(default=0)  # 0=manual, 1/2/3=automated
    email_track_token = models.UUIDField(default=uuid.uuid4, unique=True, null=True, editable=False)
    read_at = models.DateTimeField(null=True, blank=True)
    link_click_token = models.UUIDField(default=uuid.uuid4, unique=True, null=True, editable=False)
    link_clicked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"OutreachLog#{self.pk} via {self.channel} at {self.sent_at.date()}"

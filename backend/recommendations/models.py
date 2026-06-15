import secrets

from django.db import models


def generate_token():
    return secrets.token_urlsafe(32)[:48]


class Recommendation(models.Model):
    """Magic-link recommendation: pro requests, client reviews via signed
    token (no auth), pro moderates before it goes public."""

    class Channel(models.TextChoices):
        WHATSAPP = "whatsapp", "WhatsApp"
        SMS = "sms", "SMS"
        EMAIL = "email", "Email"

    class Status(models.TextChoices):
        SENT = "sent", "Sent"
        OPENED = "opened", "Opened"
        SUBMITTED = "submitted", "Submitted"  # pending pro moderation
        APPROVED = "approved", "Approved"
        HIDDEN = "hidden", "Hidden"

    pro = models.ForeignKey(
        "accounts.ProProfile", on_delete=models.CASCADE, related_name="recommendations"
    )
    lead = models.ForeignKey(
        "leads.Lead", null=True, blank=True, on_delete=models.SET_NULL
    )
    client_name = models.CharField(max_length=120)
    client_contact = models.CharField(max_length=120, blank=True, default="")
    channel = models.CharField(
        max_length=10, choices=Channel.choices, default=Channel.SMS
    )
    stars = models.PositiveSmallIntegerField(null=True, blank=True)  # 1..5
    text = models.TextField(blank=True, default="")
    photo_urls = models.JSONField(default=list, blank=True)
    token = models.CharField(max_length=64, unique=True, default=generate_token)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.SENT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Recommendation#{self.pk} {self.client_name} [{self.status}]"

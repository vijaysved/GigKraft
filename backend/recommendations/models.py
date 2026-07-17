import secrets

from django.db import models


def generate_token():
    return secrets.token_urlsafe(32)[:48]


class Recommendation(models.Model):
    """A rating, either against an on-platform pro (`pro`) or an off-platform
    referred contact (`referrer_pro`) — exactly one is set. Two submission
    paths: the original magic-link flow (pro-requested, anonymous, `rater=None`)
    and the newer card-click flow (`rater` set — see design-specs/12.OffPlatformProRatings.md
    §4), which is how off-platform pros get rated at all since they have no
    login to request a review link themselves. Both paths converge on the same
    SENT/OPENED/SUBMITTED/APPROVED/HIDDEN moderation lifecycle."""

    class Channel(models.TextChoices):
        WHATSAPP = "whatsapp", "WhatsApp"
        SMS = "sms", "SMS"
        EMAIL = "email", "Email"

    class Status(models.TextChoices):
        SENT = "sent", "Sent"
        OPENED = "opened", "Opened"
        SUBMITTED = "submitted", "Submitted"  # pending moderation
        APPROVED = "approved", "Approved"
        HIDDEN = "hidden", "Hidden"

    pro = models.ForeignKey(
        "accounts.ProProfile", null=True, blank=True, on_delete=models.CASCADE, related_name="recommendations"
    )
    referrer_pro = models.ForeignKey(
        "referrals.ReferrerPro", null=True, blank=True, on_delete=models.CASCADE, related_name="recommendations"
    )
    # Set only for the card-click flow (§4) — null for the original anonymous
    # magic-link flow, where client_name/client_contact are free text instead.
    rater = models.ForeignKey(
        "accounts.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="ratings_given"
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
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(pro__isnull=False) & models.Q(referrer_pro__isnull=True))
                    | (models.Q(pro__isnull=True) & models.Q(referrer_pro__isnull=False))
                ),
                name="recommendation_exactly_one_target",
            ),
            models.UniqueConstraint(
                fields=["rater", "pro"],
                condition=models.Q(rater__isnull=False, pro__isnull=False),
                name="unique_rater_pro_rating",
            ),
            models.UniqueConstraint(
                fields=["rater", "referrer_pro"],
                condition=models.Q(rater__isnull=False, referrer_pro__isnull=False),
                name="unique_rater_referrer_pro_rating",
            ),
        ]

    def __str__(self):
        return f"Recommendation#{self.pk} {self.client_name} [{self.status}]"

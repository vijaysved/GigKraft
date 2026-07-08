from django.db import models
from django.utils import timezone


class SiteSettings(models.Model):
    """Singleton row — always use SiteSettings.get() to read.

    Stores environment-specific template pro profile URLs and any additional
    template URLs used in marketing material references.
    """

    # Template pro profile page — the "demo" profile linked in marketing copy
    template_pro_url_local = models.URLField(
        max_length=500,
        default="http://localhost:5173/pros/stephan-carry",
        help_text="Template pro profile URL used in local/dev environment.",
    )
    template_pro_url_prod = models.URLField(
        max_length=500,
        default="https://www.gigkraft.com/pros/chris-karry",
        help_text="Template pro profile URL used in production.",
    )

    # Template free member profile page — demo free-tier account
    template_member_url_local = models.URLField(
        max_length=500,
        default="http://localhost:5173/pros/stephan-carry",
        help_text="Template free member profile URL used in local/dev environment.",
    )
    template_member_url_prod = models.URLField(
        max_length=500,
        default="https://www.gigkraft.com/pros/chris-karry",
        help_text="Template free member profile URL used in production.",
    )

    # Pros signup/landing page — destination for tracked outreach links
    pros_signup_url_local = models.URLField(
        max_length=500,
        default="http://localhost:5173/for-pros",
        help_text="Pros signup page URL used in local/dev environment (tracked link redirect target).",
    )
    pros_signup_url_prod = models.URLField(
        max_length=500,
        default="https://www.gigkraft.com/for-pros",
        help_text="Pros signup page URL used in production (tracked link redirect target).",
    )

    # Extra template URLs (list of {label, url} objects stored as JSON)
    extra_template_urls = models.JSONField(
        default=list,
        blank=True,
        help_text='Additional named template URLs, e.g. [{"label": "Home demo", "url": "https://..."}]',
    )

    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    class Meta:
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "SiteSettings"

    @classmethod
    def get(cls) -> "SiteSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SitePageView(models.Model):
    """Tracks visits to site-config demo/marketing pages by unauthenticated visitors."""

    url = models.CharField(max_length=500, db_index=True)
    referrer = models.CharField(max_length=500, blank=True, default="")
    visited_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-visited_at"]

    def __str__(self):
        return f"View of {self.url} at {self.visited_at.date()}"

from datetime import timedelta

from django.db import models
from django.utils import timezone


class Lead(models.Model):
    """An inbound job for a pro, with a response SLA timer."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SCHEDULED = "scheduled", "Scheduled"
        QUOTED = "quoted", "Quoted"
        WON = "won", "Won"
        LOST = "lost", "Lost"
        ARCHIVED = "archived", "Archived"

    class ThreadType(models.TextChoices):
        LEAD = "lead", "Lead / Quote"
        CHAT = "chat", "Chat"
        REQUEST = "request", "Request"

    node = models.ForeignKey(
        "nodes.Node", on_delete=models.PROTECT, related_name="leads"
    )
    homeowner = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="leads"
    )
    pro = models.ForeignKey(
        "accounts.ProProfile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="leads",
    )
    job_title = models.CharField(max_length=120)
    detail = models.TextField(blank=True, default="")
    distance_mi = models.DecimalField(
        max_digits=4, decimal_places=1, null=True, blank=True
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE
    )
    thread_type = models.CharField(
        max_length=10, choices=ThreadType.choices, default=ThreadType.LEAD
    )
    request_accepted = models.BooleanField(default=False)
    # SLA: created_at + pro.response_hours, set on create (see set_respond_by).
    respond_by = models.DateTimeField(null=True, blank=True)
    first_response_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Lead#{self.pk} {self.job_title} [{self.status}]"

    def set_respond_by(self):
        """Set respond_by = created_at + pro.response_hours (node default
        when unassigned)."""
        hours = (
            self.pro.response_hours if self.pro else self.node.default_sla_hours
        )
        base = self.created_at or timezone.now()
        self.respond_by = base + timedelta(hours=hours)


class Message(models.Model):
    """A chat message inside a lead thread."""

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="messages"
    )
    body = models.TextField(blank=True, default="")
    image_url = models.URLField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Message#{self.pk} lead={self.lead_id}"


class QuoteRequest(models.Model):
    """Free-form quote request submitted from the public /search page Type tab."""

    class Timeline(models.TextChoices):
        THIS_WEEK   = "this_week",    "This week"
        NEXT_MONTH  = "next_month",   "Next month"
        JUST_PLAN   = "just_planning","Just planning"

    class Budget(models.TextChoices):
        NO_PREF = "no_pref",   "No preference"
        U500    = "under_500", "Under $500"
        U2K     = "500_2k",   "$500–$2k"
        U10K    = "2k_10k",   "$2k–$10k"
        OVER10K = "over_10k", "$10k+"

    description       = models.TextField()
    category          = models.CharField(max_length=60)
    subcategory       = models.CharField(max_length=80, blank=True, default="")
    timeline          = models.CharField(max_length=20, choices=Timeline.choices)
    zip_code          = models.CharField(max_length=10)
    budget            = models.CharField(max_length=20, choices=Budget.choices, default=Budget.NO_PREF)
    requester_name    = models.CharField(max_length=120)
    requester_contact = models.CharField(max_length=200)
    notified_pro_ids  = models.JSONField(default=list)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"RFQ#{self.pk} {self.category} {self.zip_code}"


class Quote(models.Model):
    """A structured quote sent by the pro inside a lead chat."""

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="quotes")
    line_items = models.JSONField(default=list)  # [{label, amount}]
    total = models.DecimalField(max_digits=10, decimal_places=2)
    accepted = models.BooleanField(default=False)
    is_invoice = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        kind = "Invoice" if self.is_invoice else "Quote"
        return f"{kind}#{self.pk} lead={self.lead_id} total={self.total}"

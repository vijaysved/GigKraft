from django.db import models


class Node(models.Model):
    """A geographic operating node (multi-node support from day one).

    Service area is modeled as a ZIP list plus a center ZIP + radius,
    matching the MVP's no-map UI (ZIP list + radius slider).
    """

    node_id = models.SlugField(max_length=50, unique=True)
    name = models.CharField(max_length=120)
    center_zip = models.CharField(max_length=10, blank=True, default="")
    service_zips = models.JSONField(default=list, blank=True)
    radius_miles = models.PositiveIntegerField(default=50)
    is_active = models.BooleanField(default=True)
    # Node ops settings (admin screen 3.6).
    manager = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="managed_nodes",
    )
    auto_blast = models.BooleanField(default=True)
    escalation_enabled = models.BooleanField(default=True)
    escalation_minutes = models.PositiveSmallIntegerField(default=15)
    default_sla_hours = models.PositiveSmallIntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["node_id"]

    def __str__(self):
        return f"{self.node_id} ({self.name})"


class SafetyLog(models.Model):
    """Safety & hygiene queue entries for admin triage (screen 3.3)."""

    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        DISMISSED = "dismissed", "Dismissed"
        SUSPENDED = "suspended", "Suspended"

    node = models.ForeignKey(Node, on_delete=models.CASCADE, related_name="safety_logs")
    pro = models.ForeignKey(
        "accounts.ProProfile", on_delete=models.CASCADE, related_name="safety_logs"
    )
    infraction = models.CharField(max_length=200)
    severity = models.CharField(
        max_length=10, choices=Severity.choices, default=Severity.LOW
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"SafetyLog#{self.pk} {self.infraction}"

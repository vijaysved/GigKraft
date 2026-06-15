from django.db import models


class EmergencyBroadcast(models.Model):
    """A homeowner emergency blast fanned out to eligible pros (screen 2.3)."""

    class Kind(models.TextChoices):
        BURST = "burst", "Burst pipe"
        POWER = "power", "Power out"
        HVAC = "hvac", "HVAC down"
        LOCK = "lock", "Lockout"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLAIMED = "claimed", "Claimed"
        ROUTED = "routed", "Routed by admin"
        CANCELLED = "cancelled", "Cancelled"

    node = models.ForeignKey(
        "nodes.Node", on_delete=models.PROTECT, related_name="broadcasts"
    )
    homeowner = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="broadcasts"
    )
    kind = models.CharField(max_length=20, choices=Kind.choices)
    description = models.TextField()
    address = models.CharField(max_length=200)
    zip = models.CharField(max_length=10, blank=True, default="")
    budget_ceiling = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.OPEN
    )
    claimed_by = models.ForeignKey(
        "accounts.ProProfile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="claimed_broadcasts",
    )
    claimed_at = models.DateTimeField(null=True, blank=True)
    lead = models.ForeignKey(
        "leads.Lead",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="broadcasts",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Broadcast#{self.pk} {self.kind} [{self.status}]"


class BroadcastDispatch(models.Model):
    """One mock SMS/WhatsApp notification sent to a pro for a broadcast.

    MOCK (Phase 1): rows are written to the DB and logged to the console;
    no real Twilio/WhatsApp call is made.
    """

    class Channel(models.TextChoices):
        SMS = "sms", "SMS"
        WHATSAPP = "whatsapp", "WhatsApp"

    class Status(models.TextChoices):
        NOTIFIED = "notified", "Notified"
        CLAIMED = "claimed", "Claimed"

    broadcast = models.ForeignKey(
        EmergencyBroadcast, on_delete=models.CASCADE, related_name="dispatches"
    )
    pro = models.ForeignKey(
        "accounts.ProProfile", on_delete=models.CASCADE, related_name="dispatches"
    )
    channel = models.CharField(max_length=10, choices=Channel.choices)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.NOTIFIED
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Dispatch<{self.broadcast_id}->{self.pro_id} {self.channel}>"

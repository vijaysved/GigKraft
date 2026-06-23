from django.db import models


class Feedback(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        RESOLVED = "resolved", "Resolved"

    ticket_number = models.CharField(max_length=20, unique=True, editable=False)
    text = models.TextField()
    user = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="feedback_items",
    )
    page_url = models.CharField(max_length=500, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            super().save(*args, **kwargs)
            self.ticket_number = f"FB-{self.pk:04d}"
            Feedback.objects.filter(pk=self.pk).update(ticket_number=self.ticket_number)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.ticket_number}: {self.text[:60]}"


class FeedbackReply(models.Model):
    feedback = models.ForeignKey(
        Feedback,
        on_delete=models.CASCADE,
        related_name="replies",
    )
    text = models.TextField()
    author = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="feedback_replies",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Reply to {self.feedback.ticket_number} by {self.author}"

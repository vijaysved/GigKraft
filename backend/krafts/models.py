import random
import string

from django.core.exceptions import ValidationError
from django.db import models


def _generate_slug() -> str:
    digits  = random.choices(string.digits,          k=3)
    letters = random.choices(string.ascii_lowercase, k=7)
    chars   = digits + letters
    random.shuffle(chars)
    return "".join(chars)


def _unique_slug() -> str:
    for _ in range(20):
        s = _generate_slug()
        if not Kraft.objects.filter(slug=s).exists():
            return s
    raise RuntimeError("Could not generate a unique Kraft slug.")


class Kraft(models.Model):
    """A before/after (or photo-only) work sample posted by a pro."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    class GigType(models.TextChoices):
        UNDER_500  = "under_500",  "Under $500"
        MID        = "500_2000",   "$500 – $2,000"
        HIGH       = "2000_plus",  "$2,000 or more"

    slug = models.CharField(max_length=10, unique=True, blank=True, default="")

    pro = models.ForeignKey(
        "accounts.ProProfile", on_delete=models.CASCADE, related_name="krafts"
    )
    node = models.ForeignKey(
        "nodes.Node", on_delete=models.PROTECT, related_name="krafts"
    )
    title       = models.CharField(max_length=100)
    description = models.TextField(max_length=512, blank=True, default="")
    skill       = models.CharField(max_length=100, blank=True, default="")
    gig_type    = models.CharField(
        max_length=20, choices=GigType.choices, blank=True, default=""
    )
    location    = models.CharField(max_length=100, blank=True, default="")
    start_month = models.PositiveSmallIntegerField(null=True, blank=True)
    start_year  = models.PositiveSmallIntegerField(null=True, blank=True)
    end_month   = models.PositiveSmallIntegerField(null=True, blank=True)
    end_year    = models.PositiveSmallIntegerField(null=True, blank=True)

    # Legacy fields kept for data-model compatibility (no longer required to publish)
    invoice_cost      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    invoice_confirmed = models.BooleanField(default=False)

    status      = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    review_note = models.CharField(max_length=300, blank=True, default="")
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = _unique_slug()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Kraft#{self.pk} [{self.slug}] {self.title} [{self.status}]"

    @property
    def has_after(self):
        return self.photos.filter(kind=KraftPhoto.Kind.AFTER).exists()

    def proof_errors(self):
        """Return unmet conditions (empty = publishable). Only an After photo is required."""
        if not self.has_after:
            return ["A Kraft requires at least one After photo."]
        return []

    def clean(self):
        if self.status in (self.Status.PENDING, self.Status.VERIFIED):
            errors = self.proof_errors()
            if errors:
                raise ValidationError(" ".join(errors))


class KraftPhoto(models.Model):
    class Kind(models.TextChoices):
        BEFORE = "before", "Before"
        AFTER  = "after",  "After"

    kraft     = models.ForeignKey(Kraft, on_delete=models.CASCADE, related_name="photos")
    kind      = models.CharField(max_length=6, choices=Kind.choices)
    image_url = models.TextField()
    order     = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["kind", "order", "id"]

    def __str__(self):
        return f"KraftPhoto<{self.kraft_id}:{self.kind}:{self.order}>"

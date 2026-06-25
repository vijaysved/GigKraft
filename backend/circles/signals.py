from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender="accounts.User")
def create_circle_for_homeowner(sender, instance, created, **kwargs):
    from circles.models import Circle

    if created and instance.role == "homeowner":
        Circle.objects.get_or_create(curator=instance)


@receiver(post_save, sender="accounts.ProProfile")
def claim_off_platform_circle_entries(sender, instance, created, **kwargs):
    from circles.models import CirclePro

    if not created:
        return

    user = instance.user
    matches = CirclePro.objects.filter(pro__isnull=True).filter(
        models.Q(off_platform_phone=user.phone or "")
        | models.Q(off_platform_email=user.email or "")
    )
    if not matches.exists():
        return

    for cp in matches:
        cp.pro = instance
        cp.status = CirclePro.Status.CLAIMED
        cp.save(update_fields=["pro", "status", "updated_at"])

        for referral in cp.circle.referrals.filter(lead__is_escrow=True).select_related("lead"):
            lead = referral.lead
            lead.pro = instance
            lead.is_escrow = False
            lead.save(update_fields=["pro", "is_escrow", "updated_at"])

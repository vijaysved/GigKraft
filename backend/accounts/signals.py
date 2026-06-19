from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender="accounts.User")
def auto_convert_prospect(sender, instance, created, **kwargs):
    """When a new user registers, check if their email matches an open prospect
    and automatically convert that prospect + link the user account."""
    if not created or not instance.email:
        return

    from django.utils import timezone
    from vendors.models import Prospect

    prospect = (
        Prospect.objects
        .filter(email__iexact=instance.email)
        .exclude(status=Prospect.Status.CONVERTED)
        .first()
    )
    if prospect:
        prospect.status = Prospect.Status.CONVERTED
        prospect.converted_user = instance
        prospect.save(update_fields=["status", "converted_user", "updated_at"])

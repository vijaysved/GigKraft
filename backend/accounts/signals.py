from django.db.models.signals import post_delete, post_save
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


# ---------------------------------------------------------------------------
# Popularity / Quality-of-Work card metrics (design-specs/11.ContactCardUpdate.md)
#
# Recomputed synchronously on every write that can move a score — there's no
# Celery/async task runner in this codebase, and these writes are user-click-rate
# (favorite a pro, approve a review, win a job), not page-view-rate.
# ---------------------------------------------------------------------------

@receiver(post_save, sender="recommendations.Recommendation")
def recompute_metrics_on_recommendation_save(sender, instance, **kwargs):
    if instance.pro_id is None:
        return  # off-platform rating — see referrals/signals.py instead
    from accounts.metrics import recompute_pro_metrics

    recompute_pro_metrics(instance.pro)


@receiver(post_save, sender="leads.Lead")
def recompute_metrics_on_lead_save(sender, instance, **kwargs):
    if instance.pro_id is None:
        return
    from accounts.metrics import recompute_pro_metrics

    recompute_pro_metrics(instance.pro)


@receiver(post_save, sender="accounts.FavoritePro")
def recompute_metrics_on_favorite_save(sender, instance, **kwargs):
    from accounts.metrics import recompute_pro_metrics

    recompute_pro_metrics(instance.pro)


@receiver(post_delete, sender="accounts.FavoritePro")
def recompute_metrics_on_favorite_delete(sender, instance, **kwargs):
    from accounts.metrics import recompute_pro_metrics

    recompute_pro_metrics(instance.pro)

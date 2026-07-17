from django.db.models.signals import post_save
from django.dispatch import receiver

# ---------------------------------------------------------------------------
# Popularity / Quality-of-Work card metrics for off-platform pros
# (design-specs/12.OffPlatformProRatings.md) — recomputed synchronously on
# every write that can move a score, same rationale as accounts/signals.py.
# ---------------------------------------------------------------------------


@receiver(post_save, sender="recommendations.Recommendation")
def recompute_referrer_pro_metrics_on_recommendation_save(sender, instance, **kwargs):
    if instance.referrer_pro_id is None:
        return
    from referrals.metrics import recompute_referrer_pro_metrics

    recompute_referrer_pro_metrics(instance.referrer_pro)


@receiver(post_save, sender="leads.Lead")
def recompute_referrer_pro_metrics_on_lead_save(sender, instance, **kwargs):
    if instance.referrer_pro_id is None:
        return
    from referrals.metrics import recompute_referrer_pro_metrics

    recompute_referrer_pro_metrics(instance.referrer_pro)

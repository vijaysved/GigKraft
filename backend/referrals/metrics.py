"""Popularity / Quality-of-Work card metrics for off-platform (referred) pros
— see design-specs/12.OffPlatformProRatings.md. Parallel to accounts/metrics.py
(on-platform ProProfile), sharing the same pure math from
common/pro_metrics_math.py. Scores are cached on ReferrerPro and recomputed
here on every relevant write (see referrals/signals.py), never at read time."""
from django.utils import timezone

from common.pro_metrics_math import normalize, quality_category_pcts, weighted_quality_score

# §12 #1 (confirmed 2026-07-16): no Recommended/favorites sub-metric applies to
# off-platform pros (no public profile/Search listing to be favorited from).
POPULARITY_WEIGHTS = {"used": 0.55, "reviews": 0.45}
POPULARITY_TARGETS = {"used": 30, "reviews": 25}

REFERRER_PRO_METRICS_FIELDS = [
    "popularity_score", "quality_score", "used_count", "review_count",
    "schedule_adherence_pct", "professionalism_cleanliness_pct",
    "pricing_transparency_pct", "communication_quality_pct", "rehire_intent_pct",
    "metrics_updated_at",
]


def recompute_referrer_pro_metrics(rp) -> None:
    """Recalculate and persist popularity_score/quality_score + their inputs
    for one off-platform ReferrerPro. Called only from signal handlers."""
    from leads.models import Lead
    from recommendations.models import Recommendation

    used_count = (
        Lead.objects.filter(referrer_pro=rp, status=Lead.Status.WON)
        .values("homeowner").distinct().count()
    )
    approved_recs = list(
        Recommendation.objects.filter(referrer_pro=rp, status=Recommendation.Status.APPROVED)
    )
    review_count = len(approved_recs)

    if review_count == 0:
        popularity_score = quality_score = None
        category_pcts = {
            "schedule_adherence_pct": None, "professionalism_cleanliness_pct": None,
            "pricing_transparency_pct": None, "communication_quality_pct": None,
            "rehire_intent_pct": None,
        }
    else:
        popularity_score = round(
            POPULARITY_WEIGHTS["used"] * normalize(used_count, POPULARITY_TARGETS["used"])
            + POPULARITY_WEIGHTS["reviews"] * normalize(review_count, POPULARITY_TARGETS["reviews"])
        )
        category_pcts = quality_category_pcts(approved_recs)
        quality_score = weighted_quality_score(category_pcts)

    rp.popularity_score = popularity_score
    rp.quality_score = quality_score
    rp.used_count = used_count
    rp.review_count = review_count
    rp.schedule_adherence_pct = category_pcts["schedule_adherence_pct"]
    rp.professionalism_cleanliness_pct = category_pcts["professionalism_cleanliness_pct"]
    rp.pricing_transparency_pct = category_pcts["pricing_transparency_pct"]
    rp.communication_quality_pct = category_pcts["communication_quality_pct"]
    rp.rehire_intent_pct = category_pcts["rehire_intent_pct"]
    rp.metrics_updated_at = timezone.now()
    rp.save(update_fields=REFERRER_PRO_METRICS_FIELDS)

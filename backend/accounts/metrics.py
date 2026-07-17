"""Popularity / Quality-of-Work card metrics — see design-specs/11.ContactCardUpdate.md.

Scores are cached on ProProfile and recomputed here on every relevant write
(see accounts/signals.py), never at read/card-render time."""
from django.utils import timezone

from common.pro_metrics_math import normalize, quality_category_pcts, weighted_quality_score

# §11 #2/#3 (confirmed 2026-07-16): weights and log-normalization targets for
# the three raw Popularity counts.
POPULARITY_WEIGHTS = {"recommended": 0.40, "used": 0.40, "reviews": 0.20}
POPULARITY_TARGETS = {"recommended": 50, "used": 30, "reviews": 25}

PRO_METRICS_FIELDS = [
    "popularity_score", "quality_score", "recommended_count", "used_count",
    "review_count", "schedule_adherence_pct", "professionalism_cleanliness_pct",
    "pricing_transparency_pct", "communication_quality_pct", "rehire_intent_pct",
    "metrics_updated_at",
]


def recompute_pro_metrics(pro) -> None:
    """Recalculate and persist popularity_score/quality_score + their inputs
    for one ProProfile. Called only from signal handlers — never from a
    request path directly (§3 of the design spec)."""
    from accounts.models import FavoritePro
    from leads.models import Lead
    from recommendations.models import Recommendation

    recommended_count = FavoritePro.objects.filter(pro=pro).count()
    used_count = (
        Lead.objects.filter(pro=pro, status=Lead.Status.WON)
        .values("homeowner").distinct().count()
    )
    approved_recs = list(
        Recommendation.objects.filter(pro=pro, status=Recommendation.Status.APPROVED)
    )
    review_count = len(approved_recs)

    if review_count == 0:
        # §2.2 / §9: zero reviews -> both scores null ("not enough data"), not 0.
        popularity_score = quality_score = None
        category_pcts = {
            "schedule_adherence_pct": None, "professionalism_cleanliness_pct": None,
            "pricing_transparency_pct": None, "communication_quality_pct": None,
            "rehire_intent_pct": None,
        }
    else:
        popularity_score = round(
            POPULARITY_WEIGHTS["recommended"] * normalize(recommended_count, POPULARITY_TARGETS["recommended"])
            + POPULARITY_WEIGHTS["used"] * normalize(used_count, POPULARITY_TARGETS["used"])
            + POPULARITY_WEIGHTS["reviews"] * normalize(review_count, POPULARITY_TARGETS["reviews"])
        )
        category_pcts = quality_category_pcts(approved_recs)
        quality_score = weighted_quality_score(category_pcts)

    pro.popularity_score = popularity_score
    pro.quality_score = quality_score
    pro.recommended_count = recommended_count
    pro.used_count = used_count
    pro.review_count = review_count
    pro.schedule_adherence_pct = category_pcts["schedule_adherence_pct"]
    pro.professionalism_cleanliness_pct = category_pcts["professionalism_cleanliness_pct"]
    pro.pricing_transparency_pct = category_pcts["pricing_transparency_pct"]
    pro.communication_quality_pct = category_pcts["communication_quality_pct"]
    pro.rehire_intent_pct = category_pcts["rehire_intent_pct"]
    pro.metrics_updated_at = timezone.now()
    pro.save(update_fields=PRO_METRICS_FIELDS)

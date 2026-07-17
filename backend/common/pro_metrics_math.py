"""Shared pure math for Popularity/Quality-of-Work scoring — used by both
accounts/metrics.py (on-platform ProProfile) and referrals/metrics.py
(off-platform ReferrerPro). See design-specs/11.ContactCardUpdate.md and
design-specs/12.OffPlatformProRatings.md. No model-specific logic here."""
import math

# §11 #1 (confirmed): weights for the five Quality-of-Work categories, as given.
QUALITY_WEIGHTS = {
    "schedule_adherence_pct": 0.25,
    "professionalism_cleanliness_pct": 0.25,
    "pricing_transparency_pct": 0.20,
    "communication_quality_pct": 0.15,
    "rehire_intent_pct": 0.15,
}


def normalize(count: int, target: int) -> int:
    """0 at count=0, 100 once count reaches `target`, log-scaled between."""
    if count <= 0:
        return 0
    return min(100, round(100 * math.log(1 + count) / math.log(1 + target)))


def category_pct(recs: list, keys: list[str]) -> "int | None":
    """Yes-rate (0-100) for a category backed by one or more REC_METRICS keys,
    averaged per-review across `keys` first, then across reviews. Reviews that
    answered none of `keys` are excluded (not counted as "no") — §11 #5."""
    from recommendations.metrics import decode_rec_metrics

    per_review = []
    for rec in recs:
        answers = decode_rec_metrics(rec.text)
        if not answers:
            continue
        answered = [answers[k] for k in keys if k in answers]
        if not answered:
            continue
        per_review.append(sum(1 for a in answered if a) / len(answered))
    if not per_review:
        return None
    return round(100 * sum(per_review) / len(per_review))


def quality_category_pcts(recs: list) -> dict:
    """The five Quality-of-Work sub-category percentages for a list of
    APPROVED recommendations, keyed to match QUALITY_WEIGHTS."""
    return {
        "schedule_adherence_pct": category_pct(recs, ["punctuality"]),
        "professionalism_cleanliness_pct": category_pct(recs, ["cleanliness"]),
        "pricing_transparency_pct": category_pct(recs, ["clear_rates", "written_estimates", "material_policy"]),
        "communication_quality_pct": category_pct(recs, ["communication"]),
        "rehire_intent_pct": category_pct(recs, ["rehire_intent"]),
    }


def weighted_quality_score(category_pcts: dict) -> "int | None":
    """§11 #5: exclude unanswered categories and renormalize the rest to 100%."""
    answered = [(pct, QUALITY_WEIGHTS[k]) for k, pct in category_pcts.items() if pct is not None]
    if not answered:
        return None
    total_weight = sum(w for _, w in answered)
    return round(sum(pct * w for pct, w in answered) / total_weight)

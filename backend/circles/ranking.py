from accounts.models import ProProfile
from circles.models import Circle, CirclePro


def build_tiered_results(circle: Circle, matched_categories: list, seeker=None) -> list:
    results = []
    seen_pro_ids: set = set()
    curator_name = f"{circle.curator.first_name} {circle.curator.last_name}".strip()

    # Tier 1: pros explicitly in this circle that match the query
    for cp in circle.pros.select_related("pro", "pro__user").all():
        score = _cp_relevance(cp, matched_categories)
        if score == 0 and matched_categories:
            continue
        results.append({
            "tier": 1,
            "tier_label": f"Vouched by {curator_name}",
            "circle_pro_id": cp.pk,
            "pro_id": cp.pro.pk if cp.pro else None,
            "display_name": cp.display_name,
            "primary_trade": cp.pro.primary_trade if cp.pro else cp.off_platform_skill,
            "avatar_url": cp.pro.avatar_url if cp.pro else None,
            "endorsement": cp.endorsement or None,
            "status": cp.status,
            "is_off_platform": cp.is_off_platform,
            "relevance_score": score,
        })
        if cp.pro_id:
            seen_pro_ids.add(cp.pro_id)

    # Tier 2: deferred until social graph model is built
    if seeker and False:  # noqa: SIM210
        pass

    # Tier 3: active platform pros matching categories, not already in Tier 1
    if matched_categories:
        for pro in ProProfile.objects.filter(is_suspended=False).exclude(pk__in=seen_pro_ids):
            score = _pro_relevance(pro, matched_categories)
            if score == 0:
                continue
            results.append({
                "tier": 3,
                "tier_label": "Gigkraft Verified",
                "circle_pro_id": None,
                "pro_id": pro.pk,
                "display_name": pro.display_name,
                "primary_trade": pro.primary_trade,
                "avatar_url": pro.avatar_url or None,
                "endorsement": None,
                "status": "active",
                "is_off_platform": False,
                "relevance_score": score,
            })

    results.sort(key=lambda r: (r["tier"], -r["relevance_score"]))
    return results


def _cp_relevance(cp: CirclePro, categories: list) -> float:
    if not categories:
        return 1.0
    if cp.pro:
        return _pro_relevance(cp.pro, categories)
    skill = cp.off_platform_skill.lower()
    return 1.0 if any(c.lower() in skill or skill in c.lower() for c in categories) else 0.0


def _pro_relevance(pro: ProProfile, categories: list) -> float:
    if not categories:
        return 1.0
    trade = (pro.primary_trade or "").lower()
    tags = [t.lower() for t in (pro.skill_tags or [])]
    for cat in categories:
        cat_lower = cat.lower()
        if cat_lower in trade or trade in cat_lower:
            return 1.0
        if any(cat_lower in tag or tag in cat_lower for tag in tags):
            return 0.8
    return 0.0

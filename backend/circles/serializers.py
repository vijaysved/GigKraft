from typing import Optional

from circles.models import Circle, CirclePro


def serialize_circle_pro(cp: CirclePro) -> dict:
    pro = cp.pro
    krafts_verified = 0
    recs_approved = 0
    circles_count = 0
    if pro:
        from krafts.models import Kraft
        from recommendations.models import Recommendation
        krafts_verified = pro.krafts.filter(status=Kraft.Status.VERIFIED).count()
        recs_approved = Recommendation.objects.filter(
            pro=pro, status=Recommendation.Status.APPROVED
        ).count()
        circles_count = CirclePro.objects.filter(
            pro=pro, status__in=[CirclePro.Status.ACTIVE, CirclePro.Status.CLAIMED]
        ).count()
    return {
        "id": cp.pk,
        "pro_id": pro.pk if pro else None,
        "display_name": cp.display_name,
        "primary_trade": pro.primary_trade if pro else cp.off_platform_skill,
        "avatar_url": pro.avatar_url if pro else None,
        "handle": pro.handle if pro else None,
        "bio": (pro.bio or None) if pro else None,
        "off_platform_phone": cp.off_platform_phone or None,
        "off_platform_email": cp.off_platform_email or None,
        "phone": (pro.user.phone or None) if pro else (cp.off_platform_phone or None),
        "email": (pro.user.email or None) if pro else (cp.off_platform_email or None),
        "zip_code": (pro.base_zip or None) if pro else None,
        "endorsement": cp.endorsement,
        "status": cp.status,
        "is_off_platform": cp.is_off_platform,
        "skill_tags": list(pro.skill_tags) if pro else [],
        "krafts_verified": krafts_verified,
        "recs_approved": recs_approved,
        "circles_count": circles_count,
    }


def serialize_circle(
    circle: Circle,
    include_pros: bool = True,
    follow_status: Optional[str] = None,
) -> dict:
    curator = circle.curator
    curator_avatar = None
    if hasattr(curator, "homeowner_profile"):
        curator_avatar = curator.homeowner_profile.avatar_url or None
    pros = []
    if include_pros:
        pros = [
            serialize_circle_pro(cp)
            for cp in circle.pros.select_related("pro", "pro__user").all()
        ]
    return {
        "slug": circle.slug,
        "curator_name": f"{curator.first_name} {curator.last_name}".strip() or curator.email or "",
        "curator_avatar_url": curator_avatar,
        "pro_count": circle.pros.count(),
        "follow_status": follow_status,
        "pros": pros,
    }

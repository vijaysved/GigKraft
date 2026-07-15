"""Role guards for Ninja endpoints. All raise HttpError(403) on failure."""
from ninja.errors import HttpError

from accounts.models import HomeownerProfile, ProProfile, User


def _has_role(user, *roles) -> bool:
    """True if `user.role` or any of `user.extra_roles` matches one of `roles`.

    A user's `role` field holds only one primary role, but the platform lets a
    person hold several capabilities at once (e.g. Pro + Referrer + Community
    Owner) — the rest live in `extra_roles`. Every guard below must check both,
    or a user whose primary role changed away from "pro" would silently lose
    Pro access even with a `ProProfile` and `extra_roles=["pro"]` intact.
    """
    if user.role in roles:
        return True
    return any(r in roles for r in (user.extra_roles or []))


def require_pro(request) -> ProProfile:
    user = request.auth
    if not _has_role(user, User.Role.PRO):
        raise HttpError(403, "This endpoint requires the pro role.")
    profile, _ = ProProfile.objects.get_or_create(user=user)
    return profile


def require_member_or_pro(request) -> ProProfile:
    """Allow member (pre-checkout) and pro (already subscribed) roles.

    Creates a ProProfile stub for members so the pro_id can be embedded in
    Stripe session metadata before the webhook fires the role upgrade."""
    user = request.auth
    if not _has_role(user, User.Role.MEMBER, User.Role.PRO):
        raise HttpError(403, "This endpoint requires a member or pro account.")
    profile, _ = ProProfile.objects.get_or_create(user=user)
    return profile


def require_homeowner(request) -> HomeownerProfile:
    """Ensure the user has homeowner capability (primary role or extra_roles)."""
    user = request.auth
    if not _has_role(user, User.Role.HOMEOWNER):
        raise HttpError(403, "This endpoint requires the homeowner role.")
    profile, _ = HomeownerProfile.objects.get_or_create(user=user)
    return profile


def require_referrer(request) -> "ReferrerProfile":
    """Ensure the user has referrer (or legacy homeowner) role and return their ReferrerProfile."""
    from referrals.models import ReferrerProfile
    user = request.auth
    if not _has_role(user, User.Role.REFERRER, User.Role.HOMEOWNER, User.Role.COMMUNITY_LEAD):
        raise HttpError(403, "This endpoint requires the referrer role.")
    profile, _ = ReferrerProfile.objects.get_or_create(user=user)
    if not profile.slug:
        profile.save()  # triggers _generate_slug
    return profile


def require_node_manager(request) -> User:
    user = request.auth
    if user.role != User.Role.NODE_MANAGER:
        raise HttpError(403, "This endpoint requires the node manager role.")
    return user


def require_gk_admin(request) -> User:
    user = request.auth
    if user.role != User.Role.GK_ADMIN:
        raise HttpError(403, "This endpoint requires the gk_admin role.")
    return user

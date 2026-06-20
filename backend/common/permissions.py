"""Role guards for Ninja endpoints. All raise HttpError(403) on failure."""
from ninja.errors import HttpError

from accounts.models import HomeownerProfile, ProProfile, User


def require_pro(request) -> ProProfile:
    user = request.auth
    if user.role != User.Role.PRO:
        raise HttpError(403, "This endpoint requires the pro role.")
    profile, _ = ProProfile.objects.get_or_create(user=user)
    return profile


def require_member_or_pro(request) -> ProProfile:
    """Allow member (pre-checkout) and pro (already subscribed) roles.

    Creates a ProProfile stub for members so the pro_id can be embedded in
    Stripe session metadata before the webhook fires the role upgrade."""
    user = request.auth
    if user.role not in (User.Role.MEMBER, User.Role.PRO):
        raise HttpError(403, "This endpoint requires a member or pro account.")
    profile, _ = ProProfile.objects.get_or_create(user=user)
    return profile


def require_homeowner(request) -> HomeownerProfile:
    user = request.auth
    if user.role != User.Role.HOMEOWNER:
        raise HttpError(403, "This endpoint requires the homeowner role.")
    profile, _ = HomeownerProfile.objects.get_or_create(user=user)
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

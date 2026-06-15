"""GigKraft super-admin API — gk_admin role only, cross-node visibility."""
import os
from typing import List, Optional

import stripe
from django.db.models import Count, Q
from ninja import Router, Schema

from accounts.auth import jwt_auth
from accounts.models import ProProfile, User
from billing.models import Subscription, StripeSettings
from common.permissions import require_gk_admin
from krafts.models import Kraft
from leads.models import Lead
from nodes.models import Node, SafetyLog

router = Router(tags=["gk_admin"], auth=jwt_auth)


class NodeSummary(Schema):
    node_id: str
    name: str
    active_pros: int
    pending_leads: int
    monthly_run_rate: float
    is_active: bool


class PlatformMetrics(Schema):
    total_users: int
    total_pros: int
    total_homeowners: int
    total_node_managers: int
    total_nodes: int
    active_nodes: int
    total_krafts: int
    verified_krafts: int
    total_leads: int
    open_leads: int
    total_subscriptions: int
    active_subscriptions: int
    open_infractions: int
    nodes: List[NodeSummary]


class UserRow(Schema):
    id: int
    email: str | None
    phone: str | None
    role: str
    first_name: str
    last_name: str
    node_id: str | None
    is_active: bool
    date_joined: str
    primary_zip: str | None
    service_zips: List[str]
    pro_handle: str | None

    @staticmethod
    def resolve_node_id(obj):
        return obj.node.node_id if obj.node_id else None

    @staticmethod
    def resolve_date_joined(obj):
        return obj.date_joined.strftime("%Y-%m-%d")

    @staticmethod
    def resolve_primary_zip(obj):
        if obj.role == User.Role.PRO:
            try:
                return obj.pro_profile.base_zip or None
            except Exception:
                return None
        if obj.role == User.Role.HOMEOWNER:
            try:
                return obj.homeowner_profile.default_zip or None
            except Exception:
                return None
        return None

    @staticmethod
    def resolve_pro_handle(obj):
        if obj.role == User.Role.PRO:
            try:
                return obj.pro_profile.handle or None
            except Exception:
                return None
        return None

    @staticmethod
    def resolve_service_zips(obj):
        if obj.role == User.Role.PRO:
            try:
                return obj.pro_profile.service_zips or []
            except Exception:
                return []
        if obj.role == User.Role.HOMEOWNER:
            try:
                zips = list(
                    obj.homeowner_profile.addresses.values_list("zip", flat=True)
                )
                return zips
            except Exception:
                return []
        return []


class UserListOut(Schema):
    total: int
    items: List[UserRow]


@router.get("/metrics", response=PlatformMetrics)
def platform_metrics(request):
    require_gk_admin(request)

    role_counts = dict(
        User.objects.values_list("role").annotate(c=Count("id"))
    )

    nodes_qs = Node.objects.all()
    node_summaries = []
    for node in nodes_qs:
        active_pros = ProProfile.objects.filter(
            user__node=node, is_suspended=False
        ).count()
        pending_leads = Lead.objects.filter(node=node, status="pending").count()
        subs = Subscription.objects.filter(
            pro__user__node=node, status="active"
        )
        run_rate = sum(
            (99.0 if s.plan == "monthly" else 79.0) for s in subs
        )
        node_summaries.append(NodeSummary(
            node_id=node.node_id,
            name=node.name,
            active_pros=active_pros,
            pending_leads=pending_leads,
            monthly_run_rate=run_rate,
            is_active=node.is_active,
        ))

    return PlatformMetrics(
        total_users=User.objects.count(),
        total_pros=role_counts.get("pro", 0),
        total_homeowners=role_counts.get("homeowner", 0),
        total_node_managers=role_counts.get("node_manager", 0),
        total_nodes=nodes_qs.count(),
        active_nodes=nodes_qs.filter(is_active=True).count(),
        total_krafts=Kraft.objects.count(),
        verified_krafts=Kraft.objects.filter(status="approved").count(),
        total_leads=Lead.objects.count(),
        open_leads=Lead.objects.filter(status="pending").count(),
        total_subscriptions=Subscription.objects.count(),
        active_subscriptions=Subscription.objects.filter(status="active").count(),
        open_infractions=SafetyLog.objects.filter(status="open").count(),
        nodes=node_summaries,
    )


@router.get("/users", response=UserListOut)
def list_users(
    request,
    role: str = "",
    search: str = "",
    zip: str = "",
    page: int = 1,
    page_size: int = 25,
):
    require_gk_admin(request)
    qs = (
        User.objects.all()
        .select_related("node", "pro_profile", "homeowner_profile")
        .prefetch_related("homeowner_profile__addresses")
    )
    if role:
        qs = qs.filter(role=role)
    if search:
        qs = qs.filter(
            Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
        )
    if zip:
        qs = qs.filter(
            Q(pro_profile__base_zip=zip)
            | Q(pro_profile__service_zips__contains=zip)
            | Q(homeowner_profile__default_zip=zip)
            | Q(homeowner_profile__addresses__zip=zip)
        ).distinct()
    qs = qs.order_by("-date_joined")
    total = qs.count()
    offset = (page - 1) * page_size
    items = list(qs[offset : offset + page_size])
    return UserListOut(total=total, items=items)


@router.get("/users/zipcodes", response=List[str])
def list_user_zipcodes(request):
    require_gk_admin(request)
    zips = set()
    for z in ProProfile.objects.values_list("base_zip", flat=True):
        if z:
            zips.add(z)
    for zlist in ProProfile.objects.values_list("service_zips", flat=True):
        if zlist:
            zips.update(z for z in zlist if z)
    from accounts.models import HomeownerProfile, Address
    for z in HomeownerProfile.objects.values_list("default_zip", flat=True):
        if z:
            zips.add(z)
    for z in Address.objects.values_list("zip", flat=True):
        if z:
            zips.add(z)
    return sorted(zips)


@router.delete("/users/{user_id}", response={204: None, 404: dict})
def delete_user(request, user_id: int):
    require_gk_admin(request)
    user = User.objects.filter(pk=user_id).first()
    if user is None:
        return 404, {"detail": "User not found."}
    user.delete()
    return 204, None


@router.patch("/users/{user_id}/set-admin", response={200: UserRow, 404: dict})
def set_user_admin(request, user_id: int):
    require_gk_admin(request)
    user = User.objects.select_related("node", "pro_profile", "homeowner_profile").filter(pk=user_id).first()
    if user is None:
        return 404, {"detail": "User not found."}
    user.role = User.Role.GK_ADMIN
    user.save(update_fields=["role"])
    return 200, user


@router.get("/nodes", response=List[NodeSummary])
def list_nodes(request):
    require_gk_admin(request)
    result = []
    for node in Node.objects.all():
        active_pros = ProProfile.objects.filter(
            user__node=node, is_suspended=False
        ).count()
        pending_leads = Lead.objects.filter(node=node, status="pending").count()
        subs = Subscription.objects.filter(
            pro__user__node=node, status="active"
        )
        run_rate = sum(
            (99.0 if s.plan == "monthly" else 79.0) for s in subs
        )
        result.append(NodeSummary(
            node_id=node.node_id,
            name=node.name,
            active_pros=active_pros,
            pending_leads=pending_leads,
            monthly_run_rate=run_rate,
            is_active=node.is_active,
        ))
    return result


# ---------------------------------------------------------------------------
# Stripe configuration (gk_admin only)
# ---------------------------------------------------------------------------

class StripeConfigOut(Schema):
    mode: str           # value stored in DB (editable)
    effective_mode: str # what's actually active (may be overridden by STRIPE_MODE env var)
    mode_locked: bool   # True when STRIPE_MODE env var is set, DB value is ignored
    test_price_monthly: str
    test_price_annual: str
    live_price_monthly: str
    live_price_annual: str
    # Which env vars are present on the server (values are never returned)
    test_key_set: bool
    live_key_set: bool
    webhook_secret_set: bool
    updated_at: Optional[str]


class StripeConfigIn(Schema):
    mode: str  # "test" | "live"
    test_price_monthly: str
    test_price_annual: str
    live_price_monthly: str
    live_price_annual: str


class StripeConnectionOut(Schema):
    ok: bool
    mode: str
    account_id: Optional[str]
    account_name: Optional[str]
    error: Optional[str]


def _cfg_out(cfg) -> StripeConfigOut:
    env_mode = os.environ.get("STRIPE_MODE", "").lower()
    mode_locked = env_mode in ("test", "live")
    return StripeConfigOut(
        mode=cfg.mode,
        effective_mode=cfg.effective_mode,
        mode_locked=mode_locked,
        test_price_monthly=cfg.test_price_monthly,
        test_price_annual=cfg.test_price_annual,
        live_price_monthly=cfg.live_price_monthly,
        live_price_annual=cfg.live_price_annual,
        test_key_set=bool(os.environ.get("STRIPE_TEST_SECRET_KEY")),
        live_key_set=bool(os.environ.get("STRIPE_SECRET_KEY")),
        webhook_secret_set=bool(os.environ.get("STRIPE_WEBHOOK_SECRET")),
        updated_at=cfg.updated_at.isoformat() if cfg.updated_at else None,
    )


@router.get("/stripe-config", response=StripeConfigOut)
def get_stripe_config(request):
    require_gk_admin(request)
    return _cfg_out(StripeSettings.get())


@router.put("/stripe-config", response={200: StripeConfigOut, 400: dict})
def update_stripe_config(request, payload: StripeConfigIn):
    require_gk_admin(request)
    if payload.mode not in ("test", "live"):
        return 400, {"detail": "mode must be 'test' or 'live'."}
    cfg = StripeSettings.get()
    cfg.mode = payload.mode
    cfg.test_price_monthly = payload.test_price_monthly.strip()
    cfg.test_price_annual = payload.test_price_annual.strip()
    cfg.live_price_monthly = payload.live_price_monthly.strip()
    cfg.live_price_annual = payload.live_price_annual.strip()
    cfg.updated_by = request.auth
    cfg.save()
    return 200, _cfg_out(cfg)


@router.post("/stripe-config/test-connection", response=StripeConnectionOut)
def test_stripe_connection(request):
    """Ping Stripe with whichever key matches the current mode."""
    require_gk_admin(request)
    cfg = StripeSettings.get()
    secret_env = "STRIPE_SECRET_KEY" if cfg.mode == "live" else "STRIPE_TEST_SECRET_KEY"
    key = os.environ.get(secret_env, "")
    if not key:
        return StripeConnectionOut(
            ok=False,
            mode=cfg.mode,
            account_id=None,
            account_name=None,
            error=f"Environment variable {secret_env} is not set on the server.",
        )
    try:
        stripe.api_key = key
        acct = stripe.Account.retrieve()
        return StripeConnectionOut(
            ok=True,
            mode=cfg.mode,
            account_id=acct.id,
            account_name=acct.get("business_profile", {}).get("name") or acct.get("display_name"),
            error=None,
        )
    except stripe.error.AuthenticationError:
        return StripeConnectionOut(ok=False, mode=cfg.mode, account_id=None, account_name=None, error="Invalid API key.")
    except Exception as exc:
        return StripeConnectionOut(ok=False, mode=cfg.mode, account_id=None, account_name=None, error=str(exc))

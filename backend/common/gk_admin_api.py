"""GigKraft super-admin API — gk_admin role only, cross-node visibility."""
from typing import List

from django.db.models import Count
from ninja import Router, Schema

from accounts.auth import jwt_auth
from accounts.models import ProProfile, User
from billing.models import Subscription
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

    @staticmethod
    def resolve_node_id(obj):
        return obj.node.node_id if obj.node_id else None


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


@router.get("/users", response=List[UserRow])
def list_users(request, role: str = "", search: str = ""):
    require_gk_admin(request)
    qs = User.objects.exclude(role=User.Role.GK_ADMIN).select_related("node")
    if role:
        qs = qs.filter(role=role)
    if search:
        qs = qs.filter(email__icontains=search)
    return list(qs.order_by("role", "email")[:200])


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

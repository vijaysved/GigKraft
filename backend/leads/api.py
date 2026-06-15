"""Lead + chat + quote endpoints (screens 1.9, 1.10, 2.4).

Realtime is polling-based: clients poll the messages endpoint with
`?since=<message id>`."""
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import ProProfile, User
from common import notify
from common.permissions import require_homeowner, require_pro
from leads.models import Lead, Message, Quote
from nodes.models import Node

router = Router(tags=["leads"], auth=jwt_auth)


class ErrorOut(Schema):
    detail: str


class PartyOut(Schema):
    id: int
    name: str
    avatar_url: str


class QuoteLineItem(Schema):
    label: str
    amount: float


class QuoteOut(Schema):
    id: int
    lead_id: int
    line_items: list[QuoteLineItem]
    total: float
    accepted: bool
    is_invoice: bool
    created_at: str


class MessageOut(Schema):
    id: int
    lead_id: int
    sender_id: int
    sender_name: str
    is_mine: bool
    body: str
    image_url: str
    created_at: str


class LeadOut(Schema):
    id: int
    job_title: str
    detail: str
    status: str
    distance_mi: Optional[float]
    respond_by: Optional[str]
    created_at: str
    homeowner: PartyOut
    pro: Optional[PartyOut]
    last_message: Optional[str]
    unread_hint: int
    quotes: list[QuoteOut]


class LeadCreateIn(Schema):
    pro_id: int
    job_title: str
    detail: str = ""


class MessageIn(Schema):
    body: str = ""
    image_url: str = ""


class QuoteIn(Schema):
    line_items: list[QuoteLineItem]
    is_invoice: bool = False


def _party(user: User, avatar_url: str = "") -> dict:
    name = f"{user.first_name} {user.last_name}".strip() or str(user)
    return {"id": user.id, "name": name, "avatar_url": avatar_url}


def serialize_quote(quote: Quote) -> dict:
    return {
        "id": quote.id,
        "lead_id": quote.lead_id,
        "line_items": quote.line_items or [],
        "total": float(quote.total),
        "accepted": quote.accepted,
        "is_invoice": quote.is_invoice,
        "created_at": quote.created_at.isoformat(),
    }


def serialize_lead(lead: Lead, viewer: User) -> dict:
    last = lead.messages.order_by("-created_at").first()
    unread = lead.messages.exclude(sender=viewer).count() if last else 0
    return {
        "id": lead.id,
        "job_title": lead.job_title,
        "detail": lead.detail,
        "status": lead.status,
        "distance_mi": float(lead.distance_mi) if lead.distance_mi else None,
        "respond_by": lead.respond_by.isoformat() if lead.respond_by else None,
        "created_at": lead.created_at.isoformat(),
        "homeowner": _party(
            lead.homeowner,
            getattr(
                getattr(lead.homeowner, "homeowner_profile", None),
                "avatar_url",
                "",
            )
            or "",
        ),
        "pro": _party(lead.pro.user, lead.pro.avatar_url) if lead.pro else None,
        "last_message": (last.body or "[photo]") if last else None,
        "unread_hint": min(unread, 9),
        "quotes": [serialize_quote(q) for q in lead.quotes.all()],
    }


def serialize_message(message: Message, viewer: User) -> dict:
    sender_name = (
        f"{message.sender.first_name} {message.sender.last_name}".strip()
        or str(message.sender)
    )
    return {
        "id": message.id,
        "lead_id": message.lead_id,
        "sender_id": message.sender_id,
        "sender_name": sender_name,
        "is_mine": message.sender_id == viewer.id,
        "body": message.body,
        "image_url": message.image_url,
        "created_at": message.created_at.isoformat(),
    }


def _lead_for_viewer(request, lead_id: int) -> Lead:
    user = request.auth
    lead = (
        Lead.objects.filter(pk=lead_id)
        .select_related("homeowner", "pro", "pro__user")
        .first()
    )
    if lead is None:
        raise HttpError(404, "Lead not found.")
    is_homeowner = lead.homeowner_id == user.id
    is_pro = lead.pro is not None and lead.pro.user_id == user.id
    if not (is_homeowner or is_pro):
        raise HttpError(403, "You are not a participant of this lead.")
    return lead


@router.get("", response=list[LeadOut])
def list_leads(request, status: Optional[str] = None):
    """Role-aware list: pros see their leads, homeowners see theirs."""
    user = request.auth
    if user.role == User.Role.PRO:
        pro = require_pro(request)
        leads = Lead.objects.filter(pro=pro)
    else:
        leads = Lead.objects.filter(homeowner=user)
    if status:
        statuses = [s for s in status.split(",") if s]
        leads = leads.filter(status__in=statuses)
    leads = leads.select_related("homeowner", "pro", "pro__user")
    return [serialize_lead(lead, user) for lead in leads[:100]]


@router.post("", response={201: LeadOut, 400: ErrorOut})
def create_lead(request, payload: LeadCreateIn):
    """Homeowner requests a quote from a pro (screen 2.2 footer).

    Sets respond_by = created_at + pro.response_hours (the SLA timer)."""
    homeowner_profile = require_homeowner(request)
    pro = ProProfile.objects.filter(pk=payload.pro_id).first()
    if pro is None:
        return 400, {"detail": "Unknown pro."}
    node = pro.user.node or request.auth.node or Node.objects.first()
    if node is None:
        return 400, {"detail": "No node available."}
    lead = Lead.objects.create(
        node=node,
        homeowner=request.auth,
        pro=pro,
        job_title=payload.job_title,
        detail=payload.detail,
    )
    lead.set_respond_by()
    lead.save(update_fields=["respond_by"])
    if payload.detail:
        Message.objects.create(lead=lead, sender=request.auth, body=payload.detail)
    notify.notify_user(pro.user, f"New lead: {lead.job_title}")
    return 201, serialize_lead(lead, request.auth)


@router.get("/{lead_id}", response=LeadOut)
def lead_detail(request, lead_id: int):
    lead = _lead_for_viewer(request, lead_id)
    return serialize_lead(lead, request.auth)


@router.get("/{lead_id}/messages", response=list[MessageOut])
def list_messages(request, lead_id: int, since: int = 0):
    """Poll endpoint: pass ?since=<last message id> for increments."""
    lead = _lead_for_viewer(request, lead_id)
    messages = lead.messages.select_related("sender")
    if since:
        messages = messages.filter(id__gt=since)
    return [serialize_message(m, request.auth) for m in messages[:200]]


@router.post("/{lead_id}/messages", response={201: MessageOut, 400: ErrorOut})
def send_message(request, lead_id: int, payload: MessageIn):
    lead = _lead_for_viewer(request, lead_id)
    if not payload.body and not payload.image_url:
        return 400, {"detail": "Message needs a body or an image."}
    message = Message.objects.create(
        lead=lead,
        sender=request.auth,
        body=payload.body,
        image_url=payload.image_url,
    )
    # First pro response stops the SLA clock.
    if (
        lead.pro is not None
        and lead.pro.user_id == request.auth.id
        and lead.first_response_at is None
    ):
        lead.first_response_at = timezone.now()
        lead.save(update_fields=["first_response_at"])
    return 201, serialize_message(message, request.auth)


@router.post("/{lead_id}/quotes", response={201: QuoteOut, 400: ErrorOut})
def send_quote(request, lead_id: int, payload: QuoteIn):
    """Pro sends a quote (or invoice) into the chat (screen 1.10)."""
    require_pro(request)
    lead = _lead_for_viewer(request, lead_id)
    if not payload.line_items:
        return 400, {"detail": "A quote needs at least one line item."}
    total = sum(item.amount for item in payload.line_items)
    quote = Quote.objects.create(
        lead=lead,
        line_items=[item.dict() for item in payload.line_items],
        total=total,
        is_invoice=payload.is_invoice,
    )
    if not payload.is_invoice and lead.status == Lead.Status.ACTIVE:
        lead.status = Lead.Status.QUOTED
        lead.save(update_fields=["status"])
    label = "invoice" if payload.is_invoice else "quote"
    Message.objects.create(
        lead=lead,
        sender=request.auth,
        body=f"[{label}] total ${total:,.2f}",
    )
    notify.notify_user(lead.homeowner, f"New {label} on '{lead.job_title}'")
    return 201, serialize_quote(quote)


@router.post("/quotes/{quote_id}/accept", response={200: QuoteOut, 404: ErrorOut})
def accept_quote(request, quote_id: int):
    """Homeowner accepts a quote (screen 2.4)."""
    require_homeowner(request)
    quote = Quote.objects.filter(pk=quote_id).select_related("lead").first()
    if quote is None or quote.lead.homeowner_id != request.auth.id:
        return 404, {"detail": "Quote not found."}
    quote.accepted = True
    quote.save(update_fields=["accepted"])
    lead = quote.lead
    if lead.status in (Lead.Status.ACTIVE, Lead.Status.QUOTED):
        lead.status = Lead.Status.SCHEDULED
        lead.save(update_fields=["status"])
    if lead.pro:
        notify.notify_user(lead.pro.user, f"Quote accepted on '{lead.job_title}'")
    return 200, serialize_quote(quote)


@router.post("/{lead_id}/complete", response=LeadOut)
def mark_complete(request, lead_id: int):
    """Pro marks the job complete -> lead won (screen 1.10 quick action)."""
    require_pro(request)
    lead = _lead_for_viewer(request, lead_id)
    lead.status = Lead.Status.WON
    lead.completed_at = timezone.now()
    lead.save(update_fields=["status", "completed_at"])
    notify.notify_user(lead.homeowner, f"'{lead.job_title}' was marked complete.")
    return serialize_lead(lead, request.auth)


@router.post("/{lead_id}/archive", response=LeadOut)
def archive_lead(request, lead_id: int):
    lead = _lead_for_viewer(request, lead_id)
    lead.status = Lead.Status.ARCHIVED
    lead.save(update_fields=["status"])
    return serialize_lead(lead, request.auth)

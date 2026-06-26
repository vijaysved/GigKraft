"""Lead + chat + quote endpoints.

Realtime is polling-based: clients poll the messages endpoint with
`?since=<message id>`.

Thread types:
  lead    — homeowner-initiated quote request (default)
  chat    — peer-to-peer networking / general message
  request — unsolicited: HO typed handle directly, no prior contact

Abuse controls enforced here:
  § Global lead cap  — HO may have at most 3 active unaccepted leads at once.
  § Single-message lock — In a `lead` thread, the HO may not send follow-up
    messages until the PRO has responded (first_response_at is set).
  § Receipt quarantine — `request` threads: request_accepted=False is exposed
    to the frontend; read-receipt display is suppressed client-side.
"""
from typing import Optional

from django.utils import timezone
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.models import HomeownerProfile, ProProfile, User
from common import notify
from common.permissions import require_homeowner, require_pro
from leads.models import Lead, Message, Quote
from nodes.models import Node
from referrals.models import ReferrerPro

router = Router(tags=["leads"], auth=jwt_auth)
public_router = Router(tags=["leads"])

ACTIVE_LEAD_CAP = 3


class ErrorOut(Schema):
    detail: str


class PartyOut(Schema):
    id: int
    name: str
    avatar_url: str
    role: str


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
    sender_role: str
    is_mine: bool
    body: str
    image_url: str
    created_at: str


class LeadOut(Schema):
    id: int
    job_title: str
    detail: str
    status: str
    thread_type: str
    request_accepted: bool
    distance_mi: Optional[float]
    respond_by: Optional[str]
    created_at: str
    homeowner: PartyOut
    pro: Optional[PartyOut]
    last_message: Optional[str]
    unread_hint: int
    quotes: list[QuoteOut]
    is_connected: bool = False


class LeadCreateIn(Schema):
    pro_id: int
    job_title: str
    detail: str = ""
    thread_type: str = "lead"


class ComposeIn(Schema):
    handle: str
    body: str
    subject: str = "Direct message"


class MessageIn(Schema):
    body: str = ""
    image_url: str = ""


class QuoteIn(Schema):
    line_items: list[QuoteLineItem]
    is_invoice: bool = False


def _party(user: User, avatar_url: str = "") -> dict:
    name = f"{user.first_name} {user.last_name}".strip() or str(user)
    return {
        "id": user.id,
        "name": name,
        "avatar_url": avatar_url,
        "role": user.role,
    }


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


def serialize_lead(lead: Lead, viewer: User, connected_pro_ids: set | None = None) -> dict:
    last = lead.messages.order_by("-created_at").first()
    unread = lead.messages.exclude(sender=viewer).count() if last else 0
    is_connected = True
    if connected_pro_ids is not None:
        pro_user_id = lead.pro.user_id if lead.pro else None
        is_connected = pro_user_id in connected_pro_ids if pro_user_id else False
    return {
        "id": lead.id,
        "job_title": lead.job_title,
        "detail": lead.detail,
        "status": lead.status,
        "thread_type": lead.thread_type,
        "request_accepted": lead.request_accepted,
        "distance_mi": float(lead.distance_mi) if lead.distance_mi else None,
        "respond_by": lead.respond_by.isoformat() if lead.respond_by else None,
        "created_at": lead.created_at.isoformat(),
        "homeowner": _party(
            lead.homeowner,
            getattr(
                getattr(lead.homeowner, "homeowner_profile", None),
                "avatar_url",
                "",
            ) or "",
        ),
        "pro": _party(lead.pro.user, lead.pro.avatar_url) if lead.pro else None,
        "last_message": (last.body or "[photo]") if last else None,
        "unread_hint": min(unread, 9),
        "quotes": [serialize_quote(q) for q in lead.quotes.all()],
        "is_connected": is_connected,
        **_circle_referral_fields(lead),
    }


def _circle_referral_fields(lead: Lead) -> dict:
    try:
        ref = lead.circle_referral
        curator = ref.circle.curator
        return {
            "circle_referral_slug": ref.circle.slug,
            "circle_referral_curator": f"{curator.first_name} {curator.last_name}".strip() or curator.email or "",
        }
    except Exception:
        return {"circle_referral_slug": None, "circle_referral_curator": None}


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
        "sender_role": message.sender.role,
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
    is_admin = user.role in (User.Role.NODE_MANAGER, User.Role.GK_ADMIN)
    if not (is_homeowner or is_pro or is_admin):
        raise HttpError(403, "You are not a participant of this lead.")
    return lead


@router.get("", response=list[LeadOut])
def list_leads(request, status: Optional[str] = None, thread_type: Optional[str] = None, sent: bool = False):
    """Role-aware list: pros see their leads, homeowners/referrers see theirs.

    Pass ?sent=true to see threads initiated by the current user (homeowner slot),
    regardless of role — powers the Sent tab in both inboxes."""
    user = request.auth
    connected_pro_ids: set | None = None
    if user.role == User.Role.GK_ADMIN:
        leads = Lead.objects.all()
    elif user.role == User.Role.NODE_MANAGER:
        leads = Lead.objects.filter(pro__user__node=user.node)
    elif sent:
        leads = Lead.objects.filter(homeowner=user)
    elif user.role == User.Role.PRO:
        pro = require_pro(request)
        leads = Lead.objects.filter(pro=pro)
    elif user.role == User.Role.REFERRER:
        leads = Lead.objects.filter(homeowner=user)
        connected_pro_ids = set(
            ReferrerPro.objects.filter(referrer=user, pro__isnull=False)
            .values_list("pro__user_id", flat=True)
        )
    else:
        leads = Lead.objects.filter(homeowner=user)
    if status:
        statuses = [s for s in status.split(",") if s]
        leads = leads.filter(status__in=statuses)
    if thread_type:
        types = [t for t in thread_type.split(",") if t]
        leads = leads.filter(thread_type__in=types)
    leads = leads.select_related("homeowner", "pro", "pro__user").prefetch_related("quotes", "messages")
    return [serialize_lead(lead, user, connected_pro_ids) for lead in leads[:100]]


@router.post("", response={201: LeadOut, 400: ErrorOut})
def create_lead(request, payload: LeadCreateIn):
    """Any authenticated user can request a quote.

    If the user lacks the homeowner role, it is added to their extra_roles
    so they can track their own requests. Enforces § global lead cap.
    """
    user = request.auth
    if user.role != User.Role.HOMEOWNER and User.Role.HOMEOWNER not in (user.extra_roles or []):
        roles = list(user.extra_roles or [])
        roles.append(User.Role.HOMEOWNER)
        user.extra_roles = roles
        user.save(update_fields=["extra_roles"])
    homeowner_profile, _ = HomeownerProfile.objects.get_or_create(user=user)

    if payload.thread_type not in ("lead", "chat", "request"):
        return 400, {"detail": "Invalid thread_type."}

    # § Global lead cap: max 3 active unaccepted lead threads
    if payload.thread_type == "lead":
        active_count = Lead.objects.filter(
            homeowner=request.auth,
            thread_type="lead",
            status__in=["active", "quoted"],
        ).count()
        if active_count >= ACTIVE_LEAD_CAP:
            return 400, {
                "detail": (
                    f"You already have {ACTIVE_LEAD_CAP} active quote requests. "
                    "Archive or wait for a response on an existing one before sending another."
                )
            }

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
        thread_type=payload.thread_type,
    )
    lead.set_respond_by()
    lead.save(update_fields=["respond_by"])
    if payload.detail:
        Message.objects.create(lead=lead, sender=request.auth, body=payload.detail)
    notify.notify_user(pro.user, f"New {'quote request' if payload.thread_type == 'lead' else 'message'}: {lead.job_title}")
    return 201, serialize_lead(lead, request.auth)


@router.post("/compose", response={201: LeadOut, 400: ErrorOut})
def compose_message(request, payload: ComposeIn):
    """Start a new direct-message chat thread by addressing a pro @handle.

    Any authenticated user (homeowner or pro) can compose. The sender occupies
    the homeowner slot; the addressed pro occupies the pro slot. The thread is
    classified as thread_type='chat' and appears in the receiver's Chats tab.
    Senders can find it in their Sent tab via ?sent=true."""
    handle = payload.handle.lstrip("@").lower().strip()
    if not handle:
        return 400, {"detail": "Handle cannot be empty."}
    pro = ProProfile.objects.filter(handle__iexact=handle).select_related("user").first()
    if pro is None:
        return 400, {"detail": f"No pro found with handle @{handle}."}
    if pro.user == request.auth:
        return 400, {"detail": "You cannot send a message to yourself."}
    node = pro.user.node or request.auth.node or Node.objects.first()
    if node is None:
        return 400, {"detail": "No node available."}
    sender_name = f"{request.auth.first_name} {request.auth.last_name}".strip() or "Someone"
    subject = payload.subject.strip() if payload.subject.strip() else f"Message from {sender_name}"
    lead = Lead.objects.create(
        node=node,
        homeowner=request.auth,
        pro=pro,
        job_title=subject,
        thread_type=Lead.ThreadType.CHAT,
    )
    if payload.body.strip():
        Message.objects.create(lead=lead, sender=request.auth, body=payload.body.strip())
    notify.notify_user(pro.user, f"New message from {sender_name}: {subject}")
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


@router.post("/{lead_id}/messages", response={201: MessageOut, 400: ErrorOut, 423: ErrorOut})
def send_message(request, lead_id: int, payload: MessageIn):
    lead = _lead_for_viewer(request, lead_id)
    user = request.auth
    if not payload.body and not payload.image_url:
        return 400, {"detail": "Message needs a body or an image."}

    is_homeowner = lead.homeowner_id == user.id
    is_pro = lead.pro is not None and lead.pro.user_id == user.id

    # § Single-message lock: HO cannot send a 2nd message in a `lead` thread
    # until the PRO has responded (first_response_at is set).
    if is_homeowner and lead.thread_type == "lead" and lead.first_response_at is None:
        already_sent = lead.messages.filter(sender=user).exists()
        if already_sent:
            return 423, {
                "detail": "Waiting for the pro to respond before you can send another message."
            }

    message = Message.objects.create(
        lead=lead,
        sender=user,
        body=payload.body,
        image_url=payload.image_url,
    )
    # First pro response stops the SLA clock and lifts the HO lock.
    if is_pro and lead.first_response_at is None:
        lead.first_response_at = timezone.now()
        lead.save(update_fields=["first_response_at"])
    return 201, serialize_message(message, request.auth)


@router.post("/{lead_id}/accept-request", response={200: LeadOut, 400: ErrorOut})
def accept_request(request, lead_id: int):
    """PRO accepts a thread classified as `request`, moving it to active chat.

    Until accepted: sender does not receive read receipts (enforced client-side).
    """
    require_pro(request)
    lead = _lead_for_viewer(request, lead_id)
    if lead.thread_type != "request":
        return 400, {"detail": "Only 'request' threads can be accepted."}
    lead.request_accepted = True
    lead.save(update_fields=["request_accepted"])
    notify.notify_user(lead.homeowner, f"Your message to {lead.pro.user.first_name or 'the pro'} was accepted.")
    return 200, serialize_lead(lead, request.auth)


@router.post("/{lead_id}/quotes", response={201: QuoteOut, 400: ErrorOut})
def send_quote(request, lead_id: int, payload: QuoteIn):
    """Pro sends a quote (or invoice) into the chat."""
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
    """Homeowner accepts a quote."""
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
    """Pro marks the job complete."""
    require_pro(request)
    lead = _lead_for_viewer(request, lead_id)
    lead.status = Lead.Status.WON
    lead.completed_at = timezone.now()
    lead.save(update_fields=["status", "completed_at"])
    notify.notify_user(lead.homeowner, f"'{lead.job_title}' was marked complete.")
    return serialize_lead(lead, request.auth)


# ── Public: anonymous quote request (no account required) ─────────────────────

class AnonLeadIn(Schema):
    pro_id: int
    job_title: str
    detail: str = ""


class AnonLeadOut(Schema):
    id: int
    status: str


@public_router.post("/anonymous", response={201: AnonLeadOut, 400: ErrorOut}, auth=None)
def create_anonymous_lead(request, payload: AnonLeadIn):
    """Submit a quote request without signing in.

    The lead is attributed to a sentinel 'anonymous@gigkraft.internal' user so
    it appears in the PRO's inbox labelled 'Anonymous'. The anon user can later
    claim the conversation by signing up and linking via the lead ID."""
    pro = ProProfile.objects.filter(pk=payload.pro_id).first()
    if pro is None:
        return 400, {"detail": "Unknown pro."}

    anon_user, _ = User.objects.get_or_create(
        email="anonymous@gigkraft.internal",
        defaults={
            "first_name": "Anonymous",
            "role": User.Role.HOMEOWNER,
            "is_active": True,
        },
    )

    node = pro.user.node or Node.objects.filter(is_active=True).first()
    if node is None:
        return 400, {"detail": "No node available."}

    lead = Lead.objects.create(
        node=node,
        homeowner=anon_user,
        pro=pro,
        job_title=payload.job_title,
        detail=payload.detail,
        thread_type=Lead.ThreadType.LEAD,
    )
    lead.set_respond_by()
    lead.save(update_fields=["respond_by"])
    if payload.detail:
        Message.objects.create(lead=lead, sender=anon_user, body=payload.detail)
    notify.notify_user(pro.user, f"Anonymous quote request: {lead.job_title}")
    return 201, {"id": lead.id, "status": lead.status}


@router.post("/{lead_id}/archive", response=LeadOut)
def archive_lead(request, lead_id: int):
    lead = _lead_for_viewer(request, lead_id)
    lead.status = Lead.Status.ARCHIVED
    lead.save(update_fields=["status"])
    return serialize_lead(lead, request.auth)


@router.post("/{lead_id}/claim", response={200: LeadOut, 400: ErrorOut, 403: ErrorOut})
def claim_anonymous_lead(request, lead_id: int):
    """Reassign an anonymous lead to the authenticated user who just signed up.

    Only works when the lead's homeowner is anonymous@gigkraft.internal.
    Called after a visitor completes signup following an anonymous quote submission."""
    lead = (
        Lead.objects.filter(pk=lead_id)
        .select_related("homeowner", "pro", "pro__user")
        .first()
    )
    if lead is None:
        return 400, {"detail": "Lead not found."}
    if lead.homeowner.email != "anonymous@gigkraft.internal":
        return 403, {"detail": "This lead has already been claimed or cannot be claimed."}
    lead.homeowner = request.auth
    lead.save(update_fields=["homeowner"])
    notify.notify_user(lead.pro.user, f"Quote request confirmed: {lead.job_title}") if lead.pro else None
    return 200, serialize_lead(lead, request.auth)

"""Feedback API — submit, list, and reply to user feedback tickets."""
from typing import Optional

from ninja import Router, Schema
from ninja.errors import HttpError
from ninja.security import HttpBearer

from accounts.auth import jwt_auth
from accounts.models import User
from feedback.models import Feedback, FeedbackReply


class OptionalJWTAuth(HttpBearer):
    """Accepts a valid JWT but also allows unauthenticated requests.

    Ninja 401s when an auth callback returns a falsy value, so anonymous/
    invalid-token requests must return `True` (not None) to get through —
    submit_feedback() below distinguishes the real user from this sentinel
    via `isinstance(request.auth, bool)`.
    """

    def __call__(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return True
        return super().__call__(request)

    def authenticate(self, request, token):
        from accounts import tokens as tk

        payload = tk.decode_token(token, expected_type=tk.ACCESS)
        if payload is None:
            return True
        try:
            user = User.objects.get(pk=payload["sub"], is_active=True)
            request.user = user
            return user
        except (User.DoesNotExist, ValueError):
            return True


optional_jwt = OptionalJWTAuth()

# Public router — optional auth (anon or logged-in can submit)
public_router = Router(tags=["feedback"], auth=optional_jwt)
# Protected router — must be authenticated
router = Router(tags=["feedback"], auth=jwt_auth)


class ErrorOut(Schema):
    detail: str


class FeedbackIn(Schema):
    text: str
    page_url: str = ""


class ReplyOut(Schema):
    id: int
    text: str
    author_name: str
    created_at: str


class FeedbackOut(Schema):
    id: int
    ticket_number: str
    text: str
    page_url: str
    status: str
    submitter: Optional[str]
    created_at: str
    replies: list[ReplyOut]


class ReplyIn(Schema):
    text: str


class StatusIn(Schema):
    status: str


def _serialize_reply(reply: FeedbackReply) -> dict:
    name = f"{reply.author.first_name} {reply.author.last_name}".strip() or str(reply.author)
    return {
        "id": reply.id,
        "text": reply.text,
        "author_name": name,
        "created_at": reply.created_at.isoformat(),
    }


def _serialize_feedback(fb: Feedback) -> dict:
    submitter = None
    if fb.user:
        submitter = (
            f"{fb.user.first_name} {fb.user.last_name}".strip()
            or fb.user.email
            or fb.user.phone
            or f"user #{fb.user.id}"
        )
    return {
        "id": fb.id,
        "ticket_number": fb.ticket_number,
        "text": fb.text,
        "page_url": fb.page_url,
        "status": fb.status,
        "submitter": submitter,
        "created_at": fb.created_at.isoformat(),
        "replies": [_serialize_reply(r) for r in fb.replies.all()],
    }


@public_router.post("", response={201: FeedbackOut}, auth=optional_jwt)
def submit_feedback(request, payload: FeedbackIn):
    """Submit feedback — works for both anonymous and authenticated users."""
    user = request.auth if request.auth and not isinstance(request.auth, bool) else None
    fb = Feedback.objects.create(
        text=payload.text.strip(),
        page_url=payload.page_url,
        user=user,
    )
    return 201, _serialize_feedback(fb)


@router.get("/mine", response=list[FeedbackOut])
def my_feedback(request):
    """Return all feedback submitted by the authenticated user."""
    fbs = Feedback.objects.filter(user=request.auth).prefetch_related("replies__author")
    return [_serialize_feedback(fb) for fb in fbs]


@public_router.get("", response=list[FeedbackOut], auth=jwt_auth)
def list_feedback(request, status: Optional[str] = None):
    """List all feedback — gk_admin only."""
    if request.auth.role != User.Role.GK_ADMIN:
        raise HttpError(403, "GK Admin access required.")
    fbs = Feedback.objects.prefetch_related("replies__author").select_related("user")
    if status:
        fbs = fbs.filter(status=status)
    return [_serialize_feedback(fb) for fb in fbs[:500]]


@router.post("/{feedback_id}/reply", response={201: FeedbackOut, 404: ErrorOut})
def reply_to_feedback(request, feedback_id: int, payload: ReplyIn):
    """Add a reply to a feedback ticket — gk_admin only."""
    if request.auth.role != User.Role.GK_ADMIN:
        raise HttpError(403, "GK Admin access required.")
    fb = Feedback.objects.filter(pk=feedback_id).prefetch_related("replies__author").select_related("user").first()
    if fb is None:
        return 404, {"detail": "Feedback not found."}
    FeedbackReply.objects.create(feedback=fb, text=payload.text.strip(), author=request.auth)
    fb.refresh_from_db()
    return 201, _serialize_feedback(
        Feedback.objects.filter(pk=feedback_id).prefetch_related("replies__author").select_related("user").first()
    )


@router.patch("/{feedback_id}/status", response={200: FeedbackOut, 404: ErrorOut})
def update_status(request, feedback_id: int, payload: StatusIn):
    """Mark a feedback ticket open or resolved — gk_admin only."""
    if request.auth.role != User.Role.GK_ADMIN:
        raise HttpError(403, "GK Admin access required.")
    if payload.status not in (Feedback.Status.OPEN, Feedback.Status.RESOLVED):
        raise HttpError(400, "Invalid status.")
    fb = Feedback.objects.filter(pk=feedback_id).prefetch_related("replies__author").select_related("user").first()
    if fb is None:
        return 404, {"detail": "Feedback not found."}
    fb.status = payload.status
    fb.save(update_fields=["status"])
    return 200, _serialize_feedback(fb)

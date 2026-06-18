"""Kraft endpoints: create/publish (1.6), discovery feed (2.1) and admin
verification (3.5). Publishing requires ≥1 photo and sets status VERIFIED
directly so the Kraft appears on the pro's public profile immediately."""
from typing import Optional

from django.db import transaction
from ninja import Router, Schema
from ninja.errors import HttpError

from accounts.auth import jwt_auth
from accounts.pros_api import ProOut, serialize_pro
from common import notify
from common.permissions import require_node_manager, require_pro
from krafts.models import Kraft, KraftPhoto
from nodes.models import Node

router = Router(tags=["krafts"], auth=jwt_auth)
public_router = Router(tags=["krafts"])


class ErrorOut(Schema):
    detail: str


class KraftPhotoIn(Schema):
    kind: str   # before | after
    image_url: str
    order: int = 0


class KraftPhotoOut(Schema):
    id: int
    kind: str
    image_url: str
    order: int


class KraftIn(Schema):
    title: str
    description: str = ""
    skill: str = ""
    gig_type: str = ""
    location: str = ""
    start_month: Optional[int] = None
    start_year: Optional[int] = None
    end_month: Optional[int] = None
    end_year: Optional[int] = None
    photos: list[KraftPhotoIn] = []


class KraftUpdateIn(Schema):
    title: Optional[str] = None
    description: Optional[str] = None
    skill: Optional[str] = None
    gig_type: Optional[str] = None
    location: Optional[str] = None
    start_month: Optional[int] = None
    start_year: Optional[int] = None
    end_month: Optional[int] = None
    end_year: Optional[int] = None
    photos: Optional[list[KraftPhotoIn]] = None


class RejectIn(Schema):
    note: str = ""


class KraftOut(Schema):
    id: int
    slug: str
    title: str
    description: str
    skill: str
    gig_type: str
    location: str
    start_month: Optional[int]
    start_year: Optional[int]
    end_month: Optional[int]
    end_year: Optional[int]
    status: str
    review_note: str
    has_after: bool
    invoice_confirmed: bool
    invoice_cost: Optional[float]
    photos: list[KraftPhotoOut]
    created_at: str
    pro: ProOut


def serialize_kraft(kraft: Kraft) -> dict:
    return {
        "id": kraft.id,
        "slug": kraft.slug,
        "title": kraft.title,
        "description": kraft.description,
        "skill": kraft.skill,
        "gig_type": kraft.gig_type,
        "location": kraft.location,
        "start_month": kraft.start_month,
        "start_year": kraft.start_year,
        "end_month": kraft.end_month,
        "end_year": kraft.end_year,
        "status": kraft.status,
        "review_note": kraft.review_note,
        "has_after": kraft.has_after,
        "invoice_confirmed": kraft.invoice_confirmed,
        "invoice_cost": float(kraft.invoice_cost) if kraft.invoice_cost is not None else None,
        "photos": [
            {"id": p.id, "kind": p.kind, "image_url": p.image_url, "order": p.order}
            for p in kraft.photos.all()
        ],
        "created_at": kraft.created_at.isoformat(),
        "pro": serialize_pro(kraft.pro),
    }


def _validate_photo_kinds(photos: list[KraftPhotoIn]):
    for photo in photos:
        if photo.kind not in (KraftPhoto.Kind.BEFORE, KraftPhoto.Kind.AFTER):
            raise HttpError(400, "Photo kind must be 'before' or 'after'.")


def _replace_photos(kraft: Kraft, photos: list[KraftPhotoIn]):
    kraft.photos.all().delete()
    for p in photos:
        KraftPhoto.objects.create(
            kraft=kraft, kind=p.kind, image_url=p.image_url, order=p.order
        )


@router.post("", response={201: KraftOut, 400: ErrorOut})
def create_kraft(request, payload: KraftIn):
    pro = require_pro(request)
    node = pro.user.node or Node.objects.filter(is_active=True).first()
    if node is None:
        return 400, {"detail": "No active node available."}
    _validate_photo_kinds(payload.photos)
    kraft = Kraft.objects.create(
        pro=pro, node=node,
        title=payload.title,
        description=payload.description,
        skill=payload.skill,
        gig_type=payload.gig_type,
        location=payload.location,
        start_month=payload.start_month,
        start_year=payload.start_year,
        end_month=payload.end_month,
        end_year=payload.end_year,
    )
    for photo in payload.photos:
        KraftPhoto.objects.create(
            kraft=kraft, kind=photo.kind, image_url=photo.image_url, order=photo.order
        )
    return 201, serialize_kraft(kraft)


@router.get("", response=list[KraftOut])
def list_krafts(
    request,
    status: Optional[str] = None,
    node: Optional[str] = None,
    mine: bool = False,
    trade: Optional[str] = None,
    q: Optional[str] = None,
):
    krafts = Kraft.objects.select_related("pro", "pro__user", "pro__user__node")
    if mine:
        pro = require_pro(request)
        krafts = krafts.filter(pro=pro)
    elif status:
        krafts = krafts.filter(status=status)
    else:
        krafts = krafts.filter(status=Kraft.Status.VERIFIED)
    if node:
        krafts = krafts.filter(node__node_id=node)
    if trade:
        krafts = krafts.filter(pro__primary_trade__iexact=trade)
    if q:
        krafts = krafts.filter(title__icontains=q)
    return [serialize_kraft(k) for k in krafts[:50]]


@router.get("/slug/{slug}", response={200: KraftOut, 404: ErrorOut})
def kraft_detail_by_slug(request, slug: str):
    kraft = Kraft.objects.filter(slug=slug).first()
    if kraft is None:
        return 404, {"detail": "Kraft not found."}
    return 200, serialize_kraft(kraft)


@router.get("/{kraft_id}", response={200: KraftOut, 404: ErrorOut})
def kraft_detail(request, kraft_id: int):
    kraft = Kraft.objects.filter(pk=kraft_id).first()
    if kraft is None:
        return 404, {"detail": "Kraft not found."}
    return 200, serialize_kraft(kraft)


@router.patch("/{kraft_id}", response={200: KraftOut, 400: ErrorOut, 404: ErrorOut})
def update_kraft(request, kraft_id: int, payload: KraftUpdateIn):
    pro = require_pro(request)
    kraft = Kraft.objects.filter(pk=kraft_id, pro=pro).first()
    if kraft is None:
        return 404, {"detail": "Kraft not found."}
    data = payload.dict(exclude_unset=True)
    photos = data.pop("photos", None)
    for field, value in data.items():
        setattr(kraft, field, value)
    kraft.save()
    if photos is not None:
        _validate_photo_kinds(payload.photos or [])
        _replace_photos(kraft, payload.photos or [])
    return 200, serialize_kraft(kraft)


@router.post("/{kraft_id}/publish", response={200: KraftOut, 400: ErrorOut, 404: ErrorOut})
def publish_kraft(request, kraft_id: int):
    """Publish the Kraft. Requires ≥1 After photo. Sets status VERIFIED so it appears on the public profile immediately."""
    pro = require_pro(request)
    kraft = Kraft.objects.filter(pk=kraft_id, pro=pro).first()
    if kraft is None:
        return 404, {"detail": "Kraft not found."}
    errors = kraft.proof_errors()
    if errors:
        return 400, {"detail": " ".join(errors)}
    with transaction.atomic():
        kraft.status = Kraft.Status.VERIFIED
        kraft.review_note = ""
        kraft.save()
        if not kraft.pro.is_verified:
            kraft.pro.is_verified = True
            kraft.pro.save(update_fields=["is_verified"])
    return 200, serialize_kraft(kraft)


@router.post("/{kraft_id}/verify", response={200: KraftOut, 400: ErrorOut, 404: ErrorOut})
def verify_kraft(request, kraft_id: int):
    require_node_manager(request)
    kraft = Kraft.objects.filter(pk=kraft_id).first()
    if kraft is None:
        return 404, {"detail": "Kraft not found."}
    errors = kraft.proof_errors()
    if errors:
        return 400, {"detail": "Proof incomplete: " + " ".join(errors)}
    with transaction.atomic():
        kraft.status = Kraft.Status.VERIFIED
        kraft.full_clean()
        kraft.save()
        if not kraft.pro.is_verified:
            kraft.pro.is_verified = True
            kraft.pro.save(update_fields=["is_verified"])
    notify.notify_user(kraft.pro.user, f"Your Kraft '{kraft.title}' was verified.")
    return 200, serialize_kraft(kraft)


@router.post("/{kraft_id}/reject", response={200: KraftOut, 404: ErrorOut})
def reject_kraft(request, kraft_id: int, payload: RejectIn):
    require_node_manager(request)
    kraft = Kraft.objects.filter(pk=kraft_id).first()
    if kraft is None:
        return 404, {"detail": "Kraft not found."}
    kraft.status = Kraft.Status.REJECTED
    kraft.review_note = payload.note
    kraft.save()
    notify.notify_user(
        kraft.pro.user,
        f"Your Kraft '{kraft.title}' was rejected. {payload.note}".strip(),
    )
    return 200, serialize_kraft(kraft)


# ── Public: list verified Krafts for a given pro (no auth required) ───────────

class KraftPublicOut(Schema):
    id: int
    title: str
    description: str
    skill: str
    gig_type: str
    location: str
    start_month: Optional[int]
    start_year: Optional[int]
    end_month: Optional[int]
    end_year: Optional[int]
    before_url: Optional[str]
    after_url: Optional[str]


def serialize_kraft_public(kraft: Kraft) -> dict:
    before = kraft.photos.filter(kind=KraftPhoto.Kind.BEFORE).first()
    after  = kraft.photos.filter(kind=KraftPhoto.Kind.AFTER).first()
    return {
        "id": kraft.id,
        "title": kraft.title,
        "description": kraft.description,
        "skill": kraft.skill,
        "gig_type": kraft.gig_type,
        "location": kraft.location,
        "start_month": kraft.start_month,
        "start_year": kraft.start_year,
        "end_month": kraft.end_month,
        "end_year": kraft.end_year,
        "before_url": before.image_url if before else None,
        "after_url": after.image_url if after else None,
    }


@public_router.get("/by-pro/{pro_id}", response=list[KraftPublicOut], auth=None)
def krafts_by_pro(request, pro_id: int):
    """Public: return the verified Krafts for a pro (shown on public profile)."""
    krafts = (
        Kraft.objects
        .filter(pro_id=pro_id, status=Kraft.Status.VERIFIED)
        .prefetch_related("photos")
        .order_by("-created_at")[:12]
    )
    return [serialize_kraft_public(k) for k in krafts]

from django.shortcuts import get_object_or_404
from ninja import Router, Schema

from accounts.auth import jwt_auth
from accounts.models import FavoritePro, ProProfile

router = Router(tags=["favorites"], auth=jwt_auth)


class FavoritesOut(Schema):
    pro_ids: list[int]


class SyncIn(Schema):
    pro_ids: list[int]


class ToggleOut(Schema):
    favorited: bool
    pro_ids: list[int]


@router.get("/pros", response=FavoritesOut)
def get_favorites(request):
    ids = list(
        FavoritePro.objects.filter(user=request.user).values_list("pro_id", flat=True)
    )
    return {"pro_ids": ids}


@router.post("/pros/sync", response=FavoritesOut)
def sync_favorites(request, payload: SyncIn):
    """Merge local-storage favorites into the server's list and return the union."""
    if payload.pro_ids:
        valid_ids = set(
            ProProfile.objects.filter(id__in=payload.pro_ids).values_list("id", flat=True)
        )
        existing = set(
            FavoritePro.objects.filter(user=request.user).values_list("pro_id", flat=True)
        )
        new_ids = valid_ids - existing
        if new_ids:
            FavoritePro.objects.bulk_create(
                [FavoritePro(user=request.user, pro_id=pid) for pid in new_ids],
                ignore_conflicts=True,
            )
    all_ids = list(
        FavoritePro.objects.filter(user=request.user).values_list("pro_id", flat=True)
    )
    return {"pro_ids": all_ids}


@router.post("/pros/{pro_id}/toggle", response=ToggleOut)
def toggle_favorite(request, pro_id: int):
    pro = get_object_or_404(ProProfile, id=pro_id)
    fav, created = FavoritePro.objects.get_or_create(user=request.user, pro=pro)
    if not created:
        fav.delete()
        favorited = False
    else:
        favorited = True
    all_ids = list(
        FavoritePro.objects.filter(user=request.user).values_list("pro_id", flat=True)
    )
    return {"favorited": favorited, "pro_ids": all_ids}

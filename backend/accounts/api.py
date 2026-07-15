import uuid
from pathlib import Path
from typing import Optional

from django.conf import settings
from django.contrib.auth import get_user_model
from ninja import File, Router, Schema
from ninja.files import UploadedFile

from accounts import services, tokens
from accounts.auth import jwt_auth
from accounts.models import User
from accounts.schemas import (
    AccessTokenOut,
    ErrorOut,
    GoogleAuthIn,
    LoginIn,
    OTPRequestIn,
    OTPRequestOut,
    OTPVerifyIn,
    RefreshIn,
    RegisterIn,
    TokenPairOut,
    UserOut,
)
from common.phone import normalize_phone
from nodes.models import Node

_ALLOWED_IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
_AVATARS_SUBDIR = "avatars"

router = Router(tags=["auth"])
me_router = Router(tags=["me"])


def _token_response(user, created=False):
    pair = tokens.create_token_pair(user)
    return {"access": pair["access"], "refresh": pair["refresh"], "user": user, "created": created}


@router.post(
    "/register", response={201: TokenPairOut, 400: ErrorOut}, auth=None
)
def register(request, payload: RegisterIn):
    """Email/password registration (any role; primary path for node managers)."""
    if User.objects.filter(email=payload.email.lower()).exists():
        return 400, {"detail": "A user with this email already exists."}
    node = None
    if payload.node_id:
        node = Node.objects.filter(node_id=payload.node_id).first()
        if node is None:
            return 400, {"detail": f"Unknown node_id: {payload.node_id}"}
    user = User.objects.create_user(
        email=payload.email.lower(),
        password=payload.password,
        role=payload.role,
        first_name=payload.first_name,
        last_name=payload.last_name,
        node=node,
    )
    services.ensure_role_profile(user)
    return 201, _token_response(user)


@router.post("/login", response={200: TokenPairOut, 401: ErrorOut}, auth=None)
def login(request, payload: LoginIn):
    """Email/password login."""
    User = get_user_model()
    user = User.objects.filter(email=payload.email.lower(), is_active=True).first()
    if user is None or not user.check_password(payload.password):
        return 401, {"detail": "Invalid email or password."}
    return 200, _token_response(user)


@router.post("/refresh", response={200: AccessTokenOut, 401: ErrorOut}, auth=None)
def refresh(request, payload: RefreshIn):
    """Exchange a valid refresh token for a new access token."""
    decoded = tokens.decode_token(payload.refresh, expected_type=tokens.REFRESH)
    if decoded is None:
        return 401, {"detail": "Invalid or expired refresh token."}
    user = User.objects.filter(pk=decoded["sub"], is_active=True).first()
    if user is None:
        return 401, {"detail": "User not found or inactive."}
    return 200, {"access": tokens.create_access_token(user)}


@router.post(
    "/otp/request",
    response={200: OTPRequestOut, 503: ErrorOut},
    auth=None,
)
def otp_request(request, payload: OTPRequestIn):
    """Request a phone OTP (pros/homeowners).

    MOCK (Phase 1): with MOCK_TWILIO=true the code is deterministic and
    returned in `dev_code` so local clients can complete the flow.
    """
    try:
        sent, mock, dev_code = services.request_otp(payload.phone)
    except services.AuthProviderUnavailable as exc:
        return 503, {"detail": str(exc)}
    return 200, {"sent": sent, "mock": mock, "dev_code": dev_code if mock else None}


@router.post(
    "/otp/verify",
    response={200: TokenPairOut, 401: ErrorOut, 503: ErrorOut},
    auth=None,
)
def otp_verify(request, payload: OTPVerifyIn):
    """Verify a phone OTP and sign in (creates the user on first login)."""
    try:
        valid = services.verify_otp(payload.phone, payload.code)
    except services.AuthProviderUnavailable as exc:
        return 503, {"detail": str(exc)}
    if not valid:
        return 401, {"detail": "Invalid OTP code."}
    user = services.get_or_create_phone_user(payload.phone, payload.role)
    return 200, _token_response(user)


@router.post(
    "/google",
    response={200: TokenPairOut, 401: ErrorOut, 503: ErrorOut},
    auth=None,
)
def google_auth(request, payload: GoogleAuthIn):
    """Google Sign-In: verify id_token and return a JWT pair."""
    try:
        email, first_name, last_name, picture_url = services.verify_google_token(payload.id_token)
    except services.AuthProviderUnavailable as exc:
        return 503, {"detail": str(exc)}
    if email is None:
        return 401, {"detail": "Invalid Google id_token."}
    user, created = services.get_or_create_google_user(
        email, role=payload.role, first_name=first_name, last_name=last_name, picture_url=picture_url
    )
    return 200, _token_response(user, created=created)


@me_router.get("/me", response=UserOut, auth=jwt_auth)
def me(request):
    """Return the authenticated user's profile (JWT-protected sample)."""
    return request.auth


class UserPatchIn(Schema):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    theme: Optional[str] = None


@me_router.patch("/me", response={200: UserOut, 400: ErrorOut}, auth=jwt_auth)
def patch_me(request, payload: UserPatchIn):
    """Update the authenticated user's profile fields."""
    user = request.auth
    data = payload.dict(exclude_unset=True)
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    if "theme" in data:
        user.theme = data["theme"] or ""
    if "phone" in data:
        phone = normalize_phone(data["phone"]) or None
        if phone and User.objects.filter(phone=phone).exclude(pk=user.pk).exists():
            return 400, {"detail": "That phone number is already in use."}
        user.phone = phone
    if "role" in data:
        new_role = data["role"]
        if new_role not in (User.Role.PRO, User.Role.HOMEOWNER, User.Role.REFERRER):
            return 400, {"detail": "Role must be pro, homeowner, or referrer."}
        user.role = new_role
        user.save()
        services.ensure_role_profile(user)
    user.save()
    return 200, user


def _save_avatar_file(content: bytes, original_name: str) -> str:
    """Write avatar bytes to MEDIA_ROOT/avatars/ and return the path fragment."""
    suffix = Path(original_name).suffix.lower() or ".jpg"
    if suffix not in _ALLOWED_IMAGE_SUFFIXES:
        suffix = ".jpg"
    filename = f"avatar_{uuid.uuid4().hex}{suffix}"
    dest_dir = Path(settings.MEDIA_ROOT) / _AVATARS_SUBDIR
    dest_dir.mkdir(parents=True, exist_ok=True)
    (dest_dir / filename).write_bytes(content)
    return f"{_AVATARS_SUBDIR}/{filename}"


class AvatarOut(Schema):
    avatar_url: str


class AvatarUrlIn(Schema):
    url: str


@me_router.post("/me/avatar", response=AvatarOut, auth=jwt_auth)
def upload_avatar(request, file: UploadedFile = File(...)):
    """Accept a multipart image upload, save to MEDIA_ROOT, return the public URL."""
    content = file.read()
    path_fragment = _save_avatar_file(content, file.name or "avatar.jpg")
    public_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{path_fragment}")
    services.update_avatar_url(request.auth, public_url)
    return {"avatar_url": public_url}


@me_router.post("/me/avatar-from-url", response=AvatarOut, auth=jwt_auth)
def avatar_from_url(request, payload: AvatarUrlIn):
    """Download an image URL (e.g. Google photo), save to MEDIA_ROOT, return stable URL."""
    import requests as http_req

    src = payload.url.strip()
    if not src.startswith(("http://", "https://")):
        return {"avatar_url": src}
    try:
        resp = http_req.get(src, timeout=8, stream=True)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "")
        if "png" in content_type:
            ext = ".png"
        elif "webp" in content_type:
            ext = ".webp"
        else:
            ext = ".jpg"
        content = resp.content
        path_fragment = _save_avatar_file(content, f"avatar{ext}")
        public_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{path_fragment}")
        services.update_avatar_url(request.auth, public_url)
        return {"avatar_url": public_url}
    except Exception:
        return {"avatar_url": src}

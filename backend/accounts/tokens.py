"""Stateless JWT access/refresh token helpers (PyJWT, HS256)."""
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings

ACCESS = "access"
REFRESH = "refresh"


def _create_token(user, token_type, lifetime):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.pk),
        "role": user.role,
        "type": token_type,
        "iat": now,
        "exp": now + lifetime,
        "jti": uuid.uuid4().hex,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_access_token(user):
    return _create_token(
        user, ACCESS, timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES)
    )


def create_refresh_token(user):
    return _create_token(user, REFRESH, timedelta(days=settings.JWT_REFRESH_TTL_DAYS))


def create_token_pair(user):
    return {
        "access": create_access_token(user),
        "refresh": create_refresh_token(user),
    }


def decode_token(token, expected_type):
    """Decode and validate a token. Returns the payload or None if invalid."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
    except jwt.PyJWTError:
        return None
    if payload.get("type") != expected_type:
        return None
    return payload

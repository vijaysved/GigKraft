"""Django Ninja auth classes for JWT bearer tokens."""
from django.contrib.auth import get_user_model
from ninja.security import HttpBearer

from accounts import tokens


class JWTAuth(HttpBearer):
    """Authenticates requests with `Authorization: Bearer <access token>`."""

    def authenticate(self, request, token):
        payload = tokens.decode_token(token, expected_type=tokens.ACCESS)
        if payload is None:
            return None
        User = get_user_model()
        try:
            user = User.objects.get(pk=payload["sub"], is_active=True)
        except (User.DoesNotExist, ValueError):
            return None
        request.user = user
        return user


jwt_auth = JWTAuth()

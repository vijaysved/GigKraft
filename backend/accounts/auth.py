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


class OptionalJWTAuth(HttpBearer):
    """Accepts a valid JWT but also allows unauthenticated requests.

    Ninja treats a falsy auth-callback return as a hard 401 (see
    Operation._run_authentication), so anonymous/invalid-token requests must
    return a truthy non-User sentinel (`True`) rather than `None` — returning
    `None` here would 401 every anonymous visitor instead of letting them
    through. Callers must check `isinstance(request.auth, User)` rather than
    truthiness to tell a real user apart from the anonymous sentinel.
    """

    def __call__(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith("Bearer "):
            return True
        return super().__call__(request)

    def authenticate(self, request, token):
        payload = tokens.decode_token(token, expected_type=tokens.ACCESS)
        if payload is None:
            return True
        User = get_user_model()
        try:
            user = User.objects.get(pk=payload["sub"], is_active=True)
        except (User.DoesNotExist, ValueError):
            return True
        request.user = user
        return user


jwt_auth = JWTAuth()
optional_jwt = OptionalJWTAuth()

"""Auth provider services. Phase 1: deterministic mocks behind env flags.

MOCK BEHAVIOR (env-controlled):
- MOCK_TWILIO=true  -> OTP code is always settings.MOCK_OTP_CODE (default 123456)
  and the request endpoint echoes it back as `dev_code`.
- MOCK_GOOGLE_OAUTH=true -> id_token must look like "mock-google:<email>";
  the email is extracted from the token deterministically.

When the flags are false, these raise NotImplementedError until the live
integrations land in Phase 2 (Milestone 6).
"""
from django.conf import settings
from django.db import transaction

from accounts.models import HomeownerProfile, ProProfile, User


class AuthProviderUnavailable(Exception):
    """Raised when a live (non-mock) provider is requested but not wired yet."""


def request_otp(phone):
    """Send an OTP to `phone`. Returns (sent, mock, dev_code)."""
    if not settings.MOCK_TWILIO:
        raise AuthProviderUnavailable(
            "Live Twilio OTP is not available until Phase 2; set MOCK_TWILIO=true."
        )
    # MOCK: deterministic code, echoed back for local clients.
    return True, True, settings.MOCK_OTP_CODE


def verify_otp(phone, code):
    """Validate an OTP code for `phone`. Returns True if valid."""
    if not settings.MOCK_TWILIO:
        raise AuthProviderUnavailable(
            "Live Twilio OTP is not available until Phase 2; set MOCK_TWILIO=true."
        )
    # MOCK: only the deterministic code is accepted.
    return code == settings.MOCK_OTP_CODE


def verify_google_token(id_token):
    """Validate a Google id_token and return the account email, or None."""
    if not settings.MOCK_GOOGLE_OAUTH:
        raise AuthProviderUnavailable(
            "Live Google OAuth is not available until Phase 2; "
            "set MOCK_GOOGLE_OAUTH=true."
        )
    # MOCK: deterministic token format "mock-google:<email>".
    prefix = settings.MOCK_GOOGLE_TOKEN_PREFIX
    if not id_token.startswith(prefix):
        return None
    email = id_token[len(prefix):].strip().lower()
    if "@" not in email:
        return None
    return email


def ensure_role_profile(user):
    """Create the role-specific profile row if it does not exist yet."""
    if user.role == User.Role.PRO:
        ProProfile.objects.get_or_create(user=user)
    elif user.role == User.Role.HOMEOWNER:
        HomeownerProfile.objects.get_or_create(user=user)


@transaction.atomic
def get_or_create_phone_user(phone, role):
    user, created = User.objects.get_or_create(
        phone=phone, defaults={"role": role}
    )
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])
    ensure_role_profile(user)
    return user


@transaction.atomic
def get_or_create_google_user(email):
    user, created = User.objects.get_or_create(
        email=email, defaults={"role": User.Role.NODE_MANAGER}
    )
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])
    return user

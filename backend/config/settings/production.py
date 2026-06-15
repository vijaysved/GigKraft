"""Production settings — imported when DJANGO_SETTINGS_MODULE=config.settings.production.

All secrets come from environment variables injected by the platform.
Nothing sensitive is hardcoded here.
"""
from .base import *  # noqa: F401,F403
from .base import SECRET_KEY

# Hard-fail at startup if the secret key is still the insecure default.
if SECRET_KEY == "insecure-local-only-change-me-0123456789abcdef":
    raise RuntimeError(
        "DJANGO_SECRET_KEY environment variable is not set. "
        "Refusing to start in production with the default key."
    )

DEBUG = False

# All traffic must go through HTTPS.
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

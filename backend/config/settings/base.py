"""Base settings shared by all environments.

Environment variables are loaded from backend/.env for local dev.
In production, the platform (Railway / GCP / AWS) injects them directly —
no .env file is present and load_dotenv() is a no-op.

Required production env vars:
  DJANGO_SECRET_KEY        — long random string, never commit this
  DJANGO_DEBUG             — set to "False" in production
  DJANGO_ALLOWED_HOSTS     — comma-separated hostnames, e.g. "api.gigkraft.com"
  DATABASE_URL             — full Postgres connection string injected by the platform
  CORS_ALLOWED_ORIGINS     — comma-separated frontend origins
"""
import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# load_dotenv is a no-op when the file doesn't exist (production).
load_dotenv(BASE_DIR / ".env")


def env_bool(name, default=False):
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "insecure-local-only-change-me-0123456789abcdef",  # overridden in production
)
DEBUG = os.environ.get("DJANGO_DEBUG", "False") == "True"
ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,10.0.2.2,.up.railway.app").split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # GigKraft apps
    "common",
    "accounts",
    "nodes",
    "krafts",
    "leads",
    "emergencies",
    "recommendations",
    "billing",
    "vendors",
    "comms",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database: platform injects DATABASE_URL in production.
# SQLite fallback is only used locally when no DATABASE_URL is set.
# ssl_require=False: Railway terminates SSL at the proxy layer; psycopg3[binary]
# ignores PGSSLMODE env vars so we disable SSL via OPTIONS instead.
_db = dj_database_url.config(
    default=os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
    conn_max_age=600,
    ssl_require=False,
)
if _db.get("ENGINE", "").endswith("postgresql"):
    _db.setdefault("OPTIONS", {})["sslmode"] = "disable"
DATABASES = {"default": _db}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- JWT ---
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TTL_MINUTES = int(os.environ.get("JWT_ACCESS_TTL_MINUTES", "15"))
JWT_REFRESH_TTL_DAYS = int(os.environ.get("JWT_REFRESH_TTL_DAYS", "14"))

# --- Integration mock flags (Phase 1: everything mocked) ---
MOCK_TWILIO = env_bool("MOCK_TWILIO", default=True)
MOCK_STRIPE = env_bool("MOCK_STRIPE", default=True)
MOCK_S3 = env_bool("MOCK_S3", default=True)
MOCK_FCM = env_bool("MOCK_FCM", default=True)
MOCK_WHATSAPP = env_bool("MOCK_WHATSAPP", default=True)
MOCK_RESEND = env_bool("MOCK_RESEND", default=True)

# --- Resend (email) ---
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
# When set, all outbound emails are redirected to this address (local dev only).
DEV_EMAIL_TO = os.environ.get("DEV_EMAIL_TO", "")

# Deterministic OTP code used when MOCK_TWILIO=true. Never used in live mode.
MOCK_OTP_CODE = os.environ.get("MOCK_OTP_CODE", "123456")

# --- Google OAuth ---
# Dev:  set in backend/.env  (your local dev OAuth client)
# Prod: set in Railway env vars (prod OAuth client with gigkraft.com origin)
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

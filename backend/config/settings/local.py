"""Local development settings."""
from .base import *  # noqa: F401,F403

DEBUG = True

# Longer token lifetimes for local dev — avoids 401s during normal use
JWT_ACCESS_TTL_MINUTES  = 60 * 24       # 24 hours
JWT_REFRESH_TTL_DAYS    = 30            # 30 days

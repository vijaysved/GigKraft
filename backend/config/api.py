"""Root NinjaAPI instance.

Docs live at /api/docs, OpenAPI JSON at /api/openapi.json.
Use `python manage.py export_openapi` to write the schema to disk for
frontend/mobile typed client generation.
"""
from ninja import NinjaAPI

from accounts.api import me_router, router as auth_router
from accounts.home_api import prefs_router, router as home_router
from accounts.pros_api import public_router as pros_public_router
from accounts.pros_api import router as pros_router
from billing.api import router as billing_router
from vendors.api import public_router as vendors_public_router
from vendors.api import router as vendors_router
from comms.api import router as comms_router
from common.api import router as common_router
from common.gk_admin_api import router as gk_admin_router
from emergencies.api import router as emergencies_router
from krafts.api import public_router as krafts_public_router
from krafts.api import router as krafts_router
from leads.api import router as leads_router
from nodes.admin_api import router as admin_router
from recommendations.api import public_router as recommendations_public_router
from recommendations.api import router as recommendations_router

api = NinjaAPI(
    title="GigKraft API",
    version="0.2.0",
    description="GigKraft backend API (MVP, Phase 1: integrations mocked).",
)

api.add_router("", common_router)
api.add_router("/auth", auth_router)
api.add_router("", me_router)
api.add_router("/me", prefs_router)
api.add_router("/pros", pros_router)
api.add_router("/pros", pros_public_router)
api.add_router("/krafts", krafts_router)
api.add_router("/krafts", krafts_public_router)
api.add_router("/leads", leads_router)
api.add_router("/emergencies", emergencies_router)
api.add_router("/recommendations", recommendations_router)
api.add_router("/recommendations", recommendations_public_router)
api.add_router("/home", home_router)
api.add_router("/admin", admin_router)
api.add_router("/billing", billing_router)
api.add_router("/gk-admin", gk_admin_router)
api.add_router("/vendors", vendors_router)
api.add_router("/vendors", vendors_public_router)
api.add_router("/comms", comms_router)

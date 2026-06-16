from django.conf import settings
from ninja import Router, Schema

router = Router(tags=["system"])


class HealthOut(Schema):
    status: str
    debug: bool
    mocks: dict
    google_client_id_set: bool


@router.get("/health", response=HealthOut, auth=None)
def health(request):
    """Liveness check; also reports which integrations are mocked."""
    return {
        "status": "ok",
        "debug": settings.DEBUG,
        "mocks": {
            "twilio": settings.MOCK_TWILIO,
            "stripe": settings.MOCK_STRIPE,
            "s3": settings.MOCK_S3,
            "fcm": settings.MOCK_FCM,
            "whatsapp": settings.MOCK_WHATSAPP,
        },
        "google_client_id_set": bool(settings.GOOGLE_CLIENT_ID),
    }

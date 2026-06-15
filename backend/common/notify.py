"""Mock outbound notifications (Phase 1).

MOCK: with MOCK_TWILIO / MOCK_WHATSAPP enabled (the default), messages are
logged to the console only. No real Twilio or WhatsApp API call is made.
DB persistence of dispatches happens in the caller (BroadcastDispatch rows).
"""
import logging

logger = logging.getLogger("gigkraft.notify")


def send_sms(to: str, body: str) -> None:
    logger.info("[MOCK SMS] to=%s body=%s", to or "<no phone>", body)


def send_whatsapp(to: str, body: str) -> None:
    logger.info("[MOCK WHATSAPP] to=%s body=%s", to or "<no phone>", body)


def notify_user(user, body: str) -> None:
    """Generic mock notification to a user (console only)."""
    logger.info("[MOCK NOTIFY] user=%s body=%s", user, body)

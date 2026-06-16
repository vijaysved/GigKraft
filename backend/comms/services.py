"""Email sending via Resend.

Dev behaviour: when DEV_EMAIL_TO is set (local .env), all outbound "to" addresses
are replaced with that address so real inboxes never get hit during development.
The original recipient is preserved in the subject prefix so you know who it was for.

Mock mode: when MOCK_RESEND=True or RESEND_API_KEY is blank, logs the email and
returns a fake ID without hitting the network.
"""
import logging
import os

from django.conf import settings

logger = logging.getLogger(__name__)

DEFAULT_FROM = "vijay@gigkraft.com"
DEFAULT_CC = ["oddlynicellc@gmail.com"]


def send_email(
    *,
    to: str,
    subject: str,
    body: str,
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    from_addr: str = DEFAULT_FROM,
) -> str:
    """Send an email. Returns the Resend message ID (or a mock/dev ID)."""
    cc_list = list(cc or DEFAULT_CC)
    if DEFAULT_CC[0] not in cc_list:
        cc_list.append(DEFAULT_CC[0])

    mock = getattr(settings, "MOCK_RESEND", True)
    api_key = os.environ.get("RESEND_API_KEY", "")

    if mock or not api_key:
        logger.info("[MOCK EMAIL] to=%s subject=%r cc=%s", to, subject, cc_list)
        return "mock-resend-id"

    # Dev redirect — send to a safe inbox instead of the real recipient
    dev_override = os.environ.get("DEV_EMAIL_TO", "").strip()
    actual_to = to
    if dev_override:
        subject = f"[DEV → {to}] {subject}"
        actual_to = dev_override
        logger.info("[DEV EMAIL] redirecting %s → %s", to, dev_override)

    import resend  # lazy import — optional in mock mode

    resend.api_key = api_key
    params: dict = {
        "from": from_addr,
        "to": [actual_to],
        "subject": subject,
        "text": body,
    }
    if cc_list:
        params["cc"] = cc_list
    if bcc:
        params["bcc"] = bcc

    response = resend.Emails.send(params)
    return response.get("id", "")

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
AUDIT_BCC = "oddlynicellc@gmail.com"


def send_email(
    *,
    to: str,
    subject: str,
    body: str,
    html_body: str | None = None,
    cc: list[str] | None = None,
    bcc: list[str] | None = None,
    from_addr: str = DEFAULT_FROM,
    track_token: str | None = None,
) -> str:
    """Send an email. Returns the Resend message ID (or a mock/dev ID).

    When html_body is provided it is used as-is (with tracking pixel appended).
    Otherwise a plain-text-to-HTML fallback is auto-generated from body.
    When track_token is provided, an invisible 1×1 pixel is embedded so we can
    detect when the recipient opens the email.
    """
    cc_list = list(cc or [])
    bcc_list = list(bcc or [])
    if AUDIT_BCC not in bcc_list:
        bcc_list.append(AUDIT_BCC)

    mock = getattr(settings, "MOCK_RESEND", True)
    api_key = os.environ.get("RESEND_API_KEY", "")

    if mock or not api_key:
        logger.info("[MOCK EMAIL] to=%s subject=%r cc=%s bcc=%s token=%s", to, subject, cc_list, bcc_list, track_token)
        return "mock-resend-id"

    # Dev redirect — send to a safe inbox instead of the real recipient
    dev_override = os.environ.get("DEV_EMAIL_TO", "").strip()
    actual_to = to
    if dev_override:
        subject = f"[DEV → {to}] {subject}"
        actual_to = dev_override
        logger.info("[DEV EMAIL] redirecting %s → %s", to, dev_override)

    # Build HTML — use provided html_body or fall back to escaped plain text
    if html_body:
        final_html = html_body
    else:
        import html as _html
        body_escaped = _html.escape(body).replace("\n", "<br>")
        final_html = f"<div style='font-family:sans-serif;line-height:1.6'>{body_escaped}</div>"

    if track_token:
        base_url = os.environ.get("BACKEND_URL", "https://gigkraft.com")
        pixel = (
            f'<img src="{base_url}/api/prospects/pixel/{track_token}" '
            f'width="1" height="1" style="display:none;opacity:0;position:absolute" '
            f'alt="" />'
        )
        final_html = final_html + "\n" + pixel

    import resend  # lazy import — optional in mock mode

    resend.api_key = api_key
    params: dict = {
        "from": from_addr,
        "to": [actual_to],
        "subject": subject,
        "text": body,
        "html": final_html,
    }
    if cc_list:
        params["cc"] = cc_list
    if bcc_list:
        params["bcc"] = bcc_list

    response = resend.Emails.send(params)
    return getattr(response, "id", "") or ""

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
INTERNAL_DOMAIN = "gigkraft.com"


def _is_internal(addr: str) -> bool:
    return addr.strip().lower().endswith(f"@{INTERNAL_DOMAIN}")


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

    Internal @gigkraft.com CC addresses receive a separate copy WITHOUT the
    tracking pixel so admin opens don't falsely trigger "Opened" status.
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

    # Build base HTML — use provided html_body or fall back to escaped plain text
    if html_body:
        base_html = html_body
    else:
        import html as _html
        body_escaped = _html.escape(body).replace("\n", "<br>")
        base_html = f"<div style='font-family:sans-serif;line-height:1.6'>{body_escaped}</div>"

    # Tracked HTML (with pixel) goes to the prospect only.
    # Internal @gigkraft.com CC recipients get base_html (no pixel) so their
    # opens don't fire the tracking endpoint and mark the email as "Opened".
    if track_token:
        base_url = os.environ.get("BACKEND_URL", "https://gigkraft.com")
        pixel = (
            f'<img src="{base_url}/api/prospects/pixel/{track_token}" '
            f'width="1" height="1" style="display:none;opacity:0;position:absolute" '
            f'alt="" />'
        )
        tracked_html = base_html + "\n" + pixel
    else:
        tracked_html = base_html

    # Split CC: internal addresses receive an untracked copy
    internal_cc = [e for e in cc_list if _is_internal(e)]
    external_cc = [e for e in cc_list if not _is_internal(e)]

    import resend  # lazy import — optional in mock mode

    resend.api_key = api_key

    # Main send — prospect + external CC, with tracking pixel
    params: dict = {
        "from": from_addr,
        "to": [actual_to],
        "subject": subject,
        "text": body,
        "html": tracked_html,
    }
    if external_cc:
        params["cc"] = external_cc
    if bcc_list:
        params["bcc"] = bcc_list

    response = resend.Emails.send(params)
    resend_id = getattr(response, "id", "") or ""

    # Untracked copy for internal @gigkraft.com addresses
    if internal_cc:
        resend.Emails.send({
            "from": from_addr,
            "to": internal_cc,
            "subject": subject,
            "text": body,
            "html": base_html,
        })

    return resend_id

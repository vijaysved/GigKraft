"""Email sending via Resend.

Dev behaviour: when DEV_EMAIL_TO is set (local .env), all outbound "to" addresses
are replaced with that address so real inboxes never get hit during development.
The original recipient is preserved in the subject prefix so you know who it was for.

Mock mode: when MOCK_RESEND=True or RESEND_API_KEY is blank, logs the email and
returns a fake ID without hitting the network.
"""
import logging
import os
import re as _re

from django.conf import settings

logger = logging.getLogger(__name__)

DEFAULT_FROM = "vijay@gigkraft.com"
AUDIT_BCC = "oddlynicellc@gmail.com"
INTERNAL_DOMAIN = "gigkraft.com"

_URL_RE = _re.compile(r"(https?://\S+)")


def _is_internal(addr: str) -> bool:
    return addr.strip().lower().endswith(f"@{INTERNAL_DOMAIN}")


def render_branded_html(body_text: str, cta_url: str | None = None, cta_label: str = "View on GigKraft") -> str:
    """Wrap plain text in the same branded card layout used for prospect outreach emails
    (dark header wordmark, white card, mint CTA button, gray footer) — see comms.models
    .MessageTemplate's seeded "GigKraft Intro — Email" template for the source of truth."""
    import html as _html

    def _linkify_escape(line: str) -> str:
        parts = _URL_RE.split(line)
        out = []
        for i, part in enumerate(parts):
            if i % 2 == 1:  # captured URL group
                href = _html.escape(part)
                out.append(f'<a href="{href}" style="color:#059669;font-weight:600;">{href}</a>')
            else:
                out.append(_html.escape(part))
        return "".join(out)

    paragraphs = "".join(
        f"<p style='margin:0 0 16px;'>{_linkify_escape(line)}</p>"
        for line in body_text.split("\n") if line.strip()
    )

    cta_html = ""
    if cta_url:
        cta_html = f"""
<div style="text-align:center;margin:28px 0;">
  <a href="{_html.escape(cta_url)}" style="display:inline-block;background:#34d399;color:#064e3b;padding:13px 30px;border-radius:6px;font-weight:700;font-size:14px;text-decoration:none;">{_html.escape(cta_label)} &rarr;</a>
</div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.10);">
  <div style="background:#111827;padding:20px 32px;">
    <a href="https://www.gigkraft.com" style="text-decoration:none;">
      <span style="color:#34d399;font-size:20px;font-weight:700;letter-spacing:-0.3px;">GigKraft</span>
    </a>
  </div>
  <div style="padding:32px;color:#374151;font-size:15px;line-height:1.75;">
    {paragraphs}{cta_html}
  </div>
  <div style="border-top:1px solid #e5e7eb;padding:16px 32px;background:#f9fafb;">
    <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
      <a href="https://www.gigkraft.com" style="color:#9ca3af;text-decoration:none;">www.gigkraft.com</a>
      &nbsp;&middot;&nbsp;support@gigkraft.com
    </p>
  </div>
</div>
</body>
</html>"""


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
    pixel_path: str = "/api/prospects/pixel",
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
        # gigkraft.com may not be verified in Resend yet; fall back to Resend's
        # built-in test sender so local sends always go through.
        from_addr = "onboarding@resend.dev"
        logger.info("[DEV EMAIL] redirecting %s → %s", to, dev_override)

    # Build base HTML — use provided html_body or fall back to the branded card layout
    base_html = html_body if html_body else render_branded_html(body)

    # Tracked HTML (with pixel) goes to the prospect only.
    # Internal @gigkraft.com CC recipients get base_html (no pixel) so their
    # opens don't fire the tracking endpoint and mark the email as "Opened".
    if track_token:
        base_url = os.environ.get("BACKEND_URL", "https://gigkraft.com")
        pixel = (
            f'<img src="{base_url}{pixel_path}/{track_token}" '
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

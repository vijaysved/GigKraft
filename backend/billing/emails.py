"""Transactional emails for billing events via Resend.

Respects settings.MOCK_RESEND — set False in Railway for real sends.
Uses settings.DEV_EMAIL_TO to redirect all email in dev/staging.
"""
import logging
import os

logger = logging.getLogger(__name__)


def _recipient(to: str) -> str:
    dev = os.environ.get("DEV_EMAIL_TO", "")
    return dev if dev else to


def send_invoice_email(to: str, plan_label: str, amount: str, renewal_date: str) -> None:
    from django.conf import settings

    recipient = _recipient(to)
    if getattr(settings, "MOCK_RESEND", True):
        logger.info("[MOCK] invoice email to=%s plan=%s amount=%s renewal=%s", recipient, plan_label, amount, renewal_date)
        return

    try:
        import resend
        resend.api_key = getattr(settings, "RESEND_API_KEY", "")
        params: resend.Emails.SendParams = {
            "from": "GigKraft <vijay@gigkraft.com>",
            "to": [recipient],
            "bcc": ["oddlynicellc@gmail.com"],
            "subject": f"Your GigKraft Pro receipt — {plan_label}",
            "html": f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#0a2540;margin-bottom:4px">Payment confirmed</h2>
  <p style="color:#627d98;margin-top:0">Thank you for subscribing to GigKraft Pro.</p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#627d98">Plan</td>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-weight:600;text-align:right">{plan_label}</td>
    </tr>
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#627d98">Amount paid</td>
      <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-weight:600;text-align:right">{amount}</td>
    </tr>
    <tr>
      <td style="padding:12px 0;color:#627d98">Next renewal</td>
      <td style="padding:12px 0;font-weight:600;text-align:right">{renewal_date}</td>
    </tr>
  </table>
  <a href="https://app.gigkraft.com/pro/account?tab=billing"
     style="display:inline-block;background:#3498db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
    View your subscription
  </a>
  <p style="color:#627d98;font-size:13px;margin-top:32px">
    Questions? Reply to this email or visit gigkraft.com.<br>
    GigKraft &middot; Austin, TX
  </p>
</div>
""",
        }
        resend.Emails.send(params)
        logger.info("invoice email sent to=%s", recipient)
    except Exception:
        logger.exception("Failed to send invoice email to %s", recipient)


def send_welcome_email(to: str, first_name: str) -> None:
    from django.conf import settings

    recipient = _recipient(to)
    name = first_name or "there"
    if getattr(settings, "MOCK_RESEND", True):
        logger.info("[MOCK] welcome email to=%s name=%s", recipient, name)
        return

    try:
        import resend
        resend.api_key = getattr(settings, "RESEND_API_KEY", "")
        params: resend.Emails.SendParams = {
            "from": "GigKraft <vijay@gigkraft.com>",
            "to": [recipient],
            "bcc": ["oddlynicellc@gmail.com"],
            "subject": "Welcome to GigKraft Pro",
            "html": f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#0a2540">Welcome, {name}!</h2>
  <p style="color:#627d98">You're now a GigKraft Pro. Here's what's unlocked:</p>
  <ul style="color:#0a2540;line-height:1.8;padding-left:20px">
    <li>Unlimited verified Krafts</li>
    <li>Homeowner endorsements on every job</li>
    <li>Zipcode standing &amp; performance insights</li>
    <li>Full data export &mdash; your work is yours</li>
  </ul>
  <a href="https://app.gigkraft.com/pro/onboarding"
     style="display:inline-block;background:#3498db;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
    Set up your profile
  </a>
  <p style="color:#627d98;font-size:13px;margin-top:32px">
    Need help? Reply to this email &mdash; we read every message.<br>
    GigKraft &middot; Austin, TX
  </p>
</div>
""",
        }
        resend.Emails.send(params)
        logger.info("welcome email sent to=%s", recipient)
    except Exception:
        logger.exception("Failed to send welcome email to %s", recipient)


def send_payment_failed_email(to: str, first_name: str) -> None:
    from django.conf import settings

    recipient = _recipient(to)
    name = first_name or "there"
    if getattr(settings, "MOCK_RESEND", True):
        logger.info("[MOCK] payment_failed email to=%s name=%s", recipient, name)
        return

    try:
        import resend
        resend.api_key = getattr(settings, "RESEND_API_KEY", "")
        params: resend.Emails.SendParams = {
            "from": "GigKraft <vijay@gigkraft.com>",
            "to": [recipient],
            "bcc": ["oddlynicellc@gmail.com"],
            "subject": "Action required: GigKraft Pro payment failed",
            "html": f"""
<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
  <h2 style="color:#c0392b">Payment failed</h2>
  <p style="color:#627d98">Hi {name}, we weren't able to charge your card for your GigKraft Pro subscription.</p>
  <p style="color:#627d98">Please update your payment method to keep your Pro access.</p>
  <a href="https://app.gigkraft.com/pro/account?tab=billing"
     style="display:inline-block;background:#e74c3c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
    Update payment method
  </a>
  <p style="color:#627d98;font-size:13px;margin-top:32px">
    If you have questions, reply to this email.<br>
    GigKraft &middot; Austin, TX
  </p>
</div>
""",
        }
        resend.Emails.send(params)
        logger.info("payment_failed email sent to=%s", recipient)
    except Exception:
        logger.exception("Failed to send payment_failed email to %s", recipient)

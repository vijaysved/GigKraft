"""Resend webhook handler.

Register in config/urls.py as a raw Django view (outside Ninja) so we receive
the raw POST body without interference from middleware.

Supported events:
  email.bounced  — marks prospect.email_bounced = True
"""
import json
import logging

from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def resend_webhook(request):
    try:
        payload = json.loads(request.body)
    except (ValueError, TypeError):
        return HttpResponse(status=400)

    event_type = payload.get("type", "")
    data = payload.get("data", {})

    if event_type == "email.bounced":
        resend_id = data.get("id", "")
        if resend_id:
            from comms.models import OutreachLog
            log = (
                OutreachLog.objects
                .filter(resend_id=resend_id)
                .select_related("prospect")
                .first()
            )
            if log and log.prospect and not log.prospect.email_bounced:
                log.prospect.email_bounced = True
                log.prospect.save(update_fields=["email_bounced", "updated_at"])
                logger.info(
                    "Bounce recorded: prospect=%s email=%s resend_id=%s",
                    log.prospect.prospect_id,
                    log.prospect.email,
                    resend_id,
                )

    return JsonResponse({"ok": True})

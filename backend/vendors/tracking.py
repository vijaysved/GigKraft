"""Shared click-tracking redirect logic for outreach links.

Used by both the short public paths (/go/<token>, /go/example/<token>,
mounted at the root in config/urls.py) and the legacy /api/prospects/track*
endpoints (kept working for already-sent messages using the old links).
"""
import os
import uuid as _uuid

from django.http import HttpResponseRedirect
from django.utils import timezone

from common.models import SiteSettings
from vendors.models import Prospect

GK_EXAMPLE_URL = "https://www.gigkraft.com/pros/template-pro"


def _parse_token(token: str):
    try:
        return _uuid.UUID(token)
    except (ValueError, AttributeError, TypeError):
        return None


def handle_signup_click(token: str) -> HttpResponseRedirect:
    from django.db.models import F

    from comms.models import OutreachLog

    now = timezone.now()
    uid = _parse_token(token)

    if uid:
        # Per-message token (new path) — look up via OutreachLog first
        log = OutreachLog.objects.select_related("prospect").filter(link_click_token=uid).first()
        if log:
            if not log.link_clicked_at:
                log.link_clicked_at = now
                log.save(update_fields=["link_clicked_at"])
            # Also backfill prospect-level timestamp for backwards compat
            if log.prospect:
                if not log.prospect.link_clicked_at:
                    Prospect.objects.filter(pk=log.prospect_id, link_clicked_at__isnull=True).update(
                        link_clicked_at=now, updated_at=now
                    )
                Prospect.objects.filter(pk=log.prospect_id).update(
                    signup_link_click_count=F("signup_link_click_count") + 1
                )
        else:
            # Legacy path — prospect-level token for old sent messages (also the
            # path used by manual WhatsApp/SMS sends, which reuse the prospect's
            # single signup_link_token rather than a per-message token)
            p = Prospect.objects.filter(signup_link_token=uid).first()
            if p:
                if not p.link_clicked_at:
                    Prospect.objects.filter(pk=p.pk, link_clicked_at__isnull=True).update(
                        link_clicked_at=now, updated_at=now
                    )
                Prospect.objects.filter(pk=p.pk).update(
                    signup_link_click_count=F("signup_link_click_count") + 1
                )

    cfg = SiteSettings.get()
    is_prod = os.environ.get("DEBUG", "").lower() not in ("1", "true")
    signup_url = cfg.pros_signup_url_prod if is_prod else cfg.pros_signup_url_local
    return HttpResponseRedirect(signup_url)


def handle_example_click(token: str) -> HttpResponseRedirect:
    from comms.models import OutreachEvent, OutreachLog

    now = timezone.now()
    uid = _parse_token(token)

    if uid:
        log = OutreachLog.objects.filter(link_click_token=uid).first()
        if log:
            if not log.example_clicked_at:
                log.example_clicked_at = now
                log.save(update_fields=["example_clicked_at"])
            OutreachEvent.objects.create(log=log, event_type="profile_view", occurred_at=now)

    return HttpResponseRedirect(GK_EXAMPLE_URL)

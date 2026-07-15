"""Short-link redirect for a Community's public page."""
import os

from django.db.models import F
from django.http import HttpResponseRedirect
from django.views.decorators.http import require_GET

from communities.models import Community

FRONTEND_URL = os.environ.get("FRONTEND_URL") or (
    "http://localhost:5173" if os.environ.get("DJANGO_DEBUG", "False") == "True" else "https://gigkraft.com"
)

BOT_AGENTS = (
    "whatsapp", "facebookexternalhit", "twitterbot", "linkedinbot",
    "slackbot", "telegrambot", "discordbot", "googlebot", "bingbot",
    "applebot", "ia_archiver", "curl", "wget", "python-requests",
)


def _is_bot(request) -> bool:
    ua = (request.META.get("HTTP_USER_AGENT") or "").lower()
    return any(b in ua for b in BOT_AGENTS)


@require_GET
def community_short_link(request, code: str) -> HttpResponseRedirect:
    """Short `/g/<code>` alias ("group") for a Community's page — same
    redirect/click-counting shape as `referrals/views.py:referrer_short_link`."""
    community = Community.objects.filter(short_code=code).first()
    if community is None:
        return HttpResponseRedirect(FRONTEND_URL)

    if not _is_bot(request):
        Community.objects.filter(pk=community.pk).update(
            short_link_click_count=F("short_link_click_count") + 1
        )

    target = f"{FRONTEND_URL}/community/{community.slug}"
    if request.META.get("QUERY_STRING"):
        target = f"{target}?{request.META['QUERY_STRING']}"
    return HttpResponseRedirect(target)

"""Social-preview view for referrer profile pages.

WhatsApp / Facebook / Twitter bots scrape this URL and get proper OG meta tags.
Real users get an instant JS + meta-refresh redirect to the frontend SPA.
"""
import html
import os

from django.db.models import F
from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_GET

from referrals.models import ReferrerPro, ReferrerProfile
from accounts.models import HomeownerProfile, ProProfile

FRONTEND_URL = os.environ.get("FRONTEND_URL") or (
    "http://localhost:5173" if os.environ.get("DJANGO_DEBUG", "False") == "True" else "https://gigkraft.com"
)
GK_LOGO = "https://gigkraft.com/brand/gigKraftLogo.png"

BOT_AGENTS = (
    "whatsapp", "facebookexternalhit", "twitterbot", "linkedinbot",
    "slackbot", "telegrambot", "discordbot", "googlebot", "bingbot",
    "applebot", "ia_archiver", "curl", "wget", "python-requests",
)


def _is_bot(request) -> bool:
    ua = (request.META.get("HTTP_USER_AGENT") or "").lower()
    return any(b in ua for b in BOT_AGENTS)


def _get_avatar(profile: ReferrerProfile) -> str:
    if profile.avatar_url:
        return profile.avatar_url
    ho = HomeownerProfile.objects.filter(user=profile.user).values_list("avatar_url", flat=True).first()
    if ho:
        return ho
    pp = ProProfile.objects.filter(user=profile.user).values_list("avatar_url", flat=True).first()
    return pp or GK_LOGO


@require_GET
@cache_control(max_age=3600, public=True)
def referrer_social_preview(request, slug: str) -> HttpResponse:
    profile = ReferrerProfile.objects.select_related("user").filter(slug=slug).first()
    frontend_url = f"{FRONTEND_URL}/us/{slug}/refer"

    if profile is None:
        # Unknown slug — redirect to frontend either way
        return HttpResponse(
            f'<html><head><meta http-equiv="refresh" content="0;url={frontend_url}"></head>'
            f'<body><a href="{frontend_url}">Go to GigKraft</a></body></html>',
            content_type="text/html",
        )

    name = html.escape(
        f"{profile.user.first_name} {profile.user.last_name}".strip() or str(profile.user)
    )
    bio = html.escape(
        profile.bio or f"Trusted home service professionals curated by {name} on GigKraft."
    )
    image = _get_avatar(profile)
    title = f"{name}'s Trusted Pros · GigKraft"
    canon = f"https://gigkraft.com/us/{slug}/refer"

    og_html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{html.escape(title)}</title>
  <meta property="og:type"        content="profile" />
  <meta property="og:site_name"   content="GigKraft" />
  <meta property="og:title"       content="{html.escape(title)}" />
  <meta property="og:description" content="{bio}" />
  <meta property="og:image"       content="{html.escape(image)}" />
  <meta property="og:url"         content="{canon}" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="{html.escape(title)}" />
  <meta name="twitter:description" content="{bio}" />
  <meta name="twitter:image"       content="{html.escape(image)}" />
  <!-- Redirect real users to the SPA immediately -->
  <meta http-equiv="refresh" content="0;url={frontend_url}" />
  <script>window.location.replace("{frontend_url}");</script>
</head>
<body>
  <p><a href="{frontend_url}">View {html.escape(name)}'s page on GigKraft</a></p>
</body>
</html>"""

    return HttpResponse(og_html, content_type="text/html; charset=utf-8")


@require_GET
def referrer_short_link(request, code: str) -> HttpResponseRedirect:
    """Short `/r/<code>` alias for a referrer's page. Counts real clicks (not bot
    preview fetches), then hands off to `/us/<slug>/refer`, which the bot-only
    Vercel rewrite routes back to `referrer_social_preview` above for OG tags —
    so link-preview crawlers following this redirect still see the real photo.
    """
    profile = ReferrerProfile.objects.filter(short_code=code).first()
    if profile is None:
        return HttpResponseRedirect(FRONTEND_URL)

    if not _is_bot(request):
        ReferrerProfile.objects.filter(pk=profile.pk).update(
            short_link_click_count=F("short_link_click_count") + 1
        )

    target = f"{FRONTEND_URL}/us/{profile.slug}/refer"
    if request.META.get("QUERY_STRING"):
        target = f"{target}?{request.META['QUERY_STRING']}"
    return HttpResponseRedirect(target)


@require_GET
def referrer_pro_short_link(request, code: str) -> HttpResponseRedirect:
    """Short `/p/<code>` alias for one specific pro on a referrer's page — same
    redirect/click-counting shape as `referrer_short_link`, but scoped to a single
    `ReferrerPro` row so each pro's share links can be tracked independently."""
    rp = ReferrerPro.objects.select_related("referrer__referrer_profile").filter(short_code=code).first()
    if rp is None or not hasattr(rp.referrer, "referrer_profile"):
        return HttpResponseRedirect(FRONTEND_URL)

    if not _is_bot(request):
        ReferrerPro.objects.filter(pk=rp.pk).update(
            short_link_click_count=F("short_link_click_count") + 1
        )

    slug = rp.referrer.referrer_profile.slug
    target = f"{FRONTEND_URL}/us/{slug}/refer"
    if request.META.get("QUERY_STRING"):
        target = f"{target}?{request.META['QUERY_STRING']}"
    return HttpResponseRedirect(target)

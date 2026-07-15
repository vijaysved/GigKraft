"""Short-link redirect and social-preview view for a Community's public page."""
import base64
import html
import os
import re

from django.db.models import F
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseNotFound
from django.views.decorators.cache import cache_control
from django.views.decorators.http import require_GET

from communities.models import Community

_DATA_URL_RE = re.compile(r"^data:(?P<mime>image/[\w.+-]+);base64,(?P<b64>.+)$", re.DOTALL)

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


@require_GET
@cache_control(max_age=300, public=True)
def community_cover_image(request, slug: str) -> HttpResponse:
    """Serves a Community's cover image as a real, fetchable URL.

    `Community.cover_image_url` is often a `data:image/...;base64,...` URI —
    the Settings page compresses uploads client-side and stores the data URI
    directly rather than uploading to real file storage. That's fine for the
    SPA's own `<img>` tags, but social-media crawlers (WhatsApp, Facebook,
    etc.) fetch `og:image` as an HTTP GET and cannot resolve `data:` URIs, so
    the community's logo silently fails to show up in link previews. This
    view decodes the stored data URI on each request and serves the raw
    bytes, giving `community_social_preview` below a URL bots can actually
    fetch — no dependency on persistent file storage.
    """
    community = Community.objects.filter(slug=slug).first()
    if community is None:
        return HttpResponseNotFound()

    m = _DATA_URL_RE.match(community.cover_image_url or "")
    if not m:
        return HttpResponseNotFound()

    try:
        content = base64.b64decode(m.group("b64"))
    except (ValueError, base64.binascii.Error):
        return HttpResponseNotFound()

    return HttpResponse(content, content_type=m.group("mime"))


@require_GET
@cache_control(max_age=3600, public=True)
def community_social_preview(request, slug: str) -> HttpResponse:
    """Social-preview view for a Community's public page — same shape as
    `referrals/views.py:referrer_social_preview`. WhatsApp / Facebook / Twitter
    bots scrape this URL (via the Vercel bot-only rewrite for `/community/:slug`)
    and get the Community's own logo/name instead of the generic gigKraft.com
    card; real users get an instant JS + meta-refresh redirect to the SPA."""
    community = Community.objects.filter(slug=slug).first()
    frontend_url = f"{FRONTEND_URL}/community/{slug}"

    if community is None:
        return HttpResponse(
            f'<html><head><meta http-equiv="refresh" content="0;url={frontend_url}"></head>'
            f'<body><a href="{frontend_url}">Go to GigKraft</a></body></html>',
            content_type="text/html",
        )

    name = html.escape(community.name)
    desc = html.escape(
        community.description or f"Trusted home service pros curated by {name} on GigKraft."
    )
    if community.cover_image_url.startswith("data:"):
        image = request.build_absolute_uri(f"/community/{slug}/og-image")
    else:
        image = html.escape(community.cover_image_url or GK_LOGO)
    title = f"{name} · GigKraft Community"
    canon = f"https://gigkraft.com/community/{slug}"

    og_html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{html.escape(title)}</title>
  <meta property="og:type"        content="website" />
  <meta property="og:site_name"   content="GigKraft" />
  <meta property="og:title"       content="{html.escape(title)}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:image"       content="{image}" />
  <meta property="og:url"         content="{canon}" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="{html.escape(title)}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image"       content="{image}" />
  <!-- Redirect real users to the SPA immediately -->
  <meta http-equiv="refresh" content="0;url={frontend_url}" />
  <script>window.location.replace("{frontend_url}");</script>
</head>
<body>
  <p><a href="{frontend_url}">View {name} on GigKraft</a></p>
</body>
</html>"""

    return HttpResponse(og_html, content_type="text/html; charset=utf-8")

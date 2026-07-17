"""Fetches basic link-preview metadata (title/description/image) for a
member-supplied URL in the Recommend-a-Pro flow. Guards against SSRF by
resolving the hostname and rejecting private/loopback/link-local/reserved
addresses before every request, including redirect hops."""

import html
import ipaddress
import socket
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit

import requests

MAX_BYTES = 512 * 1024
TIMEOUT_SECONDS = 5
MAX_REDIRECTS = 3
USER_AGENT = "GigKraftLinkPreview/1.0"


class LinkPreviewError(Exception):
    """Raised with a user-facing message whenever a preview can't be produced."""


def _assert_public_host(hostname: str) -> None:
    try:
        infos = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        raise LinkPreviewError("Couldn't resolve that link.")
    for info in infos:
        addr = ipaddress.ip_address(info[4][0])
        if addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_reserved or addr.is_multicast or addr.is_unspecified:
            raise LinkPreviewError("That link isn't reachable.")


def _validate_url(url: str) -> str:
    parts = urlsplit(url)
    if parts.scheme not in ("http", "https"):
        raise LinkPreviewError("Enter a valid website link (starting with http:// or https://).")
    if not parts.hostname:
        raise LinkPreviewError("Enter a valid website link.")
    _assert_public_host(parts.hostname)
    return url


class _MetaParser(HTMLParser):
    """Pulls <title> plus og:title/og:description/og:image meta tags."""

    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""
        self.og: dict[str, str] = {}

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            prop = attrs_dict.get("property") or attrs_dict.get("name")
            content = attrs_dict.get("content")
            if prop in ("og:title", "og:description", "og:image") and content:
                self.og[prop] = content

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title and not self.title:
            self.title = data.strip()


def fetch_link_preview(url: str) -> dict:
    """Fetches `url` server-side and extracts basic preview metadata.
    Raises LinkPreviewError with a user-facing message on any failure."""
    current = _validate_url(url.strip())
    resp = None
    for _ in range(MAX_REDIRECTS + 1):
        try:
            resp = requests.get(
                current,
                timeout=TIMEOUT_SECONDS,
                stream=True,
                allow_redirects=False,
                headers={"User-Agent": USER_AGENT},
            )
        except requests.RequestException:
            raise LinkPreviewError("Couldn't fetch a preview for that link.")
        if resp.is_redirect:
            location = resp.headers.get("Location")
            resp.close()
            if not location:
                raise LinkPreviewError("Couldn't fetch a preview for that link.")
            current = _validate_url(urljoin(current, location))
            continue
        break
    else:
        raise LinkPreviewError("Couldn't fetch a preview for that link.")

    if resp.status_code != 200:
        resp.close()
        raise LinkPreviewError("Couldn't fetch a preview for that link.")
    if "text/html" not in resp.headers.get("Content-Type", ""):
        resp.close()
        raise LinkPreviewError("That link doesn't look like a webpage.")

    body = b""
    for chunk in resp.iter_content(chunk_size=8192):
        body += chunk
        if len(body) >= MAX_BYTES:
            break
    resp.close()

    parser = _MetaParser()
    try:
        parser.feed(body.decode(resp.encoding or "utf-8", errors="ignore"))
    except Exception:
        raise LinkPreviewError("Couldn't fetch a preview for that link.")

    title = parser.og.get("og:title") or parser.title
    description = parser.og.get("og:description") or ""
    image = parser.og.get("og:image") or ""
    if image:
        image = urljoin(current, image)

    return {
        "title": html.unescape(title)[:200],
        "description": html.unescape(description)[:300],
        "image": image,
    }

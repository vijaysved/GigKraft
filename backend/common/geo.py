"""Shared ZIP-radius geo helpers, used anywhere a "pros near this ZIP" search
happens (public search, B2B discovery, RFQ matching, gk-admin, SEO location info)."""
import math
import re

from django.core.cache import cache

import requests as _http

DEFAULT_SEARCH_RADIUS_MILES = 25

_ZIP5_RE = re.compile(r"^\d{5}$")


def zip_centroid(zip_code: str):
    """Return (lat, lng) for a US ZIP code via zippopotam.us, cached 15 days. Returns None on failure."""
    if not _ZIP5_RE.match(zip_code):
        return None
    key = f"zip_centroid:{zip_code}"
    cached = cache.get(key)
    if cached:
        return cached
    try:
        resp = _http.get(f"https://api.zippopotam.us/us/{zip_code}", timeout=3)
        if resp.status_code == 200:
            place = resp.json()["places"][0]
            result = (float(place["latitude"]), float(place["longitude"]))
            cache.set(key, result, 60 * 60 * 24 * 15)
            return result
    except Exception:
        pass
    return None


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 3959.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))


def pro_within_radius(pro, lat1: float, lon1: float, radius: int) -> bool:
    """Return True if any of the pro's service ZIPs are within `radius` miles of (lat1, lon1),
    or — for radial-mode pros — if the search point falls within their own declared coverage radius."""
    candidate_zips = [z for z in [pro.base_zip, pro.service_center_zip] + (pro.service_zips or []) if z]
    for z in candidate_zips:
        c = zip_centroid(z)
        if c and haversine_miles(lat1, lon1, c[0], c[1]) <= radius:
            return True
    if getattr(pro, "service_mode", None) == "radial" and pro.service_center_zip:
        c = zip_centroid(pro.service_center_zip)
        if c and haversine_miles(lat1, lon1, c[0], c[1]) <= (pro.service_radius_miles or 0):
            return True
    return False


def pros_within_radius(pros_qs, zip_code: str, radius: int = DEFAULT_SEARCH_RADIUS_MILES, limit: int = 200):
    """Given a ProProfile queryset, return the list of pros within `radius` miles of `zip_code`.
    Falls back to the first `limit` candidates unfiltered if the ZIP can't be geocoded."""
    centroid = zip_centroid(zip_code)
    candidates = list(pros_qs[:limit])
    if not centroid:
        return candidates
    lat1, lon1 = centroid
    return [p for p in candidates if pro_within_radius(p, lat1, lon1, radius)]

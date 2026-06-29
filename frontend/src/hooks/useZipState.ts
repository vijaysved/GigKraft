import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { fetchGeoZip } from "../api/endpoints";

const ZIP_KEY = "gk_user_zip";
const ZIP_RE = /^\d{5}$/;

// ── Geo detection cache ───────────────────────────────────────────────────────
const GEO_CACHE_KEY = "gk_geo_cache";
const GEO_CACHE_TTL_MS = 15 * 24 * 60 * 60 * 1000; // 15 days

/**
 * Dev-mode exclusion: run this once in the browser console on any machine you
 * use for testing to permanently skip geo detection and analytics events:
 *
 *   localStorage.setItem("gk_dev_mode", "true")
 *
 * To re-enable on that machine:
 *   localStorage.removeItem("gk_dev_mode")
 */
const IS_DEV_MACHINE =
  localStorage.getItem("gk_dev_mode") === "true" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

interface GeoCacheEntry {
  zip: string;
  city: string;
  state: string;
  cachedAt: number;
}

function readGeoCache(): GeoCacheEntry | null {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const entry: GeoCacheEntry = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > GEO_CACHE_TTL_MS) {
      localStorage.removeItem(GEO_CACHE_KEY);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeGeoCache(geo: { zip: string; city: string; state: string }) {
  localStorage.setItem(
    GEO_CACHE_KEY,
    JSON.stringify({ ...geo, cachedAt: Date.now() }),
  );
}

declare function gtag(command: string, ...args: unknown[]): void;

export type ZipSource = "url" | "local_storage" | "geo" | "none";

export interface ZipState {
  zip: string;
  setZip: (zip: string, method?: "inline_input" | "geolocation_click") => void;
  clearZip: () => void;
  source: ZipSource;
  /** Geo-detected ZIP awaiting user confirmation (empty string when none pending). */
  pendingGeoZip: string;
  pendingGeoCity: string;
  pendingGeoState: string;
  confirmGeoZip: () => void;
  declineGeoZip: () => void;
}

export function useZipState(): ZipState {
  const [searchParams] = useSearchParams();

  const urlZip = searchParams.get("zip") ?? "";
  const storedZip = localStorage.getItem(ZIP_KEY) ?? "";

  const resolvedZip = ZIP_RE.test(urlZip) ? urlZip : ZIP_RE.test(storedZip) ? storedZip : "";
  const resolvedSource: ZipSource = ZIP_RE.test(urlZip)
    ? "url"
    : ZIP_RE.test(storedZip)
    ? "local_storage"
    : "none";

  const [zip, setZipState] = useState(resolvedZip);
  const [source, setSource] = useState<ZipSource>(resolvedSource);

  // Pending geo-detection state (awaiting user confirmation)
  const [pendingGeoZip, setPendingGeoZip] = useState("");
  const [pendingGeoCity, setPendingGeoCity] = useState("");
  const [pendingGeoState, setPendingGeoState] = useState("");
  const geoFiredRef = useRef(false);

  // Auto-detect via IP when no zip is known.
  // Skipped on dev machines and when a 15-day client-side cache is still fresh.
  useEffect(() => {
    if (resolvedZip || geoFiredRef.current || IS_DEV_MACHINE) return;
    geoFiredRef.current = true;

    // Serve from localStorage cache if still within 15-day TTL
    const cached = readGeoCache();
    if (cached) {
      setPendingGeoZip(cached.zip);
      setPendingGeoCity(cached.city);
      setPendingGeoState(cached.state);
      return;
    }

    // Cache miss — call the backend (which in turn calls ip-api.com)
    fetchGeoZip().then((geo) => {
      if (geo && ZIP_RE.test(geo.zip)) {
        writeGeoCache(geo);
        setPendingGeoZip(geo.zip);
        setPendingGeoCity(geo.city);
        setPendingGeoState(geo.state);
      }
    });
  // Intentionally empty deps — fires once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setZip(newZip: string, method: "inline_input" | "geolocation_click" = "inline_input") {
    if (!ZIP_RE.test(newZip)) return;
    const previousZip = zip;
    localStorage.setItem(ZIP_KEY, newZip);
    setZipState(newZip);
    setSource("local_storage");
    // Clear any pending geo confirmation when user explicitly sets a zip
    setPendingGeoZip("");
    setPendingGeoCity("");
    setPendingGeoState("");
    if (!IS_DEV_MACHINE && typeof gtag !== "undefined") {
      gtag("event", "location_changed", {
        old_zip: previousZip || null,
        new_zip: newZip,
        method,
      });
    }
  }

  function clearZip() {
    localStorage.removeItem(ZIP_KEY);
    setZipState("");
    setSource("none");
  }

  function confirmGeoZip() {
    if (!pendingGeoZip) return;
    setZip(pendingGeoZip, "geolocation_click");
    setSource("geo");
  }

  function declineGeoZip() {
    setPendingGeoZip("");
    setPendingGeoCity("");
    setPendingGeoState("");
  }

  return {
    zip,
    setZip,
    clearZip,
    source,
    pendingGeoZip,
    pendingGeoCity,
    pendingGeoState,
    confirmGeoZip,
    declineGeoZip,
  };
}

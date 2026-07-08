export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? ""  // same-origin: Vercel proxies /api/* to Railway
    : "http://localhost:8000");

// Base origin for the /go/ short links embedded in outreach messages. These
// are pasted into messages sent to third parties, so they must always be the
// public gigkraft.com domain — never VITE_API_BASE_URL (which points at the
// raw Railway origin for direct API calls). Mirrors the backend's own
// BACKEND_URL fallback (vendors/models.py).
export const TRACKING_BASE_URL = import.meta.env.PROD
  ? "https://www.gigkraft.com"
  : "http://localhost:8000";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export const APP_VERSION = "1.0.2";

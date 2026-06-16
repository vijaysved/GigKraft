export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? ""  // same-origin: Vercel proxies /api/* to Railway
    : "http://localhost:8000");

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

export const APP_VERSION = "1.0.0";

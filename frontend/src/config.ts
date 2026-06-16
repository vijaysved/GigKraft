export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD
    ? "https://gigkraft-backend-production.up.railway.app"
    : "http://localhost:8000");

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "83848902207-ibto40vuqcf30ncb6695tt2irvffb5hb.apps.googleusercontent.com";

export const APP_VERSION = "1.0.0";

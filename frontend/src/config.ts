export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const MOCK_GOOGLE_OAUTH =
  (import.meta.env.VITE_MOCK_GOOGLE_OAUTH ?? "true").toLowerCase() === "true";

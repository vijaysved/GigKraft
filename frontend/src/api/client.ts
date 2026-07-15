import createClient, { type Middleware } from "openapi-fetch";

import { API_BASE_URL } from "../config";
import type { paths } from "./generated/types";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokens";

// Requests sent via fetch() have their body stream consumed, so cloning them
// afterward (needed to retry on 401) throws "Request body is already used".
// Stash an unread clone here while the request is still fresh.
const pendingBodies = new WeakMap<Request, Request>();

// Attach access token to every outgoing request.
const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getAccessToken();
    if (token && !request.headers.has("Authorization")) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    pendingBodies.set(request, request.clone());
    return request;
  },
};

// On a 401, attempt a silent token refresh and retry once.
// If refresh also fails, clear tokens and redirect to /login.
let refreshing: Promise<string | null> | null = null;

const refreshMiddleware: Middleware = {
  async onResponse({ response, request }) {
    if (response.status !== 401) return response;

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      window.location.href = "/login";
      return response;
    }

    // Deduplicate concurrent refresh attempts
    if (!refreshing) {
      refreshing = fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      })
        .then(async (r) => {
          if (!r.ok) return null;
          const data = (await r.json()) as { access: string; refresh?: string };
          setTokens(data.access, data.refresh);
          return data.access;
        })
        .catch(() => null)
        .finally(() => { refreshing = null; });
    }

    const newAccess = await refreshing;

    if (!newAccess) {
      clearTokens();
      window.location.href = "/login";
      return response;
    }

    // Retry original request with the new token, using the clone stashed before it was sent
    const original = pendingBodies.get(request) ?? request;
    const retried = new Request(original, {});
    retried.headers.set("Authorization", `Bearer ${newAccess}`);
    return fetch(retried);
  },
};

export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
client.use(authMiddleware);
client.use(refreshMiddleware);

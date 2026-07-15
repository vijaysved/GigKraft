import { useCallback, useEffect, useState } from "react";

import { API_BASE_URL } from "../../../config";
import { getAccessToken } from "../../../api/tokens";
import type { CommunityOut, ManagedCommunityOut } from "../types";

export async function communityFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken();
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
}

/** Public community page data — works for anonymous, member, moderator, and owner viewers. */
export function useCommunityPublic(slug: string | undefined) {
  const [data, setData] = useState<CommunityOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await communityFetch(`/api/communities/${slug}`);
      const body = await res.json() as CommunityOut & { detail?: string };
      if (!res.ok) throw new Error(body.detail ?? "Community not found.");
      setData(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

/** The caller's managed Community (Owner or Moderator) — /api/me/community. */
export function useMyCommunity() {
  const [data, setData] = useState<ManagedCommunityOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await communityFetch("/api/me/community");
      if (res.status === 403 || res.status === 404) {
        setData(null);
        setNotFound(true);
        return;
      }
      const body = await res.json() as ManagedCommunityOut;
      setData(body);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refetch(); }, [refetch]);

  return { data, loading, notFound, refetch };
}

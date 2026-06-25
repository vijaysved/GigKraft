import { useCallback, useEffect, useState } from "react";

import { getAccessToken } from "../../../api/tokens";
import { API_BASE_URL } from "../../../config";
import type { CircleOut } from "../types";

export function useCircle(slug: string) {
  const [circle, setCircle] = useState<CircleOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCircle = useCallback(() => {
    setLoading(true);
    setError(null);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch(`${API_BASE_URL}/api/circles/${slug}`, { headers })
      .then((r) => {
        if (!r.ok) throw new Error("Circle not found");
        return r.json() as Promise<CircleOut>;
      })
      .then((data) => {
        setCircle(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    fetchCircle();
  }, [fetchCircle]);

  return { circle, loading, error, refetch: fetchCircle };
}

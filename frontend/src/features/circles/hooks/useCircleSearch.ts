import { useCallback, useState } from "react";

import { API_BASE_URL } from "../../../config";
import type { CircleSearchResultOut } from "../types";

export function useCircleSearch(slug: string) {
  const [results, setResults] = useState<CircleSearchResultOut[]>([]);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");

  const runSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const r = await fetch(
          `${API_BASE_URL}/api/circles/${slug}/search?q=${encodeURIComponent(q)}`
        );
        const data = (await r.json()) as CircleSearchResultOut[];
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [slug]
  );

  return { results, searching, runSearch, query };
}

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../auth/AuthContext";
import { syncFavoritePros, toggleFavoritePro } from "../api/endpoints";

const LS_KEY = "gk_fav_pros";

function readLocal(): number[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: number[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export function useFavorites() {
  const { status, user } = useAuth();
  const [favIds, setFavIds] = useState<Set<number>>(() => new Set(readLocal()));
  const synced = useRef(false);

  // On login: push local-storage IDs to server and merge the result back.
  // Runs once per authenticated session (synced ref prevents repeated calls).
  useEffect(() => {
    if (status !== "authenticated" || !user || synced.current) return;
    synced.current = true;
    const local = readLocal();
    syncFavoritePros(local)
      .then(({ pro_ids }) => {
        setFavIds(new Set(pro_ids));
        writeLocal(pro_ids);
      })
      .catch(() => {});
  }, [status, user]);

  // Reset sync flag on logout so the next login triggers a fresh sync.
  useEffect(() => {
    if (status === "anonymous") synced.current = false;
  }, [status]);

  function toggle(proId: number) {
    // Optimistic update — instant feedback regardless of network.
    let wasAdded = false;
    setFavIds((prev) => {
      const next = new Set(prev);
      if (next.has(proId)) {
        next.delete(proId);
        wasAdded = false;
      } else {
        next.add(proId);
        wasAdded = true;
      }
      writeLocal(Array.from(next));
      return next;
    });

    if (status === "authenticated") {
      toggleFavoritePro(proId)
        .then(({ pro_ids }) => {
          setFavIds(new Set(pro_ids));
          writeLocal(pro_ids);
        })
        .catch(() => {
          // Rollback the optimistic update on error.
          setFavIds((prev) => {
            const rolled = new Set(prev);
            if (wasAdded) rolled.delete(proId);
            else rolled.add(proId);
            writeLocal(Array.from(rolled));
            return rolled;
          });
        });
    }
  }

  return {
    favIds,
    toggle,
    isAuthenticated: status === "authenticated",
  };
}

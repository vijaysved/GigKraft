import { useCallback, useEffect, useState } from "react";

import { getMyProProfile, updateHandle as apiUpdateHandle } from "../api/endpoints";

const STORAGE_KEY = "gigkraft.pro_handle";

export function sanitizeHandle(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export function generateDefaultHandle(
  firstName?: string | null,
  lastName?: string | null,
  trade?: string | null,
): string {
  const parts = [firstName, lastName].filter(Boolean);
  if (parts.length === 0 && trade) parts.push(trade);
  const raw = parts.join("-") || trade || "pro";
  return sanitizeHandle(raw);
}

export function isValidHandle(h: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(h) || /^[a-z0-9]{2,30}$/.test(h);
}

function loadHandle(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveHandleLocal(h: string) {
  try {
    localStorage.setItem(STORAGE_KEY, h);
  } catch {}
}

export function useProHandle(defaults?: {
  firstName?: string | null;
  lastName?: string | null;
  trade?: string | null;
}) {
  // null = not yet confirmed by backend
  const [handle, setHandleState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProProfile()
      .then((pro) => {
        const h = pro.handle ?? loadHandle() ?? generateDefaultHandle(defaults?.firstName, defaults?.lastName, defaults?.trade);
        setHandleState(h);
        if (pro.handle) saveHandleLocal(pro.handle);
      })
      .catch(() => {
        // Not authenticated — fall back to localStorage cache
        const cached = loadHandle();
        setHandleState(cached ?? generateDefaultHandle(defaults?.firstName, defaults?.lastName, defaults?.trade));
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setHandle = useCallback(async (raw: string): Promise<void> => {
    const h = sanitizeHandle(raw);
    const pro = await apiUpdateHandle(h);
    const saved = pro.handle ?? h;
    setHandleState(saved);
    saveHandleLocal(saved);
  }, []);

  const profileUrl = handle ? `${window.location.origin}/pros/${handle}` : null;

  return { handle, loading, setHandle, profileUrl };
}

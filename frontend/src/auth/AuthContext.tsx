import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  getMe,
  googleAuth,
  login as apiLogin,
  refreshAccessToken,
  type UserOut,
} from "../api/endpoints";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../api/tokens";
import { clearAvatar, clearGooglePictureUrl, loadAvatar, saveAvatar, saveGooglePictureUrl } from "../hooks/useProAvatar";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: UserOut | null;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, role?: string) => Promise<{ created: boolean }>;
  logout: () => void;
  updateUser: (patch: Partial<UserOut>) => void;
}

function decodeGoogleJwt(jwt: string): Record<string, unknown> {
  try {
    const payload = jwt.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<UserOut | null>(null);

  // Restore the session on first load: try /me with the stored access token,
  // fall back to the refresh token once, otherwise drop to anonymous.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!getAccessToken()) {
        setStatus("anonymous");
        return;
      }
      try {
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
        return;
      } catch (err) {
        if (!(err instanceof ApiError) || err.status !== 401) {
          if (!cancelled) setStatus("anonymous");
          return;
        }
      }
      const refresh = getRefreshToken();
      if (!refresh) {
        clearTokens();
        if (!cancelled) setStatus("anonymous");
        return;
      }
      try {
        const { access } = await refreshAccessToken(refresh);
        setTokens(access);
        const me = await getMe();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        clearTokens();
        if (!cancelled) setStatus("anonymous");
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const pair = await apiLogin({ email, password });
      setTokens(pair.access, pair.refresh);
      setUser(pair.user);
      setStatus("authenticated");
    },
    [],
  );

  const loginWithGoogle = useCallback(async (idToken: string, role = "homeowner") => {
    const claims = decodeGoogleJwt(idToken);
    const googlePic = typeof claims.picture === "string" ? claims.picture : null;

    const pair = await googleAuth(idToken, role);

    if (googlePic) {
      const existing = loadAvatar();
      const hasManualPhoto = existing && existing.startsWith("data:");
      if (!hasManualPhoto) saveAvatar(googlePic);
      saveGooglePictureUrl(googlePic);
    }

    setTokens(pair.access, pair.refresh);
    setUser(pair.user);
    setStatus("authenticated");
    return { created: pair.created ?? false };
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    clearAvatar();
    clearGooglePictureUrl();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const updateUser = useCallback((patch: Partial<UserOut>) => {
    setUser((prev) => prev ? { ...prev, ...patch } : prev);
  }, []);

  const value = useMemo(
    () => ({ status, user, loginWithPassword, loginWithGoogle, logout, updateUser }),
    [status, user, loginWithPassword, loginWithGoogle, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

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
import { clearAvatar } from "../hooks/useProAvatar";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: UserOut | null;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string, role?: string) => Promise<{ created: boolean }>;
  logout: () => void;
  updateUser: (patch: Partial<UserOut>) => void;
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
    console.log("[GK Auth] loginWithGoogle() called");
    const pair = await googleAuth(idToken, role);
    console.log("[GK Auth] googleAuth returned, created:", pair.created, "user:", pair.user?.email);
    if (pair.created) clearAvatar();
    setTokens(pair.access, pair.refresh);
    setUser(pair.user);
    setStatus("authenticated");
    console.log("[GK Auth] status set to authenticated, navigating...");
    return { created: pair.created ?? false };
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    clearAvatar();
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

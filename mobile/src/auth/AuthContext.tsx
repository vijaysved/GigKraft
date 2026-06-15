import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authApi from '../api/auth';
import { setAccessToken } from '../api/client';
import { isExpired } from './jwt';
import { clearTokens, loadTokens, saveTokens } from './session';

export type Role = 'pro' | 'homeowner' | 'node_manager';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  user: authApi.ApiUser | null;
  role: Role | null;
  login: (email: string, password: string) => Promise<authApi.ApiUser>;
  register: (input: authApi.RegisterInput) => Promise<authApi.ApiUser>;
  requestOtp: (phone: string) => Promise<authApi.OtpRequestResult>;
  verifyOtp: (
    phone: string,
    code: string,
    role: 'pro' | 'homeowner',
  ) => Promise<authApi.ApiUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toRole(value: string): Role | null {
  return value === 'pro' || value === 'homeowner' || value === 'node_manager'
    ? value
    : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<authApi.ApiUser | null>(null);

  const applyTokenPair = useCallback(async (pair: authApi.TokenPair) => {
    setAccessToken(pair.access);
    await saveTokens(pair.access, pair.refresh);
    setUser(pair.user);
    setStatus('signedIn');
    return pair.user;
  }, []);

  const signOut = useCallback(async () => {
    setAccessToken(null);
    await clearTokens();
    setUser(null);
    setStatus('signedOut');
  }, []);

  // Restore the session on app open: reuse a valid access token, or
  // exchange the refresh token for a new one, then fetch the profile.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { access, refresh } = await loadTokens();
        let token = access && !isExpired(access) ? access : null;
        if (!token && refresh && !isExpired(refresh)) {
          token = await authApi.refresh(refresh);
          await saveTokens(token);
        }
        if (!token) {
          if (!cancelled) await signOut();
          return;
        }
        setAccessToken(token);
        const profile = await authApi.me();
        if (!cancelled) {
          setUser(profile);
          setStatus('signedIn');
        }
      } catch {
        if (!cancelled) await signOut();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signOut]);

  const login = useCallback(
    async (email: string, password: string) =>
      applyTokenPair(await authApi.login({ email, password })),
    [applyTokenPair],
  );

  const register = useCallback(
    async (input: authApi.RegisterInput) =>
      applyTokenPair(await authApi.register(input)),
    [applyTokenPair],
  );

  const requestOtp = useCallback(
    (phone: string) => authApi.requestOtp(phone),
    [],
  );

  const verifyOtp = useCallback(
    async (phone: string, code: string, role: 'pro' | 'homeowner') =>
      applyTokenPair(await authApi.verifyOtp(phone, code, role)),
    [applyTokenPair],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      role: user ? toRole(user.role) : null,
      login,
      register,
      requestOtp,
      verifyOtp,
      logout: signOut,
    }),
    [status, user, login, register, requestOtp, verifyOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}

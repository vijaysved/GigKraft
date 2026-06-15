const ACCESS_KEY = "gigkraft.auth.access";
const REFRESH_KEY = "gigkraft.auth.refresh";

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh?: string): void {
  window.localStorage.setItem(ACCESS_KEY, access);
  if (refresh !== undefined) {
    window.localStorage.setItem(REFRESH_KEY, refresh);
  }
}

export function clearTokens(): void {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

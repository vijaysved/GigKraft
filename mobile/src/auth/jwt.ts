// Minimal JWT payload decoding (no signature verification; the backend is
// the authority -- we only read claims for routing and expiry checks).

export interface JwtClaims {
  exp?: number;
  user_id?: number;
  role?: string;
  [key: string]: unknown;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return globalThis.atob(padded);
}

export function decodeJwt(token: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(base64UrlDecode(parts[1])) as JwtClaims;
  } catch {
    return null;
  }
}

/** True if the token is expired (or expires within `skewSeconds`). */
export function isExpired(token: string, skewSeconds = 30): boolean {
  const claims = decodeJwt(token);
  if (!claims?.exp) return true;
  return claims.exp <= Date.now() / 1000 + skewSeconds;
}

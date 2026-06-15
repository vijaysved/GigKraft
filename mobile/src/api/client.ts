import createClient, { Middleware } from 'openapi-fetch';

import { config } from '../config';
import type { paths } from './generated/types';

// In-memory access token; the source of truth lives in expo-secure-store
// (see src/auth/session.ts). AuthContext keeps this in sync.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

const authMiddleware: Middleware = {
  onRequest({ request }) {
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return request;
  },
};

export const api = createClient<paths>({ baseUrl: config.apiBaseUrl });
api.use(authMiddleware);

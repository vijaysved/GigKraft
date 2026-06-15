// Typed wrappers around the backend auth endpoints. Request/response shapes
// come from the generated OpenAPI types (npm run generate:api).

import { api } from './client';
import type { components } from './generated/types';

export type TokenPair = components['schemas']['TokenPairOut'];
export type ApiUser = components['schemas']['UserOut'];
export type RegisterInput = components['schemas']['RegisterIn'];
export type LoginInput = components['schemas']['LoginIn'];
export type OtpRequestResult = components['schemas']['OTPRequestOut'];

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function fail(status: number, detail?: string): never {
  throw new ApiError(detail ?? `Request failed (${status})`, status);
}

export async function login(input: LoginInput): Promise<TokenPair> {
  const { data, error, response } = await api.POST('/api/auth/login', {
    body: input,
  });
  if (data) return data;
  fail(response.status, error?.detail);
}

export async function register(input: RegisterInput): Promise<TokenPair> {
  const { data, error, response } = await api.POST('/api/auth/register', {
    body: input,
  });
  if (data) return data;
  fail(response.status, error?.detail);
}

export async function refresh(refreshToken: string): Promise<string> {
  const { data, error, response } = await api.POST('/api/auth/refresh', {
    body: { refresh: refreshToken },
  });
  if (data) return data.access;
  fail(response.status, error?.detail);
}

export async function me(): Promise<ApiUser> {
  const { data, response } = await api.GET('/api/me');
  if (data) return data;
  fail(response.status);
}

export async function requestOtp(phone: string): Promise<OtpRequestResult> {
  const { data, error, response } = await api.POST('/api/auth/otp/request', {
    body: { phone },
  });
  if (data) return data;
  fail(response.status, error?.detail);
}

export async function verifyOtp(
  phone: string,
  code: string,
  role: 'pro' | 'homeowner',
): Promise<TokenPair> {
  const { data, error, response } = await api.POST('/api/auth/otp/verify', {
    body: { phone, code, role },
  });
  if (data) return data;
  fail(response.status, error?.detail);
}

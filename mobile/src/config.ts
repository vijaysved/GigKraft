// App configuration sourced from EXPO_PUBLIC_* env vars (see .env.example).

export const config = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:8000',
  mockOtp: (process.env.EXPO_PUBLIC_MOCK_OTP ?? 'true') === 'true',
  mockPush: (process.env.EXPO_PUBLIC_MOCK_PUSH ?? 'true') === 'true',
} as const;

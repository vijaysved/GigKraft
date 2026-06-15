/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string;
  readonly VITE_MOCK_GOOGLE_OAUTH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

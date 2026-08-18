/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HBS_API_BASE_URL?: string;
  readonly VITE_APP_ENVIRONMENT?: "local" | "staging" | "production";
  readonly VITE_RELEASE_SHA?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HBS_API_BASE_URL?: string;
  readonly VITE_APP_ENVIRONMENT?: "local" | "staging" | "production";
  readonly VITE_RELEASE_SHA?: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_META_CATALOG_ID?: string;
  readonly VITE_META_SITE_ID?: string;
  readonly VITE_META_PURCHASE_TRANSPORT?: "browser" | "server" | "deduplicated";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

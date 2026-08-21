/**
 * Configuration centrale du back-office.
 * `dataProvider` bascule sur "api" quand le backend Codex sera disponible.
 */
export type AdminDataProvider = "mock" | "api";

export const adminConfig = {
  dataProvider: "mock" as AdminDataProvider,
  /** Le catalogue est la première surface Admin migrée vers l'API. */
  catalogDataProvider: "api" as AdminDataProvider,
  demoMode: true,
  pageSize: 20,
  currency: "TND",
} as const;

export const ADMIN_STORAGE_KEY = "hbs-home-admin-demo-v1";
export const ADMIN_STORAGE_VERSION = 1;

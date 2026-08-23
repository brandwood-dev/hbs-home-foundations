/**
 * Configuration centrale du back-office.
 * `dataProvider` bascule sur "api" quand le backend Codex sera disponible.
 */
export type AdminDataProvider = "mock" | "api";

export const adminConfig = {
  dataProvider: "mock" as AdminDataProvider,
  /** Le catalogue est la première surface Admin migrée vers l'API. */
  catalogDataProvider: "api" as AdminDataProvider,
  promotionDataProvider: "api" as AdminDataProvider,
  /** Les commandes persistées sont lues depuis l'API ; les actions suivront. */
  orderDataProvider: "api" as AdminDataProvider,
  /** Les fiches clients persistées suivent les commandes en Phase 6E. */
  customerDataProvider: "api" as AdminDataProvider,
  /** La médiathèque éditoriale est migrée dans la phase 9C. */
  mediaDataProvider: "api" as AdminDataProvider,
  demoMode: false,
  pageSize: 20,
  currency: "TND",
} as const;

export const ADMIN_STORAGE_KEY = "hbs-home-admin-demo-v1";
export const ADMIN_STORAGE_VERSION = 1;

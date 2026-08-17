import { ADMIN_STORAGE_KEY, ADMIN_STORAGE_VERSION } from "@/admin/config/admin.config";
import type { AdminAuditLog, AdminMockDatabase } from "@/admin/types/admin.types";
import { createSeedDatabase } from "@/admin/mock/admin-seed";
import { adminId } from "@/admin/utils/admin.utils";

/**
 * Base mock persistée. Seul ce module touche localStorage :
 * aucun composant ne doit y accéder directement.
 * SSR : le stockage n'est lu que côté client, la lecture serveur renvoie le seed.
 */

let cache: AdminMockDatabase | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isValid(value: unknown): value is AdminMockDatabase {
  if (typeof value !== "object" || value === null) return false;
  const db = value as Partial<AdminMockDatabase>;
  return (
    db.version === ADMIN_STORAGE_VERSION &&
    Array.isArray(db.products) &&
    Array.isArray(db.orders) &&
    Array.isArray(db.categories) &&
    typeof db.settings === "object" &&
    db.settings !== null
  );
}

function persist(db: AdminMockDatabase): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* quota dépassé : le back-office reste utilisable en mémoire */
  }
}

export function getDb(): AdminMockDatabase {
  if (cache) return cache;
  if (isBrowser()) {
    try {
      const raw = window.localStorage.getItem(ADMIN_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) {
          cache = parsed;
          return cache;
        }
      }
    } catch {
      /* données corrompues : on repart du seed */
    }
    cache = createSeedDatabase();
    persist(cache);
    return cache;
  }
  // Rendu serveur : base éphémère, jamais persistée.
  cache = createSeedDatabase();
  return cache;
}

/** Mutation atomique : applique le changement puis persiste. */
export function mutateDb<T>(mutator: (db: AdminMockDatabase) => T): T {
  const db = getDb();
  const result = mutator(db);
  persist(db);
  return result;
}

export function logActivity(entry: {
  action: AdminAuditLog["action"];
  resourceType: string;
  resourceId: string;
  details: string;
}): void {
  mutateDb((db) => {
    db.auditLogs.unshift({
      id: adminId("log"),
      at: new Date().toISOString(),
      userId: "usr_1",
      userName: "Hana Ben Salah",
      ...entry,
    });
    db.auditLogs = db.auditLogs.slice(0, 200);
  });
}

export function resetDb(): AdminMockDatabase {
  cache = createSeedDatabase();
  persist(cache);
  return cache;
}

export function exportDb(): string {
  return JSON.stringify(getDb(), null, 2);
}

export function importDb(json: string): AdminMockDatabase {
  const parsed: unknown = JSON.parse(json);
  if (!isValid(parsed)) throw new Error("Fichier de démonstration invalide.");
  cache = parsed;
  persist(cache);
  return cache;
}

/** Copie défensive : les composants ne mutent jamais la base directement. */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

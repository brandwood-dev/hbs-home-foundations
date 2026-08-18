import { SEARCH_HISTORY_VERSION } from "@/domain/search/search.constants";

/**
 * Point d'entrée des migrations d'historique.
 * Une version inconnue est ignorée : l'historique repart à vide, sans erreur.
 */
export function migrateSearchHistory(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as { version?: unknown };
  if (candidate.version === SEARCH_HISTORY_VERSION) return raw;
  return null;
}

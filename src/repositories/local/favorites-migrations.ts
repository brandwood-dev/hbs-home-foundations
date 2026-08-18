import { FAVORITES_VERSION } from "@/domain/favorites/favorites.constants";

/**
 * Migrations de la liste de favoris.
 * Une version inconnue est ignorée (liste vide) plutôt que de faire planter la page.
 */
export function migrateFavorites(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as { version?: unknown; items?: unknown };
  if (candidate.version === FAVORITES_VERSION) return raw;
  // Ancien format éventuel : simple tableau d'identifiants.
  if (Array.isArray(raw)) {
    return {
      version: FAVORITES_VERSION,
      items: raw
        .filter((id): id is string => typeof id === "string")
        .map((productId) => ({ productId, addedAt: new Date(0).toISOString() })),
    };
  }
  return null;
}

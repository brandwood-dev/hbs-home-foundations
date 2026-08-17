import { CART_STORAGE_VERSION } from "@/domain/cart/cart.constants";

/**
 * Migrations du panier local.
 * Toute structure inconnue ou trop ancienne est réinitialisée proprement.
 */
export function migratePersistedCart(input: unknown): unknown {
  if (input == null || typeof input !== "object") return null;
  const candidate = input as { version?: unknown; items?: unknown; updatedAt?: unknown };

  // Version courante : rien à faire, la validation Zod prendra le relais.
  if (candidate.version === CART_STORAGE_VERSION) return candidate;

  // Structure historique sans version : tableau de lignes ou objet sans version.
  if (candidate.version === undefined && Array.isArray(candidate.items)) {
    return {
      version: CART_STORAGE_VERSION,
      updatedAt:
        typeof candidate.updatedAt === "string" ? candidate.updatedAt : new Date().toISOString(),
      items: candidate.items,
    };
  }

  // Version inconnue (future ou corrompue) : on repart d'un panier vide.
  return null;
}

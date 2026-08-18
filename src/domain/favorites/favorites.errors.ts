export type FavoritesErrorCode =
  "storage_unavailable" | "storage_write_failed" | "limit_reached" | "product_not_found";

export class FavoritesError extends Error {
  constructor(
    public readonly code: FavoritesErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "FavoritesError";
  }
}

export const FAVORITES_ERROR_MESSAGES: Record<FavoritesErrorCode, string> = {
  storage_unavailable:
    "Vos favoris ne peuvent pas être enregistrés sur cet appareil (stockage désactivé).",
  storage_write_failed: "Impossible d'enregistrer vos favoris. Réessayez.",
  limit_reached:
    "Votre liste de favoris est pleine. Retirez un article avant d'en ajouter un autre.",
  product_not_found: "Cet article n'est plus disponible.",
};

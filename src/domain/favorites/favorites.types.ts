import type { Product } from "@/domain/product/product.types";

/** Entrée persistée : uniquement l'identifiant produit et la date d'ajout. */
export interface PersistedFavoriteItem {
  productId: string;
  addedAt: string;
}

export interface PersistedFavorites {
  version: 1;
  items: PersistedFavoriteItem[];
}

/** Favori résolu contre le catalogue courant (prix et stock à jour). */
export interface ResolvedFavoriteItem {
  productId: string;
  addedAt: string;
  product: Product;
  isAvailable: boolean;
}

export interface ResolvedFavorites {
  items: ResolvedFavoriteItem[];
  /** Produits retirés du catalogue, signalés puis nettoyés. */
  removedProductIds: string[];
  count: number;
}

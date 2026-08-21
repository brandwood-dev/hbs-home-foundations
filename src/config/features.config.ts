/** Feature flags du site. Le checkout invité est actif depuis la phase 5. */
export const features = {
  checkout: true,
  cartRecommendations: true,
  /** Suivi de commande sans compte (phase 6). */
  orderTracking: true,
  /** Recherche globale (phase 10). */
  search: true,
  /** Favoris locaux (phase 10). */
  wishlist: true,

  customerAccount: false,
  onlinePayment: false,
  reviews: false,
} as const;

/**
 * Source de données du site public.
 *
 * Le preview/production fournit l’URL API au build ; le fallback mock permet
 * de conserver un démarrage local sans dépendance à un backend distant.
 */
export const dataProvider: "mock" | "api" = import.meta.env.VITE_HBS_API_BASE_URL?.trim().length
  ? "api"
  : "mock";

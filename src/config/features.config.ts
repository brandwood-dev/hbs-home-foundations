/** Feature flags du site. Le checkout invité est actif depuis la phase 5. */
export const features = {
  checkout: true,
  cartRecommendations: true,
  /** Suivi de commande sans compte (phase 6). */
  orderTracking: true,

  customerAccount: false,
  onlinePayment: false,
  reviews: false,
} as const;

/** Source de données courante — bascule vers "api" lors du branchement backend. */
export const dataProvider: "mock" | "api" = "mock";

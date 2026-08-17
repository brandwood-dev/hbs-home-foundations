import type { OrderStatus } from "@/domain/order/order.types";

export const ORDER_STORAGE_KEY = "hbs-home-orders-demo";
export const ORDER_STORAGE_VERSION = 1;
export const ORDER_NUMBER_PREFIX = "HBS";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_confirmation: "En attente de confirmation",
  confirmed: "Confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const ORDER_DEMO_NOTICE =
  "Commande de démonstration : aucun paiement n'est encaissé et aucune donnée n'est transmise à un serveur.";

export const ORDER_CONFIRMATION_NEXT_STEPS = [
  "Notre équipe vous appelle pour confirmer les articles et l'adresse de livraison.",
  "Votre commande est préparée puis remise au livreur.",
  "Vous réglez le montant en espèces à la réception de votre colis.",
] as const;

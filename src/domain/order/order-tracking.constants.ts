import type { OrderStatus } from "@/domain/order/order.types";
import type { OrderTrackingStepKey } from "@/domain/order/order-tracking.types";

export const MOCK_ORDER_SESSION_STORAGE_KEY = "hbs-home-orders-demo-v1";
export const MOCK_ORDER_SESSION_VERSION = 1;
export const MOCK_ORDER_SESSION_MAX = 10;

/** Un seul message, quelle que soit la cause : limite l'énumération des commandes. */
export const ORDER_TRACKING_NOT_FOUND_MESSAGE =
  "Aucune commande ne correspond aux informations saisies. Vérifiez le numéro de commande et le téléphone utilisés lors de l'achat.";

export const ORDER_NUMBER_ERROR =
  "Saisissez un numéro de commande valide, par exemple HBS-20260818-100001.";

export const ORDER_TRACKING_STATUS_TITLES: Record<OrderStatus, string> = {
  pending_confirmation: "En attente de confirmation",
  confirmed: "Commande confirmée",
  preparing: "En préparation",
  shipped: "Commande expédiée",
  delivered: "Commande livrée",
  cancelled: "Commande annulée",
};

export const ORDER_TRACKING_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  pending_confirmation:
    "Votre commande a été enregistrée et doit encore être confirmée par notre équipe.",
  confirmed: "Votre commande a été confirmée et sera prochainement préparée.",
  preparing: "Notre équipe prépare actuellement votre commande.",
  shipped: "Votre commande a quitté notre dépôt et est en cours de livraison.",
  delivered: "Votre commande a été indiquée comme livrée.",
  cancelled: "Cette commande a été annulée.",
};

export const ORDER_TRACKING_NEXT_STEPS: Record<OrderStatus, string> = {
  pending_confirmation: "Notre équipe doit encore confirmer votre commande.",
  confirmed: "Votre commande sera prochainement préparée.",
  preparing: "Votre commande est actuellement en cours de préparation.",
  shipped: "Votre commande est en cours de livraison.",
  delivered: "Votre commande a été indiquée comme livrée.",
  cancelled: "Cette commande ne poursuivra pas le parcours de livraison.",
};

export const ORDER_TRACKING_CANCELLED_NOTICE =
  "Cette commande a été annulée. Pour toute question, contactez notre service client.";

export const ORDER_TRACKING_STEPS: {
  key: OrderTrackingStepKey;
  label: string;
  description: string;
}[] = [
  {
    key: "received",
    label: "Commande reçue",
    description: "Nous avons bien enregistré votre commande.",
  },
  {
    key: "confirmed",
    label: "Commande confirmée",
    description: "Notre équipe confirme les articles et l'adresse.",
  },
  {
    key: "preparing",
    label: "En préparation",
    description: "Vos articles sont préparés et emballés.",
  },
  {
    key: "shipped",
    label: "Expédiée",
    description: "Votre commande est en cours de livraison.",
  },
  {
    key: "delivered",
    label: "Livrée",
    description: "Votre commande a été indiquée comme livrée.",
  },
];

export const ORDER_TRACKING_DEMO_NOTICE =
  "Suivi de démonstration : les commandes sont conservées uniquement dans l'onglet courant.";

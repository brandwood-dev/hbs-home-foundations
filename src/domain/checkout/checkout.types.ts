/** Types du tunnel de commande invité (aucun compte client). */

export type DeliveryMethod = "home_delivery" | "store_pickup";

export type PaymentMethod = "cash_on_delivery";

export interface CheckoutCustomer {
  firstName: string;
  lastName: string;
  /** Toujours normalisé au format +216XXXXXXXX. */
  phone: string;
  email?: string;
}

export interface CheckoutAddress {
  governorate: string;
  city: string;
  postalCode?: string;
  addressLine: string;
  landmark?: string;
  deliveryNote?: string;
}

export interface CheckoutFormValues {
  customer: CheckoutCustomer;
  deliveryMethod: DeliveryMethod;
  shippingAddress?: CheckoutAddress;
  paymentMethod: PaymentMethod;
  acceptedTerms: boolean;
}

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  home_delivery: "Livraison à domicile",
  store_pickup: "Retrait en magasin",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash_on_delivery: "Paiement à la livraison",
};

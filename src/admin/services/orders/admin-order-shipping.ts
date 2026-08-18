import type {
  AdminOrder,
  AdminShipmentInfo,
  AdminShippingProfile,
  AdminShippingStatus,
} from "@/admin/types/admin.types";
import type { StatusTone } from "@/admin/services/order-status";

export const SHIPPING_STATUS_LABELS: Record<AdminShippingStatus, string> = {
  calculated: "Frais calculés",
  to_confirm: "Frais de livraison à confirmer",
};

export const SHIPPING_STATUS_TONE: Record<AdminShippingStatus, StatusTone> = {
  calculated: "success",
  to_confirm: "warning",
};

export const SHIPPING_PROFILE_LABELS: Record<AdminShippingProfile, string> = {
  standard: "Livraison standard",
  fragile: "Livraison fragile",
  bulky: "Livraison mobilier",
  oversized: "Livraison spéciale",
};

export const DELIVERY_METHOD_LABELS: Record<AdminOrder["deliveryMethod"], string> = {
  home_delivery: "Livraison à domicile",
  store_pickup: "Retrait en magasin",
};

const PROFILE_WEIGHT: Record<AdminShippingProfile, number> = {
  standard: 0,
  fragile: 1,
  bulky: 2,
  oversized: 3,
};

/** Profil le plus contraignant présent dans la commande. */
export function getOrderShippingProfile(order: AdminOrder): AdminShippingProfile {
  let worst: AdminShippingProfile = "standard";
  for (const item of order.items) {
    const profile = item.shippingProfile ?? "standard";
    if (PROFILE_WEIGHT[profile] > PROFILE_WEIGHT[worst]) worst = profile;
  }
  return worst;
}

export function getShipment(order: AdminOrder): AdminShipmentInfo {
  return order.shipment ?? { shippingStatus: "calculated" };
}

export function getShippingStatus(order: AdminOrder): AdminShippingStatus {
  return getShipment(order).shippingStatus;
}

export function isShippingToConfirm(order: AdminOrder): boolean {
  return getShippingStatus(order) === "to_confirm";
}

/** Retrait en magasin gratuit : la confirmation reste possible sans frais définis. */
export function canConfirmWithoutShippingFee(order: AdminOrder): boolean {
  return order.deliveryMethod === "store_pickup";
}

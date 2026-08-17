import veloursImg from "@/assets/catalog/rideau-velours.jpg";
import linImg from "@/assets/catalog/rideau-lin.jpg";
import packImg from "@/assets/catalog/pack-rideau-voilage.jpg";
import type { Order, OrderItemSnapshot, OrderStatus } from "@/domain/order/order.types";
import type { DeliveryMethod } from "@/domain/checkout/checkout.types";
import { calculateOrderTotals } from "@/services/checkout/checkout-calculations";

/**
 * Commandes fictives réservées au test du suivi (mode mock).
 * Aucune donnée personnelle réelle. Les composants ne doivent jamais importer ce fichier.
 */

interface DemoItemInput {
  slug: string;
  name: string;
  imageUrl: string;
  unitPriceMinor: number;
  quantity: number;
  colorLabel: string;
}

function demoItem(index: number, input: DemoItemInput): OrderItemSnapshot {
  return {
    productId: `demo-p-${index}`,
    variantId: `demo-v-${index}`,
    productSlug: input.slug,
    productName: input.name,
    productReference: `REF-DEMO-${index}`,
    sku: `SKU-DEMO-${index}`,
    imageUrl: input.imageUrl,
    imageAlt: input.name,
    quantity: input.quantity,
    unitPriceMinor: input.unitPriceMinor,
    lineTotalMinor: input.unitPriceMinor * input.quantity,
    colorLabel: input.colorLabel,
    widthCm: 140,
    heightCm: 260,
    sellingUnitLabel: "Panneau",
  };
}

interface DemoOrderInput {
  orderNumber: string;
  phone: string;
  firstName: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  createdAt: string;
  updatedAt?: string;
  governorate?: string;
  city?: string;
  items: DemoItemInput[];
}

function demoOrder(index: number, input: DemoOrderInput): Order {
  const items = input.items.map((item, itemIndex) => demoItem(index * 10 + itemIndex, item));
  return {
    id: `demo-order-${index}`,
    orderNumber: input.orderNumber,
    status: input.status,
    customer: {
      firstName: input.firstName,
      lastName: "Démonstration",
      phone: input.phone,
    },
    deliveryMethod: input.deliveryMethod,
    ...(input.deliveryMethod === "home_delivery"
      ? {
          shippingAddress: {
            governorate: input.governorate ?? "tunis",
            city: input.city ?? "Tunis",
            addressLine: "Adresse de démonstration",
          },
        }
      : {}),
    paymentMethod: "cash_on_delivery",
    items,
    totals: calculateOrderTotals(items, input.deliveryMethod),
    createdAt: input.createdAt,
    ...(input.updatedAt ? { updatedAt: input.updatedAt } : {}),
    idempotencyKey: `demo-${input.orderNumber}`,
    isDemo: true,
  };
}

const VELOURS: DemoItemInput = {
  slug: "rideau-velours-ivoire",
  name: "Rideau velours — Ivoire",
  imageUrl: veloursImg,
  unitPriceMinor: 129000,
  quantity: 2,
  colorLabel: "Ivoire",
};

const LIN: DemoItemInput = {
  slug: "rideau-lin-sable",
  name: "Rideau lin lavé — Sable",
  imageUrl: linImg,
  unitPriceMinor: 149000,
  quantity: 1,
  colorLabel: "Sable",
};

const PACK: DemoItemInput = {
  slug: "pack-rideau-voilage",
  name: "Pack rideau + voilage",
  imageUrl: packImg,
  unitPriceMinor: 219000,
  quantity: 1,
  colorLabel: "Lin naturel",
};

export const DEMO_TRACKING_ORDERS: Order[] = [
  demoOrder(1, {
    orderNumber: "HBS-20260818-100001",
    phone: "+21622123456",
    firstName: "Mohamed",
    status: "pending_confirmation",
    deliveryMethod: "home_delivery",
    createdAt: "2026-08-18T09:15:00.000Z",
    governorate: "tunis",
    city: "Tunis",
    items: [VELOURS],
  }),
  demoOrder(2, {
    orderNumber: "HBS-20260818-100002",
    phone: "+21698765432",
    firstName: "Sarra",
    status: "confirmed",
    deliveryMethod: "home_delivery",
    createdAt: "2026-08-17T10:40:00.000Z",
    updatedAt: "2026-08-17T14:05:00.000Z",
    governorate: "sousse",
    city: "Sousse",
    items: [LIN, VELOURS],
  }),
  demoOrder(3, {
    orderNumber: "HBS-20260818-100003",
    phone: "+21655112233",
    firstName: "Amine",
    status: "preparing",
    deliveryMethod: "home_delivery",
    createdAt: "2026-08-16T08:20:00.000Z",
    updatedAt: "2026-08-17T09:00:00.000Z",
    governorate: "sfax",
    city: "Sfax",
    items: [PACK],
  }),
  demoOrder(4, {
    orderNumber: "HBS-20260818-100004",
    phone: "+21620304050",
    firstName: "Nadia",
    status: "shipped",
    deliveryMethod: "home_delivery",
    createdAt: "2026-08-14T11:00:00.000Z",
    updatedAt: "2026-08-16T16:30:00.000Z",
    governorate: "nabeul",
    city: "Hammamet",
    items: [LIN],
  }),
  demoOrder(5, {
    orderNumber: "HBS-20260818-100005",
    phone: "+21624681012",
    firstName: "Youssef",
    status: "delivered",
    deliveryMethod: "store_pickup",
    createdAt: "2026-08-10T07:45:00.000Z",
    updatedAt: "2026-08-13T13:10:00.000Z",
    items: [VELOURS],
  }),
  demoOrder(6, {
    orderNumber: "HBS-20260818-100006",
    phone: "+21627889900",
    firstName: "Ines",
    status: "cancelled",
    deliveryMethod: "home_delivery",
    createdAt: "2026-08-12T12:00:00.000Z",
    updatedAt: "2026-08-12T18:20:00.000Z",
    governorate: "bizerte",
    city: "Ras Jebel",
    items: [PACK],
  }),
];

/** Commande mise en avant par l'aide de démonstration. */
export const DEMO_TRACKING_SHOWCASE = {
  orderNumber: "HBS-20260818-100003",
  phone: "55 112 233",
} as const;

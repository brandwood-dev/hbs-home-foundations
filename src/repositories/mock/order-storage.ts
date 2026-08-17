import { ORDER_STORAGE_KEY, ORDER_STORAGE_VERSION } from "@/domain/order/order.constants";
import { OrderError } from "@/domain/order/order.errors";
import type { Order } from "@/domain/order/order.types";

interface StoredOrders {
  version: number;
  orders: Order[];
}

const MAX_STORED_ORDERS = 10;

function getStorage(): Storage {
  if (typeof window === "undefined" || !window.sessionStorage) {
    throw new OrderError("storage_unavailable", "sessionStorage indisponible");
  }
  return window.sessionStorage;
}

function isOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Order>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.orderNumber === "string" &&
    typeof candidate.idempotencyKey === "string" &&
    Array.isArray(candidate.items) &&
    typeof candidate.totals === "object" &&
    candidate.totals !== null
  );
}

export function readStoredOrders(): Order[] {
  let raw: string | null = null;
  try {
    raw = getStorage().getItem(ORDER_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as Partial<StoredOrders>;
    if (parsed?.version !== ORDER_STORAGE_VERSION || !Array.isArray(parsed.orders)) return [];
    return parsed.orders.filter(isOrder);
  } catch {
    return [];
  }
}

export function writeStoredOrders(orders: Order[]): void {
  const payload: StoredOrders = {
    version: ORDER_STORAGE_VERSION,
    orders: orders.slice(-MAX_STORED_ORDERS),
  };
  try {
    getStorage().setItem(ORDER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* Le tunnel reste fonctionnel même si la session ne peut pas être écrite. */
  }
}

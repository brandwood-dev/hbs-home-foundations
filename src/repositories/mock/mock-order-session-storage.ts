import { ORDER_STORAGE_KEY } from "@/domain/order/order.constants";
import {
  MOCK_ORDER_SESSION_MAX,
  MOCK_ORDER_SESSION_STORAGE_KEY,
  MOCK_ORDER_SESSION_VERSION,
} from "@/domain/order/order-tracking.constants";
import type { Order } from "@/domain/order/order.types";

export interface MockOrderSessionDatabase {
  version: 1;
  orders: Order[];
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}

export function isStoredOrder(value: unknown): value is Order {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Order>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.orderNumber === "string" &&
    typeof candidate.idempotencyKey === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.customer === "object" &&
    candidate.customer !== null &&
    Array.isArray(candidate.items) &&
    typeof candidate.totals === "object" &&
    candidate.totals !== null
  );
}

function parseOrders(raw: string | null, expectVersion: boolean): Order[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<MockOrderSessionDatabase>;
    if (!Array.isArray(parsed?.orders)) return [];
    if (expectVersion && parsed.version !== MOCK_ORDER_SESSION_VERSION) return [];
    return parsed.orders.filter(isStoredOrder);
  } catch {
    return [];
  }
}

/** Migration de la clé de la phase 5 vers l'historique versionné. */
function migrateLegacyOrders(storage: Storage): Order[] {
  let legacy: Order[] = [];
  try {
    legacy = parseOrders(storage.getItem(ORDER_STORAGE_KEY), false);
    if (legacy.length > 0) {
      storage.setItem(
        MOCK_ORDER_SESSION_STORAGE_KEY,
        JSON.stringify({ version: MOCK_ORDER_SESSION_VERSION, orders: legacy }),
      );
    }
    storage.removeItem(ORDER_STORAGE_KEY);
  } catch {
    return legacy;
  }
  return legacy;
}

export function readSessionOrders(): Order[] {
  const storage = getStorage();
  if (!storage) return [];
  let raw: string | null = null;
  try {
    raw = storage.getItem(MOCK_ORDER_SESSION_STORAGE_KEY);
  } catch {
    return [];
  }
  if (!raw) return migrateLegacyOrders(storage);
  return parseOrders(raw, true);
}

export function writeSessionOrders(orders: Order[]): void {
  const storage = getStorage();
  if (!storage) return;
  const payload: MockOrderSessionDatabase = {
    version: MOCK_ORDER_SESSION_VERSION,
    orders: orders.slice(-MOCK_ORDER_SESSION_MAX),
  };
  try {
    storage.setItem(MOCK_ORDER_SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* Le tunnel reste fonctionnel même si la session ne peut pas être écrite. */
  }
}

export function appendSessionOrder(order: Order): void {
  writeSessionOrders([...readSessionOrders(), order]);
}

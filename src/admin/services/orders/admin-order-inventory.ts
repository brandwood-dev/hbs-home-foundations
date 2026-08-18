import type { AdminOrder, AdminOrderItem, AdminProduct } from "@/admin/types/admin.types";

export interface StockShortage {
  productName: string;
  sku: string;
  requested: number;
  available: number;
}

/** Une ligne est suivie en stock uniquement si la variante l'est encore. */
export function isTrackedLine(item: AdminOrderItem, product: AdminProduct | undefined): boolean {
  if (item.trackInventory === false) return false;
  if (!product) return false;
  if (product.sellingMode === "custom_quote") return false;
  const variant = product.variants.find((entry) => entry.id === item.variantId);
  if (!variant) return false;
  if (variant.trackInventory === false) return false;
  if (variant.availability === "made_to_order") return false;
  return true;
}

/** Contrôle transactionnel : renvoie toutes les lignes en conflit. */
export function findStockShortages(order: AdminOrder, products: AdminProduct[]): StockShortage[] {
  const shortages: StockShortage[] = [];
  for (const item of order.items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!isTrackedLine(item, product)) continue;
    const variant = product?.variants.find((entry) => entry.id === item.variantId);
    if (!variant) continue;
    if (variant.stock < item.quantity) {
      shortages.push({
        productName: item.productName,
        sku: item.sku,
        requested: item.quantity,
        available: variant.stock,
      });
    }
  }
  return shortages;
}

export function stockShortageMessage(shortages: StockShortage[]): string {
  return [
    "Stock insuffisant : la confirmation est bloquée.",
    ...shortages.map(
      (line) =>
        `${line.productName} (${line.sku}) — demandé ${line.requested}, disponible ${line.available}`,
    ),
  ].join("\n");
}

export function isStockDeducted(order: AdminOrder): boolean {
  return Boolean(order.inventoryState?.deductedAt);
}

export function isStockRestored(order: AdminOrder): boolean {
  return Boolean(order.inventoryState?.restoredAt);
}

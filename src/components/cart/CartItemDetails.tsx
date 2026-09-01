import type { ResolvedCartItem } from "@/domain/cart/cart.types";
import { formatOptionDetails } from "@/services/product/product-options";

/** Attributs de la variante, affichés de façon compacte. */
export function CartItemDetails({ item }: { item: ResolvedCartItem }) {
  const selected = formatOptionDetails(item.selectedOptions);
  const fallback = [
    item.colorLabel,
    item.widthCm && item.heightCm ? `${item.widthCm} × ${item.heightCm} cm` : undefined,
    item.curtainHeaderLabel,
    item.eyeletColorLabel,
    item.liningLabel,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  const summary = [selected || fallback, item.sellingUnitLabel]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

  return <p className="mt-1 text-xs text-foreground-muted">{summary}</p>;
}

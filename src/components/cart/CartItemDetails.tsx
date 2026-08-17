import type { ResolvedCartItem } from "@/domain/cart/cart.types";

/** Attributs de la variante, affichés de façon compacte. */
export function CartItemDetails({ item }: { item: ResolvedCartItem }) {
  const parts = [
    item.colorLabel,
    item.widthCm && item.heightCm ? `${item.widthCm} × ${item.heightCm} cm` : undefined,
    item.curtainHeaderLabel,
    item.eyeletColorLabel,
    item.liningLabel,
    item.sellingUnitLabel,
  ].filter((part): part is string => Boolean(part));

  return (
    <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-foreground-muted">
      {parts.map((part) => (
        <li key={part} className="after:ml-2 after:content-['·'] last:after:content-none">
          {part}
        </li>
      ))}
    </ul>
  );
}

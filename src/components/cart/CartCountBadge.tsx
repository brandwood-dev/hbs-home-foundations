import { useCart } from "@/hooks/cart/useCart";

/** Nombre total d'unités du panier, calculé côté client uniquement (SSR-safe). */
export function useCartCount(): { count: number; label: string; ready: boolean } {
  const { cart, hydrated } = useCart();
  const count = hydrated ? cart.itemCount : 0;
  return {
    count,
    label: count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier, vide",
    ready: hydrated,
  };
}

export function CartCountBadge({ className = "" }: { className?: string }) {
  const { count } = useCartCount();
  if (count <= 0) return null;
  return (
    <span aria-hidden="true" className={className}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

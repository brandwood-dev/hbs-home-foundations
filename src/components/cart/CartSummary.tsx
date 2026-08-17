import { CART_ESTIMATE_NOTICE } from "@/domain/cart/cart.constants";
import type { Cart } from "@/domain/cart/cart.types";
import { CartShippingProgress } from "@/components/cart/CartShippingProgress";
import { formatMoney } from "@/lib/money/money";

export function CartSummary({ cart, title = "Résumé estimatif" }: { cart: Cart; title?: string }) {
  const { totals } = cart;

  return (
    <section aria-label={title} className="space-y-4 rounded-sm border border-border bg-surface p-4">
      <h2 className="text-lg">{title}</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">
            Sous-total ({cart.itemCount} article{cart.itemCount > 1 ? "s" : ""})
          </dt>
          <dd>{formatMoney(totals.subtotalMinor)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Livraison estimée</dt>
          <dd>{totals.hasFreeShipping ? "Offerte" : formatMoney(totals.shippingMinor)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-medium">
          <dt>Total estimé</dt>
          <dd>{formatMoney(totals.totalEstimatedMinor)}</dd>
        </div>
      </dl>

      <CartShippingProgress totals={totals} />

      <p className="text-xs text-foreground-muted">{CART_ESTIMATE_NOTICE}</p>
    </section>
  );
}

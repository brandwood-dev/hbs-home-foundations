import { CART_ESTIMATE_NOTICE } from "@/domain/cart/cart.constants";
import type { Cart } from "@/domain/cart/cart.types";
import { CartShippingProgress } from "@/components/cart/CartShippingProgress";
import { formatMoney } from "@/lib/money/money";

export function CartSummary({ cart, title = "Résumé estimatif" }: { cart: Cart; title?: string }) {
  const { totals } = cart;

  return (
    <section
      aria-label={title}
      className="space-y-4 rounded-sm border border-border bg-surface p-4"
    >
      <h2 className="text-lg">{title}</h2>

      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">
            Sous-total ({cart.itemCount} article{cart.itemCount > 1 ? "s" : ""})
          </dt>
          <dd>{formatMoney(totals.subtotalMinor)}</dd>
        </div>
        {totals.discountMinor && totals.discountMinor > 0 ? (
          <div className="flex items-baseline justify-between text-success">
            <dt>Promotion{cart.promotion?.code ? ` (${cart.promotion.code})` : ""}</dt>
            <dd>-{formatMoney(totals.discountMinor)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Livraison estimée</dt>
          <dd>
            {totals.requiresShippingQuote
              ? "Sur devis"
              : totals.hasFreeShipping
                ? "Offerte"
                : formatMoney(totals.shippingMinor)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-medium">
          <dt>Total estimé</dt>
          <dd>{formatMoney(totals.totalEstimatedMinor)}</dd>
        </div>
      </dl>

      {totals.requiresShippingQuote ? (
        <p className="rounded-sm bg-surface-muted p-3 text-xs text-foreground">
          Votre panier contient un article volumineux. Les frais de livraison sont confirmés par
          téléphone après la commande, selon votre gouvernorat et l&apos;accès au logement.
        </p>
      ) : (
        <CartShippingProgress totals={totals} />
      )}

      <p className="text-xs text-foreground-muted">{CART_ESTIMATE_NOTICE}</p>
    </section>
  );
}

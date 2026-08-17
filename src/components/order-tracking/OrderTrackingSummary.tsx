import { PAYMENT_METHOD_LABELS } from "@/domain/checkout/checkout.types";
import type { OrderTotals } from "@/domain/order/order.types";
import { formatMoney } from "@/lib/money/money";

export function OrderTrackingSummary({ totals }: { totals: OrderTotals }) {
  return (
    <section aria-labelledby="tracking-summary" className="space-y-3">
      <h2 id="tracking-summary" className="text-xl">
        Récapitulatif
      </h2>
      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Sous-total</dt>
          <dd>{formatMoney(totals.subtotalMinor)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Livraison</dt>
          <dd>{totals.shippingMinor === 0 ? "Offerte" : formatMoney(totals.shippingMinor)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-medium">
          <dt>Total</dt>
          <dd>{formatMoney(totals.totalMinor)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Paiement</dt>
          <dd>{PAYMENT_METHOD_LABELS.cash_on_delivery}</dd>
        </div>
      </dl>
    </section>
  );
}

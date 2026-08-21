import type { Order } from "@/domain/order/order.types";
import { formatMoney } from "@/lib/money/money";
import { AppLink } from "@/components/ui/app-link";

export function OrderItemsRecap({ order }: { order: Order }) {
  return (
    <section aria-labelledby="order-items" className="space-y-4">
      <h2 id="order-items" className="text-xl">
        Articles commandés
      </h2>

      <ul className="divide-y divide-border border-y border-border">
        {order.items.map((item) => (
          <li key={`${item.productId}:${item.variantId}`} className="flex gap-3 py-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <AppLink
                href={`/produit/${item.productSlug}`}
                className="font-medium hover:text-accent-dark"
              >
                {item.productName}
              </AppLink>
              <p className="text-xs text-foreground-muted">Référence {item.sku}</p>
              <p className="mt-1 text-xs text-foreground-muted">
                {[
                  item.colorLabel,
                  item.widthCm && item.heightCm
                    ? `${item.widthCm} × ${item.heightCm} cm`
                    : undefined,
                  item.curtainHeaderLabel,
                  item.eyeletColorLabel,
                  item.liningLabel,
                  item.sellingUnitLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">Quantité : {item.quantity}</p>
            </div>
            <span className="text-sm">{formatMoney(item.lineTotalMinor)}</span>
          </li>
        ))}
      </ul>

      <dl className="space-y-2 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Sous-total</dt>
          <dd>{formatMoney(order.totals.subtotalMinor)}</dd>
        </div>
        {order.totals.discountMinor > 0 ? (
          <div className="flex items-baseline justify-between text-success">
            <dt>Promotion</dt>
            <dd>-{formatMoney(order.totals.discountMinor)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Livraison</dt>
          <dd>
            {order.totals.shippingMinor === 0 ? "Offerte" : formatMoney(order.totals.shippingMinor)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-medium">
          <dt>Total à régler à la livraison</dt>
          <dd>{formatMoney(order.totals.totalMinor)}</dd>
        </div>
      </dl>
    </section>
  );
}

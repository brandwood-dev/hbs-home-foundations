import type { OrderItemSnapshot } from "@/domain/order/order.types";
import { formatMoney } from "@/lib/money/money";
import { formatOptionDetails } from "@/services/product/product-options";

export function OrderTrackingItems({ items }: { items: OrderItemSnapshot[] }) {
  return (
    <section aria-labelledby="tracking-items" className="space-y-3">
      <h2 id="tracking-items" className="text-xl">
        Articles de la commande
      </h2>
      <ul className="divide-y divide-border border-y border-border">
        {items.map((item) => (
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
              <p className="font-medium">{item.productName}</p>
              <p className="text-xs text-foreground-muted">
                {[
                  formatOptionDetails(item.selectedOptions) ||
                    [
                      item.colorLabel,
                      item.widthCm && item.heightCm
                        ? `${item.widthCm} × ${item.heightCm} cm`
                        : undefined,
                      item.curtainHeaderLabel,
                      item.eyeletColorLabel,
                      item.liningLabel,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  item.sellingUnitLabel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                Quantité : {item.quantity} · Prix unitaire : {formatMoney(item.unitPriceMinor)}
              </p>
            </div>
            <span className="text-sm">{formatMoney(item.lineTotalMinor)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

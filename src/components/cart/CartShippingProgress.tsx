import type { CartTotals } from "@/domain/cart/cart.types";
import { calculateFreeShippingProgress } from "@/services/cart/cart-calculations";
import { formatMoney } from "@/lib/money/money";

export function CartShippingProgress({ totals }: { totals: CartTotals }) {
  const progress = calculateFreeShippingProgress(
    totals.subtotalMinor,
    totals.freeShippingThresholdMinor,
  );
  const message = totals.hasFreeShipping
    ? "Votre livraison est offerte."
    : `Plus que ${formatMoney(totals.amountUntilFreeShippingMinor)} pour profiter de la livraison gratuite.`;

  return (
    <div className="space-y-2">
      <p className="text-xs text-foreground">{message}</p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progression vers la livraison gratuite"
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

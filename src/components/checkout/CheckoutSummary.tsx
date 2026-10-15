import type { Cart } from "@/domain/cart/cart.types";
import type { DeliveryMethod } from "@/domain/checkout/checkout.types";
import { CART_ESTIMATE_NOTICE } from "@/domain/cart/cart.constants";
import {
  calculateCheckoutShipping,
  calculateDiscountedSubtotal,
} from "@/services/checkout/checkout-calculations";
import { formatMoney } from "@/lib/money/money";
import { AppLink } from "@/components/ui/app-link";
import { formatOptionDetails } from "@/services/product/product-options";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export function CheckoutSummary({
  cart,
  deliveryMethod,
}: {
  cart: Cart;
  deliveryMethod: DeliveryMethod;
}) {
  const { data: storeSettings } = useStoreSettings();
  const subtotalMinor = cart.totals.subtotalMinor;
  const discountMinor = cart.totals.discountMinor ?? 0;
  const discountedSubtotalMinor = calculateDiscountedSubtotal(subtotalMinor, discountMinor);
  const quoteRequired = cart.totals.requiresShippingQuote;
  const shippingMinor = calculateCheckoutShipping(
    discountedSubtotalMinor,
    deliveryMethod,
    cart.totals.freeShippingThresholdMinor,
    storeSettings.shipping.standardFeeMinor,
    quoteRequired,
  );
  const totalMinor = discountedSubtotalMinor + shippingMinor;

  return (
    <section
      aria-label="Récapitulatif de la commande"
      className="min-w-0 space-y-4 rounded-sm border border-border bg-surface p-4"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg">Votre commande</h2>
        <AppLink href="/panier" className="text-xs underline underline-offset-4">
          Modifier
        </AppLink>
      </div>

      <ul className="space-y-3">
        {cart.items
          .filter((item) => item.canPurchase)
          .map((item) => (
            <li key={item.lineId} className="flex min-w-0 gap-3">
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-surface-muted">
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
                <p className="truncate font-medium">{item.productName}</p>
                <p className="break-words text-xs text-foreground-muted">
                  {[
                    formatOptionDetails(item.selectedOptions) ||
                      [
                        item.colorLabel,
                        item.widthCm && item.heightCm
                          ? `${item.widthCm}×${item.heightCm} cm`
                          : undefined,
                      ]
                        .filter(Boolean)
                        .join(" · "),
                    `Qté ${item.quantity}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span className="shrink-0 whitespace-nowrap text-sm">
                {formatMoney(item.lineTotalMinor)}
              </span>
            </li>
          ))}
      </ul>

      <dl className="space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex min-w-0 items-baseline justify-between gap-4">
          <dt className="min-w-0 break-words text-foreground-muted">Sous-total</dt>
          <dd className="shrink-0 whitespace-nowrap">{formatMoney(subtotalMinor)}</dd>
        </div>
        {discountMinor > 0 ? (
          <div className="flex min-w-0 items-baseline justify-between gap-4 text-success">
            <dt className="min-w-0 break-words">
              Promotion{cart.promotion?.code ? ` (${cart.promotion.code})` : ""}
            </dt>
            <dd className="shrink-0 whitespace-nowrap">-{formatMoney(discountMinor)}</dd>
          </div>
        ) : null}
        <div className="flex min-w-0 items-baseline justify-between gap-4">
          <dt className="min-w-0 break-words text-foreground-muted">
            {deliveryMethod === "store_pickup" ? "Retrait en magasin" : "Livraison"}
          </dt>
          <dd className="shrink-0 whitespace-nowrap">
            {quoteRequired && deliveryMethod !== "store_pickup"
              ? "Sur devis"
              : shippingMinor === 0
                ? "Offerte"
                : formatMoney(shippingMinor)}
          </dd>
        </div>
        <div className="flex min-w-0 items-baseline justify-between gap-4 border-t border-border pt-2 text-base font-medium">
          <dt className="min-w-0 break-words">Total à payer</dt>
          <dd className="shrink-0 whitespace-nowrap">{formatMoney(totalMinor)}</dd>
        </div>
      </dl>

      {quoteRequired && deliveryMethod !== "store_pickup" ? (
        <p className="break-words rounded-sm bg-surface-muted p-3 text-xs text-foreground">
          Article volumineux : les frais de livraison et le créneau de mise en place sont confirmés
          par téléphone avant l&apos;expédition.
        </p>
      ) : null}

      <p className="break-words text-xs text-foreground-muted">{CART_ESTIMATE_NOTICE}</p>
    </section>
  );
}

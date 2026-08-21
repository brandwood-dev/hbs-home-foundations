import type { Cart } from "@/domain/cart/cart.types";
import type { DeliveryMethod } from "@/domain/checkout/checkout.types";
import { CART_ESTIMATE_NOTICE } from "@/domain/cart/cart.constants";
import {
  calculateCheckoutShipping,
  calculateDiscountedSubtotal,
} from "@/services/checkout/checkout-calculations";
import { formatMoney } from "@/lib/money/money";
import { AppLink } from "@/components/ui/app-link";

export function CheckoutSummary({
  cart,
  deliveryMethod,
}: {
  cart: Cart;
  deliveryMethod: DeliveryMethod;
}) {
  const subtotalMinor = cart.totals.subtotalMinor;
  const discountMinor = cart.totals.discountMinor ?? 0;
  const discountedSubtotalMinor = calculateDiscountedSubtotal(subtotalMinor, discountMinor);
  const quoteRequired = cart.totals.requiresShippingQuote;
  const shippingMinor = calculateCheckoutShipping(
    discountedSubtotalMinor,
    deliveryMethod,
    cart.totals.freeShippingThresholdMinor,
    undefined,
    quoteRequired,
  );
  const totalMinor = discountedSubtotalMinor + shippingMinor;

  return (
    <section
      aria-label="Récapitulatif de la commande"
      className="space-y-4 rounded-sm border border-border bg-surface p-4"
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
            <li key={item.lineId} className="flex gap-3">
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
                <p className="text-xs text-foreground-muted">
                  {item.colorLabel ? `${item.colorLabel} · ` : ""}
                  {item.widthCm && item.heightCm ? `${item.widthCm}×${item.heightCm} cm · ` : ""}
                  Qté {item.quantity}
                </p>
              </div>
              <span className="text-sm">{formatMoney(item.lineTotalMinor)}</span>
            </li>
          ))}
      </ul>

      <dl className="space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">Sous-total</dt>
          <dd>{formatMoney(subtotalMinor)}</dd>
        </div>
        {discountMinor > 0 ? (
          <div className="flex items-baseline justify-between text-success">
            <dt>Promotion{cart.promotion?.code ? ` (${cart.promotion.code})` : ""}</dt>
            <dd>-{formatMoney(discountMinor)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between">
          <dt className="text-foreground-muted">
            {deliveryMethod === "store_pickup" ? "Retrait en magasin" : "Livraison"}
          </dt>
          <dd>
            {quoteRequired && deliveryMethod !== "store_pickup"
              ? "Sur devis"
              : shippingMinor === 0
                ? "Offerte"
                : formatMoney(shippingMinor)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2 text-base font-medium">
          <dt>Total à payer</dt>
          <dd>{formatMoney(totalMinor)}</dd>
        </div>
      </dl>

      {quoteRequired && deliveryMethod !== "store_pickup" ? (
        <p className="rounded-sm bg-surface-muted p-3 text-xs text-foreground">
          Article volumineux : les frais de livraison et le créneau de mise en place sont confirmés
          par téléphone avant l&apos;expédition.
        </p>
      ) : null}

      <p className="text-xs text-foreground-muted">{CART_ESTIMATE_NOTICE}</p>
    </section>
  );
}

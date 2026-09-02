import { DELIVERY_METHOD_LABELS } from "@/domain/checkout/checkout.types";
import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";
import { getGovernorateLabel } from "@/fixtures/tunisia-governorates.fixture";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export function OrderTrackingDelivery({ result }: { result: OrderTrackingResult }) {
  const { data: storeSettings } = useStoreSettings();
  const location = result.deliveryLocation;

  return (
    <section
      aria-labelledby="tracking-delivery"
      className="space-y-2 rounded-sm border border-border bg-surface p-4 text-sm"
    >
      <h2 id="tracking-delivery" className="text-base font-medium">
        {DELIVERY_METHOD_LABELS[result.deliveryMethod]}
      </h2>
      {result.deliveryMethod === "home_delivery" ? (
        <p className="text-foreground-muted">
          {[
            location?.city,
            location?.governorate ? getGovernorateLabel(location.governorate) : null,
          ]
            .filter(Boolean)
            .join(" — ") || "Zone de livraison non précisée"}
        </p>
      ) : storeSettings.shipping.pickupAddress || storeSettings.store.address ? (
        <p className="text-foreground-muted">
          {storeSettings.shipping.pickupAddress || storeSettings.store.address}
        </p>
      ) : null}
      <p className="text-foreground-muted">Téléphone : {result.maskedPhone}</p>
    </section>
  );
}

import { DELIVERY_METHOD_LABELS, PAYMENT_METHOD_LABELS } from "@/domain/checkout/checkout.types";
import { ORDER_STATUS_LABELS } from "@/domain/order/order.constants";
import type { Order } from "@/domain/order/order.types";
import { getGovernorateLabel } from "@/fixtures/tunisia-governorates.fixture";
import { formatTunisianPhone } from "@/services/checkout/phone-normalization";
import { useStoreSettings } from "@/hooks/useStoreSettings";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="text-sm text-foreground-muted">{children}</div>
    </div>
  );
}

export function OrderSummaryCard({ order }: { order: Order }) {
  const { data: storeSettings } = useStoreSettings();
  const address = order.shippingAddress;

  return (
    <section
      aria-label="Détails de la commande"
      className="grid gap-6 rounded-sm border border-border bg-surface p-4 sm:grid-cols-2"
    >
      <Block title="Contact">
        <p>
          {order.customer.firstName} {order.customer.lastName}
        </p>
        <p>{formatTunisianPhone(order.customer.phone)}</p>
        {order.customer.email ? <p>{order.customer.email}</p> : null}
      </Block>

      <Block title={DELIVERY_METHOD_LABELS[order.deliveryMethod]}>
        {order.deliveryMethod === "home_delivery" && address ? (
          <>
            <p>{address.addressLine}</p>
            <p>
              {address.city}
              {address.postalCode ? `, ${address.postalCode}` : ""} —{" "}
              {getGovernorateLabel(address.governorate)}
            </p>
            {address.landmark ? <p>Repère : {address.landmark}</p> : null}
            {address.deliveryNote ? <p>Note : {address.deliveryNote}</p> : null}
            <p className="mt-1">Délai estimé : {storeSettings.shipping.estimatedDeliveryLabel}.</p>
          </>
        ) : (
          <p>{storeSettings.shipping.pickupAddress || storeSettings.store.address}</p>
        )}
      </Block>

      <Block title="Paiement">
        <p>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
      </Block>

      <Block title="Statut">
        <p>{ORDER_STATUS_LABELS[order.status]}</p>
      </Block>
    </section>
  );
}

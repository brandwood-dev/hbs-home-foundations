import type { AdminOrder, AdminOrderItem } from "@/admin/types/admin.types";
import { ORDER_STATUS_LABELS } from "@/admin/services/order-status";
import {
  DELIVERY_METHOD_LABELS,
  getShipment,
  isShippingToConfirm,
} from "@/admin/services/orders/admin-order-shipping";
import { calculateOrderTotalMinor } from "@/admin/services/orders/admin-order-calculations";
import { formatDateTime } from "@/admin/utils/admin.utils";
import { formatMoney } from "@/lib/money/money";

function itemOptions(item: AdminOrderItem): string {
  const options = item.selectedOptions?.map((option) => `${option.label}: ${option.value}`) ?? [];
  return options.join(" · ") || item.variantLabel;
}

function itemQuantity(item: AdminOrderItem): string {
  const panels = item.panelCount
    ? ` · ${item.panelCount} panneau${item.panelCount > 1 ? "x" : ""}`
    : "";
  return `${item.quantity}${panels}`;
}

export function AdminPreparationSlip({
  order,
  customerTags = [],
}: {
  order: AdminOrder;
  customerTags?: string[];
}) {
  const total = calculateOrderTotalMinor(order);
  const shipment = getShipment(order);
  const tags = customerTags
    .map((tag) => tag.trim())
    .filter((tag, index, values) => tag && values.indexOf(tag) === index);

  return (
    <section className="print-preparation-slip" aria-label="Bon de préparation">
      <header className="print-preparation-slip__header">
        <div className="print-preparation-slip__brand">
          <img src="/apple-touch-icon.png" alt="HBS HOME" />
          <div>
            <p className="print-preparation-slip__eyebrow">HBS HOME</p>
            <p className="print-preparation-slip__title">Bon de préparation</p>
          </div>
        </div>
        <div className="print-preparation-slip__order-ref">
          <p>Commande</p>
          <strong>{order.orderNumber}</strong>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
      </header>

      <div className="print-preparation-slip__status-row">
        <span className="print-preparation-slip__status">{ORDER_STATUS_LABELS[order.status]}</span>
        {tags.map((tag) => (
          <span key={tag} className="print-preparation-slip__tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="print-preparation-slip__info-grid">
        <section className="print-preparation-slip__info-card">
          <h2>Client</h2>
          <p className="print-preparation-slip__strong">{order.customerName}</p>
          <p>{order.customerPhone}</p>
          {order.customerEmail ? <p>{order.customerEmail}</p> : null}
        </section>

        <section className="print-preparation-slip__info-card">
          <h2>Livraison</h2>
          <p className="print-preparation-slip__strong">
            {DELIVERY_METHOD_LABELS[order.deliveryMethod]}
          </p>
          <p>
            {order.addressLine}, {order.city}, {order.governorate}
            {order.postalCode ? ` ${order.postalCode}` : ""}
          </p>
          {order.landmark ? <p>Repère : {order.landmark}</p> : null}
          {shipment.trackingNumber ? <p>Suivi : {shipment.trackingNumber}</p> : null}
        </section>
      </div>

      <section className="print-preparation-slip__items">
        <div className="print-preparation-slip__section-heading">
          <h2>Articles à préparer</h2>
          <span>
            {order.items.length} référence{order.items.length > 1 ? "s" : ""}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Référence</th>
              <th className="print-preparation-slip__number">Qté</th>
              <th className="print-preparation-slip__number">PU</th>
              <th className="print-preparation-slip__number">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={`${item.productId}-${item.variantId}`}>
                <td>
                  <strong>{item.productName}</strong>
                  <span>{itemOptions(item)}</span>
                </td>
                <td>{item.sku || item.productReference || "-"}</td>
                <td className="print-preparation-slip__number">{itemQuantity(item)}</td>
                <td className="print-preparation-slip__number">
                  {formatMoney(item.unitPriceMinor)}
                </td>
                <td className="print-preparation-slip__number">
                  {formatMoney(item.lineTotalMinor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="print-preparation-slip__bottom-grid">
        <section className="print-preparation-slip__note">
          <h2>Note de livraison</h2>
          <p>
            {order.deliveryNote || shipment.internalInstructions || "Aucune consigne particulière."}
          </p>
        </section>
        <dl className="print-preparation-slip__totals">
          <div>
            <dt>Sous-total</dt>
            <dd>{formatMoney(order.subtotalMinor)}</dd>
          </div>
          <div>
            <dt>Livraison</dt>
            <dd>{isShippingToConfirm(order) ? "À confirmer" : formatMoney(order.shippingMinor)}</dd>
          </div>
          <div className="print-preparation-slip__total">
            <dt>Total à encaisser</dt>
            <dd>{total === null ? "À confirmer" : formatMoney(total)}</dd>
          </div>
        </dl>
      </div>

      <footer className="print-preparation-slip__footer">
        <span>Document interne - préparation et livraison</span>
        <span>HBS HOME</span>
      </footer>
    </section>
  );
}

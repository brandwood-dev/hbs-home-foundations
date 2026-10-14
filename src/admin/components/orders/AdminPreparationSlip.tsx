import { Calculator, Clock3, FileText, House, MapPin, Phone, UserRound } from "lucide-react";

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

const PREPARATION_SLIP_FALLBACK_IMAGE = "/images/placeholder-product.svg";

function itemOptions(item: AdminOrderItem): string {
  const options = item.selectedOptions?.map((option) => `${option.label}: ${option.value}`) ?? [];
  const variantLabel =
    item.variantLabel.trim().toLowerCase() === "accessory" ? "Accessoire" : item.variantLabel;
  return options.join(" · ") || variantLabel;
}

function itemQuantity(item: AdminOrderItem): string {
  return String(item.quantity);
}

function itemDetails(item: AdminOrderItem): string {
  const reference = item.sku || item.productReference;
  const details = [itemOptions(item), reference ? `Réf. ${reference}` : ""];
  return details.filter(Boolean).join(" · ");
}

function orderDateParts(createdAt: string): { date: string; time: string } {
  const value = formatDateTime(createdAt);
  const match = value.match(/^(.*?)(?:\s+)(\d{1,2}:\d{2}(?:\s*[AP]M)?)$/i);
  return { date: match?.[1] ?? value, time: match?.[2] ?? "" };
}

function PreparationSlipIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`print-preparation-slip__icon ${className}`} aria-hidden="true">
      {children}
    </span>
  );
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
  const dateParts = orderDateParts(order.createdAt);
  const tags = customerTags
    .map((tag) => tag.trim())
    .filter((tag, index, values) => tag && values.indexOf(tag) === index);

  return (
    <section className="print-preparation-slip" aria-label="Bon de préparation">
      <header className="print-preparation-slip__header">
        <div className="print-preparation-slip__brand">
          <img src="/apple-touch-icon.png" alt="HBS HOME" />
          <span className="print-preparation-slip__brand-divider" aria-hidden="true" />
          <div className="print-preparation-slip__heading">
            <h1>Bon de préparation</h1>
            <p>Document interne / logistique</p>
          </div>
        </div>
        <div className="print-preparation-slip__order-ref">
          <p>Commande n°</p>
          <strong>{order.orderNumber}</strong>
          <span>
            {dateParts.date}
            {dateParts.time ? <b aria-hidden="true">•</b> : null}
            {dateParts.time}
          </span>
        </div>
      </header>

      <div className="print-preparation-slip__status-row">
        <span className="print-preparation-slip__status">
          <PreparationSlipIcon>
            <Clock3 />
          </PreparationSlipIcon>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        {tags.map((tag) => (
          <span key={tag} className="print-preparation-slip__tag">
            <PreparationSlipIcon>
              <UserRound />
            </PreparationSlipIcon>
            {tag}
          </span>
        ))}
      </div>

      <div className="print-preparation-slip__info-grid">
        <section className="print-preparation-slip__info-card">
          <div className="print-preparation-slip__card-heading">
            <PreparationSlipIcon>
              <UserRound />
            </PreparationSlipIcon>
            <h2>Client</h2>
          </div>
          <div className="print-preparation-slip__card-body">
            <p className="print-preparation-slip__strong">{order.customerName}</p>
            <p className="print-preparation-slip__with-icon">
              <Phone aria-hidden="true" />
              <span>{order.customerPhone}</span>
            </p>
            {order.customerEmail ? <p>{order.customerEmail}</p> : null}
          </div>
        </section>

        <section className="print-preparation-slip__info-card">
          <div className="print-preparation-slip__card-heading">
            <PreparationSlipIcon>
              <MapPin />
            </PreparationSlipIcon>
            <h2>Livraison</h2>
          </div>
          <div className="print-preparation-slip__card-body">
            <p className="print-preparation-slip__strong">
              {DELIVERY_METHOD_LABELS[order.deliveryMethod]}
            </p>
            <p className="print-preparation-slip__with-icon">
              <House aria-hidden="true" />
              <span>
                {order.addressLine}, {order.city}, {order.governorate}
                {order.postalCode ? ` ${order.postalCode}` : ""}
              </span>
            </p>
            {order.landmark ? <p>Repère : {order.landmark}</p> : null}
            {shipment.trackingNumber ? <p>Suivi : {shipment.trackingNumber}</p> : null}
          </div>
        </section>
      </div>

      <section className="print-preparation-slip__items">
        <div className="print-preparation-slip__section-heading">
          <h2>Articles à préparer</h2>
          <span>{String(order.items.length).padStart(2, "0")} articles</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th className="print-preparation-slip__number">Qté</th>
              <th className="print-preparation-slip__number">PU</th>
              <th className="print-preparation-slip__number">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={`${item.productId}-${item.variantId}`}>
                <td>
                  <div className="print-preparation-slip__article">
                    <img
                      src={item.imageUrl || PREPARATION_SLIP_FALLBACK_IMAGE}
                      alt=""
                      loading="eager"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = PREPARATION_SLIP_FALLBACK_IMAGE;
                      }}
                    />
                    <div>
                      <strong>{item.productName}</strong>
                      <span>{itemDetails(item)}</span>
                    </div>
                  </div>
                </td>
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
        <section className="print-preparation-slip__note print-preparation-slip__bottom-card">
          <div className="print-preparation-slip__card-heading">
            <PreparationSlipIcon>
              <FileText />
            </PreparationSlipIcon>
            <h2>Note de livraison</h2>
          </div>
          <p>
            {order.deliveryNote || shipment.internalInstructions || "Aucune consigne particulière."}
          </p>
        </section>
        <section className="print-preparation-slip__totals print-preparation-slip__bottom-card">
          <div className="print-preparation-slip__card-heading">
            <PreparationSlipIcon>
              <Calculator />
            </PreparationSlipIcon>
            <h2>Récapitulatif</h2>
          </div>
          <dl>
            <div>
              <dt>Sous-total</dt>
              <dd>{formatMoney(order.subtotalMinor)}</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>
                {isShippingToConfirm(order) ? "À confirmer" : formatMoney(order.shippingMinor)}
              </dd>
            </div>
            <div className="print-preparation-slip__total">
              <dt>Total à encaisser</dt>
              <dd>{total === null ? "À confirmer" : formatMoney(total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <footer className="print-preparation-slip__footer">
        <div>
          <strong>Document interne</strong>
          <span>Préparation et livraison de la commande.</span>
        </div>
        <span>Préparation&nbsp;&nbsp;•&nbsp;&nbsp;Livraison</span>
      </footer>
    </section>
  );
}

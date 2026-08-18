import { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppLink } from "@/components/ui/app-link";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminCard, AdminSkeleton, AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { AdminEmptyState, AdminErrorState } from "@/admin/components/ui/AdminStates";
import { AdminOrderTimeline } from "@/admin/components/orders/AdminOrderTimeline";
import { AdminOrderActionDialog } from "@/admin/components/orders/AdminOrderActionDialog";
import { useAdminOrder } from "@/admin/hooks/admin.queries";
import {
  useAddOrderNote,
  useCancelOrder,
  useReturnOrder,
  useUpdateOrderAddress,
  useUpdateOrderContact,
  useUpdateOrderPaymentStatus,
  useUpdateOrderShipping,
  useUpdateOrderStatus,
} from "@/admin/hooks/admin-sales.mutations";
import type { AdminOrder, AdminOrderStatus } from "@/admin/types/admin.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/admin/services/order-status";
import { getOrderActions } from "@/admin/services/orders/admin-order-transitions";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
  getAllowedPaymentTransitions,
} from "@/admin/services/orders/admin-order-payment";
import {
  DELIVERY_METHOD_LABELS,
  SHIPPING_PROFILE_LABELS,
  SHIPPING_STATUS_LABELS,
  SHIPPING_STATUS_TONE,
  getOrderShippingProfile,
  getShipment,
  getShippingStatus,
  isShippingToConfirm,
} from "@/admin/services/orders/admin-order-shipping";
import { calculateOrderTotalMinor } from "@/admin/services/orders/admin-order-calculations";
import { canEditOrderDetails } from "@/admin/services/orders/admin-order-validation";
import { formatDateTime } from "@/admin/utils/admin.utils";
import { formatMoney, toMinor, toUnits } from "@/lib/money/money";

type DialogState =
  | { kind: "status"; status: AdminOrderStatus }
  | { kind: "cancel" }
  | { kind: "return"; action: "request" | "accept" | "refuse" }
  | { kind: "refund" }
  | null;

export function AdminOrderDetailPage({ orderId }: { orderId: string }) {
  const { data: order, isLoading, error, refetch } = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdateOrderPaymentStatus();
  const updateShipping = useUpdateOrderShipping();
  const updateContact = useUpdateOrderContact();
  const updateAddress = useUpdateOrderAddress();
  const addNote = useAddOrderNote();
  const cancelOrder = useCancelOrder();
  const returnOrder = useReturnOrder();

  const [dialog, setDialog] = useState<DialogState>(null);
  const [restoreStock, setRestoreStock] = useState(true);
  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [note, setNote] = useState("");

  if (isLoading) return <AdminSkeleton />;
  if (error) {
    return (
      <AdminErrorState
        message={error instanceof Error ? error.message : "Chargement impossible."}
        onRetry={() => void refetch()}
      />
    );
  }
  if (!order) {
    return (
      <AdminEmptyState
        title="Commande introuvable"
        description="Cette commande n'existe pas ou a été supprimée."
        action={
          <Button asChild variant="outline">
            <AppLink href="/admin/commandes">Retour aux commandes</AppLink>
          </Button>
        }
      />
    );
  }

  const shipment = getShipment(order);
  const total = calculateOrderTotalMinor(order);
  const actions = getOrderActions(order);
  const paymentTransitions = getAllowedPaymentTransitions(order);
  const editable = canEditOrderDetails(order);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={`Commande ${order.orderNumber}`}
        description={`Créée le ${formatDateTime(order.createdAt)}`}
        breadcrumbs={[
          { label: "Commandes", href: "/admin/commandes" },
          { label: order.orderNumber },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden />
            Bon de préparation
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <AdminStatusBadge
          label={ORDER_STATUS_LABELS[order.status]}
          tone={ORDER_STATUS_TONE[order.status]}
        />
        <AdminStatusBadge
          label={`Paiement : ${PAYMENT_STATUS_LABELS[order.paymentStatus]}`}
          tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
        />
        <AdminStatusBadge
          label={`Frais : ${SHIPPING_STATUS_LABELS[getShippingStatus(order)]}`}
          tone={SHIPPING_STATUS_TONE[getShippingStatus(order)]}
        />
        <AdminStatusBadge label={SHIPPING_PROFILE_LABELS[getOrderShippingProfile(order)]} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Articles</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                    <th className="py-2">Produit</th>
                    <th className="py-2">SKU</th>
                    <th className="py-2 text-right">Qté</th>
                    <th className="py-2 text-right">PU</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr
                      key={`${item.productId}-${item.variantId}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedOptions?.map((option) => option.value).join(" · ") ||
                            item.variantLabel}
                        </p>
                      </td>
                      <td className="py-2 text-xs">{item.sku}</td>
                      <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                      <td className="py-2 text-right tabular-nums">
                        {formatMoney(item.unitPriceMinor)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatMoney(item.lineTotalMinor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Sous-total</dt>
                <dd className="tabular-nums">{formatMoney(order.subtotalMinor)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd className="tabular-nums">
                  {isShippingToConfirm(order) ? "À confirmer" : formatMoney(order.shippingMinor)}
                </dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">
                  {total === null ? "À confirmer" : formatMoney(total)}
                </dd>
              </div>
            </dl>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Livraison</h2>
            <p className="text-sm">{DELIVERY_METHOD_LABELS[order.deliveryMethod]}</p>
            <p className="text-sm text-muted-foreground">
              {order.addressLine}, {order.city}, {order.governorate}
            </p>
            {shipment.carrierName ? (
              <p className="mt-2 text-sm">
                Transporteur : {shipment.carrierName}
                {shipment.trackingNumber ? ` — suivi ${shipment.trackingNumber}` : ""}
              </p>
            ) : null}

            {isShippingToConfirm(order) ? (
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="space-y-1">
                  <Label htmlFor="shipping-fee">Frais de livraison (DT)</Label>
                  <Input
                    id="shipping-fee"
                    type="number"
                    min={0}
                    step="0.5"
                    className="w-40"
                    value={shippingFee}
                    onChange={(event) => setShippingFee(event.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={shippingFee === "" || updateShipping.isPending}
                  onClick={() =>
                    updateShipping.mutate({
                      orderId: order.id,
                      shippingFeeMinor: toMinor(Number(shippingFee)),
                    })
                  }
                >
                  Enregistrer les frais
                </Button>
              </div>
            ) : null}

            {editable ? (
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-muted-foreground">
                  Modifier l'adresse ou les coordonnées
                </summary>
                <OrderEditForms
                  order={order}
                  onSaveContact={(contact) => updateContact.mutate({ orderId: order.id, contact })}
                  onSaveAddress={(address) => updateAddress.mutate({ orderId: order.id, address })}
                />
              </details>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                Les coordonnées et l'adresse ne sont plus modifiables après expédition.
              </p>
            )}
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Notes internes</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                aria-label="Nouvelle note interne"
                placeholder="Ajouter une note visible uniquement par l'équipe…"
              />
              <Button
                size="sm"
                disabled={!note.trim() || addNote.isPending}
                onClick={() =>
                  addNote.mutate(
                    { orderId: order.id, text: note },
                    { onSuccess: () => setNote("") },
                  )
                }
              >
                Ajouter
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {order.notes.map((entry) => (
                <li key={entry.id} className="rounded-md border border-border p-2 text-sm">
                  <p>{entry.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {entry.author} — {formatDateTime(entry.at)}
                  </p>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Actions</h2>
            <div className="flex flex-col gap-2">
              {actions.map((action) => (
                <Button
                  key={action.to}
                  size="sm"
                  variant={action.critical ? "destructive" : "default"}
                  onClick={() =>
                    setDialog(
                      action.to === "cancelled"
                        ? { kind: "cancel" }
                        : action.to === "return_requested"
                          ? { kind: "return", action: "request" }
                          : { kind: "status", status: action.to },
                    )
                  }
                >
                  {action.label}
                </Button>
              ))}
              {order.status === "return_requested" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialog({ kind: "return", action: "accept" })}
                  >
                    Accepter le retour
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDialog({ kind: "return", action: "refuse" })}
                  >
                    Refuser le retour
                  </Button>
                </>
              ) : null}
              {paymentTransitions.includes("collected") ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updatePayment.mutate({ orderId: order.id, paymentStatus: "collected" })
                  }
                >
                  Marquer le paiement encaissé
                </Button>
              ) : null}
              {paymentTransitions.includes("refunded") ? (
                <Button size="sm" variant="outline" onClick={() => setDialog({ kind: "refund" })}>
                  Rembourser
                </Button>
              ) : null}
              {actions.length === 0 && paymentTransitions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune action disponible pour ce statut.
                </p>
              ) : null}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Client</h2>
            <p className="text-sm font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            {order.customerEmail ? (
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            ) : null}
            <Button asChild size="sm" variant="outline" className="mt-3">
              <AppLink href={`/admin/clients/${order.customerId}`}>Voir la fiche client</AppLink>
            </Button>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Historique</h2>
            <AdminOrderTimeline events={order.timeline} />
          </AdminCard>
        </div>
      </div>

      <AdminOrderActionDialog
        open={dialog?.kind === "status"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Changer le statut"
        description={
          dialog?.kind === "status"
            ? `La commande passera au statut « ${ORDER_STATUS_LABELS[dialog.status]} ».`
            : ""
        }
        confirmLabel="Confirmer"
        isPending={updateStatus.isPending}
        extra={
          dialog?.kind === "status" && dialog.status === "shipped" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="carrier">Transporteur</Label>
                <Input
                  id="carrier"
                  value={carrierName}
                  onChange={(event) => setCarrierName(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tracking">Numéro de suivi</Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                />
              </div>
            </div>
          ) : null
        }
        onConfirm={(values) => {
          if (dialog?.kind !== "status") return;
          updateStatus.mutate(
            {
              orderId: order.id,
              status: dialog.status,
              ...(values.reason ? { reason: values.reason } : {}),
              ...(values.note ? { note: values.note } : {}),
              ...(carrierName ? { carrierName } : {}),
              ...(trackingNumber ? { trackingNumber } : {}),
            },
            { onSuccess: () => setDialog(null) },
          );
        }}
      />

      <AdminOrderActionDialog
        open={dialog?.kind === "cancel"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Annuler la commande"
        description="Cette action est définitive. Le stock peut être restauré si la commande a été confirmée."
        confirmLabel="Annuler la commande"
        requireReason
        destructive
        isPending={cancelOrder.isPending}
        extra={
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={restoreStock}
              onChange={(event) => setRestoreStock(event.target.checked)}
            />
            Restaurer le stock des articles suivis
          </label>
        }
        onConfirm={(values) => {
          cancelOrder.mutate(
            {
              orderId: order.id,
              reason: values.reason,
              restoreStock,
              ...(values.note ? { note: values.note } : {}),
            },
            { onSuccess: () => setDialog(null) },
          );
        }}
      />

      <AdminOrderActionDialog
        open={dialog?.kind === "return"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Traiter le retour"
        description="Le motif du retour est conservé dans l'historique de la commande."
        confirmLabel="Valider"
        requireReason
        isPending={returnOrder.isPending}
        extra={
          dialog?.kind === "return" && dialog.action === "accept" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={restoreStock}
                onChange={(event) => setRestoreStock(event.target.checked)}
              />
              Remettre les articles en stock
            </label>
          ) : null
        }
        onConfirm={(values) => {
          if (dialog?.kind !== "return") return;
          returnOrder.mutate(
            {
              orderId: order.id,
              action: dialog.action,
              reason: values.reason,
              restock: restoreStock,
              ...(values.note ? { note: values.note } : {}),
            },
            { onSuccess: () => setDialog(null) },
          );
        }}
      />

      <AdminOrderActionDialog
        open={dialog?.kind === "refund"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Rembourser la commande"
        description="Le remboursement est tracé dans l'historique avec son motif."
        confirmLabel="Rembourser"
        requireReason
        destructive
        isPending={updatePayment.isPending}
        onConfirm={(values) => {
          updatePayment.mutate(
            {
              orderId: order.id,
              paymentStatus: "refunded",
              reason: values.reason,
              ...(values.note ? { note: values.note } : {}),
            },
            { onSuccess: () => setDialog(null) },
          );
        }}
      />
    </div>
  );
}

function OrderEditForms({
  order,
  onSaveContact,
  onSaveAddress,
}: {
  order: AdminOrder;
  onSaveContact: (contact: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  }) => void;
  onSaveAddress: (address: {
    governorate: string;
    city: string;
    addressLine: string;
    landmark?: string;
  }) => void;
}) {
  const [name, setName] = useState(order.customerName);
  const [phone, setPhone] = useState(order.customerPhone);
  const [email, setEmail] = useState(order.customerEmail ?? "");
  const [governorate, setGovernorate] = useState(order.governorate);
  const [city, setCity] = useState(order.city);
  const [addressLine, setAddressLine] = useState(order.addressLine);

  return (
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Nom du client</Label>
        <Input id="edit-name" value={name} onChange={(event) => setName(event.target.value)} />
        <Label htmlFor="edit-phone">Téléphone</Label>
        <Input id="edit-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <Label htmlFor="edit-email">E-mail</Label>
        <Input id="edit-email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Button
          size="sm"
          onClick={() =>
            onSaveContact({
              customerName: name,
              customerPhone: phone,
              ...(email ? { customerEmail: email } : {}),
            })
          }
        >
          Enregistrer les coordonnées
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-gov">Gouvernorat</Label>
        <Input
          id="edit-gov"
          value={governorate}
          onChange={(event) => setGovernorate(event.target.value)}
        />
        <Label htmlFor="edit-city">Ville</Label>
        <Input id="edit-city" value={city} onChange={(event) => setCity(event.target.value)} />
        <Label htmlFor="edit-address">Adresse</Label>
        <Input
          id="edit-address"
          value={addressLine}
          onChange={(event) => setAddressLine(event.target.value)}
        />
        <Button size="sm" onClick={() => onSaveAddress({ governorate, city, addressLine })}>
          Enregistrer l'adresse
        </Button>
      </div>
    </div>
  );
}

export { toUnits };

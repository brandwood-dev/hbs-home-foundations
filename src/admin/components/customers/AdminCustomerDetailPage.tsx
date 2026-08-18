import { useState } from "react";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminCard,
  AdminEmptyState,
  AdminKpiCard,
  AdminSkeleton,
  AdminStatusBadge,
} from "@/admin/components/ui/AdminStates";
import { useAdminCustomer } from "@/admin/hooks/admin.queries";
import {
  useAddCustomerNote,
  useMergeCustomers,
  useUpdateCustomer,
  useUpdateCustomerTags,
} from "@/admin/hooks/admin-sales.mutations";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/admin/services/order-status";
import { calculateOrderTotalMinor } from "@/admin/services/orders/admin-order-calculations";
import {
  CUSTOMER_TAGS,
  sanitizeCustomerNote,
} from "@/admin/services/customers/admin-customer-normalization";
import { formatDate, formatDateTime } from "@/admin/utils/admin.utils";
import { formatMoney } from "@/lib/money/money";
import { cn } from "@/lib/utils";

export function AdminCustomerDetailPage({ customerId }: { customerId: string }) {
  const { data: customer, isLoading } = useAdminCustomer(customerId);
  const updateCustomer = useUpdateCustomer();
  const updateTags = useUpdateCustomerTags();
  const addNote = useAddCustomerNote();
  const mergeCustomers = useMergeCustomers();
  const [noteText, setNoteText] = useState("");

  if (isLoading) return <AdminSkeleton rows={8} />;
  if (!customer) {
    return (
      <AdminEmptyState
        title="Client introuvable"
        description="Cette fiche a peut-être été fusionnée ou supprimée."
      />
    );
  }

  const toggleTag = (tag: string) => {
    const next = customer.tags.includes(tag)
      ? customer.tags.filter((item) => item !== tag)
      : [...customer.tags, tag];
    updateTags.mutate({ customerId, tags: next });
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        description={`Client depuis le ${formatDate(customer.createdAt)} — ${customer.governorate}`}
        breadcrumbs={[
          { label: "Clients", href: "/admin/clients" },
          { label: `${customer.firstName} ${customer.lastName}` },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard label="Commandes" value={customer.metrics.totalOrders} />
        <AdminKpiCard label="Livrées" value={customer.metrics.deliveredOrders} tone="success" />
        <AdminKpiCard
          label="Total dépensé"
          value={formatMoney(customer.metrics.totalSpentMinor)}
          hint="Sous-total des commandes livrées"
        />
        <AdminKpiCard
          label="Panier moyen"
          value={formatMoney(customer.metrics.averageOrderValueMinor)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Coordonnées</h2>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                updateCustomer.mutate({
                  customerId,
                  input: {
                    firstName: String(form.get("firstName") ?? ""),
                    lastName: String(form.get("lastName") ?? ""),
                    phone: String(form.get("phone") ?? ""),
                    email: String(form.get("email") ?? ""),
                    governorate: String(form.get("governorate") ?? ""),
                  },
                });
              }}
            >
              <div className="space-y-1">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" defaultValue={customer.firstName} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" defaultValue={customer.lastName} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" defaultValue={customer.phone} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" defaultValue={customer.email ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="governorate">Gouvernorat</Label>
                <Input id="governorate" name="governorate" defaultValue={customer.governorate} />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={updateCustomer.isPending}>
                  Enregistrer
                </Button>
              </div>
            </form>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Commandes ({customer.orders.length})</h2>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune commande enregistrée.</p>
            ) : (
              <ul className="divide-y divide-border">
                {customer.orders.map((order) => (
                  <li key={order.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                    <AppLink
                      href={`/admin/commandes/${order.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {order.orderNumber}
                    </AppLink>
                    <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                    <AdminStatusBadge
                      label={ORDER_STATUS_LABELS[order.status]}
                      tone={ORDER_STATUS_TONE[order.status]}
                    />
                    <span className="ml-auto tabular-nums">
                      {(() => {
                        const total = calculateOrderTotalMinor(order);
                        return total === null ? "À confirmer" : formatMoney(total);
                      })()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Notes internes</h2>
            <div className="space-y-2">
              <Textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Ajouter une note interne…"
                rows={3}
              />
              <Button
                size="sm"
                disabled={sanitizeCustomerNote(noteText).length === 0 || addNote.isPending}
                onClick={() => {
                  addNote.mutate(
                    { customerId, text: sanitizeCustomerNote(noteText) },
                    { onSuccess: () => setNoteText("") },
                  );
                }}
              >
                Ajouter la note
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {(customer.notes ?? []).map((note) => (
                <li key={note.id} className="rounded-md border border-border p-2 text-sm">
                  <p>{note.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(note.createdAt)}</p>
                </li>
              ))}
            </ul>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Étiquettes</h2>
            <div className="flex flex-wrap gap-2">
              {CUSTOMER_TAGS.map((tag) => {
                const active = customer.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Adresses</h2>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune adresse enregistrée.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {customer.addresses.map((address) => (
                  <li key={address.id} className="rounded-md border border-border p-2">
                    <p>{address.addressLine}</p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.governorate}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Doublons possibles</h2>
            {customer.duplicates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun doublon détecté.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {customer.duplicates.map((duplicate) => (
                  <li
                    key={duplicate.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border p-2"
                  >
                    <AppLink
                      href={`/admin/clients/${duplicate.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      {duplicate.firstName} {duplicate.lastName}
                    </AppLink>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mergeCustomers.isPending}
                      onClick={() =>
                        mergeCustomers.mutate({
                          primaryCustomerId: customer.id,
                          secondaryCustomerId: duplicate.id,
                        })
                      }
                    >
                      Fusionner
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

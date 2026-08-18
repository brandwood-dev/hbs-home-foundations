import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/ui/app-link";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminDataTable,
  AdminPagination,
  AdminSearchInput,
  AdminSelectFilter,
  AdminSortSelect,
  type AdminColumn,
} from "@/admin/components/ui/AdminDataTable";
import { AdminKpiCard, AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminOrders } from "@/admin/hooks/admin.queries";
import { useBulkUpdateOrderStatus } from "@/admin/hooks/admin-sales.mutations";
import type { AdminOrderListParams, AdminOrderSort } from "@/admin/repositories/interfaces";
import type { AdminOrder, AdminOrderStatus } from "@/admin/types/admin.types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/admin/services/order-status";
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from "@/admin/services/orders/admin-order-payment";
import {
  DELIVERY_METHOD_LABELS,
  SHIPPING_PROFILE_LABELS,
  getOrderShippingProfile,
  isShippingToConfirm,
} from "@/admin/services/orders/admin-order-shipping";
import { calculateOrderTotalMinor } from "@/admin/services/orders/admin-order-calculations";
import { formatDateTime, maskPhone } from "@/admin/utils/admin.utils";
import { formatMoney } from "@/lib/money/money";
import { toast } from "sonner";

const STATUS_OPTIONS = (Object.keys(ORDER_STATUS_LABELS) as AdminOrderStatus[]).map((status) => ({
  value: status,
  label: ORDER_STATUS_LABELS[status],
}));

const SORT_OPTIONS: Array<{ value: AdminOrderSort; label: string }> = [
  { value: "newest", label: "Plus récentes" },
  { value: "oldest", label: "Plus anciennes" },
  { value: "total_desc", label: "Montant décroissant" },
  { value: "total_asc", label: "Montant croissant" },
  { value: "status", label: "Statut" },
];

const PAGE_SIZE = 20;

export function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<AdminOrderSort>("newest");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [deliveryMethod, setDeliveryMethod] = useState("all");
  const [governorate, setGovernorate] = useState("all");
  /** Recherche privée : état local uniquement, jamais persisté. */
  const [search, setSearch] = useState("");

  const params = useMemo<AdminOrderListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sort,
      ...(status !== "all" ? { status: [status as AdminOrderStatus] } : {}),
      ...(paymentStatus !== "all"
        ? { paymentStatus: [paymentStatus as AdminOrder["paymentStatus"]] }
        : {}),
      ...(deliveryMethod !== "all"
        ? { deliveryMethod: [deliveryMethod as AdminOrder["deliveryMethod"]] }
        : {}),
      ...(governorate !== "all" ? { governorates: [governorate] } : {}),
    }),
    [page, sort, status, paymentStatus, deliveryMethod, governorate],
  );

  const { data, isLoading, error, refetch } = useAdminOrders(params, search);
  const bulkUpdate = useBulkUpdateOrderStatus();

  const rows = data?.rows ?? [];
  const counters = data?.counters;

  const columns: AdminColumn<AdminOrder>[] = [
    {
      id: "order",
      header: "Commande",
      cell: (order) => (
        <AppLink
          href={`/admin/commandes/${order.id}`}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          {order.orderNumber}
        </AppLink>
      ),
    },
    { id: "date", header: "Date", cell: (order) => formatDateTime(order.createdAt) },
    {
      id: "customer",
      header: "Client",
      cell: (order) => (
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-xs text-muted-foreground">{maskPhone(order.customerPhone)}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Statut",
      cell: (order) => (
        <AdminStatusBadge
          label={ORDER_STATUS_LABELS[order.status]}
          tone={ORDER_STATUS_TONE[order.status]}
        />
      ),
    },
    {
      id: "payment",
      header: "Paiement",
      cell: (order) => (
        <AdminStatusBadge
          label={PAYMENT_STATUS_LABELS[order.paymentStatus]}
          tone={PAYMENT_STATUS_TONE[order.paymentStatus]}
        />
      ),
    },
    {
      id: "delivery",
      header: "Livraison",
      cell: (order) => (
        <div className="space-y-1">
          <p>{DELIVERY_METHOD_LABELS[order.deliveryMethod]}</p>
          <p className="text-xs text-muted-foreground">
            {order.governorate} — {SHIPPING_PROFILE_LABELS[getOrderShippingProfile(order)]}
          </p>
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      className: "text-right tabular-nums",
      cell: (order) => {
        const total = calculateOrderTotalMinor(order);
        return total === null ? (
          <AdminStatusBadge label="Frais à confirmer" tone="warning" />
        ) : (
          formatMoney(total)
        );
      },
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Commandes"
        description="Suivi opérationnel des commandes, du paiement à la livraison."
        breadcrumbs={[{ label: "Commandes" }]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminKpiCard label="Commandes" value={counters?.total ?? 0} />
        <AdminKpiCard
          label="À confirmer"
          value={counters?.pendingConfirmation ?? 0}
          tone="warning"
        />
        <AdminKpiCard
          label="Frais à confirmer"
          value={counters?.shippingToConfirm ?? 0}
          tone="warning"
        />
        <AdminKpiCard
          label="Paiement en attente"
          value={counters?.paymentPending ?? 0}
          tone="info"
        />
      </div>

      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(order) => order.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        pageSize={PAGE_SIZE}
        emptyTitle="Aucune commande"
        emptyDescription="Ajustez les filtres ou la recherche pour élargir les résultats."
        toolbar={
          <>
            <AdminSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="N° commande, client, téléphone, SKU…"
            />
            <AdminSelectFilter
              label="Statut"
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <AdminSelectFilter
              label="Paiement"
              value={paymentStatus}
              onChange={(value) => {
                setPaymentStatus(value);
                setPage(1);
              }}
              options={[
                { value: "pending", label: "En attente" },
                { value: "collected", label: "Encaissé" },
                { value: "refunded", label: "Remboursé" },
              ]}
            />
            <AdminSelectFilter
              label="Mode de livraison"
              value={deliveryMethod}
              onChange={(value) => {
                setDeliveryMethod(value);
                setPage(1);
              }}
              options={[
                { value: "home_delivery", label: "Livraison à domicile" },
                { value: "store_pickup", label: "Retrait en boutique" },
              ]}
            />
            <AdminSelectFilter
              label="Gouvernorat"
              value={governorate}
              onChange={(value) => {
                setGovernorate(value);
                setPage(1);
              }}
              options={(data?.governorates ?? []).map((item) => ({ value: item, label: item }))}
            />
            <AdminSortSelect
              value={sort}
              onChange={(value) => setSort(value as AdminOrderSort)}
              options={SORT_OPTIONS}
            />
          </>
        }
        bulkActions={(selected, clear) => (
          <>
            {(["confirmed", "preparing", "shipped"] as AdminOrderStatus[]).map((next) => (
              <Button
                key={next}
                size="sm"
                variant="outline"
                disabled={bulkUpdate.isPending}
                onClick={() => {
                  bulkUpdate.mutate(
                    { orderIds: selected, status: next },
                    {
                      onSuccess: (result) => {
                        clear();
                        if (result.failures.length > 0) {
                          toast.warning(
                            `${result.succeeded.length} mise(s) à jour, ${result.failures.length} refusée(s) : ${result.failures[0]?.message ?? ""}`,
                          );
                        }
                      },
                    },
                  );
                }}
              >
                Passer à « {ORDER_STATUS_LABELS[next]} »
              </Button>
            ))}
          </>
        )}
        rowActions={(order) => (
          <Button asChild size="sm" variant="ghost">
            <AppLink href={`/admin/commandes/${order.id}`}>Ouvrir</AppLink>
          </Button>
        )}
      />

      {data && data.pageCount > 1 ? (
        <div className="mt-3 rounded-lg border border-border bg-card">
          <AdminPagination
            page={data.page}
            pageCount={data.pageCount}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      {rows.some((order) => isShippingToConfirm(order)) ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Certaines commandes contiennent des articles volumineux : les frais de livraison doivent
          être confirmés avant validation.
        </p>
      ) : null}
    </div>
  );
}

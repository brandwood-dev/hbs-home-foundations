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
import { AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import { useAdminOrders } from "@/admin/hooks/admin.queries";
import { useBulkUpdateOrderStatus } from "@/admin/hooks/admin-sales.mutations";
import type { AdminOrderListParams, AdminOrderSort } from "@/admin/repositories/interfaces";
import type { AdminOrder, AdminOrderStatus } from "@/admin/types/admin.types";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TONE,
} from "@/admin/services/order-status";
import { isShippingToConfirm } from "@/admin/services/orders/admin-order-shipping";
import { calculateOrderTotalMinor } from "@/admin/services/orders/admin-order-calculations";
import { formatOrderListDateTime, maskPhone } from "@/admin/utils/admin.utils";
import { formatMoney } from "@/lib/money/money";
import { toast } from "sonner";

const STATUS_OPTIONS = ORDER_STATUS_OPTIONS.map((status) => ({
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
  const [governorate, setGovernorate] = useState("all");
  /** Recherche privée : état local uniquement, jamais persisté. */
  const [search, setSearch] = useState("");

  const params = useMemo<AdminOrderListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sort,
      ...(status !== "all" ? { status: [status as AdminOrderStatus] } : {}),
      ...(governorate !== "all" ? { governorates: [governorate] } : {}),
    }),
    [page, sort, status, governorate],
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
    { id: "date", header: "Date", cell: (order) => formatOrderListDateTime(order.createdAt) },
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
            <div className="flex flex-wrap items-center gap-2 text-sm sm:order-last sm:ml-auto">
              <span className="font-semibold tabular-nums text-foreground">{data?.total ?? 0}</span>
              <span className="text-muted-foreground">commande(s)</span>
              {(counters?.pendingConfirmation ?? 0) > 0 ? (
                <AdminStatusBadge
                  label={`${counters?.pendingConfirmation} à confirmer`}
                  tone="warning"
                />
              ) : null}
              {(counters?.paymentPending ?? 0) > 0 ? (
                <AdminStatusBadge
                  label={`${counters?.paymentPending} paiement(s) en attente`}
                  tone="info"
                />
              ) : null}
            </div>
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

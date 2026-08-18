import { useMemo, useState } from "react";
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
import { useAdminCustomers } from "@/admin/hooks/admin.queries";
import type {
  AdminCustomerListParams,
  AdminCustomerRow,
  AdminCustomerSort,
} from "@/admin/repositories/interfaces";
import { maskEmail } from "@/admin/services/customers/admin-customer-normalization";
import { formatDate, maskPhone } from "@/admin/utils/admin.utils";
import { formatMoney } from "@/lib/money/money";

const SORT_OPTIONS: Array<{ value: AdminCustomerSort; label: string }> = [
  { value: "last_order", label: "Dernière commande" },
  { value: "name_asc", label: "Nom (A-Z)" },
  { value: "spent_desc", label: "Chiffre d'affaires" },
  { value: "orders_desc", label: "Nombre de commandes" },
  { value: "aov_desc", label: "Panier moyen" },
];

const PAGE_SIZE = 20;

export function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<AdminCustomerSort>("last_order");
  const [governorate, setGovernorate] = useState("all");
  const [activity, setActivity] = useState("all");
  const [duplicates, setDuplicates] = useState("all");
  /** Recherche privée : jamais persistée. */
  const [search, setSearch] = useState("");

  const params = useMemo<AdminCustomerListParams>(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sort,
      ...(governorate !== "all" ? { governorates: [governorate] } : {}),
      ...(activity === "with_orders" ? { hasOrders: true } : {}),
      ...(activity === "delivered" ? { hasDeliveredOrders: true } : {}),
      ...(duplicates === "only" ? { onlyPotentialDuplicates: true } : {}),
    }),
    [page, sort, governorate, activity, duplicates],
  );

  const { data, isLoading, error, refetch } = useAdminCustomers(params, search);
  const rows = data?.rows ?? [];

  const totalSpentMinor = rows.reduce((total, row) => total + row.metrics.totalSpentMinor, 0);
  const duplicateCount = rows.filter((row) => row.hasPotentialDuplicate).length;

  const columns: AdminColumn<AdminCustomerRow>[] = [
    {
      id: "name",
      header: "Client",
      cell: (customer) => (
        <div>
          <AppLink
            href={`/admin/clients/${customer.id}`}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {customer.firstName} {customer.lastName}
          </AppLink>
          <p className="text-xs text-muted-foreground">{customer.governorate}</p>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contact",
      cell: (customer) => (
        <div className="text-xs text-muted-foreground">
          <p>{maskPhone(customer.phone)}</p>
          {customer.email ? <p>{maskEmail(customer.email)}</p> : null}
        </div>
      ),
    },
    {
      id: "orders",
      header: "Commandes",
      cell: (customer) => (
        <span className="tabular-nums">
          {customer.metrics.totalOrders}
          <span className="text-xs text-muted-foreground">
            {" "}
            ({customer.metrics.deliveredOrders} livrées)
          </span>
        </span>
      ),
    },
    {
      id: "spent",
      header: "Total dépensé",
      cell: (customer) => (
        <span className="tabular-nums">{formatMoney(customer.metrics.totalSpentMinor)}</span>
      ),
    },
    {
      id: "aov",
      header: "Panier moyen",
      cell: (customer) => (
        <span className="tabular-nums">{formatMoney(customer.metrics.averageOrderValueMinor)}</span>
      ),
    },
    {
      id: "last",
      header: "Dernière commande",
      cell: (customer) =>
        customer.metrics.lastOrderAt ? formatDate(customer.metrics.lastOrderAt) : "—",
    },
    {
      id: "flags",
      header: "Signaux",
      cell: (customer) =>
        customer.hasPotentialDuplicate ? (
          <AdminStatusBadge label="Doublon possible" tone="warning" />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Clients"
        description="Fiches clients, historique de commandes et détection de doublons."
        breadcrumbs={[{ label: "Clients" }]}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard label="Clients" value={data?.total ?? 0} />
        <AdminKpiCard label="Page courante" value={rows.length} />
        <AdminKpiCard
          label="CA cumulé (page)"
          value={formatMoney(totalSpentMinor)}
          tone="success"
        />
        <AdminKpiCard
          label="Doublons possibles (page)"
          value={duplicateCount}
          tone={duplicateCount > 0 ? "warning" : "neutral"}
        />
      </div>

      <AdminDataTable
        rows={rows}
        columns={columns}
        rowKey={(customer) => customer.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        pageSize={PAGE_SIZE}
        emptyTitle="Aucun client"
        emptyDescription="Ajustez vos filtres ou votre recherche."
        toolbar={
          <>
            <AdminSearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Nom, téléphone ou e-mail"
            />
            <AdminSelectFilter
              label="Gouvernorat"
              value={governorate}
              onChange={(value) => {
                setGovernorate(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tous" },
                ...(data?.governorates ?? []).map((item) => ({ value: item, label: item })),
              ]}
            />
            <AdminSelectFilter
              label="Activité"
              value={activity}
              onChange={(value) => {
                setActivity(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tous" },
                { value: "with_orders", label: "Avec commandes" },
                { value: "delivered", label: "Avec livraison" },
              ]}
            />
            <AdminSelectFilter
              label="Doublons"
              value={duplicates}
              onChange={(value) => {
                setDuplicates(value);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Tous" },
                { value: "only", label: "Doublons possibles" },
              ]}
            />
            <AdminSortSelect
              value={sort}
              onChange={(value) => setSort(value as AdminCustomerSort)}
              options={SORT_OPTIONS}
            />
          </>
        }
      />

      <AdminPagination
        page={data?.page ?? page}
        pageCount={data?.pageCount ?? 1}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminCard,
  AdminKpiCard,
  AdminSkeleton,
  AdminStatusBadge,
  AdminErrorState,
} from "@/admin/components/ui/AdminStates";
import { useAdminDashboard } from "@/admin/hooks/admin.queries";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/admin/services/order-status";
import { formatDate } from "@/admin/utils/admin.utils";
import { formatMoney } from "@/lib/money/money";
import { AppLink } from "@/components/ui/app-link";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminDashboard();

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Activité commerciale sur les données de démonstration."
      />

      {error ? (
        <AdminErrorState
          message="Chargement du tableau de bord impossible."
          onRetry={() => void refetch()}
        />
      ) : isLoading || !data ? (
        <AdminSkeleton rows={8} />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AdminKpiCard
              label="Chiffre d'affaires"
              value={formatMoney(data.revenueMinor)}
              hint="Sous-totaux produits des commandes livrées (hors livraison)."
              tone="success"
            />
            <AdminKpiCard label="Commandes livrées" value={data.deliveredCount} tone="success" />
            <AdminKpiCard
              label="Panier moyen"
              value={formatMoney(data.averageOrderValueMinor)}
              hint="Commandes livrées, hors frais de livraison."
            />
            <AdminKpiCard label="Total des commandes" value={data.totalOrders} />
            <AdminKpiCard
              label="À confirmer"
              value={data.pendingConfirmationCount}
              tone="warning"
            />
            <AdminKpiCard label="En préparation" value={data.preparingCount} tone="info" />
            <AdminKpiCard label="Expédiées" value={data.shippedCount} tone="info" />
            <AdminKpiCard label="Annulées" value={data.cancelledCount} tone="danger" />
            <AdminKpiCard
              label="Produits en faible stock"
              value={data.lowStockCount}
              tone="warning"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <AdminCard>
              <h2 className="mb-3 text-sm font-semibold">Commandes récentes</h2>
              <ul className="divide-y divide-border text-sm">
                {data.recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <AppLink
                        href={`/admin/commandes/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.orderNumber}
                      </AppLink>
                      <p className="truncate text-xs text-muted-foreground">
                        {order.customerName} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tabular-nums">{formatMoney(order.totalMinor)}</span>
                      <AdminStatusBadge
                        label={ORDER_STATUS_LABELS[order.status]}
                        tone={ORDER_STATUS_TONE[order.status]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </AdminCard>

            <AdminCard>
              <h2 className="mb-3 text-sm font-semibold">Répartition par statut</h2>
              <ul className="space-y-2 text-sm">
                {data.statusBreakdown.map((entry) => {
                  const max = Math.max(...data.statusBreakdown.map((item) => item.count), 1);
                  return (
                    <li
                      key={entry.status}
                      className="grid grid-cols-[140px_1fr_auto] items-center gap-2"
                    >
                      <span className="truncate text-xs">{ORDER_STATUS_LABELS[entry.status]}</span>
                      <span className="h-2 rounded bg-muted">
                        <span
                          className="block h-2 rounded bg-primary"
                          style={{ width: `${(entry.count / max) * 100}%` }}
                        />
                      </span>
                      <span className="tabular-nums">{entry.count}</span>
                    </li>
                  );
                })}
              </ul>
            </AdminCard>

            <AdminCard>
              <h2 className="mb-3 text-sm font-semibold">Produits les plus vendus</h2>
              <ul className="divide-y divide-border text-sm">
                {data.topProducts.map((product) => (
                  <li key={product.productId} className="flex justify-between gap-3 py-2">
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {product.quantity} · {formatMoney(product.revenueMinor)}
                    </span>
                  </li>
                ))}
              </ul>
            </AdminCard>

            <AdminCard>
              <h2 className="mb-3 text-sm font-semibold">Produits en faible stock</h2>
              <ul className="divide-y divide-border text-sm">
                {data.lowStockRows.map((row) => (
                  <li key={row.variant.id} className="flex justify-between gap-3 py-2">
                    <span className="truncate">
                      {row.productName}
                      <span className="text-xs text-muted-foreground"> · {row.variant.sku}</span>
                    </span>
                    <span className="shrink-0 tabular-nums">{row.variant.stock}</span>
                  </li>
                ))}
              </ul>
            </AdminCard>
          </div>

          <AdminCard>
            <h2 className="mb-3 text-sm font-semibold">Ventes récentes (commandes livrées)</h2>
            <div className="flex h-28 items-end gap-1">
              {data.salesByDay.map((day) => {
                const max = Math.max(...data.salesByDay.map((item) => item.revenueMinor), 1);
                return (
                  <span
                    key={day.date}
                    title={`${day.date} — ${formatMoney(day.revenueMinor)}`}
                    className="flex-1 rounded-t bg-primary/70"
                    style={{ height: `${Math.max(4, (day.revenueMinor / max) * 100)}%` }}
                  />
                );
              })}
            </div>
          </AdminCard>
        </div>
      )}
    </>
  );
}

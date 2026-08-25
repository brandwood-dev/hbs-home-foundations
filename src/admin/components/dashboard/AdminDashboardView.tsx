import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { AdminCard, AdminStatusBadge } from "@/admin/components/ui/AdminStates";
import type { DashboardMetrics } from "@/admin/repositories/interfaces";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "@/admin/services/order-status";
import { formatDate } from "@/admin/utils/admin.utils";
import { AppLink } from "@/components/ui/app-link";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatMoney } from "@/lib/money/money";
import { cn } from "@/lib/utils";

const UNAVAILABLE = "Donnée non disponible";

/** Palette dérivée des tokens HBS HOME (aucune couleur codée en dur). */
const SERIES_COLORS = [
  "var(--accent)",
  "var(--accent-dark)",
  "var(--success)",
  "var(--sand)",
  "var(--foreground-muted)",
];

function KpiCard({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-2 font-semibold tabular-nums",
          emphasis ? "text-3xl" : "text-2xl",
          "text-foreground",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function UnavailableCard({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 p-5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground italic">{UNAVAILABLE}</p>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AdminCard className={cn("rounded-xl p-5", className)}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </AdminCard>
  );
}

function shortDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function AdminDashboardView({ data }: { data: DashboardMetrics }) {
  const salesSeries = useMemo(
    () =>
      data.salesByDay.map((day) => ({
        date: day.date,
        label: shortDate(day.date),
        revenue: day.revenueMinor / 1000,
      })),
    [data.salesByDay],
  );

  const statusSeries = useMemo(
    () =>
      data.statusBreakdown
        .filter((entry) => entry.count > 0)
        .map((entry, index) => ({
          status: entry.status,
          label: ORDER_STATUS_LABELS[entry.status],
          count: entry.count,
          fill: SERIES_COLORS[index % SERIES_COLORS.length] as string,
        })),
    [data.statusBreakdown],
  );

  const topProductsSeries = useMemo(
    () =>
      data.topProducts.slice(0, 6).map((product) => ({
        name: product.name,
        quantity: product.quantity,
        revenueMinor: product.revenueMinor,
      })),
    [data.topProducts],
  );

  const revenueConfig = {
    revenue: { label: "Chiffre d'affaires (milliers)", color: "var(--accent)" },
  } satisfies ChartConfig;
  const countConfig = { count: { label: "Commandes", color: "var(--accent)" } } satisfies ChartConfig;
  const quantityConfig = {
    quantity: { label: "Quantité vendue", color: "var(--accent-dark)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-8">
      <section aria-labelledby="kpi-heading" className="space-y-3">
        <h2 id="kpi-heading" className="sr-only">
          Indicateurs clés
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={formatMoney(data.revenueMinor)}
            hint="Sous-totaux produits des commandes livrées (hors livraison)."
            emphasis
          />
          <KpiCard label="Total des commandes" value={data.totalOrders} emphasis />
          <KpiCard
            label="Panier moyen"
            value={formatMoney(data.averageOrderValueMinor)}
            hint="Commandes livrées, hors frais de livraison."
            emphasis
          />
          <KpiCard label="Commandes livrées" value={data.deliveredCount} emphasis />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="À confirmer" value={data.pendingConfirmationCount} />
          <KpiCard label="En préparation" value={data.preparingCount} />
          <KpiCard label="Expédiées" value={data.shippedCount} />
          <KpiCard label="Annulées" value={data.cancelledCount} />
          <KpiCard label="Produits en faible stock" value={data.lowStockCount} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <UnavailableCard label="Commandes en attente de paiement" />
          <UnavailableCard label="Frais de livraison à confirmer" />
          <UnavailableCard label="Clients" />
          <UnavailableCard label="Promotions actives" />
        </div>
        <p className="text-xs text-muted-foreground">
          Ces indicateurs ne sont pas exposés par l’API du tableau de bord actuelle : aucune valeur
          n’est estimée.
        </p>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Ventes par jour"
          description="Chiffre d'affaires des commandes livrées, en milliers."
          className="xl:col-span-2"
        >
          {salesSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <ChartContainer config={revenueConfig} className="h-56 w-full">
              <BarChart data={salesSeries} margin={{ left: 4, right: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} fill="var(--color-revenue)" />
              </BarChart>
            </ChartContainer>
          )}
          <table className="sr-only">
            <caption>Chiffre d'affaires des commandes livrées par jour</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Chiffre d'affaires</th>
              </tr>
            </thead>
            <tbody>
              {data.salesByDay.map((day) => (
                <tr key={day.date}>
                  <th scope="row">{day.date}</th>
                  <td>{formatMoney(day.revenueMinor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Répartition des statuts" description="Toutes commandes confondues.">
          {statusSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <>
              <ChartContainer config={countConfig} className="h-48 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
                  <Pie
                    data={statusSeries}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                cornerRadius={3}
                  >
                    {statusSeries.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} stroke="var(--card)" />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <ul className="mt-3 space-y-1.5 text-xs">
                {statusSeries.map((entry) => (
                  <li key={entry.status} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: entry.fill }}
                    />
                    <span className="truncate text-muted-foreground">{entry.label}</span>
                    <span className="ml-auto tabular-nums">{entry.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Produits les plus commandés"
          description="Quantités vendues sur la période fournie par l'API."
        >
          {topProductsSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <>
              <ChartContainer config={quantityConfig} className="h-56 w-full">
                <BarChart data={topProductsSeries} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantity" radius={[0, 4, 4, 0]} fill="var(--color-quantity)" />
                </BarChart>
              </ChartContainer>
              <ul className="mt-3 divide-y divide-border text-sm">
                {topProductsSeries.map((product) => (
                  <li key={product.name} className="flex justify-between gap-3 py-2">
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {product.quantity} · {formatMoney(product.revenueMinor)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Évolution des commandes livrées"
          description="Courbe du chiffre d'affaires quotidien (milliers)."
        >
          {salesSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <ChartContainer config={revenueConfig} className="h-56 w-full">
              <LineChart data={salesSeries} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} width={36} fontSize={11} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Dernières commandes" className="xl:col-span-2">
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <caption className="sr-only">Dernières commandes enregistrées</caption>
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Commande
                    </th>
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Client
                    </th>
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Date
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-medium">
                      Total
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-2 pr-3">
                        <AppLink
                          href={`/admin/commandes/${order.id}`}
                          className="rounded font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          {order.orderNumber}
                        </AppLink>
                      </td>
                      <td className="max-w-40 truncate py-2 pr-3 text-muted-foreground">
                        {order.customerName}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {formatMoney(order.totalMinor)}
                      </td>
                      <td className="py-2">
                        <AdminStatusBadge
                          label={ORDER_STATUS_LABELS[order.status]}
                          tone={ORDER_STATUS_TONE[order.status]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Produits en faible stock">
          {data.lowStockRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun produit en alerte de stock.</p>
          ) : (
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
          )}
        </SectionCard>
      </div>
    </div>
  );
}

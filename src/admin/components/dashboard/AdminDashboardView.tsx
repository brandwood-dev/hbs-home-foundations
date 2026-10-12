import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Banknote, PackageCheck, ShoppingCart, WalletCards } from "lucide-react";
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

const SERIES_COLORS = [
  "var(--admin-chart-orders)",
  "var(--admin-chart-average)",
  "var(--admin-chart-delivered)",
  "var(--admin-chart-pending)",
  "var(--admin-chart-cancelled)",
];

const GOVERNORATE_COLORS = [
  "var(--admin-chart-revenue)",
  "var(--admin-chart-orders)",
  "var(--admin-chart-average)",
  "var(--admin-chart-delivered)",
  "var(--admin-chart-pending)",
  "var(--admin-chart-cancelled)",
  "var(--admin-chart-grid)",
];

const STATUS_COLORS: Record<string, string> = {
  received: "var(--admin-chart-orders)",
  pending_confirmation: "var(--admin-chart-pending)",
  confirmed: "var(--admin-chart-orders)",
  preparing: "var(--admin-chart-average)",
  shipped: "var(--admin-chart-average)",
  delivered: "var(--admin-chart-delivered)",
  cancelled: "var(--admin-chart-cancelled)",
  return_requested: "var(--admin-chart-pending)",
  returned: "var(--admin-chart-cancelled)",
};

const KPI_TONE_STYLES = {
  revenue: {
    color: "var(--admin-chart-revenue)",
    backgroundColor: "color-mix(in srgb, var(--admin-chart-revenue) 13%, transparent)",
  },
  orders: {
    color: "var(--admin-chart-orders)",
    backgroundColor: "color-mix(in srgb, var(--admin-chart-orders) 13%, transparent)",
  },
  average: {
    color: "var(--admin-chart-average)",
    backgroundColor: "color-mix(in srgb, var(--admin-chart-average) 13%, transparent)",
  },
  delivered: {
    color: "var(--admin-chart-delivered)",
    backgroundColor: "color-mix(in srgb, var(--admin-chart-delivered) 13%, transparent)",
  },
} as const;

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone: keyof typeof KPI_TONE_STYLES;
}) {
  const toneStyle = KPI_TONE_STYLES[tone];

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 shadow-sm transition-[border-color,box-shadow,transform] motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
      style={{ borderInlineStartColor: toneStyle.color }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={toneStyle}
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 line-clamp-1 text-[11px] leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
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
    <AdminCard className={cn("rounded-xl p-4 shadow-sm", className)}>
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
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

function formatAxisMoney(value: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} DT`;
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
          fill: STATUS_COLORS[entry.status] ?? SERIES_COLORS[index % SERIES_COLORS.length],
        })),
    [data.statusBreakdown],
  );

  const topProductsSeries = useMemo(
    () =>
      data.topProducts.slice(0, 6).map((product) => ({
        productId: product.productId,
        name: product.name,
        quantity: product.quantity,
        revenueMinor: product.revenueMinor,
        imageUrl: product.imageUrl,
      })),
    [data.topProducts],
  );

  const governorateSeries = useMemo(() => {
    const entries = (data.governorateBreakdown ?? [])
      .filter((entry) => entry.governorate.trim().length > 0 && entry.count > 0)
      .sort((a, b) => b.count - a.count);
    const visible = entries.slice(0, 7);
    const otherCount = entries.slice(7).reduce((total, entry) => total + entry.count, 0);
    if (otherCount > 0) visible.push({ governorate: "Autres", count: otherCount });
    return visible.map((entry, index) => ({
      ...entry,
      fill: GOVERNORATE_COLORS[index % GOVERNORATE_COLORS.length],
    }));
  }, [data.governorateBreakdown]);

  const statusTotal = statusSeries.reduce((total, entry) => total + entry.count, 0);
  const governorateTotal = governorateSeries.reduce((total, entry) => total + entry.count, 0);

  const revenueConfig = {
    revenue: { label: "Chiffre d'affaires (DT)", color: "var(--admin-chart-revenue)" },
  } satisfies ChartConfig;
  const countConfig = {
    count: { label: "Commandes", color: "var(--admin-chart-orders)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section aria-labelledby="kpi-heading" className="space-y-3">
        <h2 id="kpi-heading" className="sr-only">
          Indicateurs clés
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Chiffre d'affaires"
            value={formatMoney(data.revenueMinor)}
            hint="Sous-totaux produits des commandes livrées (hors livraison)."
            icon={Banknote}
            tone="revenue"
          />
          <KpiCard
            label="Total des commandes"
            value={data.totalOrders}
            icon={ShoppingCart}
            tone="orders"
          />
          <KpiCard
            label="Panier moyen"
            value={formatMoney(data.averageOrderValueMinor)}
            hint="Commandes livrées, hors frais de livraison."
            icon={WalletCards}
            tone="average"
          />
          <KpiCard
            label="Commandes livrées"
            value={data.deliveredCount}
            icon={PackageCheck}
            tone="delivered"
          />
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-3">
        <SectionCard
          title="Ventes par jour"
          description="Chiffre d'affaires des commandes livrées sur la période sélectionnée."
          className="xl:col-span-2"
        >
          {salesSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <ChartContainer config={revenueConfig} className="h-60 w-full overflow-visible">
              <AreaChart data={salesSeries} margin={{ top: 20, right: 12, left: 8, bottom: 4 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--admin-chart-grid)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={72}
                  tickMargin={6}
                  fontSize={11}
                  tickCount={5}
                  domain={[0, "auto"]}
                  padding={{ top: 12, bottom: 4 }}
                  tickFormatter={(value) => formatAxisMoney(Number(value))}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {formatMoney(Number(value) * 1000)}
                        </span>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  fillOpacity={0.16}
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-revenue)", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
                />
              </AreaChart>
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
              <ChartContainer config={countConfig} className="h-44 w-full">
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
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--foreground)"
                    aria-hidden="true"
                  >
                    <tspan x="50%" dy="-0.15em" className="text-base font-semibold">
                      {statusTotal}
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.35em"
                      className="text-[10px]"
                      fill="var(--foreground-muted)"
                    >
                      commandes
                    </tspan>
                  </text>
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
                    <span className="ml-auto tabular-nums">
                      {entry.count} ·{" "}
                      {statusTotal ? Math.round((entry.count / statusTotal) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <SectionCard
          title="Top produits"
          description="Les produits les plus vendus sur la période sélectionnée."
        >
          {topProductsSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <ol className="divide-y divide-border">
              {topProductsSeries.map((product, index) => (
                <li
                  key={product.productId}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <AppLink
                      href={`/admin/produits/${product.productId}`}
                      className="line-clamp-2 text-sm font-medium leading-snug hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {product.name}
                    </AppLink>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.quantity} {product.quantity > 1 ? "ventes" : "vente"}
                      <span aria-hidden="true"> · </span>
                      {formatMoney(product.revenueMinor)}
                    </p>
                  </div>
                  <span className="shrink-0 text-right text-sm font-semibold tabular-nums">
                    {product.quantity}
                    <span className="block text-[10px] font-normal tracking-wide text-muted-foreground uppercase">
                      vendu{product.quantity > 1 ? "s" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>

        <SectionCard
          title="Commandes par gouvernorat"
          description="Répartition sur la période sélectionnée."
        >
          {governorateSeries.length === 0 ? (
            <p className="text-sm text-muted-foreground">{UNAVAILABLE}</p>
          ) : (
            <>
              <ChartContainer config={countConfig} className="h-52 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="governorate" />} />
                  <Pie
                    data={governorateSeries}
                    dataKey="count"
                    nameKey="governorate"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={2}
                    cornerRadius={3}
                  >
                    {governorateSeries.map((entry) => (
                      <Cell key={entry.governorate} fill={entry.fill} stroke="var(--card)" />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--foreground)"
                    aria-hidden="true"
                  >
                    <tspan x="50%" dy="-0.15em" className="text-base font-semibold">
                      {governorateTotal}
                    </tspan>
                    <tspan
                      x="50%"
                      dy="1.35em"
                      className="text-[10px]"
                      fill="var(--foreground-muted)"
                    >
                      commandes
                    </tspan>
                  </text>
                </PieChart>
              </ChartContainer>
              <ul className="mt-3 space-y-1.5 text-xs">
                {governorateSeries.map((entry) => (
                  <li key={entry.governorate} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: entry.fill }}
                    />
                    <span className="truncate text-muted-foreground">{entry.governorate}</span>
                    <span className="ml-auto tabular-nums">
                      {entry.count} ·{" "}
                      {governorateTotal ? Math.round((entry.count / governorateTotal) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-3">
        <SectionCard title="Dernières commandes" description="Les commandes les plus récentes.">
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune commande pour le moment.</p>
          ) : (
            <div className="max-h-64 overflow-auto">
              <table className="w-full min-w-[500px] text-xs">
                <caption className="sr-only">Dernières commandes enregistrées</caption>
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-left text-[10px] tracking-wide text-muted-foreground uppercase">
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
                      <td className="max-w-32 truncate py-2 pr-3 text-muted-foreground">
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
      </div>
    </div>
  );
}

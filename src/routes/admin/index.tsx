import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboardView } from "@/admin/components/dashboard/AdminDashboardView";
import { AdminDashboardPeriodFilter } from "@/admin/components/dashboard/AdminDashboardPeriodFilter";
import {
  defaultDashboardPeriod,
  type DashboardPeriodSelection,
} from "@/admin/components/dashboard/admin-dashboard-period";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import { AdminSkeleton, AdminErrorState } from "@/admin/components/ui/AdminStates";
import { useAdminDashboard } from "@/admin/hooks/admin.queries";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";

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
  const [selection, setSelection] = useState<DashboardPeriodSelection>(() =>
    defaultDashboardPeriod(),
  );
  const { data, isLoading, error, refetch } = useAdminDashboard(selection);

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <AdminPageHeader
        title="Tableau de bord"
        description="Commandes, catalogue et stock sur la période sélectionnée."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button asChild variant="outline" size="sm">
              <AppLink href="/admin/produits/nouveau">
                <Plus className="mr-1.5 size-4" aria-hidden="true" />
                Nouveau produit
              </AppLink>
            </Button>
            <Button asChild variant="outline" size="sm">
              <AppLink href="/admin/commandes">
                <ShoppingCart className="mr-1.5 size-4" aria-hidden="true" />
                Commandes
              </AppLink>
            </Button>
            <AdminDashboardPeriodFilter value={selection} onChange={setSelection} />
          </div>
        }
      />

      {error ? (
        <AdminErrorState
          message="Chargement du tableau de bord impossible."
          onRetry={() => void refetch()}
        />
      ) : isLoading || !data ? (
        <AdminSkeleton rows={8} />
      ) : (
        <AdminDashboardView data={data} />
      )}
    </div>
  );
}

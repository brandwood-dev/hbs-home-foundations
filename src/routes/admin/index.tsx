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
        description="Activité commerciale calculée à partir des commandes et du stock réels."
        actions={<AdminDashboardPeriodFilter value={selection} onChange={setSelection} />}
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

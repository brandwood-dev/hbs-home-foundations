import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/admin/components/layout/AdminShell";
import { AdminAccessGate } from "@/admin/components/auth/AdminAccessGate";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Administration du catalogue et des commandes HBS HOME." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (pathname === "/admin/connexion" || pathname === "/admin/auth/callback") {
    return <Outlet />;
  }

  return (
    <AdminAccessGate>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminAccessGate>
  );
}

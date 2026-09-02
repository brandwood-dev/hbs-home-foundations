import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/admin/components/administration/AdminUsersPage";
export const Route = createFileRoute("/admin/utilisateurs")({
  head: () => ({
    meta: [
      { title: "Utilisateurs et rôles — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});

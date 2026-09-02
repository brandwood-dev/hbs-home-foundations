import { createFileRoute } from "@tanstack/react-router";
import { AdminSettingsPage } from "@/admin/components/administration/AdminSettingsPage";
export const Route = createFileRoute("/admin/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSettingsPage,
});

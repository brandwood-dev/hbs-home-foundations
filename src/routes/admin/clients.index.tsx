import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomersPage } from "@/admin/components/customers/AdminCustomersPage";

export const Route = createFileRoute("/admin/clients/")({
  head: () => ({
    meta: [
      { title: "Clients — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Fiches clients et historique de commandes HBS HOME." },
    ],
  }),
  component: AdminCustomersPage,
});

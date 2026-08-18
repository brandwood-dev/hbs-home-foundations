import { createFileRoute } from "@tanstack/react-router";
import { AdminOrdersPage } from "@/admin/components/orders/AdminOrdersPage";

export const Route = createFileRoute("/admin/commandes/")({
  head: () => ({
    meta: [
      { title: "Commandes — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Suivi et traitement des commandes HBS HOME." },
    ],
  }),
  component: AdminOrdersPage,
});

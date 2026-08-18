import { createFileRoute } from "@tanstack/react-router";
import { AdminInventoryPage } from "@/admin/components/inventory/AdminInventoryPage";

export const Route = createFileRoute("/admin/stock")({
  head: () => ({
    meta: [
      { title: "Stock — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Suivi des niveaux de stock et des mouvements HBS HOME." },
    ],
  }),
  component: AdminInventoryPage,
});

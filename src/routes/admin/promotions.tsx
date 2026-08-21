import { createFileRoute } from "@tanstack/react-router";
import { AdminPromotionsPage } from "@/admin/components/promotions/AdminPromotionsPage";

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion des codes promotionnels HBS HOME." },
    ],
  }),
  component: AdminPromotionsPage,
});

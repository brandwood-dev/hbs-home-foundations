import { createFileRoute } from "@tanstack/react-router";
import { AdminProductsPage } from "@/admin/components/products/AdminProductsPage";

export const Route = createFileRoute("/admin/produits/")({
  head: () => ({
    meta: [
      { title: "Produits — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion du catalogue produits HBS HOME." },
    ],
  }),
  component: AdminProductsPage,
});

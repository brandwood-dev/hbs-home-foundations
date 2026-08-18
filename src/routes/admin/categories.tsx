import { createFileRoute } from "@tanstack/react-router";
import { AdminCategoriesPage } from "@/admin/components/categories/AdminCategoriesPage";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Catégories — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Arborescence des catégories du catalogue HBS HOME." },
    ],
  }),
  component: AdminCategoriesPage,
});

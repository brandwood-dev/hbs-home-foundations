import { createFileRoute } from "@tanstack/react-router";
import { AdminArticlesPage } from "@/admin/components/content/AdminArticlesPage";

export const Route = createFileRoute("/admin/contenu/articles")({
  head: () => ({
    meta: [
      { title: "Articles — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminArticlesPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { AdminEditorialPagesPage } from "@/admin/components/content/AdminEditorialPagesPage";

export const Route = createFileRoute("/admin/contenu/pages")({
  head: () => ({
    meta: [
      { title: "Pages éditoriales — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion des pages éditoriales HBS HOME." },
    ],
  }),
  component: AdminEditorialPagesPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { AdminAttributesPage } from "@/admin/components/attributes/AdminAttributesPage";

export const Route = createFileRoute("/admin/attributs")({
  head: () => ({
    meta: [
      { title: "Attributs et filtres — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion des attributs et filtres du catalogue HBS HOME." },
    ],
  }),
  component: AdminAttributesPage,
});

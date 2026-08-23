import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeContentPage } from "@/admin/components/content/AdminHomeContentPage";

export const Route = createFileRoute("/admin/contenu/accueil")({
  head: () => ({
    meta: [
      { title: "Page d’accueil — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion du Hero, de la banderole et de Shop the Look." },
    ],
  }),
  component: AdminHomeContentPage,
});

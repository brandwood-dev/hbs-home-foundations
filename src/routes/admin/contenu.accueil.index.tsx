import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeOverviewPage } from "@/admin/components/content/AdminHomeOverviewPage";

export const Route = createFileRoute("/admin/contenu/accueil/")({
  head: () => ({
    meta: [
      { title: "Page d’accueil — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: "Vue d’ensemble du Hero, de la banderole et de Shop the Look.",
      },
    ],
  }),
  component: AdminHomeOverviewPage,
});

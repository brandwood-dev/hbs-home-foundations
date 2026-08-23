import { createFileRoute } from "@tanstack/react-router";
import { AdminMediaPage } from "@/admin/components/media/AdminMediaPage";

export const Route = createFileRoute("/admin/medias")({
  head: () => ({
    meta: [
      { title: "Médiathèque — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestion des médias éditoriaux HBS HOME." },
    ],
  }),
  component: AdminMediaPage,
});

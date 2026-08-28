import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeContentPage } from "@/admin/components/content/AdminHomeContentPage";

export const Route = createFileRoute("/admin/contenu/accueil/banderole")({
  head: () => ({
    meta: [
      { title: "Banderole promotionnelle — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminHomeContentPage sectionKey="promo_banner" />,
});

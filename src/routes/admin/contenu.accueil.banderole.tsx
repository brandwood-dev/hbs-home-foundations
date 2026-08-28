import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeSectionEditor } from "@/admin/components/content/AdminHomeSectionEditor";

export const Route = createFileRoute("/admin/contenu/accueil/banderole")({
  head: () => ({
    meta: [
      { title: "Banderole promotionnelle — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminHomeSectionEditor sectionKey="promo_banner" />,
});

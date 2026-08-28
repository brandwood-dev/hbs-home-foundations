import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeSectionEditor } from "@/admin/components/content/AdminHomeSectionEditor";

export const Route = createFileRoute("/admin/contenu/accueil/shop-the-look")({
  head: () => ({
    meta: [
      { title: "Shop the Look — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminHomeSectionEditor sectionKey="shop_the_look" />,
});

import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeContentPage } from "@/admin/components/content/AdminHomeContentPage";

export const Route = createFileRoute("/admin/contenu/accueil/shop-the-look")({
  head: () => ({
    meta: [
      { title: "Shop the Look — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminHomeContentPage sectionKey="shop_the_look" />,
});

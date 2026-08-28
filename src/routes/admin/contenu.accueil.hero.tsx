import { createFileRoute } from "@tanstack/react-router";
import { AdminHomeContentPage } from "@/admin/components/content/AdminHomeContentPage";

export const Route = createFileRoute("/admin/contenu/accueil/hero")({
  head: () => ({
    meta: [
      { title: "Hero principal — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminHomeContentPage sectionKey="hero" />,
});

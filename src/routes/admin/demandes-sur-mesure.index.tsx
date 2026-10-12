import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomQuotesPage } from "@/admin/components/quotes/AdminCustomQuotesPage";

export const Route = createFileRoute("/admin/demandes-sur-mesure/")({
  head: () => ({ meta: [{ title: "Demandes sur mesure — Back-office HBS HOME" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminCustomQuotesPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { AdminCustomQuoteDetailPage } from "@/admin/components/quotes/AdminCustomQuoteDetailPage";

export const Route = createFileRoute("/admin/demandes-sur-mesure/$quoteId")({
  head: () => ({
    meta: [
      { title: "Demande sur mesure — Back-office HBS HOME" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: QuoteDetailRoute,
});

function QuoteDetailRoute() {
  const { quoteId } = Route.useParams();
  return <AdminCustomQuoteDetailPage quoteId={quoteId} />;
}

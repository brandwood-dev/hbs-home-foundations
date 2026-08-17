import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Promotions — HBS HOME";
const description = "Promotions — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  return <PlaceholderPage title="Promotions" />;
}

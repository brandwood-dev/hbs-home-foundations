import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Livraison et retours — HBS HOME";
const description = "Livraison et retours — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/livraison-et-retours")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LivraisonEtRetoursPage,
});

function LivraisonEtRetoursPage() {
  return <PlaceholderPage title="Livraison et retours" />;
}

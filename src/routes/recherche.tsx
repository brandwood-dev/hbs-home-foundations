import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Recherche — HBS HOME";
const description = "Recherche — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/recherche")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RecherchePage,
});

function RecherchePage() {
  return <PlaceholderPage title="Recherche" />;
}

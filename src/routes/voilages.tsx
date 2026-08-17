import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Voilages — HBS HOME";
const description = "Voilages — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/voilages")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: VoilagesPage,
});

function VoilagesPage() {
  return <PlaceholderPage title="Voilages" />;
}

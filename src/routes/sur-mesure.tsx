import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Sur mesure — HBS HOME";
const description = "Sur mesure — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/sur-mesure")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SurMesurePage,
});

function SurMesurePage() {
  return <PlaceholderPage title="Sur mesure" />;
}

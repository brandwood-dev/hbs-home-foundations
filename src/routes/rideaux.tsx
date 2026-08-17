import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Rideaux — HBS HOME";
const description = "Rideaux — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/rideaux")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RideauxPage,
});

function RideauxPage() {
  return <PlaceholderPage title="Rideaux" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Inspirations — HBS HOME";
const description = "Inspirations — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/inspirations")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: InspirationsPage,
});

function InspirationsPage() {
  return <PlaceholderPage title="Inspirations" />;
}

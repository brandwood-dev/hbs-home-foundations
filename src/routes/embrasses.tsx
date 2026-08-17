import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Embrasses — HBS HOME";
const description = "Embrasses — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/embrasses")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: EmbrassesPage,
});

function EmbrassesPage() {
  return <PlaceholderPage title="Embrasses" />;
}

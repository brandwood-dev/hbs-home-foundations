import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Nouveautés — HBS HOME";
const description = "Nouveautés — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/nouveautes")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: NouveautesPage,
});

function NouveautesPage() {
  return <PlaceholderPage title="Nouveautés" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Politique de confidentialité — HBS HOME";
const description = "Politique de confidentialité — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return <PlaceholderPage title="Politique de confidentialité" />;
}

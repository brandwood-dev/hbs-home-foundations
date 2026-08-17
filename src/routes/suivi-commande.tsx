import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Suivi de commande — HBS HOME";
const description = "Suivi de commande — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/suivi-commande")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SuiviCommandePage,
});

function SuiviCommandePage() {
  return <PlaceholderPage title="Suivi de commande" />;
}

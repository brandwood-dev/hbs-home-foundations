import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Mentions légales — HBS HOME";
const description =
  "Mentions légales — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return <PlaceholderPage title="Mentions légales" />;
}

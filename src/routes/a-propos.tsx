import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "À propos — HBS HOME";
const description = "À propos — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AProposPage,
});

function AProposPage() {
  return <PlaceholderPage title="À propos" />;
}

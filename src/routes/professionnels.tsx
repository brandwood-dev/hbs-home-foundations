import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Professionnels — HBS HOME";
const description =
  "Professionnels — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/professionnels")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProfessionnelsPage,
});

function ProfessionnelsPage() {
  return <PlaceholderPage title="Professionnels" />;
}

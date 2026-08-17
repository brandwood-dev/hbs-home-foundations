import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Tringles — HBS HOME";
const description = "Tringles — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/tringles")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TringlesPage,
});

function TringlesPage() {
  return <PlaceholderPage title="Tringles" />;
}

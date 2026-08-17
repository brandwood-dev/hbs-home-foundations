import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Politique de cookies — HBS HOME";
const description = "Politique de cookies — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CookiesPage,
});

function CookiesPage() {
  return <PlaceholderPage title="Politique de cookies" />;
}

import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Stores — HBS HOME";
const description = "Stores — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  return <PlaceholderPage title="Stores" />;
}

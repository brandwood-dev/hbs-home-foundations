import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Coussins — HBS HOME";
const description = "Coussins — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/coussins")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CoussinsPage,
});

function CoussinsPage() {
  return <PlaceholderPage title="Coussins" />;
}

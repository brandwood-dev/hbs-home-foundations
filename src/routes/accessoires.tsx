import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Accessoires — HBS HOME";
const description = "Accessoires — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/accessoires")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AccessoiresPage,
});

function AccessoiresPage() {
  return <PlaceholderPage title="Accessoires" />;
}

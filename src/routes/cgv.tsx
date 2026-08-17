import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Conditions générales de vente — HBS HOME";
const description =
  "Conditions générales de vente — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CgvPage,
});

function CgvPage() {
  return <PlaceholderPage title="Conditions générales de vente" />;
}

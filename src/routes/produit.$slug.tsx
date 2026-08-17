import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";

const title = "Fiche produit — HBS HOME";
const description =
  "Fiche produit HBS HOME : matières, dimensions, finitions et disponibilité de nos rideaux.";

export const Route = createFileRoute("/produit/$slug")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  return <PlaceholderPage title="Fiche produit" />;
}

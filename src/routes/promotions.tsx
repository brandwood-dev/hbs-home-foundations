import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const title = "Promotions — HBS HOME";
const description = "Promotions — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/promotions")({
  validateSearch: validateCatalogSearch,
  search: { middlewares: [stripSearchParams(EMPTY_SEARCH)] },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: PromotionsPage,
});

function PromotionsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };

  return (
    <CatalogView
      config={{
        routeId: "promotions",
        group: "rideaux",
        path: "/promotions",
        title: "Promotions",
        description: "Les prix doux du moment sur nos rideaux, voilages et accessoires déco.",
        seoTitle: title,
        seoDescription: description,
        seoBlock:
          "Profitez de nos offres en cours pour renouveler votre intérieur avec des pièces choisies pour leur qualité et leur style.",
      }}
      search={search}
      onSearchChange={onSearchChange}
      globalFilter="discounted"
    />
  );
}

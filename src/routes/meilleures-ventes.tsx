import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const title = "Les plus aimées — HBS HOME";
const description =
  "Les produits préférés de nos clients — HBS HOME, rideaux, voilages et décoration en Tunisie.";

export const Route = createFileRoute("/meilleures-ventes")({
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
  component: MeilleuresVentesPage,
});

function MeilleuresVentesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };

  return (
    <CatalogView
      config={{
        routeId: "meilleures-ventes",
        group: "rideaux",
        path: "/meilleures-ventes",
        title: "Les plus aimées",
        description:
          "Découvrez les produits préférés de nos clients, toutes catégories confondues.",
        seoTitle: title,
        seoDescription: description,
        seoBlock:
          "Retrouvez les produits les plus appréciés de la communauté HBS HOME : rideaux, voilages, coussins, mobilier et accessoires sélectionnés pour leur qualité et leur style.",
      }}
      search={search}
      onSearchChange={onSearchChange}
      globalFilter="best_sellers"
    />
  );
}

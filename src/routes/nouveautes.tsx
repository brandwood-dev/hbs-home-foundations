import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const title = "Nouveautés — HBS HOME";
const description = "Nouveautés — HBS HOME, rideaux, voilages et décoration textile en Tunisie.";

export const Route = createFileRoute("/nouveautes")({
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
  component: NouveautesPage,
});

function NouveautesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };

  return (
    <CatalogView
      config={{
        routeId: "nouveautes",
        group: "rideaux",
        path: "/nouveautes",
        title: "Nouveautés",
        description: "Découvrez les dernières pièces ajoutées au catalogue HBS HOME.",
        seoTitle: title,
        seoDescription: description,
        seoBlock:
          "Explorez les dernières références publiées pour trouver les nouvelles matières, couleurs et styles de la saison.",
      }}
      search={search}
      onSearchChange={onSearchChange}
      globalFilter="new"
    />
  );
}

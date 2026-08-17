import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getCatalogPage } from "@/fixtures/catalog-pages.fixture";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const config = getCatalogPage("thermiques");
const title = "Rideaux thermiques et isolants | HBS HOME";
const description =
  "Rideaux thermiques doublés pour isoler du froid et de la chaleur. Velours et tissus techniques, livraison partout en Tunisie.";

export const Route = createFileRoute("/rideaux/thermiques")({
  validateSearch: validateCatalogSearch,
  search: { middlewares: [stripSearchParams(EMPTY_SEARCH)] },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogThermiquesPage,
});

function CatalogThermiquesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };
  return <CatalogView config={config} search={search} onSearchChange={onSearchChange} />;
}

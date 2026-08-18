import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getCatalogPage } from "@/fixtures/catalog-pages.fixture";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const config = getCatalogPage("accessoires");
const title = "Accessoires pour rideaux en Tunisie | HBS HOME";
const description =
  "Tringles extensibles, rails plafond, embrasses, anneaux, supports et kits de pose. Livraison partout en Tunisie, paiement à la livraison.";

export const Route = createFileRoute("/accessoires/")({
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
  component: CatalogAccessoiresPage,
});

function CatalogAccessoiresPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };
  return <CatalogView config={config} search={search} onSearchChange={onSearchChange} />;
}

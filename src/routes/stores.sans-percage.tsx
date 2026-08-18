import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getCatalogPage } from "@/fixtures/catalog-pages.fixture";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const config = getCatalogPage("stores-sans-percage");
const title = "Stores sans perçage | HBS HOME";
const description =
  "Stores à fixation par clips, posés sans perceuse sur le battant de la fenêtre. Livraison partout en Tunisie.";

export const Route = createFileRoute("/stores/sans-percage")({
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
  component: CatalogStoresSansPercagePage,
});

function CatalogStoresSansPercagePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };
  return <CatalogView config={config} search={search} onSearchChange={onSearchChange} />;
}

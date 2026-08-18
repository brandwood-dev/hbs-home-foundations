import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getCatalogPage } from "@/fixtures/catalog-pages.fixture";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const config = getCatalogPage("stores-bambou");
const title = "Stores en bambou naturel | HBS HOME";
const description =
  "Stores en lamelles de bambou tressées à la main, filtrant la lumière en fines rayures. Livraison en Tunisie.";

export const Route = createFileRoute("/stores/bambou")({
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
  component: CatalogStoresBambouPage,
});

function CatalogStoresBambouPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };
  return <CatalogView config={config} search={search} onSearchChange={onSearchChange} />;
}

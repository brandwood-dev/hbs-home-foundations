import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { CatalogView } from "@/components/catalog/CatalogView";
import { getCatalogPage } from "@/fixtures/catalog-pages.fixture";
import {
  EMPTY_SEARCH,
  validateCatalogSearch,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

const config = getCatalogPage("voilages-grande-largeur");
const title = "Voilages grande largeur pour baie vitrée | HBS HOME";
const description =
  "Voilages jusqu'à 400 cm de large, sans couture visible, pour habiller une baie vitrée d'un seul tenant.";

export const Route = createFileRoute("/voilages/grande-largeur")({
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
  component: CatalogVoilagesGrandeLargeurPage,
});

function CatalogVoilagesGrandeLargeurPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const onSearchChange = (next: CatalogSearch) => {
    void navigate({ to: ".", search: next, resetScroll: false });
  };
  return <CatalogView config={config} search={search} onSearchChange={onSearchChange} />;
}

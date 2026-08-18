import { createFileRoute } from "@tanstack/react-router";
import { SearchPageView } from "@/components/search/SearchPageView";
import { searchPageSchema } from "@/services/search/search.search-params";

const title = "Recherche — HBS HOME";
const description =
  "Recherchez un rideau, un voilage, un store ou un accessoire dans tout le catalogue HBS HOME.";

export const Route = createFileRoute("/recherche")({
  validateSearch: searchPageSchema,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      // Les pages de résultats ne doivent pas être indexées.
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPageView,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl">La recherche est momentanément indisponible</h1>
      <p className="mt-2 text-sm text-foreground-muted">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">Aucun résultat.</div>
  ),
});

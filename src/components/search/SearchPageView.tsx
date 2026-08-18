import { useEffect, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { AppLink } from "@/components/ui/app-link";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResultsToolbar } from "@/components/search/SearchResultsToolbar";
import { SEARCH_MIN_QUERY_LENGTH } from "@/domain/search/search.constants";
import type { ProductCategory } from "@/domain/product/product.types";
import type { SearchSort } from "@/domain/search/search.types";
import { useSearchHistory } from "@/hooks/search/useSearchHistory";
import { useSearchResults } from "@/hooks/search/useSearchResults";
import { trackEvent } from "@/lib/analytics/analytics";
import { isSearchableQuery } from "@/services/search/normalize-search-query";
import { toGlobalSearchParams } from "@/services/search/search.search-params";

const routeApi = getRouteApi("/recherche");

export function SearchPageView() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const params = toGlobalSearchParams(search);
  const [draft, setDraft] = useState(search.q);
  const { addSearch } = useSearchHistory();

  useEffect(() => setDraft(search.q), [search.q]);

  const { results, isPending, isFetching, isValidQuery } = useSearchResults(params);

  useEffect(() => {
    if (!results) return;
    trackEvent(results.totalProducts === 0 ? "search_no_result" : "search", {
      search_term: results.query,
      results: results.totalProducts,
      source: "page",
    });
    if (results.totalProducts > 0) addSearch(results.query);
    // Un seul évènement par jeu de résultats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results?.query, results?.totalProducts]);

  const updateSearch = (patch: Partial<typeof search>) => {
    void navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }) });
  };

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!isSearchableQuery(trimmed, SEARCH_MIN_QUERY_LENGTH)) return;
    updateSearch({ q: trimmed, page: 1 });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Fil d'ariane" className="mb-4 text-sm text-foreground-muted">
        <AppLink href="/" className="hover:text-accent-dark">
          Accueil
        </AppLink>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Recherche</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl">
        {search.q ? <>Résultats pour « {search.q} »</> : "Rechercher"}
      </h1>

      <div className="mt-6 max-w-2xl">
        <SearchInput
          value={draft}
          onChange={setDraft}
          onSubmit={() => submit(draft)}
          isLoading={isFetching}
        />
      </div>

      {!isValidQuery ? (
        <p className="mt-10 text-sm text-foreground-muted">
          Saisissez au moins {SEARCH_MIN_QUERY_LENGTH} caractères pour lancer une recherche.
        </p>
      ) : isPending ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : !results || results.totalProducts === 0 ? (
        <SearchEmptyState query={search.q} onSuggestionClick={(value) => submit(value)} />
      ) : (
        <div className="mt-8">
          <SearchResultsToolbar
            total={results.totalProducts}
            categoryCounts={results.categoryCounts}
            activeCategory={params.category}
            sort={params.sort}
            onCategoryChange={(category: ProductCategory | undefined) =>
              updateSearch({ category: category ?? "", page: 1 })
            }
            onSortChange={(sort: SearchSort) => updateSearch({ sort, page: 1 })}
          />

          <div className="mt-8">
            <ProductGrid products={results.products.map((hit) => hit.product)} />
          </div>

          <CatalogPagination
            page={results.page}
            totalPages={results.totalPages}
            onPageChange={(page) => {
              updateSearch({ page });
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {results && (results.categories.length > 0 || results.articles.length > 0) ? (
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="text-xl">Voir aussi</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {results.categories.map((category) => (
              <AppLink
                key={category.id}
                href={category.href}
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent-dark"
              >
                {category.label}
              </AppLink>
            ))}
            {results.articles.map((article) => (
              <AppLink
                key={article.id}
                href="/inspirations"
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent-dark"
              >
                {article.title}
              </AppLink>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

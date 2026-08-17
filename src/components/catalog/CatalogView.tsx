import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ActiveFilterChips } from "@/components/catalog/ActiveFilterChips";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CatalogEmptyState } from "@/components/catalog/CatalogEmptyState";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { DEFAULT_PAGE_SIZE } from "@/domain/product/product.constants";
import type { CatalogSort } from "@/domain/product/product.types";
import { catalogSubcategories, type CatalogPageConfig } from "@/fixtures/catalog-pages.fixture";
import { catalogFacetsQuery, catalogListQuery } from "@/services/catalog/catalog.queries";
import {
  EMPTY_SEARCH,
  countActiveFilters,
  toListParams,
  type CatalogSearch,
} from "@/services/catalog/catalog.search-params";

interface CatalogViewProps {
  config: CatalogPageConfig;
  search: CatalogSearch;
  onSearchChange: (next: CatalogSearch) => void;
}

export function CatalogView({ config, search, onSearchChange }: CatalogViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = toListParams(search, config.scope, DEFAULT_PAGE_SIZE);
  const listQuery = useQuery({ ...catalogListQuery(params), placeholderData: keepPreviousData });
  const facetsQuery = useQuery(catalogFacetsQuery(config.routeId, config.scope));

  const products = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = listQuery.data?.totalPages ?? 1;
  const activeFilterCount = countActiveFilters(search);

  const update = (patch: Partial<CatalogSearch>) =>
    onSearchChange({ ...search, page: 1, ...patch });

  const toggleValue = (key: keyof CatalogSearch, value: string | number) => {
    const current = search[key] as (string | number)[];
    const exists = current.some((entry) => String(entry) === String(value));
    const next = exists
      ? current.filter((entry) => String(entry) !== String(value))
      : [...current, value];
    update({ [key]: next } as Partial<CatalogSearch>);
  };

  const changePrice = (min?: number, max?: number) =>
    update({
      ...(min != null ? { minPrice: min } : { minPrice: undefined }),
      ...(max != null ? { maxPrice: max } : { maxPrice: undefined }),
    } as Partial<CatalogSearch>);

  const resetFilters = () => onSearchChange({ ...EMPTY_SEARCH, sort: search.sort });

  const filtersNode = facetsQuery.data ? (
    <CatalogFilters
      facets={facetsQuery.data}
      search={search}
      {...(config.lockedFilterLabel ? { lockedFilterLabel: config.lockedFilterLabel } : {})}
      onToggle={toggleValue}
      onPriceChange={changePrice}
    />
  ) : null;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <CatalogBreadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            ...(config.routeId === "rideaux"
              ? [{ label: "Rideaux" }]
              : [{ label: "Rideaux", href: "/rideaux" }, { label: config.title }]),
          ]}
        />

        <header className="mt-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">{config.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
            {config.description}
          </p>
        </header>

        <nav aria-label="Sous-catégories" className="mt-6 -mx-4 overflow-x-auto px-4">
          <ul className="flex w-max gap-2 pb-1">
            {catalogSubcategories.map((item) => (
              <li key={item.routeId}>
                <AppLink
                  href={item.path}
                  className={`inline-flex min-h-9 items-center whitespace-nowrap rounded-full border px-3 text-xs transition-colors ${
                    item.routeId === config.routeId
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border text-foreground-muted hover:border-accent hover:text-accent-dark"
                  }`}
                >
                  {item.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <h2 className="eyebrow mb-2">Filtres</h2>
            {filtersNode}
          </aside>

          <div>
            <CatalogToolbar
              total={total}
              sort={search.sort}
              activeFilterCount={activeFilterCount}
              onSortChange={(sort: CatalogSort) => update({ sort })}
              onOpenFilters={() => setFiltersOpen(true)}
            />

            {activeFilterCount > 0 && facetsQuery.data && (
              <div className="mt-4">
                <ActiveFilterChips
                  facets={facetsQuery.data}
                  search={search}
                  onToggle={toggleValue}
                  onPriceChange={changePrice}
                  onReset={resetFilters}
                />
              </div>
            )}

            <div className="mt-6">
              {listQuery.isPending ? (
                <ProductGrid products={[]} loading skeletonCount={DEFAULT_PAGE_SIZE} />
              ) : products.length === 0 ? (
                <CatalogEmptyState onReset={resetFilters} />
              ) : (
                <ProductGrid products={products} />
              )}
            </div>

            <CatalogPagination
              page={search.page}
              totalPages={totalPages}
              onPageChange={(page) => onSearchChange({ ...search, page })}
            />
          </div>
        </div>

        <section className="mt-16 border-t border-border pt-8">
          <h2 className="text-2xl sm:text-3xl">{config.title} — nos conseils</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground-muted">
            {config.seoBlock}
          </p>
        </section>
      </div>

      <CatalogMobileFilters
        open={filtersOpen}
        total={total}
        onClose={() => setFiltersOpen(false)}
        onReset={resetFilters}
      >
        {filtersNode}
      </CatalogMobileFilters>
    </SiteLayout>
  );
}

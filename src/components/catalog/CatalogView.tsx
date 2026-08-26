import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ActiveFilterChips } from "@/components/catalog/ActiveFilterChips";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CatalogErrorState } from "@/components/catalog/CatalogErrorState";
import { CatalogEmptyState } from "@/components/catalog/CatalogEmptyState";
import { CatalogUnavailableState } from "@/components/catalog/CatalogUnavailableState";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogMobileFilters } from "@/components/catalog/CatalogMobileFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { DEFAULT_PAGE_SIZE } from "@/domain/product/product.constants";
import type { CatalogSort } from "@/domain/product/product.types";
import { dataProvider } from "@/config/features.config";
import {
  catalogGroups,
  getCatalogSubcategories,
  type CatalogGroup,
  type CatalogPageConfig,
} from "@/fixtures/catalog-pages.fixture";
import { catalogFacetsQuery, catalogListQuery } from "@/services/catalog/catalog.queries";
import {
  catalogCategoryQuery,
  catalogNavigationQuery,
} from "@/services/catalog/catalog-category.queries";
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
  groupOverride?: CatalogGroup;
}

export function CatalogView({ config, search, onSearchChange, groupOverride }: CatalogViewProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const apiCatalog = dataProvider === "api";

  const group =
    groupOverride ??
    catalogGroups.find((item) => item.id === config.group) ??
    ({ id: config.group, label: config.title, path: config.path } as CatalogGroup);
  const categoryQuery = useQuery(catalogCategoryQuery(config.routeId));
  const navigationQuery = useQuery(catalogNavigationQuery());
  const dynamicCategory = categoryQuery.data ?? undefined;
  const dynamicGroup = navigationQuery.data?.find((item) => item.slug === config.group);
  const subcategories = dynamicGroup
    ? dynamicGroup.children.map((item) => ({
        routeId: item.slug,
        label: item.name,
        path: item.path,
      }))
    : navigationQuery.data === undefined && catalogGroups.some((item) => item.id === config.group)
      ? getCatalogSubcategories(config.group)
      : [];
  const dynamicScope = useMemo(() => {
    if (!dynamicCategory) return config.scope;
    const slugs: string[] = [];
    const pending = [dynamicCategory];
    while (pending.length > 0) {
      const category = pending.shift();
      if (!category) continue;
      slugs.push(category.slug);
      pending.push(...category.children);
    }
    // A published API category is authoritative, even when its slug also has
    // a legacy file-based route (for example `/rideaux/lin`). This prevents
    // fixture filters from narrowing or changing the Admin-managed category.
    return { categorySlugs: slugs };
  }, [config.scope, dynamicCategory]);
  const params = toListParams(search, dynamicScope, DEFAULT_PAGE_SIZE);
  // Once the API is configured, an unpublished/missing category must not
  // silently fall back to the legacy fixture scope. Wait for the category
  // query first, then fetch products and facets using only the API taxonomy.
  const categoryReady = !apiCatalog || (categoryQuery.isSuccess && dynamicCategory !== undefined);
  const listQuery = useQuery({
    ...catalogListQuery(params),
    enabled: categoryReady,
    placeholderData: keepPreviousData,
  });
  const facetsQuery = useQuery({
    ...catalogFacetsQuery(config.routeId, dynamicScope),
    enabled: categoryReady,
  });

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

  if (apiCatalog && categoryQuery.isPending) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10" aria-busy="true">
          <ProductGrid products={[]} loading skeletonCount={DEFAULT_PAGE_SIZE} />
        </div>
      </SiteLayout>
    );
  }

  if (apiCatalog && categoryQuery.isError) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <CatalogErrorState onRetry={() => void categoryQuery.refetch()} />
        </div>
      </SiteLayout>
    );
  }

  if (apiCatalog && categoryQuery.isSuccess && dynamicCategory === undefined) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
          <CatalogUnavailableState categoryName={config.title} />
        </div>
      </SiteLayout>
    );
  }

  const filtersNode = facetsQuery.data ? (
    <CatalogFilters
      facets={facetsQuery.data}
      search={search}
      {...(!dynamicCategory && config.lockedFilterLabel
        ? { lockedFilterLabel: config.lockedFilterLabel }
        : {})}
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
            ...(config.routeId === config.group
              ? [{ label: dynamicCategory?.name ?? group.label }]
              : [
                  {
                    label: dynamicGroup?.name ?? group.label,
                    href: dynamicGroup?.path ?? group.path,
                  },
                  { label: dynamicCategory?.name ?? config.title },
                ]),
          ]}
        />

        <header className="mt-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">
            {dynamicCategory?.name ?? config.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-base">
            {dynamicCategory?.description ?? config.description}
          </p>
        </header>

        <nav aria-label="Sous-catégories" className="mt-6 -mx-4 overflow-x-auto px-4">
          <ul className="flex w-max gap-2 pb-1">
            {subcategories.map((item) => (
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
              filtersOpen={filtersOpen}
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
              {listQuery.isError ? (
                <CatalogErrorState onRetry={() => void listQuery.refetch()} />
              ) : listQuery.isPending ? (
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
          <h2 className="text-2xl sm:text-3xl">
            {dynamicCategory?.name ?? config.title} — nos conseils
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-foreground-muted">
            {dynamicCategory?.description ?? config.seoBlock}
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

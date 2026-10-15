import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { FavoritesEmptyState } from "@/components/favorites/FavoritesEmptyState";
import { FavoritesToolbar } from "@/components/favorites/FavoritesToolbar";
import { ClearFavoritesDialog } from "@/components/favorites/ClearFavoritesDialog";
import { CATEGORY_LABELS } from "@/domain/product/product.constants";
import type { ProductCategory } from "@/domain/product/product.types";
import type { ResolvedFavoriteItem } from "@/domain/favorites/favorites.types";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useFavoritesActions } from "@/hooks/favorites/useFavoritesActions";
import { trackEvent } from "@/lib/analytics/analytics";
import {
  countFavoritesByCategory,
  fallbackFavoriteCategoryLabel,
  filterFavoritesByCategory,
  favoriteCategoryKey,
  sortFavorites,
  type FavoritesSort,
} from "@/services/favorites/favorites-sort";
import { catalogNavigationQuery } from "@/services/catalog/catalog-category.queries";
import type { PublicCategory } from "@/repositories/interfaces/CategoryRepository";

function normalizeCategoryToken(value: string): string {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLocaleLowerCase("fr");
}

function createCategoryLabelIndex(categories: readonly PublicCategory[]): Map<string, string> {
  const index = new Map<string, string>();
  const visit = (category: PublicCategory) => {
    const label = category.name.trim();
    if (label) {
      index.set(normalizeCategoryToken(category.slug), label);
      if (category.parentSlug === null) {
        index.set(normalizeCategoryToken(category.path.split("/").filter(Boolean)[0] ?? ""), label);
      }
    }
    category.children.forEach(visit);
  };
  categories.forEach(visit);
  return index;
}

function buildFavoriteCategoryLabels(
  items: readonly ResolvedFavoriteItem[],
  categories: readonly PublicCategory[] | undefined,
): Record<string, string> {
  const dynamicIndex = createCategoryLabelIndex(categories ?? []);
  const labels: Record<string, string> = {};

  for (const item of items) {
    const key = favoriteCategoryKey(item.product);
    const canonicalRoot = item.product.canonicalPath
      ?.split("/")
      .map((segment) => segment.trim())
      .find((segment) => segment.length > 0 && segment !== "produit");
    const dynamicLabel = [canonicalRoot, key]
      .map((candidate) =>
        candidate ? dynamicIndex.get(normalizeCategoryToken(candidate)) : undefined,
      )
      .find((label): label is string => Boolean(label));

    labels[key] =
      dynamicLabel ?? CATEGORY_LABELS[key as ProductCategory] ?? fallbackFavoriteCategoryLabel(key);
  }

  return labels;
}

export function FavoritesPageView() {
  const { favorites, hydrated, isPending, isError } = useFavorites();
  const { clearFavorites, isClearing } = useFavoritesActions();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState<FavoritesSort>("recent");
  const [clearOpen, setClearOpen] = useState(false);
  const categoriesQuery = useQuery({
    ...catalogNavigationQuery(),
    enabled: hydrated,
  });

  const showSkeleton = !hydrated || isPending;

  const counts = useMemo(() => countFavoritesByCategory(favorites.items), [favorites.items]);
  const categoryLabels = useMemo(
    () => buildFavoriteCategoryLabels(favorites.items, categoriesQuery.data),
    [favorites.items, categoriesQuery.data],
  );
  const visible = useMemo(
    () => sortFavorites(filterFavoritesByCategory(favorites.items, category), sort),
    [favorites.items, category, sort],
  );

  // La catégorie filtrée peut disparaître après un retrait.
  useEffect(() => {
    if (category && !counts[category]) setCategory(undefined);
  }, [counts, category]);

  useEffect(() => {
    if (!hydrated) return;
    trackEvent("view_wishlist", { items: favorites.count });
    // Un seul évènement à l'arrivée sur la page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'ariane" className="mb-4 text-sm text-foreground-muted">
          <AppLink href="/" className="hover:text-accent-dark">
            Accueil
          </AppLink>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Mes favoris</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl">Mes favoris</h1>
            <p className="mt-2 text-sm text-foreground-muted">
              Retrouvez les produits que vous avez enregistrés pour les consulter plus tard.
            </p>
            <p aria-live="polite" className="mt-1 text-sm text-foreground-muted">
              {showSkeleton
                ? "Chargement de vos favoris…"
                : `${favorites.count} article${favorites.count > 1 ? "s" : ""} enregistré${
                    favorites.count > 1 ? "s" : ""
                  } sur cet appareil.`}
            </p>
          </div>
          {!showSkeleton && favorites.count > 0 ? (
            <button
              type="button"
              onClick={() => setClearOpen(true)}
              disabled={isClearing}
              className="h-11 rounded-md border border-border px-4 text-sm hover:border-error hover:text-error"
            >
              Vider les favoris
            </button>
          ) : null}
        </div>

        {showSkeleton ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="mt-10 rounded-md border border-border p-6 text-sm">
            Vos favoris n'ont pas pu être chargés sur cet appareil. Réessayez plus tard.
          </div>
        ) : favorites.count === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <div className="mt-10">
            <FavoritesToolbar
              counts={counts}
              total={favorites.count}
              activeCategory={category}
              categoryLabels={categoryLabels}
              sort={sort}
              onCategoryChange={setCategory}
              onSortChange={setSort}
            />
            <div className="mt-8">
              <ProductGrid products={visible.map((item) => item.product)} />
            </div>
          </div>
        )}
      </div>

      <ClearFavoritesDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        busy={isClearing}
        onConfirm={() => {
          clearFavorites();
          setClearOpen(false);
        }}
      />
    </SiteLayout>
  );
}

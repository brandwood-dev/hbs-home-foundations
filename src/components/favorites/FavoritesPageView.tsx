import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { FavoritesEmptyState } from "@/components/favorites/FavoritesEmptyState";
import { FavoritesToolbar } from "@/components/favorites/FavoritesToolbar";
import { ClearFavoritesDialog } from "@/components/favorites/ClearFavoritesDialog";
import type { ProductCategory } from "@/domain/product/product.types";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useFavoritesActions } from "@/hooks/favorites/useFavoritesActions";
import { trackEvent } from "@/lib/analytics/analytics";
import {
  countFavoritesByCategory,
  filterFavoritesByCategory,
  sortFavorites,
  type FavoritesSort,
} from "@/services/favorites/favorites-sort";

export function FavoritesPageView() {
  const { favorites, hydrated, isPending, isError } = useFavorites();
  const { clearFavorites, isClearing } = useFavoritesActions();
  const [category, setCategory] = useState<ProductCategory | undefined>(undefined);
  const [sort, setSort] = useState<FavoritesSort>("recent");
  const [clearOpen, setClearOpen] = useState(false);

  const showSkeleton = !hydrated || isPending;

  const counts = useMemo(() => countFavoritesByCategory(favorites.items), [favorites.items]);
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

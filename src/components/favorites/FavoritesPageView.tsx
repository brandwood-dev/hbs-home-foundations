import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { FavoritesEmptyState } from "@/components/favorites/FavoritesEmptyState";
import { useFavorites } from "@/hooks/favorites/useFavorites";
import { useFavoritesActions } from "@/hooks/favorites/useFavoritesActions";

export function FavoritesPageView() {
  const { favorites, hydrated, isPending } = useFavorites();
  const { clearFavorites, isClearing } = useFavoritesActions();

  const showSkeleton = !hydrated || isPending;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav aria-label="Fil d'ariane" className="mb-4 text-sm text-foreground-muted">
          <AppLink href="/" className="hover:text-accent-dark">
            Accueil
          </AppLink>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Favoris</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl">Mes favoris</h1>
            <p className="mt-2 text-sm text-foreground-muted">
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
              onClick={clearFavorites}
              disabled={isClearing}
              className="h-11 rounded-md border border-border px-4 text-sm hover:border-error hover:text-error"
            >
              Vider mes favoris
            </button>
          ) : null}
        </div>

        {showSkeleton ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : favorites.count === 0 ? (
          <FavoritesEmptyState />
        ) : (
          <div className="mt-10">
            <ProductGrid products={favorites.items.map((item) => item.product)} />
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

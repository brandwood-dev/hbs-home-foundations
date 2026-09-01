import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Package, Search, ShoppingBag } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { DesktopMegaMenu } from "@/components/layout/DesktopMegaMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mainNavigation } from "@/fixtures/navigation.fixture";
import { storeConfig } from "@/config/store.config";
import { useCartCount } from "@/components/cart/CartCountBadge";
import { openCartDrawer } from "@/hooks/cart/useCartDrawer";
import { openSearchPanel } from "@/hooks/search/useSearchPanel";
import { useFavoritesCount } from "@/hooks/favorites/useFavorites";
import { catalogNavigationQuery } from "@/services/catalog/catalog-category.queries";
import { mergeCatalogNavigation } from "@/services/catalog/catalog-navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SiteHeader() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count: cartCount, label: cartLabel } = useCartCount();
  const favoritesCount = useFavoritesCount();
  const navigationQuery = useQuery({
    ...catalogNavigationQuery(),
    // The query cache is not serialized by the current shell. Fetch the live
    // navigation after hydration so SSR and the first browser render match.
    enabled: typeof window !== "undefined",
  });
  const navigation = useMemo(
    () => mergeCatalogNavigation(mainNavigation, navigationQuery.data),
    [navigationQuery.data],
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      {/* Mobile */}
      <div className="flex items-center justify-between px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation-dialog"
          className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link to="/" aria-label={`${storeConfig.brandName} — Accueil`}>
          <BrandLogo className="h-11 w-[4.6rem]" />
        </Link>
        <div className="flex items-center">
          <button
            type="button"
            onClick={openSearchPanel}
            aria-label="Rechercher"
            aria-haspopup="dialog"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <AppLink
            href="/favoris"
            aria-label={favoritesCount > 0 ? `Favoris, ${favoritesCount} article(s)` : "Favoris"}
            className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
            {favoritesCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] leading-4 text-accent-foreground"
              >
                {favoritesCount > 99 ? "99+" : favoritesCount}
              </span>
            ) : null}
          </AppLink>
          <button
            type="button"
            onClick={openCartDrawer}
            aria-label={cartLabel}
            aria-haspopup="dialog"
            className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 min-w-4 rounded-full bg-accent px-1 text-center text-[10px] leading-4 text-accent-foreground"
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block" onMouseLeave={() => setOpenMenuId(null)}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <Link to="/" aria-label={`${storeConfig.brandName} — Accueil`}>
            <BrandLogo className="h-12 w-[5.1rem]" />
          </Link>

          <div className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={openSearchPanel}
              aria-haspopup="dialog"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground-muted hover:text-accent-dark"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Recherche
            </button>
            <AppLink
              href="/favoris"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground-muted hover:text-accent-dark"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favoris
              {favoritesCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="rounded-full bg-accent px-1.5 text-[11px] leading-5 text-accent-foreground"
                >
                  {favoritesCount > 99 ? "99+" : favoritesCount}
                </span>
              ) : null}
            </AppLink>
            <AppLink
              href="/suivi-commande"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground-muted hover:text-accent-dark"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Suivi de commande
            </AppLink>
            <button
              type="button"
              onClick={openCartDrawer}
              aria-label={cartLabel}
              aria-haspopup="dialog"
              className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 hover:bg-sand"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Panier
              {cartCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="rounded-full bg-accent px-1.5 text-[11px] leading-5 text-accent-foreground"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="relative border-t border-border">
          <ul className="mx-auto flex max-w-7xl items-center gap-1 px-6">
            {navigation.map((item) => (
              <li key={item.id} onMouseEnter={() => setOpenMenuId(item.megaMenu ? item.id : null)}>
                <AppLink
                  href={item.href}
                  onFocus={() => setOpenMenuId(item.megaMenu ? item.id : null)}
                  aria-haspopup={item.megaMenu ? "true" : undefined}
                  aria-expanded={item.megaMenu ? openMenuId === item.id : undefined}
                  activeProps={{ className: "text-accent-dark" }}
                  className={`inline-flex items-center px-3 py-3 text-sm tracking-wide transition-colors hover:text-accent-dark ${
                    item.highlight ? "text-accent-dark" : "text-foreground"
                  }`}
                >
                  {item.label}
                </AppLink>
              </li>
            ))}
          </ul>

          {navigation.map((item) =>
            item.megaMenu && openMenuId === item.id ? (
              <DesktopMegaMenu
                key={item.id}
                columns={item.megaMenu}
                shortcuts={item.menuShortcuts}
                onNavigate={() => setOpenMenuId(null)}
              />
            ) : null,
          )}
        </nav>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} navigation={navigation} />
    </header>
  );
}

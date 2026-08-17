import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Menu, Package, Search, ShoppingBag } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { DesktopMegaMenu } from "@/components/layout/DesktopMegaMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { mainNavigation } from "@/fixtures/navigation.fixture";
import { storeConfig } from "@/config/store.config";

export function SiteHeader() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      {/* Mobile */}
      <div className="flex items-center justify-between px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
          className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Link to="/" className="font-display text-xl tracking-[0.18em]">
          {storeConfig.brandName}
        </Link>
        <div className="flex items-center">
          <AppLink
            href="/recherche"
            aria-label="Rechercher"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </AppLink>
          <AppLink
            href="/panier"
            aria-label={`Panier, ${cartCount} article(s)`}
            className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span className="absolute right-1 top-1 min-w-4 rounded-full bg-accent px-1 text-[10px] leading-4 text-accent-foreground">
              {cartCount}
            </span>
          </AppLink>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block" onMouseLeave={() => setOpenMenuId(null)}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <Link to="/" className="font-display text-2xl tracking-[0.22em]">
            {storeConfig.brandName}
          </Link>

          <div className="flex items-center gap-1 text-sm">
            <AppLink
              href="/recherche"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground-muted hover:text-accent-dark"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Recherche
            </AppLink>
            <AppLink
              href="/favoris"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground-muted hover:text-accent-dark"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Favoris
            </AppLink>
            <AppLink
              href="/suivi-commande"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-foreground-muted hover:text-accent-dark"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Suivi de commande
            </AppLink>
            <AppLink
              href="/panier"
              aria-label={`Panier, ${cartCount} article(s)`}
              className="flex items-center gap-2 rounded-md bg-surface-muted px-3 py-2 hover:bg-sand"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Panier
              <span className="rounded-full bg-accent px-1.5 text-[11px] leading-5 text-accent-foreground">
                {cartCount}
              </span>
            </AppLink>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="relative border-t border-border">
          <ul className="mx-auto flex max-w-7xl items-center gap-1 px-6">
            {mainNavigation.map((item) => (
              <li key={item.id} onMouseEnter={() => setOpenMenuId(item.megaMenu ? item.id : null)}>
                <AppLink
                  href={item.href}
                  onFocus={() => setOpenMenuId(item.megaMenu ? item.id : null)}
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

          {mainNavigation.map((item) =>
            item.megaMenu && openMenuId === item.id ? (
              <DesktopMegaMenu
                key={item.id}
                columns={item.megaMenu}
                onNavigate={() => setOpenMenuId(null)}
              />
            ) : null,
          )}
        </nav>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

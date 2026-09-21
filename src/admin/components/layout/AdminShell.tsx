import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  ExternalLink,
  ChevronDown,
  LogOut,
  LoaderCircle,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldAlert,
} from "lucide-react";
import { useAdminAuth } from "@/admin/auth/AdminAuthProvider";
import { useAdminAuthorization } from "@/admin/auth/AdminAuthorizationContext";
import { ADMIN_NAV } from "@/admin/config/admin-nav";
import { adminConfig } from "@/admin/config/admin.config";
import { useAdminProductSearch } from "@/admin/hooks/admin.queries";
import type { AdminProduct } from "@/admin/types/admin.types";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/BrandLogo";

function isActive(pathname: string, href: string, exact = false): boolean {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { hasPermission } = useAdminAuthorization();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const visibleGroups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => item.available && hasPermission(item.requiredPermission))
      .map((item) => ({
        ...item,
        children: item.children?.filter(
          (child) => child.available && hasPermission(child.requiredPermission),
        ),
      })),
  })).filter((group) => group.items.length > 0);

  return (
    <nav
      aria-label="Navigation du back-office"
      className={cn(
        "flex h-full flex-col gap-2 overflow-hidden p-2.5",
        collapsed ? "items-center" : "",
      )}
    >
      <AppLink
        href="/admin"
        onClick={onNavigate}
        className={cn(
          "mb-4 flex min-h-9 items-center gap-2 px-2 py-1 text-sm font-semibold tracking-widest text-foreground uppercase",
          collapsed ? "justify-center" : "",
        )}
        title={collapsed ? "HBS HOME Admin" : undefined}
      >
        <BrandLogo
          alt="HBS HOME Admin"
          className={cn(collapsed ? "h-8 w-14" : "h-9 w-16", "max-w-full")}
        />
        {!collapsed ? (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium tracking-normal text-primary">
            Admin
          </span>
        ) : null}
      </AppLink>

      <div
        className={cn(
          "min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1",
          collapsed ? "w-full" : "",
        )}
      >
        {visibleGroups.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5 lg:space-y-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                const children = item.children ?? [];
                const hasChildren = children.length > 0;
                const active = isActive(pathname, item.href, hasChildren);
                const childActive = children.some((child) => isActive(pathname, child.href, true));
                const expanded = expandedItems[item.href] ?? childActive;
                return (
                  <li key={item.href}>
                    <div className="flex items-center gap-1">
                      <AppLink
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-[13px] transition-colors",
                          collapsed ? "justify-center px-0" : "",
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : childActive
                              ? "bg-primary/5 font-medium text-primary"
                              : "text-foreground/80 hover:bg-muted",
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      </AppLink>
                      {hasChildren && !collapsed ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          aria-label={`${expanded ? "Réduire" : "Développer"} ${item.label}`}
                          aria-expanded={expanded}
                          onClick={() =>
                            setExpandedItems((current) => ({
                              ...current,
                              [item.href]: !expanded,
                            }))
                          }
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform",
                              expanded ? "rotate-180" : "",
                            )}
                            aria-hidden="true"
                          />
                        </Button>
                      ) : null}
                    </div>
                    {hasChildren && !collapsed && expanded ? (
                      <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                        {children.map((child) => {
                          const ChildIcon = child.icon;
                          const childIsActive = isActive(pathname, child.href, true);
                          return (
                            <li key={child.href}>
                              <AppLink
                                href={child.href}
                                onClick={onNavigate}
                                aria-current={childIsActive ? "page" : undefined}
                                className={cn(
                                  "flex min-h-8 items-center gap-2 rounded-md px-2 text-xs transition-colors",
                                  childIsActive
                                    ? "bg-primary/10 font-medium text-primary"
                                    : "text-foreground/75 hover:bg-muted",
                                )}
                              >
                                <ChildIcon className="size-3.5 shrink-0" aria-hidden="true" />
                                <span className="truncate">{child.label}</span>
                              </AppLink>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <AppLink
        href="/"
        className={cn(
          "flex min-h-9 shrink-0 items-center gap-2 rounded-md border-t border-border px-2 pt-2 text-[13px] text-muted-foreground hover:bg-muted",
          collapsed ? "justify-center px-0" : "",
        )}
        title={collapsed ? "Voir le site public" : undefined}
      >
        <ExternalLink className="size-4" aria-hidden="true" />
        {!collapsed ? "Voir le site public" : null}
      </AppLink>
    </nav>
  );
}

export function AdminMobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetTitle className="sr-only">Navigation du back-office</SheetTitle>
        <AdminSidebar onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function AdminTopbar({
  onOpenMenu,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  onOpenMenu: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const auth = useAdminAuth();
  const { session } = useAdminAuthorization();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const normalizedSearchQuery = searchQuery.trim();
  const productSearch = useAdminProductSearch(debouncedSearchQuery);
  const searchResults = productSearch.data?.items ?? [];
  const isSearchable = normalizedSearchQuery.length >= 2;
  const isSearchWaiting = isSearchable && debouncedSearchQuery !== normalizedSearchQuery;

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearchQuery(normalizedSearchQuery), 250);
    return () => window.clearTimeout(timeout);
  }, [normalizedSearchQuery]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        window.requestAnimationFrame(() => searchInputRef.current?.focus());
      }
      if (event.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [searchOpen]);

  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) setSearchOpen(false);
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, []);

  function submitProductSearch() {
    if (!isSearchable) return;
    setSearchOpen(false);
    void navigate({ to: "/admin/produits", search: { q: normalizedSearchQuery } });
  }

  function openProduct(product: AdminProduct) {
    setSearchOpen(false);
    setSearchQuery("");
    void navigate({ to: "/admin/produits/$productId", params: { productId: product.id } });
  }

  const label = session.user.displayName ?? session.user.email;
  const initials = label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Ouvrir la navigation"
      >
        <MenuIcon className="size-5" aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={onToggleSidebar}
        aria-label={sidebarCollapsed ? "Étendre la navigation" : "Réduire la navigation"}
        title={sidebarCollapsed ? "Étendre la navigation" : "Réduire la navigation"}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="size-5" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="size-5" aria-hidden="true" />
        )}
      </Button>

      <AppLink href="/admin" className="shrink-0 text-sm font-medium">
        Back-office
      </AppLink>

      <div ref={searchContainerRef} className="relative ml-1 hidden w-full max-w-sm md:block">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submitProductSearch();
          }}
        >
          <Search
            className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="admin-global-search" className="sr-only">
            Rechercher dans le catalogue
          </label>
          <Input
            ref={searchInputRef}
            id="admin-global-search"
            type="search"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Rechercher dans le catalogue"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="admin-global-search-results"
            aria-expanded={searchOpen && isSearchable}
            className="h-9 bg-muted/40 pr-14 pl-9 text-xs"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
            ⌘K
          </kbd>
        </form>

        {searchOpen && isSearchable ? (
          <div
            id="admin-global-search-results"
            role="listbox"
            aria-label="Résultats de recherche produits"
            className="absolute top-[calc(100%+0.4rem)] left-0 right-0 z-50 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
          >
            {isSearchWaiting || productSearch.isFetching ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                Recherche en cours…
              </div>
            ) : productSearch.isError ? (
              <p className="px-3 py-3 text-xs text-destructive">
                Recherche indisponible. Ouvrez le catalogue pour réessayer.
              </p>
            ) : searchResults.length > 0 ? (
              <>
                <div className="border-b border-border px-3 py-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  Produits
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected="false"
                    onClick={() => openProduct(product)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-muted"
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt=""
                        aria-hidden="true"
                        className="size-8 shrink-0 rounded border border-border object-cover"
                      />
                    ) : (
                      <span className="size-8 shrink-0 rounded border border-dashed border-border" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{product.name}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {product.reference}
                        {product.variants[0]?.sku ? ` · ${product.variants[0].sku}` : ""}
                      </span>
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={submitProductSearch}
                  className="flex w-full items-center justify-between border-t border-border px-3 py-2 text-xs font-medium text-primary hover:bg-muted"
                >
                  Voir tous les produits
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="px-3 py-3 text-xs text-muted-foreground">
                Aucun produit trouvé pour « {normalizedSearchQuery} ».
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="ml-auto flex items-center gap-3">
        {adminConfig.demoMode ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 sm:inline-flex">
            <ShieldAlert className="size-3.5" aria-hidden="true" /> Mode démo
          </span>
        ) : null}
        <div className="flex items-center gap-2 text-sm">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
          >
            {initials || "HB"}
          </span>
          <span className="hidden max-w-48 truncate text-muted-foreground sm:inline">{label}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Se déconnecter"
            onClick={() => void auth.signOut()}
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem("hbs-admin-sidebar-collapsed") === "true");
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("hbs-admin-sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <div
      className="admin-theme min-h-screen bg-background text-foreground"
      style={
        {
          "--admin-sidebar-width": sidebarCollapsed ? "72px" : "232px",
        } as CSSProperties
      }
    >
      <a
        href="#admin-main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-[200%] rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus-visible:translate-y-0"
      >
        Aller au contenu principal
      </a>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "hidden shrink-0 border-r border-border bg-background transition-[width] duration-200 lg:block",
            sidebarCollapsed ? "w-[72px]" : "w-[232px]",
          )}
        >
          <div className="sticky top-0 h-screen">
            <AdminSidebar collapsed={sidebarCollapsed} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            onOpenMenu={() => setMenuOpen(true)}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={toggleSidebar}
          />
          <main
            id="admin-main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 p-4 outline-none sm:p-5 lg:p-6"
          >
            {children}
          </main>
          <footer className="border-t border-border bg-background px-4 py-2.5 text-[11px] text-muted-foreground">
            Authentification et permissions connectées. Les modules intégrés utilisent l’API HBS
            HOME.
          </footer>
        </div>
      </div>

      <AdminMobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}

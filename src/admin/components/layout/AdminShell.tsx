import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ExternalLink,
  LogOut,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
} from "lucide-react";
import { useAdminAuth } from "@/admin/auth/AdminAuthProvider";
import { useAdminAuthorization } from "@/admin/auth/AdminAuthorizationContext";
import { ADMIN_NAV } from "@/admin/config/admin-nav";
import { adminConfig } from "@/admin/config/admin.config";
import { AppLink } from "@/components/ui/app-link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin" || pathname === "/admin/";
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
  const visibleGroups = ADMIN_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.available && hasPermission(item.requiredPermission)),
  })).filter((group) => group.items.length > 0);

  return (
    <nav
      aria-label="Navigation du back-office"
      className={cn(
        "flex h-full flex-col gap-3 overflow-hidden p-3 lg:gap-2 lg:p-2.5",
        collapsed ? "items-center" : "",
      )}
    >
      <AppLink
        href="/admin"
        onClick={onNavigate}
        className={cn(
          "flex min-h-10 items-center gap-2 px-2 py-1 text-sm font-semibold tracking-widest text-foreground uppercase lg:min-h-9",
          collapsed ? "justify-center" : "",
        )}
        title={collapsed ? "HBS HOME Admin" : undefined}
      >
        <span aria-hidden={collapsed}>{collapsed ? "HB" : "HBS HOME"}</span>
        {!collapsed ? (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium tracking-normal text-primary">
            Admin
          </span>
        ) : null}
      </AppLink>

      <div className={cn("min-h-0 flex-1 space-y-3 lg:space-y-2", collapsed ? "w-full" : "")}>
        {visibleGroups.map((group) => (
          <div key={group.title}>
            {!collapsed ? (
              <p className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase lg:pb-0.5">
                {group.title}
              </p>
            ) : null}
            <ul className="space-y-0.5 lg:space-y-0">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <AppLink
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors lg:min-h-9",
                        collapsed ? "justify-center px-0" : "",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </AppLink>
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
          "flex min-h-10 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-muted lg:min-h-9",
          collapsed ? "justify-center px-0" : "",
        )}
        title={collapsed ? "Voir le site public" : undefined}
      >
        <ExternalLink className="size-4" />
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
  const label = session.user.displayName ?? session.user.email;
  const initials = label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="Ouvrir la navigation"
      >
        <MenuIcon className="size-5" />
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
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </Button>

      <AppLink href="/admin" className="text-sm font-medium">
        Back-office
      </AppLink>

      <div className="ml-auto flex items-center gap-3">
        {adminConfig.demoMode ? (
          <span className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 sm:inline-flex">
            <ShieldAlert className="size-3.5" /> Mode démo
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
            <LogOut className="size-4" />
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
      className="min-h-screen bg-muted/40 text-foreground"
      style={
        {
          "--admin-sidebar-width": sidebarCollapsed ? "72px" : "260px",
        } as CSSProperties
      }
    >
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "hidden shrink-0 border-r border-border bg-card transition-[width] duration-200 lg:block",
            sidebarCollapsed ? "w-[72px]" : "w-[260px]",
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
          <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
          <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Authentification et permissions connectées. Les modules intégrés utilisent l’API HBS
            HOME.
          </footer>
        </div>
      </div>

      <AdminMobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink, Menu as MenuIcon, ShieldAlert, X } from "lucide-react";
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

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav aria-label="Navigation du back-office" className="flex h-full flex-col gap-6 p-4">
      <AppLink
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 py-1 text-sm font-semibold tracking-widest text-foreground uppercase"
      >
        HBS HOME
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium tracking-normal text-primary">
          Admin
        </span>
      </AppLink>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {ADMIN_NAV.map((group) => (
          <div key={group.title}>
            <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <AppLink
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
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
        className="flex min-h-11 items-center gap-2 rounded-md px-2.5 text-sm text-muted-foreground hover:bg-muted"
      >
        <ExternalLink className="size-4" /> Voir le site public
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

export function AdminTopbar({ onOpenMenu }: { onOpenMenu: () => void }) {
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
            HB
          </span>
          <span className="hidden text-muted-foreground sm:inline">Hana Ben Salah</span>
        </div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <AdminSidebar />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onOpenMenu={() => setMenuOpen(true)} />
          <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
          <footer className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Données de démonstration locales. Authentification, permissions et API restent à
            connecter au backend.
          </footer>
        </div>
      </div>

      <AdminMobileSidebar open={menuOpen} onOpenChange={setMenuOpen} />
      <span className="sr-only">
        <X aria-hidden />
      </span>
    </div>
  );
}

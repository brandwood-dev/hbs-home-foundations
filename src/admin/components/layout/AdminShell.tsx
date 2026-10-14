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

  useEffect(() => {
    // Radix Sheet and the public mobile menu temporarily lock the body while
    // they are open. If navigation happens during the closing animation, the
    // cleanup can race with the AdminShell mount and leave the lock behind,
    // making every admin page appear stuck at the top. The admin shell owns
    // the page scroll, so clear only a stale global lock when no admin menu or
    // dialog is currently open.
    if (menuOpen) return;

    const cleanupScrollLock = () => {
      const body = document.body;
      const hasOpenDialog = Boolean(
        document.querySelector('[data-radix-dialog-content][data-state="open"]'),
      );
      const hasStaleScrollLock =
        body.hasAttribute("data-scroll-locked") ||
        body.style.overflow === "hidden" ||
        body.style.pointerEvents === "none";
      if (hasOpenDialog || !hasStaleScrollLock) return;

      body.removeAttribute("data-scroll-locked");
      body.style.removeProperty("overflow");
      body.style.removeProperty("pointer-events");
    };

    cleanupScrollLock();
    const cleanupAfterClose = window.setTimeout(cleanupScrollLock, 400);

    return () => window.clearTimeout(cleanupAfterClose);
  }, [menuOpen, pathname]);

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

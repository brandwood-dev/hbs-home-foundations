import type { ReactNode } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GlobalSearchPanel } from "@/components/search/GlobalSearchPanel";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-theme flex min-h-screen flex-col overflow-x-hidden bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-[200%] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-lg transition-transform focus-visible:translate-y-0"
      >
        Aller au contenu principal
      </a>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <GlobalSearchPanel />
      <WhatsAppFloatingButton />
    </div>
  );
}

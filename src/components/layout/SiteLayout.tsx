import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GlobalSearchPanel } from "@/components/search/GlobalSearchPanel";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { dataProvider } from "@/config/features.config";
import { promoBanner as fallbackPromoBanner } from "@/fixtures/home.fixture";
import { homeContentQuery } from "@/hooks/content/useHomeContent";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: homeContent } = useQuery({
    ...homeContentQuery(),
    enabled: dataProvider === "api",
  });
  const promoBanner = homeContent?.promoBanner ?? fallbackPromoBanner;

  return (
    <div className="site-theme flex min-h-screen flex-col overflow-x-hidden bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-[200%] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-lg transition-transform focus-visible:translate-y-0"
      >
        Aller au contenu principal
      </a>
      <HomePromoBanner content={promoBanner} />
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

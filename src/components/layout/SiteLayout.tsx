import { Suspense, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { GlobalSearchPanel } from "@/components/search/GlobalSearchPanel";
import { MessengerFloatingButton } from "@/components/MessengerFloatingButton";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { TrackingConsentBanner } from "@/components/analytics/TrackingConsentBanner";
import { dataProvider } from "@/config/features.config";
import { promoBanner as fallbackPromoBanner } from "@/fixtures/home.fixture";
import { homeContentQuery } from "@/hooks/content/useHomeContent";
import { useIsHydrated } from "@/hooks/useIsHydrated";

function PublicContentFallback() {
  return <div className="min-h-[60vh] w-full" aria-hidden="true" />;
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const hydrated = useIsHydrated();
  const { data: homeContent } = useQuery({
    ...homeContentQuery(),
    // Do not let an API response replace the SSR fixture during the first
    // client render: the shell must hydrate from identical markup first.
    enabled: dataProvider === "api" && hydrated,
  });
  // Keep the SSR and first hydrated render at the same height. Rendering an
  // empty API banner first makes the promo bar appear after hydration and
  // pushes the sticky header/content, which looks like a refresh vibration.
  // The live CMS value can still replace this fallback once the query resolves.
  const promoBanner = homeContent?.promoBanner ?? fallbackPromoBanner;

  return (
    <div className="site-theme flex min-h-screen flex-col overflow-x-clip bg-background">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-[200%] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-lg transition-transform focus-visible:translate-y-0"
      >
        Aller au contenu principal
      </a>
      <div className="sticky top-0 z-40">
        <div className="h-11 overflow-hidden">
          <HomePromoBanner content={promoBanner} />
        </div>
        <SiteHeader />
      </div>
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PublicContentFallback />}>{children}</Suspense>
      </main>
      <SiteFooter />
      <CartDrawer />
      <GlobalSearchPanel />
      <WhatsAppFloatingButton />
      <MessengerFloatingButton />
      <TrackingConsentBanner />
    </div>
  );
}

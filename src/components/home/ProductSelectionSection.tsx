import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  HomeSectionErrorState,
  HomeSectionHeading,
  HomeSectionSkeleton,
} from "@/components/home/HomeSectionStates";
import { AppLink } from "@/components/ui/app-link";
import type {
  ProductSelectionContent,
  ProductSelectionFilter,
} from "@/domain/content/home-content.types";
import { trackEvent } from "@/lib/analytics/analytics";
import { homeSelectionQuery } from "@/services/home/home-products.queries";
import { useNearViewport } from "@/hooks/useNearViewport";

type SelectionSectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
};

const SELECTION_COPY: Record<ProductSelectionFilter, SelectionSectionCopy> = {
  new: {
    eyebrow: "NOUVEAUTÉS",
    title: "Découvrez nos nouveautés",
    subtitle: "Les dernières collections HBS HOME pour renouveler votre intérieur.",
    ctaLabel: "Voir toutes les nouveautés",
  },
  best_sellers: {
    eyebrow: "LES PLUS AIMÉES",
    title: "Nos meilleures ventes",
    subtitle: "Les pièces préférées de nos clients pour habiller chaque pièce.",
    ctaLabel: "Voir toutes les meilleures ventes",
  },
  discounted: {
    eyebrow: "OFFRES DU MOMENT",
    title: "Profitez de nos promotions",
    subtitle: "Des prix avantageux sur une sélection de produits HBS HOME.",
    ctaLabel: "Voir toutes les promotions",
  },
};

const DEFAULT_CTA_HREFS: Record<ProductSelectionFilter, string> = {
  new: "/nouveautes",
  best_sellers: "/rideaux",
  discounted: "/promotions",
};

function ProductSelectionBlock({
  filter,
  pageSize,
  ctaHref,
}: {
  filter: ProductSelectionFilter;
  pageSize: number;
  ctaHref: string;
}) {
  const copy = SELECTION_COPY[filter];
  const sectionRef = useRef<HTMLElement>(null);
  const isNearViewport = useNearViewport(sectionRef);
  const query = useQuery({
    ...homeSelectionQuery(filter, pageSize),
    enabled: isNearViewport,
  });
  const products = query.data ?? [];
  const headingId = `home-selection-${filter}`;

  useEffect(() => {
    if (products.length > 0) {
      trackEvent("view_item_list", { list_id: `home_${filter}`, items: products.length });
    }
  }, [filter, products.length]);

  // Hide empty selections so the homepage does not leave a large blank gap.
  if (!query.isPending && !query.isError && products.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-7xl px-6 py-10 first:pt-12 lg:py-14"
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
        <HomeSectionHeading
          id={headingId}
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.subtitle}
        />

        <AppLink
          href={ctaHref}
          aria-label={copy.ctaLabel}
          className="group inline-flex min-h-[44px] items-center gap-2 self-start text-xs font-medium uppercase tracking-[0.18em] text-accent transition-colors hover:text-accent-dark hover:underline hover:underline-offset-4 md:mb-1 md:self-end"
        >
          <span aria-hidden="true">Voir tout</span>
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </AppLink>
      </div>

      <div className="mt-8">
        {query.isPending && <HomeSectionSkeleton count={4} />}

        {query.isError && <HomeSectionErrorState onRetry={() => void query.refetch()} />}

        {!query.isPending && !query.isError && products.length > 0 && (
          <>
            {/* Mobile : carousel horizontal accessible, sans autoplay */}
            <ul className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:hidden">
              {products.map((product) => (
                <li key={product.id} className="w-[72%] shrink-0 snap-start">
                  <div onClick={() => trackEvent("select_item", { item_id: product.id })}>
                    <ProductCard product={product} />
                  </div>
                </li>
              ))}
            </ul>

            <ul className="hidden gap-x-5 gap-y-10 md:grid md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <li key={product.id}>
                  <div onClick={() => trackEvent("select_item", { item_id: product.id })}>
                    <ProductCard product={product} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

export function ProductSelectionSection({ content }: { content: ProductSelectionContent }) {
  // Keep the homepage compact: four cards expose each selection, with the
  // dedicated CTA leading to the full catalogue page.
  const pageSize = Math.max(1, Math.min(content.pageSize || 4, 4));
  const tabsById = new Map(content.tabs.map((tab) => [tab.id, tab]));
  const filters: ProductSelectionFilter[] = ["new", "best_sellers", "discounted"];

  return (
    <div>
      {filters.map((filter) => (
        <ProductSelectionBlock
          key={filter}
          filter={filter}
          pageSize={pageSize}
          ctaHref={tabsById.get(filter)?.ctaHref ?? DEFAULT_CTA_HREFS[filter]}
        />
      ))}
    </div>
  );
}

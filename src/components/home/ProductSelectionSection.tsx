import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  HomeSectionEmptyState,
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

export function ProductSelectionSection({ content }: { content: ProductSelectionContent }) {
  const tabs = content.tabs;
  const [activeId, setActiveId] = useState<ProductSelectionFilter>(tabs[0]?.id ?? "new");
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const query = useQuery(homeSelectionQuery(activeId, content.pageSize));
  const products = query.data ?? [];

  useEffect(() => {
    if (products.length > 0) {
      trackEvent("view_item_list", { list_id: `home_${activeId}`, items: products.length });
    }
  }, [activeId, products.length]);

  if (!activeTab) return null;

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + delta + tabs.length) % tabs.length];
    if (!next) return;
    setActiveId(next.id);
    const element = document.getElementById(`home-tab-${next.id}`);
    element?.focus();
  };

  return (
    <section
      className="mx-auto max-w-7xl px-6 py-16 lg:py-24"
      aria-labelledby="home-product-selection"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <HomeSectionHeading
          id="home-product-selection"
          eyebrow="Sélection"
          title={content.title}
          {...(content.subtitle ? { subtitle: content.subtitle } : {})}
        />

        <div
          role="tablist"
          aria-label="Filtrer la sélection"
          className="flex flex-wrap gap-2 border-b border-border pb-1"
        >
          {tabs.map((tab, index) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                id={`home-tab-${tab.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls="home-tabpanel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={`min-h-[44px] rounded-sm px-4 text-sm transition-colors ${
                  selected
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div id="home-tabpanel" role="tabpanel" aria-labelledby={`home-tab-${activeId}`} className="mt-10">
        {query.isPending && <HomeSectionSkeleton count={4} />}

        {query.isError && <HomeSectionErrorState onRetry={() => void query.refetch()} />}

        {!query.isPending && !query.isError && products.length === 0 && (
          <HomeSectionEmptyState>
            Aucun produit dans cette sélection pour le moment.
          </HomeSectionEmptyState>
        )}

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

      <div className="mt-10">
        <AppLink
          href={activeTab.ctaHref}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-sm border border-taupe/50 px-6 text-sm transition-colors hover:border-accent hover:text-accent-dark"
        >
          {content.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </AppLink>
      </div>
    </section>
  );
}

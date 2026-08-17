import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { ShopTheLookHotspot } from "@/components/home/ShopTheLookHotspot";
import { AppLink } from "@/components/ui/app-link";
import type { ShopTheLookContent, ShopTheLookHotspot as Hotspot } from "@/domain/content/home-content.types";
import type { Product } from "@/domain/product/product.types";
import { formatMoney, getProductStartingPrice } from "@/lib/money/money";
import { homeProductsByIdsQuery } from "@/services/home/home-products.queries";

export interface ResolvedHotspot {
  hotspot: Hotspot;
  label: string;
  href: string;
  imageSrc?: string;
  priceLabel?: string;
}

/** Résolution produit → lien affichable. Fonction pure, testable. */
export function resolveHotspots(hotspots: Hotspot[], products: Product[]): ResolvedHotspot[] {
  return hotspots
    .map((hotspot) => {
      const product = hotspot.productId
        ? products.find((entry) => entry.id === hotspot.productId)
        : undefined;

      if (product) {
        const imageSrc = product.variants[0]?.imageUrl;
        return {
          hotspot,
          label: product.name,
          href: `/produit/${product.slug}`,
          ...(imageSrc ? { imageSrc } : {}),
          priceLabel: formatMoney(getProductStartingPrice(product)),
        } satisfies ResolvedHotspot;
      }

      if (hotspot.title && hotspot.href) {
        return { hotspot, label: hotspot.title, href: hotspot.href } satisfies ResolvedHotspot;
      }

      return null;
    })
    .filter((entry): entry is ResolvedHotspot => entry !== null);
}

export function ShopTheLookSection({ content }: { content: ShopTheLookContent }) {
  const ids = content.hotspots
    .map((hotspot) => hotspot.productId)
    .filter((id): id is string => Boolean(id));
  const { data: products = [] } = useQuery(homeProductsByIdsQuery(ids));
  const resolved = resolveHotspots(content.hotspots, products);

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = resolved.find((entry) => entry.hotspot.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeId]);

  if (resolved.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24" aria-labelledby="home-shop-the-look">
      <HomeSectionHeading
        id="home-shop-the-look"
        eyebrow="Shop the look"
        title={content.title}
        subtitle={content.subtitle}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="relative lg:col-span-8">
          <img
            src={content.image.src}
            alt={content.image.alt}
            loading="lazy"
            decoding="async"
            width={1400}
            height={1000}
            className="h-[280px] w-full rounded-sm object-cover sm:h-[420px] lg:h-[560px]"
          />

          {/* Points interactifs — desktop uniquement, zones tactiles trop petites sur mobile */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="pointer-events-auto absolute inset-0">
              {resolved.map((entry) => (
                <ShopTheLookHotspot
                  key={entry.hotspot.id}
                  label={entry.label}
                  xPercent={entry.hotspot.xPercent}
                  yPercent={entry.hotspot.yPercent}
                  isActive={activeId === entry.hotspot.id}
                  controls="shop-the-look-panel"
                  onToggle={() =>
                    setActiveId((current) =>
                      current === entry.hotspot.id ? null : entry.hotspot.id,
                    )
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div
            id="shop-the-look-panel"
            aria-live="polite"
            className="hidden rounded-sm border border-border bg-surface p-5 lg:block"
          >
            {active ? (
              <>
                {active.imageSrc && (
                  <img
                    src={active.imageSrc}
                    alt=""
                    loading="lazy"
                    width={400}
                    height={520}
                    className="h-40 w-full rounded-sm object-cover"
                  />
                )}
                <p className="mt-4 text-lg">{active.label}</p>
                {active.priceLabel && (
                  <p className="mt-1 text-sm text-foreground-muted">{active.priceLabel}</p>
                )}
                <AppLink
                  href={active.href}
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-sm text-accent-dark"
                >
                  Voir le produit
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </AppLink>
              </>
            ) : (
              <p className="text-sm text-foreground-muted">
                Sélectionnez un point sur l'image pour découvrir le produit associé.
              </p>
            )}
          </div>

          {/* Alternative mobile : liste tactile complète */}
          <ul className="grid gap-3 lg:hidden">
            {resolved.map((entry) => (
              <li key={entry.hotspot.id}>
                <AppLink
                  href={entry.href}
                  className="flex min-h-[64px] items-center gap-4 rounded-sm border border-border bg-surface p-3"
                >
                  {entry.imageSrc && (
                    <img
                      src={entry.imageSrc}
                      alt=""
                      loading="lazy"
                      width={120}
                      height={120}
                      className="h-14 w-14 rounded-sm object-cover"
                    />
                  )}
                  <span className="flex-1">
                    <span className="block text-sm">{entry.label}</span>
                    {entry.priceLabel && (
                      <span className="block text-xs text-foreground-muted">
                        {entry.priceLabel}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 text-accent-dark" aria-hidden="true" />
                </AppLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

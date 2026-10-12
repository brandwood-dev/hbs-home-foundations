import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { HomeSectionHeading } from "@/components/home/HomeSectionStates";
import { ShopTheLookHotspot } from "@/components/home/ShopTheLookHotspot";
import { AppLink } from "@/components/ui/app-link";
import type { ShopTheLookContent } from "@/domain/content/home-content.types";
import { resolveHotspots } from "@/components/home/shop-the-look-resolver";
import { richTextToPlainText } from "@/lib/content/rich-text";
import { homeProductsByIdsQuery } from "@/services/home/home-products.queries";
import { useNearViewport } from "@/hooks/useNearViewport";
import { useShopTheLookImageRatio } from "@/components/home/shop-the-look-image";

function SafeProductImage({
  src,
  alt,
  className,
  width,
  height,
}: {
  src: string | undefined;
  alt: string;
  className: string;
  width: number;
  height: number;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      src={failed ? "/images/placeholder-product.svg" : src || "/images/placeholder-product.svg"}
      alt={alt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function ShopTheLookSection({ content }: { content: ShopTheLookContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const isNearViewport = useNearViewport(sectionRef);
  const ids = content.hotspots
    .map((hotspot) => hotspot.productId)
    .filter((id): id is string => Boolean(id));
  const { data: products = [] } = useQuery({
    ...homeProductsByIdsQuery(ids),
    enabled: isNearViewport && ids.length > 0,
  });
  const resolved = useMemo(
    () => resolveHotspots(content.hotspots, products),
    [content.hotspots, products],
  );
  const { aspectRatio, onImageLoad } = useShopTheLookImageRatio(content.image.src);

  const [activeId, setActiveId] = useState<string | null>(null);
  const active = resolved.find((entry) => entry.hotspot.id === activeId) ?? null;
  const firstHotspotId = resolved[0]?.hotspot.id ?? null;

  useEffect(() => {
    setActiveId((current) => {
      if (current && resolved.some((entry) => entry.hotspot.id === current)) return current;
      return firstHotspotId;
    });
  }, [firstHotspotId, resolved]);

  useEffect(() => {
    if (!firstHotspotId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(firstHotspotId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [firstHotspotId]);

  if (resolved.length === 0 && content.hotspots.length === 0 && isNearViewport) return null;

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-7xl px-6 py-10 lg:py-14"
      aria-labelledby="home-shop-the-look"
    >
      <HomeSectionHeading
        id="home-shop-the-look"
        eyebrow="Shop the look"
        title={content.title}
        subtitle={content.subtitle}
      />

      {!isNearViewport ? (
        <div
          className="mt-8 animate-pulse rounded-sm bg-surface-muted"
          style={{ aspectRatio }}
          aria-label="Chargement de l’inspiration"
          role="status"
        />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div
            className="relative overflow-hidden rounded-sm bg-surface-muted lg:col-span-8"
            style={{ aspectRatio }}
          >
            <img
              src={content.image.src}
              alt={content.image.alt}
              loading="lazy"
              decoding="async"
              width={1672}
              height={941}
              onLoad={onImageLoad}
              className="absolute inset-0 h-full w-full object-contain"
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
                    onToggle={() => setActiveId(entry.hotspot.id)}
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
                  <div className="media-frame-product w-full overflow-hidden rounded-sm bg-surface-muted">
                    <SafeProductImage
                      src={active.imageSrc}
                      alt={active.imageAlt ?? active.label}
                      width={600}
                      height={800}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mt-4 text-lg leading-snug">
                    <AppLink href={active.href} className="hover:text-accent-dark">
                      {active.label}
                    </AppLink>
                  </h3>
                  {active.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
                      {richTextToPlainText(active.description)}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    {active.priceLabel && <p className="text-sm">Dès {active.priceLabel}</p>}
                    {active.availabilityLabel && (
                      <p className="text-xs text-foreground-muted">{active.availabilityLabel}</p>
                    )}
                  </div>
                  <AppLink
                    href={active.href}
                    className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm text-accent-dark"
                  >
                    Voir le produit
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </AppLink>
                </>
              ) : (
                <p role="status" className="text-sm text-foreground-muted">
                  Chargement du produit associé…
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
                    <SafeProductImage
                      src={entry.imageSrc}
                      alt={entry.imageAlt ?? entry.label}
                      width={120}
                      height={120}
                      className="h-14 w-14 shrink-0 rounded-sm object-cover"
                    />
                    <span className="flex-1">
                      <span className="block text-sm">{entry.label}</span>
                      {entry.description && (
                        <span className="mt-0.5 block line-clamp-2 text-xs text-foreground-muted">
                          {richTextToPlainText(entry.description)}
                        </span>
                      )}
                      {entry.priceLabel && (
                        <span className="mt-1 block text-xs text-foreground-muted">
                          Dès {entry.priceLabel}
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
      )}
    </section>
  );
}

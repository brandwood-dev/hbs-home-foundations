import { useState } from "react";
import { AppLink } from "@/components/ui/app-link";
import {
  AVAILABILITY_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  SELLING_MODE_LABELS,
} from "@/domain/product/product.constants";
import type { Product } from "@/domain/product/product.types";
import {
  formatMoney,
  getDiscountPercentage,
  getProductCompareAtPrice,
  getProductStartingPrice,
  hasMultiplePrices,
} from "@/lib/money/money";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function Badge({ children, tone }: { children: string; tone: "accent" | "neutral" | "sale" }) {
  const toneClass =
    tone === "sale"
      ? "bg-error text-surface"
      : tone === "accent"
        ? "bg-accent text-accent-foreground"
        : "bg-surface/90 text-foreground";
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClass}`}
    >
      {children}
    </span>
  );
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  const startingPrice = getProductStartingPrice(product);
  const compareAt = getProductCompareAtPrice(product);
  const discount = getDiscountPercentage(product);
  const cheapest = [...product.variants].sort(
    (a, b) => a.price.amountMinor - b.price.amountMinor,
  )[0];
  const availability = cheapest?.availability ?? "in_stock";
  const primaryImage = cheapest?.imageUrl ?? product.variants[0]?.imageUrl ?? "";
  const secondaryImage = cheapest?.secondaryImageUrl;
  const displayedImage = hovered && secondaryImage ? secondaryImage : primaryImage;

  const uniqueColors = product.colors.slice(0, 5);
  const extraColors = product.colors.length - uniqueColors.length;

  return (
    <article
      className="group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AppLink
        href={`/produit/${product.slug}`}
        className="relative block overflow-hidden rounded-md bg-surface-muted"
      >
        <div className="aspect-[3/4] w-full">
          <img
            src={displayedImage}
            alt={product.imageAlt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={600}
            height={800}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
          {product.isNew && <Badge tone="accent">Nouveau</Badge>}
          {discount > 0 && <Badge tone="sale">{`-${discount}%`}</Badge>}
          {product.isBestSeller && !product.isNew && <Badge tone="neutral">Best-seller</Badge>}
          {product.isThermal && <Badge tone="neutral">Thermique</Badge>}
        </div>

        {availability === "out_of_stock" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-foreground/70 py-1.5 text-center text-[11px] uppercase tracking-[0.14em] text-surface">
            {AVAILABILITY_LABELS.out_of_stock}
          </div>
        )}
      </AppLink>

      <div className="mt-3 flex flex-1 flex-col">
        <p className="eyebrow">
          {product.blindType ? BLIND_TYPE_LABELS[product.blindType] : MATERIAL_LABELS[product.material]}
          {" · "}
          {OPACITY_LABELS[product.opacityLevel]}
        </p>

        <h3 className="mt-1 text-base leading-snug sm:text-lg">
          <AppLink href={`/produit/${product.slug}`} className="hover:text-accent-dark">
            {product.name}
          </AppLink>
        </h3>

        <p className="mt-1 line-clamp-2 text-sm text-foreground-muted">
          {product.shortDescription}
        </p>

        <div className="mt-2 flex items-center gap-1.5" aria-label="Coloris disponibles">
          {uniqueColors.map((color) => (
            <span
              key={color.id}
              title={color.name}
              className="h-3.5 w-3.5 rounded-full border border-border"
              style={{ backgroundColor: color.hex }}
            />
          ))}
          {extraColors > 0 && (
            <span className="text-xs text-foreground-muted">{`+${extraColors}`}</span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-semibold">
            {hasMultiplePrices(product) ? "Dès " : ""}
            {formatMoney(startingPrice)}
          </span>
          {compareAt && (
            <span className="text-sm text-foreground-muted line-through">
              {formatMoney(compareAt)}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-foreground-muted">
          {SELLING_MODE_LABELS[product.sellingMode]} · {AVAILABILITY_LABELS[availability]}
        </p>
      </div>
    </article>
  );
}

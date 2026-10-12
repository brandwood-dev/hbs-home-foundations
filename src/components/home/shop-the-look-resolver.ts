import { getProductCardImage } from "@/components/catalog/product-card-image";
import { AVAILABILITY_LABELS } from "@/domain/product/product.constants";
import type {
  ShopTheLookContent,
  ShopTheLookHotspot as Hotspot,
} from "@/domain/content/home-content.types";
import type { Product } from "@/domain/product/product.types";
import { formatMoney, getProductStartingPrice } from "@/lib/money/money";
import { getProductPath } from "@/services/product/product-url";

export interface ResolvedHotspot {
  hotspot: Hotspot;
  label: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  description?: string;
  priceLabel?: string;
  availabilityLabel?: string;
}

/** Résolution produit → lien affichable. Fonction pure, testable. */
export function resolveHotspots(
  hotspots: ShopTheLookContent["hotspots"],
  products: Product[],
): ResolvedHotspot[] {
  return hotspots
    .map((hotspot): ResolvedHotspot | null => {
      const product = hotspot.productId
        ? products.find((entry) => entry.id === hotspot.productId)
        : undefined;

      if (product) {
        const cheapestVariant = [...product.variants].sort(
          (left, right) => left.price.amountMinor - right.price.amountMinor,
        )[0];
        return {
          hotspot,
          label: product.name,
          href: getProductPath(product),
          imageSrc: getProductCardImage(product),
          imageAlt: product.imageAlt || `Image de ${product.name}`,
          ...(product.shortDescription.trim() ? { description: product.shortDescription } : {}),
          priceLabel: formatMoney(getProductStartingPrice(product)),
          ...(cheapestVariant
            ? { availabilityLabel: AVAILABILITY_LABELS[cheapestVariant.availability] }
            : {}),
        };
      }

      if (hotspot.title && hotspot.href) {
        return {
          hotspot,
          label: hotspot.title,
          href: hotspot.href,
          imageAlt: hotspot.title,
        };
      }

      return null;
    })
    .filter((entry): entry is ResolvedHotspot => entry !== null);
}

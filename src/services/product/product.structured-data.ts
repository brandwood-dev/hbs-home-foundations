import { storeConfig } from "@/config/store.config";
import type { Product } from "@/domain/product/product.types";

const AVAILABILITY_SCHEMA = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/LimitedAvailability",
  out_of_stock: "https://schema.org/OutOfStock",
  made_to_order: "https://schema.org/PreOrder",
} as const;

/** JSON-LD Product avec une offre par variante. */
export function buildProductJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.reference,
    description: product.seo.description,
    brand: { "@type": "Brand", name: storeConfig.brandName },
    ...(product.details.composition ? { material: product.details.composition } : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      price: (variant.price.amountMinor / 1000).toFixed(3),
      priceCurrency: storeConfig.currency,
      availability: AVAILABILITY_SCHEMA[variant.availability],
      itemCondition: "https://schema.org/NewCondition",
    })),
  };
}

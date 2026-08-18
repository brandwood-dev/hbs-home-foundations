import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductStickyBar } from "@/components/product/ProductStickyBar";
import { ProductTrustPoints } from "@/components/product/ProductTrustPoints";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { getCatalogGroup } from "@/fixtures/catalog-pages.fixture";
import {
  MATERIAL_LABELS,
  OPACITY_LABELS,
  SELLING_MODE_LABELS,
} from "@/domain/product/product.constants";
import type { Product } from "@/domain/product/product.types";
import { relatedProductsQuery } from "@/services/product/product.queries";
import {
  changeAxis,
  getInitialVariant,
  type VariantAxis,
} from "@/services/product/product-variants";
import { ProductVariantSelectors } from "@/components/product/ProductVariantSelectors";
import { buildProductJsonLd } from "@/services/product/product.structured-data";

export function ProductDetailView({ product }: { product: Product }) {
  const [variant, setVariant] = useState(() => getInitialVariant(product));
  const [quantity, setQuantity] = useState(1);

  const related = useQuery(relatedProductsQuery(product.slug, 4));

  const onAxisChange = (axis: VariantAxis, value: string) => {
    const next = changeAxis(product, variant, axis, value);
    setVariant(next);
    setQuantity((current) => Math.min(current, Math.max(1, next.availableQuantity || 1)));
  };

  const jsonLd = useMemo(() => buildProductJsonLd(product), [product]);

  return (
    <SiteLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-16 lg:pt-10">
        <CatalogBreadcrumbs
          items={[
            { label: "Accueil", href: "/" },
            {
              label: getCatalogGroup(product.category).label,
              href: getCatalogGroup(product.category).path,
            },
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery images={product.images} activeImageId={variant.imageIds[0]} />

          <div className="space-y-6">
            <header>
              <p className="eyebrow">
                {MATERIAL_LABELS[product.material]} · {OPACITY_LABELS[product.opacityLevel]} ·{" "}
                {SELLING_MODE_LABELS[product.sellingMode]}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl">{product.name}</h1>
              <p className="mt-2 text-sm text-foreground-muted">{product.shortDescription}</p>
              <p className="mt-1 text-xs text-foreground-muted">Référence {variant.sku}</p>
            </header>

            <ProductVariantSelectors product={product} variant={variant} onChange={onAxisChange} />

            <ProductPurchasePanel
              product={product}
              variant={variant}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />

            <ProductTrustPoints />

            <ProductDetailsAccordion product={product} variant={variant} />
          </div>
        </div>

        <RelatedProducts products={related.data ?? []} loading={related.isLoading} />
      </div>

      <ProductStickyBar product={product} variant={variant} quantity={quantity} />
    </SiteLayout>
  );
}

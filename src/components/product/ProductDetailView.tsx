import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductStickyBar } from "@/components/product/ProductStickyBar";
import { ProductTrustPoints } from "@/components/product/ProductTrustPoints";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { getCatalogGroup } from "@/fixtures/catalog-pages.fixture";
import { catalogCategoryQuery } from "@/services/catalog/catalog-category.queries";
import {
  MATERIAL_LABELS,
  OPACITY_LABELS,
  SELLING_MODE_LABELS,
} from "@/domain/product/product.constants";
import type { Product } from "@/domain/product/product.types";
import {
  confectionKeyForVariant,
  confectionOptionsFor,
  type ConfectionKey,
} from "@/domain/product/confection";
import { relatedProductsQuery } from "@/services/product/product.queries";
import {
  changeAxis,
  getInitialVariant,
  getVariantImages,
  type VariantAxis,
} from "@/services/product/product-variants";
import { ProductVariantSelectors } from "@/components/product/ProductVariantSelectors";
import { buildProductJsonLd } from "@/services/product/product.structured-data";
import { getProductTaxonomyPath } from "@/services/product/product-breadcrumbs";

export function ProductDetailView({ product }: { product: Product }) {
  const [variant, setVariant] = useState(() => getInitialVariant(product));
  const [confectionKey, setConfectionKey] = useState<ConfectionKey | undefined>(() => {
    const initial = confectionKeyForVariant(getInitialVariant(product));
    return initial ?? confectionOptionsFor(product.category, product.confectionOptions)[0]?.key;
  });
  const [quantity, setQuantity] = useState(1);

  const related = useQuery(relatedProductsQuery(product.slug, 4));
  const fallbackGroup = getCatalogGroup(product.category);
  const { rootSlug, subcategorySlug } = getProductTaxonomyPath(product);
  const rootCategoryQuery = useQuery(catalogCategoryQuery(rootSlug));
  const subcategoryQuery = useQuery({
    ...catalogCategoryQuery(subcategorySlug ?? ""),
    enabled: Boolean(subcategorySlug),
  });
  const rootCategory = rootCategoryQuery.data;
  const subcategory =
    (subcategorySlug
      ? rootCategory?.children.find((candidate) => candidate.slug === subcategorySlug)
      : undefined) ?? subcategoryQuery.data;

  const onAxisChange = (axis: VariantAxis, value: string) => {
    const next = changeAxis(product, variant, axis, value);
    setVariant(next);
    setQuantity((current) => Math.min(current, Math.max(1, next.availableQuantity || 1)));
  };

  const onConfectionChange = (value: ConfectionKey) => {
    setConfectionKey(value);
    const matching = product.variants.find(
      (candidate) =>
        confectionKeyForVariant(candidate) === value &&
        candidate.colorId === variant.colorId &&
        candidate.widthCm === variant.widthCm &&
        candidate.heightCm === variant.heightCm,
    );
    if (matching) setVariant(matching);
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
              label: rootCategory?.name ?? fallbackGroup.label,
              href: rootCategory?.path ?? fallbackGroup.path,
            },
            ...(subcategory ? [{ label: subcategory.name, href: subcategory.path }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="min-w-0 space-y-8">
            <ProductGallery
              images={getVariantImages(product, variant)}
              activeImageId={variant.imageIds[0]}
            />

            <section aria-label="Informations sur le produit">
              <ProductDetailsAccordion product={product} variant={variant} />
            </section>
          </div>

          <div className="space-y-6">
            <header>
              <p className="eyebrow">
                {MATERIAL_LABELS[product.material]}
                {product.opacityLevel ? ` · ${OPACITY_LABELS[product.opacityLevel]}` : ""} ·{" "}
                {SELLING_MODE_LABELS[product.sellingMode]}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl">{product.name}</h1>
              <div className="mt-4" aria-label="Prix du produit">
                <ProductPrice variant={variant} />
              </div>
              <p className="mt-2 text-sm text-foreground-muted">{product.shortDescription}</p>
              <p className="mt-1 text-xs text-foreground-muted">Référence {variant.sku}</p>
            </header>

            <ProductVariantSelectors
              product={product}
              variant={variant}
              onChange={onAxisChange}
              selectedConfection={confectionKey}
              onConfectionChange={onConfectionChange}
            />

            <ProductPurchasePanel
              product={product}
              variant={variant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              confectionKey={confectionKey}
            />

            <ProductTrustPoints />
          </div>
        </div>

        <RelatedProducts products={related.data ?? []} loading={related.isLoading} />
      </div>

      <ProductStickyBar
        product={product}
        variant={variant}
        quantity={quantity}
        confectionKey={confectionKey}
      />
    </SiteLayout>
  );
}

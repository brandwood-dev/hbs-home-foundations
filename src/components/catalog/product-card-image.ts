import type { Product } from "@/domain/product/product.types";

/**
 * Catalogue cards use product media as their canonical visual source.
 * Variant image URLs can be legacy fixture paths while media is stored on the
 * product itself, so keep the variant URL as a backwards-compatible fallback.
 */
type ProductCardImageSource = Pick<Product, "images"> & {
  variants: ReadonlyArray<Pick<Product["variants"][number], "imageUrl">>;
};

type ProductCardSecondaryImageSource = Pick<Product, "images">;
type ProductCardVariantImageSource = Pick<
  Product["variants"][number],
  "secondaryImageUrl" | "imageIds"
>;

export function getProductCardImage(product: ProductCardImageSource): string {
  const productImage = product.images.find((image) => image.type === "front") ?? product.images[0];
  return productImage?.url ?? product.variants[0]?.imageUrl ?? "/images/placeholder-product.svg";
}

/**
 * Resolve the hover image from the variant first, then from its linked gallery
 * media and finally from the product gallery. Older API records do not always
 * populate `secondaryImageUrl`, even when a second gallery image exists.
 */
export function getProductCardSecondaryImage(
  product: ProductCardSecondaryImageSource & ProductCardImageSource,
  variant?: ProductCardVariantImageSource,
): string | undefined {
  const primaryImage = getProductCardImage(product);
  const explicitSecondary = variant?.secondaryImageUrl;
  if (explicitSecondary && explicitSecondary !== primaryImage) return explicitSecondary;

  const linkedSecondary = variant?.imageIds
    .map((imageId) => product.images.find((image) => image.id === imageId))
    .find((image) => image && image.url !== primaryImage);
  if (linkedSecondary) return linkedSecondary.url;

  return product.images.find((image) => image.url !== primaryImage)?.url;
}

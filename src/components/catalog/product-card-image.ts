import type { Product } from "@/domain/product/product.types";

/**
 * Catalogue cards use product media as their canonical visual source.
 * Variant image URLs can be legacy fixture paths while media is stored on the
 * product itself, so keep the variant URL as a backwards-compatible fallback.
 */
type ProductCardImageSource = Pick<Product, "images"> & {
  variants: ReadonlyArray<Pick<Product["variants"][number], "imageUrl">>;
};

export function getProductCardImage(product: ProductCardImageSource): string {
  const productImage = product.images.find((image) => image.type === "front") ?? product.images[0];
  return productImage?.url ?? product.variants[0]?.imageUrl ?? "/images/placeholder-product.webp";
}

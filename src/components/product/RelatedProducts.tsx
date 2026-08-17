import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import type { Product } from "@/domain/product/product.types";

export function RelatedProducts({
  products,
  loading = false,
}: {
  products: Product[];
  loading?: boolean;
}) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-2xl sm:text-3xl">
        Vous aimerez aussi
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
        {loading
          ? Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)
          : products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

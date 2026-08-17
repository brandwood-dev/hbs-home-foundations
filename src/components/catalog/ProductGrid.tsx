import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductCardSkeleton } from "@/components/catalog/ProductCardSkeleton";
import type { Product } from "@/domain/product/product.types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

export function ProductGrid({ products, loading = false, skeletonCount = 12 }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
      {loading
        ? Array.from({ length: skeletonCount }, (_, index) => <ProductCardSkeleton key={index} />)
        : products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
    </div>
  );
}

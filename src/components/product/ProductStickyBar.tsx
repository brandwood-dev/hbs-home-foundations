import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import type { Product, ProductVariant } from "@/domain/product/product.types";
import { formatMoney } from "@/lib/money/money";

export function ProductStickyBar({
  product,
  variant,
  quantity,
}: {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-sm text-foreground-muted">
            {formatMoney(variant.price)} · {variant.widthCm} × {variant.heightCm} cm
          </p>
        </div>
        <ProductPurchaseActions product={product} variant={variant} quantity={quantity} compact />
      </div>
    </div>
  );
}

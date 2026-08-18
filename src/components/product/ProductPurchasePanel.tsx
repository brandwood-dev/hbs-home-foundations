import { Minus, Plus } from "lucide-react";
import { ProductAvailabilityBadge } from "@/components/product/ProductAvailabilityBadge";
import { ProductPrice } from "@/components/product/ProductPrice";
import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import { ProductShippingNotice } from "@/components/product/ProductShippingNotice";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import type { Product, ProductVariant } from "@/domain/product/product.types";

interface ProductPurchasePanelProps {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function ProductPurchasePanel({
  product,
  variant,
  quantity,
  onQuantityChange,
}: ProductPurchasePanelProps) {
  const unavailable = variant.availability === "out_of_stock";
  const max = Math.max(1, variant.availableQuantity || 1);

  return (
    <div className="space-y-4">
      <ProductPrice variant={variant} />
      <ProductAvailabilityBadge variant={variant} />

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center rounded-sm border border-border">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              disabled={quantity <= 1 || unavailable}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span aria-live="polite" className="w-10 text-center text-sm font-medium">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Augmenter la quantité"
              disabled={quantity >= max || unavailable}
              onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
              className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {quantity >= max && !unavailable ? (
            <p className="text-xs text-foreground-muted">Quantité maximale disponible atteinte</p>
          ) : null}
        </div>

        <div className="min-w-[200px] flex-1">
          <ProductPurchaseActions
            product={product}
            variant={variant}
            quantity={quantity}
            missingOptionLabel="Sélectionnez une dimension"
          />
        </div>

        <FavoriteButton
          productId={product.id}
          productName={product.name}
          variant="inline"
          className="w-full sm:w-auto"
        />
      </div>

      <ProductShippingNotice profile={product.shippingProfile} />
    </div>
  );
}

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductAvailabilityBadge } from "@/components/product/ProductAvailabilityBadge";
import { ProductPrice } from "@/components/product/ProductPrice";
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
  const max = Math.max(1, variant.availableQuantity || 10);

  const addToCart = () => {
    toast.success("Sélection enregistrée", {
      description: `${product.name} — ${variant.sku} × ${quantity}. Le panier sera activé à la prochaine étape.`,
    });
  };

  return (
    <div className="space-y-4">
      <ProductPrice variant={variant} />
      <ProductAvailabilityBadge variant={variant} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-sm border border-border">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            disabled={quantity <= 1}
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
            disabled={quantity >= max}
            onClick={() => onQuantityChange(Math.min(max, quantity + 1))}
            className="flex h-12 w-12 items-center justify-center disabled:opacity-40"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={addToCart}
          disabled={unavailable}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-muted"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {unavailable ? "Indisponible" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}

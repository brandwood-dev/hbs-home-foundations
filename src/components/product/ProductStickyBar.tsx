import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
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
  const unavailable = variant.availability === "out_of_stock";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="text-sm text-foreground-muted">
            {formatMoney(variant.price)} · {variant.widthCm} × {variant.heightCm} cm
          </p>
        </div>
        <button
          type="button"
          disabled={unavailable}
          onClick={() =>
            toast.success("Sélection enregistrée", {
              description: `${product.name} — ${variant.sku} × ${quantity}.`,
            })
          }
          className="flex min-h-[48px] items-center gap-2 rounded-sm bg-accent px-5 text-sm font-medium text-accent-foreground disabled:bg-surface-muted disabled:text-foreground-muted"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {unavailable ? "Indisponible" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

import { Trash2 } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { CartItemDetails } from "@/components/cart/CartItemDetails";
import { CartQuantitySelector } from "@/components/cart/CartQuantitySelector";
import { CartStatusNotice } from "@/components/cart/CartStatusNotice";
import type { ResolvedCartItem } from "@/domain/cart/cart.types";
import { formatMoney } from "@/lib/money/money";

interface CartItemProps {
  item: ResolvedCartItem;
  compact?: boolean;
  busy?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  compact = false,
  busy = false,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  return (
    <article className="flex gap-3 py-4">
      <div
        className={`${compact ? "h-24 w-20" : "h-32 w-24"} shrink-0 overflow-hidden rounded-sm bg-surface-muted`}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.imageAlt}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.productSlug ? (
              <AppLink
                href={`/produit/${item.productSlug}`}
                className="text-sm font-medium hover:text-accent-dark"
              >
                {item.productName}
              </AppLink>
            ) : (
              <span className="text-sm font-medium">{item.productName}</span>
            )}
            {item.sku ? (
              <p className="text-xs text-foreground-muted">Référence {item.sku}</p>
            ) : null}
            <CartItemDetails item={item} />
          </div>

          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Supprimer ${item.productName} du panier`}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-muted hover:text-destructive disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <CartStatusNotice item={item} />

        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          {item.canPurchase ? (
            <CartQuantitySelector
              quantity={item.quantity}
              max={Math.max(1, item.availableQuantity)}
              disabled={busy}
              size={compact ? "sm" : "md"}
              label={item.productName}
              onChange={onQuantityChange}
            />
          ) : (
            <span className="text-xs text-foreground-muted">Quantité : {item.quantity}</span>
          )}

          <div className="text-right">
            {item.compareAtPriceMinor ? (
              <p className="text-xs text-foreground-muted line-through">
                {formatMoney(item.compareAtPriceMinor)}
              </p>
            ) : null}
            <p className="text-sm font-medium">{formatMoney(item.lineTotalMinor)}</p>
            {item.quantity > 1 && item.canPurchase ? (
              <p className="text-xs text-foreground-muted">
                {formatMoney(item.unitPriceMinor)} l'unité
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

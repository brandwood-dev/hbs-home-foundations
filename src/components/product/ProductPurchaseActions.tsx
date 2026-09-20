import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { getCartErrorMessage } from "@/domain/cart/cart.errors";
import type { Product, ProductVariant } from "@/domain/product/product.types";
import type { ConfectionKey } from "@/domain/product/confection";
import { useAddCartItemMutation } from "@/hooks/cart/useCartMutations";
import { openCartDrawer } from "@/hooks/cart/useCartDrawer";

interface ProductPurchaseActionsProps {
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  /** Message expliquant l'option manquante quand la sélection est incomplète. */
  missingOptionLabel?: string;
  compact?: boolean;
  confectionKey?: ConfectionKey | undefined;
}

const ADD_ERROR = "Impossible d'ajouter cet article au panier. Veuillez réessayer.";

/**
 * Unique point d'ajout au panier : réutilisé par le panneau d'achat et la barre sticky.
 */
export function ProductPurchaseActions({
  product,
  variant,
  quantity,
  missingOptionLabel,
  compact = false,
  confectionKey,
}: ProductPurchaseActionsProps) {
  const addItem = useAddCartItemMutation();
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const unavailable = variant?.availability === "out_of_stock";
  const maxQuantity = variant ? Math.max(1, variant.availableQuantity || 1) : 0;
  const validQuantity = Number.isInteger(quantity) && quantity >= 1 && quantity <= maxQuantity;
  const requiresConfection = product.category === "rideaux" || product.category === "voilages";
  const canAdd =
    Boolean(variant) &&
    (!requiresConfection || Boolean(confectionKey)) &&
    !unavailable &&
    validQuantity &&
    !addItem.isPending;

  const label = !variant
    ? "Sélectionnez vos options"
    : requiresConfection && !confectionKey
      ? "Choisissez votre confection"
      : unavailable
        ? "Indisponible"
        : addItem.isPending
          ? "Ajout en cours…"
          : compact
            ? "Ajouter"
            : "Ajouter au panier";

  const onAdd = () => {
    if (!variant || !canAdd) return;
    setError(null);
    addItem.mutate(
      { productId: product.id, variantId: variant.id, quantity, confectionKey },
      {
        onSuccess: () => {
          setAnnouncement(`${product.name} ajouté au panier, quantité ${quantity}.`);
          openCartDrawer();
        },
        onError: (mutationError) => {
          setError(getCartErrorMessage(mutationError, ADD_ERROR));
        },
      },
    );
  };

  return (
    <div className={compact ? "" : "space-y-2"}>
      <button
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        aria-disabled={!canAdd}
        className={`flex min-h-[48px] items-center justify-center gap-2 rounded-sm bg-accent text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-foreground-muted ${
          compact ? "px-5" : "w-full px-6"
        }`}
      >
        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

      {!compact && (!variant || (requiresConfection && !confectionKey)) && missingOptionLabel ? (
        <p className="text-xs text-foreground-muted">
          {requiresConfection && !confectionKey
            ? "Choisissez votre type de confection"
            : missingOptionLabel}
        </p>
      ) : null}

      {!compact && variant && validQuantity === false && !unavailable ? (
        <p className="text-xs text-foreground-muted">Quantité maximale disponible atteinte</p>
      ) : null}

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}

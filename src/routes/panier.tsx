import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartErrorState } from "@/components/cart/CartErrorState";
import { CartItem } from "@/components/cart/CartItem";
import { CartSkeleton } from "@/components/cart/CartSkeleton";
import { CartSummary } from "@/components/cart/CartSummary";
import { ClearCartDialog } from "@/components/cart/ClearCartDialog";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { useCart } from "@/hooks/cart/useCart";
import {
  useClearCartMutation,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/hooks/cart/useCartMutations";

const title = "Panier — HBS HOME";
const description =
  "Votre sélection de rideaux et voilages HBS HOME : quantités, sous-total estimé et livraison.";

export const Route = createFileRoute("/panier")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PanierPage,
});

function PanierPage() {
  const { cart, isLoading, isError, refetch, hydrated } = useCart();
  const updateItem = useUpdateCartItemMutation();
  const removeItem = useRemoveCartItemMutation();
  const clearCart = useClearCartMutation();
  const [confirmClear, setConfirmClear] = useState(false);
  const busy = updateItem.isPending || removeItem.isPending || clearCart.isPending;

  const loading = !hydrated || isLoading;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <CatalogBreadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Panier" }]} />

        <h1 className="mt-4 text-3xl sm:text-4xl">Votre panier</h1>
        {!loading && !isError ? (
          <p className="mt-1 text-sm text-foreground-muted" aria-live="polite">
            {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""}
          </p>
        ) : null}

        {isError ? (
          <CartErrorState onRetry={() => void refetch()} />
        ) : loading ? (
          <div className="mt-8">
            <CartSkeleton lines={3} />
          </div>
        ) : cart.lineCount === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <ul className="divide-y divide-border border-y border-border">
                {cart.items.map((item) => (
                  <li key={item.lineId}>
                    <CartItem
                      item={item}
                      busy={busy}
                      onQuantityChange={(quantity) =>
                        updateItem.mutate({ lineId: item.lineId, quantity })
                      }
                      onRemove={() => removeItem.mutate(item.lineId)}
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <AppLink
                  href="/rideaux"
                  className="flex min-h-[44px] items-center text-sm underline underline-offset-4 hover:text-accent-dark"
                >
                  Continuer mes achats
                </AppLink>
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  disabled={busy}
                  className="flex min-h-[44px] items-center rounded-sm border border-border px-4 text-sm hover:bg-surface-muted disabled:opacity-40"
                >
                  Vider le panier
                </button>
              </div>
            </div>

            <div className="space-y-3 lg:sticky lg:top-28 lg:self-start">
              <CartSummary cart={cart} />
              {features.checkout ? (
                cart.hasUnavailableItems ? (
                  <p className="rounded-sm border border-border bg-surface-muted p-3 text-xs text-foreground-muted">
                    Retirez les articles indisponibles pour passer commande.
                  </p>
                ) : (
                  <AppLink
                    href="/commande"
                    className="flex min-h-[52px] items-center justify-center rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
                  >
                    Commander
                  </AppLink>
                )
              ) : null}
            </div>
          </div>
        )}
      </div>

      <ClearCartDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        busy={clearCart.isPending}
        onConfirm={() => {
          clearCart.mutate(undefined, { onSettled: () => setConfirmClear(false) });
        }}
      />
    </SiteLayout>
  );
}

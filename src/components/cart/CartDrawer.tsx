import { AppLink } from "@/components/ui/app-link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartDrawerItem } from "@/components/cart/CartDrawerItem";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartErrorState } from "@/components/cart/CartErrorState";
import { CartShippingProgress } from "@/components/cart/CartShippingProgress";
import { CartSkeleton } from "@/components/cart/CartSkeleton";
import { useCart } from "@/hooks/cart/useCart";
import { useCartDrawer } from "@/hooks/cart/useCartDrawer";
import {
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/hooks/cart/useCartMutations";
import { formatMoney } from "@/lib/money/money";

export function CartDrawer() {
  const { isOpen, setOpen, close } = useCartDrawer();
  const { cart, isLoading, isError, refetch, hydrated } = useCart();
  const updateItem = useUpdateCartItemMutation();
  const removeItem = useRemoveCartItemMutation();
  const busy = updateItem.isPending || removeItem.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle>Votre panier</SheetTitle>
          <SheetDescription>
            {cart.itemCount} article{cart.itemCount > 1 ? "s" : ""} dans votre panier.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isError ? (
            <CartErrorState onRetry={() => void refetch()} />
          ) : !hydrated || isLoading ? (
            <div className="py-4">
              <CartSkeleton lines={2} />
            </div>
          ) : cart.lineCount === 0 ? (
            <CartEmptyState onNavigate={close} />
          ) : (
            <ul className="divide-y divide-border" aria-live="polite">
              {cart.items.map((item) => (
                <li key={item.lineId}>
                  <CartDrawerItem
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
          )}
        </div>

        {cart.lineCount > 0 && !isError ? (
          <div className="space-y-3 border-t border-border px-4 py-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-foreground-muted">Sous-total estimé</span>
              <span className="text-base font-medium">
                {formatMoney(cart.totals.subtotalMinor)}
              </span>
            </div>
            <CartShippingProgress totals={cart.totals} />
            {features.checkout ? (
              <AppLink
                href="/commande"
                onClick={close}
                className="flex min-h-[48px] items-center justify-center rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
              >
                Commander
              </AppLink>
            ) : null}
            <AppLink
              href="/panier"
              onClick={close}
              className="flex min-h-[48px] items-center justify-center rounded-sm border border-border px-6 text-sm font-medium hover:bg-surface-muted"
            >
              Voir le panier
            </AppLink>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

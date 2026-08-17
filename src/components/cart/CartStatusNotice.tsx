import { AlertTriangle, Info } from "lucide-react";
import { CART_STATUS_MESSAGES } from "@/domain/cart/cart.constants";
import type { ResolvedCartItem } from "@/domain/cart/cart.types";

/** Message d'état d'une ligne : jamais transmis par la couleur seule. */
export function CartStatusNotice({ item }: { item: ResolvedCartItem }) {
  const message = CART_STATUS_MESSAGES[item.status];
  if (!message) return null;

  const critical = !item.canPurchase;
  const Icon = critical ? AlertTriangle : Info;

  return (
    <p
      className={`mt-2 flex items-start gap-1.5 text-xs ${
        critical ? "text-destructive" : "text-foreground-muted"
      }`}
    >
      <Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

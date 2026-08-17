import { CartItem } from "@/components/cart/CartItem";
import type { ResolvedCartItem } from "@/domain/cart/cart.types";

export function CartDrawerItem(props: {
  item: ResolvedCartItem;
  busy?: boolean;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}) {
  return <CartItem {...props} compact />;
}

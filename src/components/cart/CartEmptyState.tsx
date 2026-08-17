import { AppLink } from "@/components/ui/app-link";
import { CART_EMPTY_TEXT, CART_EMPTY_TITLE } from "@/domain/cart/cart.constants";

export function CartEmptyState({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <h2 className="text-xl">{CART_EMPTY_TITLE}</h2>
      <p className="max-w-sm text-sm text-foreground-muted">{CART_EMPTY_TEXT}</p>
      <div className="flex flex-col items-center gap-2">
        <AppLink
          href="/rideaux"
          onClick={onNavigate}
          className="flex min-h-[48px] items-center justify-center rounded-sm bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
        >
          Découvrir les rideaux
        </AppLink>
        <AppLink
          href="/nouveautes"
          onClick={onNavigate}
          className="text-sm text-foreground-muted underline underline-offset-4 hover:text-accent-dark"
        >
          Voir les nouveautés
        </AppLink>
      </div>
    </div>
  );
}

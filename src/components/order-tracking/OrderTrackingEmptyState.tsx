import { SearchX } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { ORDER_TRACKING_NOT_FOUND_MESSAGE } from "@/domain/order/order-tracking.constants";

export function OrderTrackingEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-4 rounded-sm border border-border bg-surface p-6 text-center">
      <SearchX className="mx-auto size-6 text-foreground-muted" aria-hidden />
      <h2 className="text-xl">Commande introuvable</h2>
      <p className="text-sm text-foreground-muted">{ORDER_TRACKING_NOT_FOUND_MESSAGE}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] rounded-sm border border-border px-5 text-sm hover:bg-surface-muted"
        >
          Corriger les informations
        </button>
        <AppLink
          href="/rideaux"
          className="flex min-h-[44px] items-center rounded-sm bg-accent px-5 text-sm text-accent-foreground hover:bg-accent-dark"
        >
          Continuer mes achats
        </AppLink>
      </div>
    </div>
  );
}

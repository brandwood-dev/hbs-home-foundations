import { AlertTriangle } from "lucide-react";
import { ORDER_TRACKING_TECHNICAL_ERROR } from "@/domain/order/order-tracking.errors";

export function OrderTrackingErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-4 rounded-sm border border-destructive/50 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="mx-auto size-6 text-destructive" aria-hidden />
      <h2 className="text-xl">Impossible de consulter le suivi</h2>
      <p className="text-sm text-foreground-muted">{ORDER_TRACKING_TECHNICAL_ERROR}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-[44px] rounded-sm border border-border px-5 text-sm hover:bg-surface-muted"
      >
        Réessayer
      </button>
    </div>
  );
}

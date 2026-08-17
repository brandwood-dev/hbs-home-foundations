import { AlertTriangle, PackageCheck } from "lucide-react";
import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";
import { ORDER_TRACKING_CANCELLED_NOTICE } from "@/domain/order/order-tracking.constants";
import { storeConfig } from "@/config/store.config";

export function OrderTrackingStatus({ result }: { result: OrderTrackingResult }) {
  const cancelled = result.status === "cancelled";

  return (
    <div
      className={[
        "flex gap-3 rounded-sm border p-4",
        cancelled ? "border-destructive/50 bg-destructive/5" : "border-border bg-surface",
      ].join(" ")}
    >
      {cancelled ? (
        <AlertTriangle className="mt-0.5 size-5 text-destructive" aria-hidden />
      ) : (
        <PackageCheck className="mt-0.5 size-5 text-accent-dark" aria-hidden />
      )}
      <div className="space-y-1 text-sm">
        <p className="font-medium">{result.statusLabel}</p>
        <p className="text-foreground-muted">{result.statusDescription}</p>
        {cancelled ? (
          <p className="text-foreground-muted">
            {ORDER_TRACKING_CANCELLED_NOTICE}
            {storeConfig.customerServicePhone ? ` (${storeConfig.customerServicePhone})` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";

export function OrderTrackingNextSteps({ result }: { result: OrderTrackingResult }) {
  return (
    <section
      aria-labelledby="tracking-next"
      className="space-y-1 rounded-sm border border-border bg-surface-muted p-4"
    >
      <h2 id="tracking-next" className="text-base font-medium">
        Prochaine étape
      </h2>
      <p className="text-sm text-foreground-muted">{result.nextStepDescription}</p>
    </section>
  );
}

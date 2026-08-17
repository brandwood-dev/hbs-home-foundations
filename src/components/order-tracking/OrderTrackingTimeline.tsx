import { Check, Circle, Clock, XCircle } from "lucide-react";
import type { OrderTrackingStep } from "@/domain/order/order-tracking.types";

const STATE_TEXT: Record<OrderTrackingStep["state"], string> = {
  completed: "Étape terminée",
  current: "Étape en cours",
  upcoming: "Étape à venir",
  cancelled: "Étape non réalisée",
};

function StepIcon({ state }: { state: OrderTrackingStep["state"] }) {
  if (state === "completed") return <Check className="size-4" aria-hidden />;
  if (state === "current") return <Clock className="size-4" aria-hidden />;
  if (state === "cancelled") return <XCircle className="size-4" aria-hidden />;
  return <Circle className="size-3" aria-hidden />;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-TN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderTrackingTimeline({ steps }: { steps: OrderTrackingStep[] }) {
  const visible = steps.filter((step) => step.state !== "cancelled");

  return (
    <section aria-labelledby="tracking-timeline" className="space-y-4">
      <h2 id="tracking-timeline" className="text-xl">
        Suivi de la commande
      </h2>
      <ol className="space-y-4">
        {visible.map((step) => (
          <li key={step.key} className="flex gap-3">
            <span
              className={[
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
                step.state === "completed"
                  ? "border-accent bg-accent text-accent-foreground"
                  : step.state === "current"
                    ? "border-accent text-accent-dark"
                    : "border-border text-foreground-muted",
              ].join(" ")}
            >
              <StepIcon state={step.state} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {step.label}{" "}
                <span className="text-xs font-normal text-foreground-muted">
                  — {STATE_TEXT[step.state]}
                </span>
              </p>
              <p className="text-xs text-foreground-muted">{step.description}</p>
              {step.completedAt ? (
                <p className="mt-1 text-xs text-foreground-muted">
                  Le {formatDate(step.completedAt)}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

import { Sparkles } from "lucide-react";
import { dataProvider } from "@/config/features.config";
import { DEMO_TRACKING_SHOWCASE } from "@/fixtures/order-tracking.fixture";

export interface DemoOrderTrackingHelperProps {
  onFill: (values: { orderNumber: string; phone: string }) => void;
}

/** Visible uniquement en mode mock : disparaîtra automatiquement avec l'API. */
export function DemoOrderTrackingHelper({ onFill }: DemoOrderTrackingHelperProps) {
  if (dataProvider !== "mock") return null;

  return (
    <div className="rounded-sm border border-dashed border-border bg-surface-muted p-3 text-xs text-foreground-muted">
      <p className="flex items-center gap-2 font-medium text-foreground">
        <Sparkles className="size-4" aria-hidden />
        Tester le suivi avec une commande de démonstration
      </p>
      <button
        type="button"
        onClick={() => onFill({ ...DEMO_TRACKING_SHOWCASE })}
        className="mt-2 inline-flex min-h-[44px] items-center rounded-sm border border-border bg-background px-4 text-xs hover:bg-surface"
      >
        Remplir avec une commande de démonstration
      </button>
    </div>
  );
}

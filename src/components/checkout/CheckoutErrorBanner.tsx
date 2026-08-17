import { AlertTriangle } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { getOrderErrorDetails, getOrderErrorMessage } from "@/domain/order/order.errors";

export function CheckoutErrorBanner({ error }: { error: unknown }) {
  if (!error) return null;
  const details = getOrderErrorDetails(error);

  return (
    <div
      role="alert"
      className="flex gap-3 rounded-sm border border-destructive/40 bg-destructive/5 p-4 text-sm"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="space-y-2">
        <p className="font-medium">{getOrderErrorMessage(error)}</p>
        {details.length > 0 ? (
          <ul className="list-disc space-y-1 pl-4 text-xs text-foreground-muted">
            {details.map((detail) => (
              <li key={`${detail.lineId ?? detail.message}`}>{detail.message}</li>
            ))}
          </ul>
        ) : null}
        <AppLink href="/panier" className="inline-block text-xs underline underline-offset-4">
          Revenir au panier
        </AppLink>
      </div>
    </div>
  );
}

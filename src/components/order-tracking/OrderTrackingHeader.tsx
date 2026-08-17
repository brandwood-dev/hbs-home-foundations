import type { OrderTrackingResult } from "@/domain/order/order-tracking.types";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-TN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderTrackingHeader({ result }: { result: OrderTrackingResult }) {
  const updated = result.updatedAt !== result.createdAt;

  return (
    <header className="space-y-2">
      <h2 className="text-2xl sm:text-3xl">Commande {result.orderNumber}</h2>
      <p className="inline-flex items-center rounded-full border border-border bg-surface-muted px-3 py-1 text-xs">
        {result.statusLabel}
      </p>
      <p className="text-sm text-foreground-muted">
        Commandée le {formatDate(result.createdAt)}
        {updated ? ` · Mise à jour le ${formatDate(result.updatedAt)}` : ""}
      </p>
      {result.customerFirstName ? (
        <p className="text-sm">
          Bonjour {result.customerFirstName}, voici l'état actuel de votre commande.
        </p>
      ) : null}
    </header>
  );
}

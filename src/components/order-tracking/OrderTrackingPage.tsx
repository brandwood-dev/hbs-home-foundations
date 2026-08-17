import { useEffect, useRef } from "react";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { OrderTrackingEmptyState } from "@/components/order-tracking/OrderTrackingEmptyState";
import { OrderTrackingErrorState } from "@/components/order-tracking/OrderTrackingErrorState";
import { OrderTrackingForm } from "@/components/order-tracking/OrderTrackingForm";
import { OrderTrackingResultView } from "@/components/order-tracking/OrderTrackingResult";
import { OrderTrackingSkeleton } from "@/components/order-tracking/OrderTrackingSkeleton";
import { OrderTrackingError } from "@/domain/order/order-tracking.errors";
import { useLastOrderNumber } from "@/hooks/order/useLastOrderNumber";
import { useTrackOrder } from "@/hooks/order/useTrackOrder";

export function OrderTrackingPage() {
  const { orderNumber: lastOrderNumber } = useLastOrderNumber();
  const mutation = useTrackOrder();
  const resultRef = useRef<HTMLDivElement>(null);

  const notFound = mutation.isError && mutation.error instanceof OrderTrackingError;
  const technicalError = mutation.isError && !notFound;

  useEffect(() => {
    if (mutation.isSuccess || mutation.isError) resultRef.current?.focus();
  }, [mutation.isSuccess, mutation.isError]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      <CatalogBreadcrumbs
        items={[{ label: "Accueil", href: "/" }, { label: "Suivi de commande" }]}
      />

      <header className="mt-6 space-y-3">
        <h1 className="text-3xl sm:text-4xl">Suivre ma commande</h1>
        <p className="text-sm text-foreground-muted">
          Saisissez votre numéro de commande et le téléphone utilisé lors de l'achat pour consulter
          son état.
        </p>
        <p className="text-xs text-foreground-muted">
          Votre numéro de commande figure sur la page de confirmation de votre achat.
        </p>
      </header>

      <div className="mt-8">
        <OrderTrackingForm
          {...(lastOrderNumber ? { defaultOrderNumber: lastOrderNumber } : {})}
          isPending={mutation.isPending}
          onSubmit={(values) => {
            mutation.reset();
            mutation.mutate(values);
          }}
        />
      </div>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="mt-10 outline-none">
        {mutation.isPending ? <OrderTrackingSkeleton /> : null}
        {!mutation.isPending && notFound ? (
          <OrderTrackingEmptyState onRetry={() => mutation.reset()} />
        ) : null}
        {!mutation.isPending && technicalError ? (
          <OrderTrackingErrorState onRetry={() => mutation.reset()} />
        ) : null}
        {!mutation.isPending && mutation.isSuccess && mutation.data ? (
          <OrderTrackingResultView result={mutation.data} />
        ) : null}
      </div>
    </div>
  );
}

import { CheckCircle2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CartSkeleton } from "@/components/cart/CartSkeleton";
import { OrderItemsRecap } from "@/components/order/OrderItemsRecap";
import { OrderSummaryCard } from "@/components/order/OrderSummaryCard";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";
import { ORDER_CONFIRMATION_NEXT_STEPS, ORDER_DEMO_NOTICE } from "@/domain/order/order.constants";
import { useLastOrder } from "@/hooks/order/useLastOrder";

const title = "Commande confirmée — HBS HOME";
const description = "Merci pour votre commande HBS HOME. Voici le récapitulatif de votre achat.";

export const Route = createFileRoute("/commande/confirmation")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { order, isLoading, hydrated } = useLastOrder();
  const loading = !hydrated || isLoading;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
        <CatalogBreadcrumbs
          items={[{ label: "Accueil", href: "/" }, { label: "Confirmation de commande" }]}
        />

        {loading ? (
          <div className="mt-8">
            <CartSkeleton lines={2} />
          </div>
        ) : !order ? (
          <section className="mt-8 space-y-4 text-center">
            <h1 className="text-3xl sm:text-4xl">Aucune commande à afficher</h1>
            <p className="text-sm text-foreground-muted">
              Cette page affiche la confirmation juste après la validation d'une commande.
            </p>
            <AppLink
              href="/rideaux"
              className="inline-flex min-h-[48px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark"
            >
              Découvrir nos rideaux
            </AppLink>
          </section>
        ) : (
          <div className="mt-6 space-y-10">
            <header className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-accent-dark">
                <CheckCircle2 className="size-5" aria-hidden />
                Commande enregistrée
              </p>
              <h1 className="text-3xl sm:text-4xl">Merci {order.customer.firstName} !</h1>
              <p className="text-sm text-foreground-muted" aria-live="polite">
                Votre numéro de commande est{" "}
                <span className="font-medium text-foreground">{order.orderNumber}</span>. Nous vous
                appelons rapidement au {order.customer.phone} pour confirmer.
              </p>
            </header>

            <OrderSummaryCard order={order} />

            <section aria-labelledby="order-next" className="space-y-3">
              <h2 id="order-next" className="text-xl">
                Prochaines étapes
              </h2>
              <ol className="space-y-2 text-sm text-foreground-muted">
                {ORDER_CONFIRMATION_NEXT_STEPS.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs text-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            <OrderItemsRecap order={order} />

            <div className="flex flex-wrap gap-3">
              <AppLink
                href="/rideaux"
                className="flex min-h-[48px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark"
              >
                Continuer mes achats
              </AppLink>
              <AppLink
                href="/contact"
                className="flex min-h-[48px] items-center rounded-sm border border-border px-6 text-sm hover:bg-surface-muted"
              >
                Contacter le service client
              </AppLink>
            </div>

            <p className="text-xs text-foreground-muted">{ORDER_DEMO_NOTICE}</p>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

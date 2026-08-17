import { createFileRoute } from "@tanstack/react-router";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CartEmptyState } from "@/components/cart/CartEmptyState";
import { CartErrorState } from "@/components/cart/CartErrorState";
import { CartSkeleton } from "@/components/cart/CartSkeleton";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useCart } from "@/hooks/cart/useCart";

const title = "Commande — HBS HOME";
const description =
  "Finalisez votre commande HBS HOME : livraison partout en Tunisie et paiement à la livraison.";

export const Route = createFileRoute("/commande/")({
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
  component: CommandePage,
});

function CommandePage() {
  const { cart, isLoading, isError, refetch, hydrated } = useCart();
  const loading = !hydrated || isLoading;
  const purchasable = cart.items.filter((item) => item.canPurchase);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <CatalogBreadcrumbs
          items={[{ label: "Accueil", href: "/" }, { label: "Panier", href: "/panier" }, { label: "Commande" }]}
        />

        <h1 className="mt-4 text-3xl sm:text-4xl">Finaliser ma commande</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Commande sans création de compte. Paiement à la livraison.
        </p>

        {isError ? (
          <CartErrorState onRetry={() => void refetch()} />
        ) : loading ? (
          <div className="mt-8">
            <CartSkeleton lines={3} />
          </div>
        ) : purchasable.length === 0 ? (
          <CartEmptyState />
        ) : (
          <CheckoutForm cart={cart} />
        )}
      </div>
    </SiteLayout>
  );
}

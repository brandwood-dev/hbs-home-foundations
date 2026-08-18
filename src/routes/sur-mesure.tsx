import { createFileRoute } from "@tanstack/react-router";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { CustomQuoteForm } from "@/components/custom-quote/CustomQuoteForm";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AppLink } from "@/components/ui/app-link";

const title = "Rideaux et stores sur mesure en Tunisie | HBS HOME";
const description =
  "Confection sur mesure de rideaux, voilages et stores : envoyez vos dimensions et recevez une proposition de notre atelier sous 48 heures.";

export const Route = createFileRoute("/sur-mesure")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurMesurePage,
});

const STEPS = [
  {
    title: "Vous envoyez vos mesures",
    text: "Décrivez chaque ouverture et vos préférences de finition en quelques minutes.",
  },
  {
    title: "Nous étudions votre projet",
    text: "Notre atelier vérifie la faisabilité, les métrages et les contraintes de pose.",
  },
  {
    title: "Vous recevez une proposition",
    text: "Une estimation détaillée vous est transmise sous 48 heures ouvrées.",
  },
];

function SurMesurePage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:pt-10">
        <CatalogBreadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Sur mesure" }]} />

        <header className="mt-6">
          <p className="eyebrow">Atelier HBS HOME</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Sur mesure</h1>
          <p className="mt-3 max-w-2xl text-foreground-muted">
            Fenêtres hors normes, baies très larges, hauteurs sous plafond inhabituelles : nous
            confectionnons vos rideaux, voilages et stores aux dimensions exactes de votre
            intérieur.
          </p>
          <p className="mt-3 text-sm">
            Vous ne connaissez pas encore vos mesures ?{" "}
            <AppLink href="/guide-des-mesures" className="underline hover:text-accent-dark">
              Passez d'abord par le guide des mesures
            </AppLink>
            .
          </p>
        </header>

        <ol className="mt-10 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-md bg-surface-muted p-4">
              <p className="eyebrow">Étape {index + 1}</p>
              <h2 className="mt-1 text-lg leading-snug">{step.title}</h2>
              <p className="mt-1 text-sm text-foreground-muted">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12">
          <CustomQuoteForm />
        </div>
      </div>
    </SiteLayout>
  );
}

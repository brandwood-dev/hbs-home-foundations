import { createFileRoute } from "@tanstack/react-router";
import { CatalogBreadcrumbs } from "@/components/catalog/CatalogBreadcrumbs";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProfessionalLeadForm } from "@/components/professional/ProfessionalLeadForm";

const title = "Offre professionnels et projets B2B | HBS HOME";
const description =
  "Hôtels, bureaux, architectes et décorateurs : équipements textiles en volume, tarifs dédiés et accompagnement projet partout en Tunisie.";

export const Route = createFileRoute("/professionnels")({
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
  component: ProfessionnelsPage,
});

const BENEFITS = [
  {
    title: "Tarifs dégressifs",
    text: "Des conditions adaptées aux volumes, du petit bureau à la rénovation hôtelière complète.",
  },
  {
    title: "Interlocuteur dédié",
    text: "Un contact unique du chiffrage à la livraison, avec un planning partagé.",
  },
  {
    title: "Confection sur mesure",
    text: "Dimensions exactes, finitions techniques et exigences d'occultation ou d'entretien.",
  },
  {
    title: "Livraison coordonnée",
    text: "Expéditions groupées par site, partout en Tunisie, selon vos dates de chantier.",
  },
];

function ProfessionnelsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:pt-10">
        <CatalogBreadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Professionnels" }]} />

        <header className="mt-6">
          <p className="eyebrow">Offre B2B</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Professionnels</h1>
          <p className="mt-3 max-w-2xl text-foreground-muted">
            Nous accompagnons les hôtels, restaurants, bureaux, architectes et décorateurs sur leurs
            projets d'habillage de fenêtres, du chiffrage à la pose.
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <article key={benefit.title} className="rounded-md bg-surface-muted p-5">
              <h2 className="text-lg leading-snug">{benefit.title}</h2>
              <p className="mt-1.5 text-sm text-foreground-muted">{benefit.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="text-2xl">Parlons de votre projet</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            Décrivez votre besoin : nous revenons vers vous sous 48 heures ouvrées avec une première
            estimation.
          </p>
          <div className="mt-6">
            <ProfessionalLeadForm />
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

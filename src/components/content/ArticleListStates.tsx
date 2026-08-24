import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";

export function ArticleListError({ error }: { error: Error }) {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="eyebrow">HBS HOME</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Magazine momentanément indisponible</h1>
        <p className="mt-4 text-foreground-muted">{error.message}</p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-sm bg-accent px-6 text-sm text-accent-foreground hover:bg-accent-dark"
        >
          Retour à l'accueil
        </Link>
      </section>
    </SiteLayout>
  );
}

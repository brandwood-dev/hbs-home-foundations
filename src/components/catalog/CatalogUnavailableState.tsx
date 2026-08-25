import { FolderX } from "lucide-react";

interface CatalogUnavailableStateProps {
  categoryName: string;
}

/**
 * Shown when the API is configured but the requested category is not
 * published. We deliberately do not fall back to fixture products in this
 * situation: staging and production must never present catalogue data that
 * an Admin has not published.
 */
export function CatalogUnavailableState({ categoryName }: CatalogUnavailableStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center"
    >
      <FolderX className="h-8 w-8 text-taupe" aria-hidden="true" />
      <h1 className="mt-4 text-2xl">Cette catégorie n’est pas disponible</h1>
      <p className="mt-2 max-w-md text-sm text-foreground-muted">
        « {categoryName} » n’est pas encore publiée dans le catalogue. Revenez bientôt ou découvrez
        les catégories disponibles.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
      >
        Retour à l’accueil
      </a>
    </div>
  );
}

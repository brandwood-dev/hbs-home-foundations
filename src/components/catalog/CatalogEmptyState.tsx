import { SearchX } from "lucide-react";

interface CatalogEmptyStateProps {
  onReset: () => void;
}

export function CatalogEmptyState({ onReset }: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center">
      <SearchX className="h-8 w-8 text-taupe" aria-hidden="true" />
      <h2 className="mt-4 text-2xl">Aucun produit ne correspond à ces filtres</h2>
      <p className="mt-2 max-w-md text-sm text-foreground-muted">
        Essayez d'élargir votre sélection : retirez une couleur, une dimension ou augmentez la
        fourchette de prix.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 min-h-11 rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}

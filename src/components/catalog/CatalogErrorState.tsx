import { AlertTriangle } from "lucide-react";

interface CatalogErrorStateProps {
  onRetry: () => void;
}

export function CatalogErrorState({ onRetry }: CatalogErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center rounded-md border border-error/30 bg-surface px-6 py-16 text-center"
    >
      <AlertTriangle className="h-8 w-8 text-error" aria-hidden="true" />
      <h2 className="mt-4 text-2xl">Le catalogue est momentanément indisponible</h2>
      <p className="mt-2 max-w-md text-sm text-foreground-muted">
        Vérifiez votre connexion puis réessayez. Vos filtres seront conservés.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 min-h-11 rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
      >
        Réessayer
      </button>
    </div>
  );
}

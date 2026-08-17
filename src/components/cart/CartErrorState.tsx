import { AlertTriangle } from "lucide-react";

export function CartErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <h2 className="text-lg">Impossible de charger votre panier</h2>
      <p className="max-w-sm text-sm text-foreground-muted">
        Une erreur est survenue pendant la récupération de vos articles.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="flex min-h-[44px] items-center justify-center rounded-sm border border-border px-5 text-sm font-medium hover:bg-surface-muted"
      >
        Réessayer
      </button>
    </div>
  );
}

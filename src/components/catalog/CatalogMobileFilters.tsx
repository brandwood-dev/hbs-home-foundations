import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface CatalogMobileFiltersProps {
  open: boolean;
  total: number;
  onClose: () => void;
  onReset: () => void;
  children: ReactNode;
}

export function CatalogMobileFilters({
  open,
  total,
  onClose,
  onReset,
  children,
}: CatalogMobileFiltersProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Fermer les filtres"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filtres"
        className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg">Filtres</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer les filtres"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">{children}</div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 flex-1 rounded-md border border-border text-sm"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-md bg-accent text-sm font-medium text-accent-foreground"
          >
            Voir {total} produit{total > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

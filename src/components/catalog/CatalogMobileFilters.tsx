import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

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
  const [rendered, setRendered] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({
    active: open,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    const timeout = window.setTimeout(() => setRendered(false), 240);
    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!rendered) return null;

  const closing = !open;

  return (
    <div
      className={`catalog-filter-shell fixed inset-0 z-50 lg:hidden${closing ? " catalog-filter-closing" : ""}`}
    >
      <button
        type="button"
        aria-label="Fermer les filtres"
        onClick={onClose}
        className={`catalog-filter-backdrop absolute inset-0 bg-foreground/30${closing ? " catalog-filter-closing" : ""}`}
      />
      <div
        ref={panelRef}
        id="catalog-mobile-filters-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-mobile-filters-title"
        tabIndex={-1}
        className={`catalog-filter-panel absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface outline-none${closing ? " catalog-filter-closing" : ""}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="catalog-mobile-filters-title" className="text-lg">
            Filtres
          </h2>
          <button
            type="button"
            ref={closeButtonRef}
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
            className="min-h-11 flex-1 rounded-md border border-border text-sm transition-colors hover:bg-surface-muted"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 rounded-md bg-accent text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
          >
            Voir {total} produit{total > 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

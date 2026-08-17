import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageList } from "@/services/catalog/catalog.pagination";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const baseButton =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null;
  const pages = buildPageList(page, totalPages);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <button
        type="button"
        className={baseButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-1 text-foreground-muted">
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-current={entry === page ? "page" : undefined}
            className={`${baseButton} ${
              entry === page
                ? "border-accent bg-accent text-accent-foreground"
                : "hover:border-accent hover:text-accent-dark"
            }`}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        className={baseButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Page suivante"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

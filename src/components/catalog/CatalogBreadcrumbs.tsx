import { ChevronRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";

export interface Crumb {
  label: string;
  href?: string;
}

export function CatalogBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-xs text-foreground-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <AppLink href={item.href} className="hover:text-accent-dark">
                  {item.label}
                </AppLink>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="text-foreground">
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

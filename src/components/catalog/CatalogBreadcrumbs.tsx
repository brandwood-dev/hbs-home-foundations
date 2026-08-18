import { ChevronRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";

export interface Crumb {
  label: string;
  href?: string;
}

export function CatalogBreadcrumbs({ items }: { items: Crumb[] }) {
  // Une page d'index porte le même libellé que son univers : on évite le doublon.
  const crumbs = items.filter((item, index) => item.label !== items[index - 1]?.label);

  return (
    <nav aria-label="Fil d'Ariane" className="text-xs text-foreground-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
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

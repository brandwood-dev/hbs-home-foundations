import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";

export interface Crumb {
  label: string;
  href?: string;
}

export function AdminBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
    >
      <AppLink href="/admin" className="hover:text-foreground">
        Admin
      </AppLink>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <ChevronRight className="size-3" aria-hidden />
          {item.href ? (
            <AppLink href={item.href} className="hover:text-foreground">
              {item.label}
            </AppLink>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 space-y-2">
      {breadcrumbs ? <AdminBreadcrumbs items={breadcrumbs} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

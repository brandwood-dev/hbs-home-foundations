import { AppLink } from "@/components/ui/app-link";
import type { MegaMenuColumn } from "@/types/navigation.types";

interface DesktopMegaMenuProps {
  columns: MegaMenuColumn[];
  onNavigate?: () => void;
}

export function DesktopMegaMenu({ columns, onNavigate }: DesktopMegaMenuProps) {
  return (
    <div className="absolute left-0 right-0 top-full z-40 border-b border-border bg-surface shadow-soft">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-10 px-6 py-10">
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="eyebrow mb-4">{column.title}</h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <AppLink
                    href={link.href}
                    onClick={onNavigate}
                    className="text-sm text-foreground-muted transition-colors hover:text-accent-dark"
                  >
                    {link.label}
                  </AppLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

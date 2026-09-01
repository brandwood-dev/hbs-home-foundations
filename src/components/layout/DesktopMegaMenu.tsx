import { AppLink } from "@/components/ui/app-link";
import type { MegaMenuColumn, NavMenuShortcut } from "@/types/navigation.types";

interface DesktopMegaMenuProps {
  columns: MegaMenuColumn[];
  shortcuts?: NavMenuShortcut[] | undefined;
  onNavigate?: () => void;
}

export function DesktopMegaMenu({ columns, shortcuts = [], onNavigate }: DesktopMegaMenuProps) {
  const hasShortcuts = shortcuts.length > 0;

  return (
    <div className="absolute left-0 right-0 top-full z-40 border-b border-border bg-surface shadow-soft">
      <div
        className={`mx-auto grid max-w-7xl gap-8 px-6 py-8 ${
          hasShortcuts ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.78fr)]" : ""
        }`}
      >
        <div
          className={`grid gap-x-8 gap-y-7 ${
            columns.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""
          }`}
        >
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

        {hasShortcuts ? (
          <div className="grid grid-cols-2 gap-4 border-l border-border pl-8">
            {shortcuts.slice(0, 2).map((shortcut) => (
              <AppLink
                key={shortcut.href}
                href={shortcut.href}
                onClick={onNavigate}
                className="group relative overflow-hidden rounded-md border border-border bg-surface-muted"
              >
                <img
                  src={shortcut.imageUrl}
                  alt={shortcut.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-2 bottom-2 rounded-sm bg-surface/95 px-2 py-2 text-center text-xs font-medium text-foreground shadow-sm transition-colors group-hover:text-accent-dark">
                  {shortcut.label}
                </span>
              </AppLink>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

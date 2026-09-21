import { AppLink } from "@/components/ui/app-link";
import type { MegaMenuColumn, NavMenuShortcut } from "@/types/navigation.types";

interface DesktopMegaMenuProps {
  columns: MegaMenuColumn[];
  shortcuts?: NavMenuShortcut[] | undefined;
  collectionHref?: string;
  collectionLabel?: string;
  onNavigate?: () => void;
}

export function DesktopMegaMenu({
  columns,
  shortcuts = [],
  collectionHref,
  collectionLabel = "Voir toute la collection",
  onNavigate,
}: DesktopMegaMenuProps) {
  const hasShortcuts = shortcuts.length > 0;
  const hasSingleShortcut = shortcuts.length === 1;

  return (
    <div className="absolute left-0 right-0 top-full z-40 bg-surface">
      <div
        className={`mx-auto grid max-w-7xl gap-8 px-6 py-6 ${
          hasShortcuts ? "lg:grid-cols-[minmax(0,0.78fr)_minmax(30rem,1.22fr)]" : ""
        }`}
      >
        <div className="px-1 py-1">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-1">Explorer la collection</p>
              <p className="text-sm text-foreground-muted">
                Trouvez rapidement le style adapté à votre intérieur.
              </p>
            </div>
            {collectionHref ? (
              <AppLink
                href={collectionHref}
                onClick={onNavigate}
                className="shrink-0 text-xs font-semibold text-accent-dark underline-offset-4 transition-colors hover:underline"
              >
                {collectionLabel}
              </AppLink>
            ) : null}
          </div>

          <div
            className={`grid gap-x-8 gap-y-6 ${columns.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}
          >
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="eyebrow mb-3">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <AppLink
                        href={link.href}
                        onClick={onNavigate}
                        className="group flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-accent-dark"
                      >
                        <span className="h-px w-0 bg-accent transition-all duration-200 group-hover:w-3" />
                        {link.label}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {hasShortcuts ? (
          <div className={hasSingleShortcut ? "flex items-start" : "grid gap-4 sm:grid-cols-2"}>
            {shortcuts.slice(0, 2).map((shortcut) => (
              <AppLink
                key={shortcut.href}
                href={shortcut.href}
                onClick={onNavigate}
                className={`group relative overflow-hidden ${
                  hasSingleShortcut ? "aspect-[4/3] w-full max-w-sm" : "aspect-[4/3]"
                }`}
              >
                <img
                  src={shortcut.imageUrl}
                  alt={shortcut.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full rounded-xl object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-3 left-1/2 w-max max-w-[90%] -translate-x-1/2 rounded-lg bg-surface/95 px-4 py-2.5 text-center text-sm font-medium text-foreground shadow-sm transition-colors group-hover:text-accent-dark">
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

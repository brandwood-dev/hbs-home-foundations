import { AppLink } from "@/components/ui/app-link";
import type { MegaMenuColumn, NavMenuShortcut } from "@/types/navigation.types";
import { getMegaMenuLinkLayout } from "./mega-menu-links";

interface DesktopMegaMenuProps {
  columns: MegaMenuColumn[];
  categoryHref: string;
  shortcuts?: NavMenuShortcut[] | undefined;
  sectionTitle?: string;
  editorialTitle?: string | undefined;
  editorialDescription?: string | undefined;
  onNavigate?: () => void;
}

const DEFAULT_EDITORIAL_TITLE = "Sublimez votre intérieur avec style.";
const DEFAULT_EDITORIAL_DESCRIPTION =
  "Des collections pensées pour apporter caractère, élégance et douceur à votre intérieur.";

function ShortcutFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-52 items-end bg-gradient-to-br from-sand via-surface-muted to-accent/20 p-5 sm:min-h-60">
      <span className="menu-editorial max-w-[14rem] text-2xl leading-tight text-accent-dark sm:text-3xl">
        {label}
      </span>
    </div>
  );
}

export function DesktopMegaMenu({
  columns,
  categoryHref,
  shortcuts = [],
  sectionTitle = "À découvrir",
  editorialTitle = DEFAULT_EDITORIAL_TITLE,
  editorialDescription = DEFAULT_EDITORIAL_DESCRIPTION,
  onNavigate,
}: DesktopMegaMenuProps) {
  const { links: visibleLinks, hasMore, useColumns } = getMegaMenuLinkLayout(columns);
  const visibleShortcuts = (
    shortcuts.length > 0
      ? shortcuts
      : visibleLinks.slice(0, 2).map((link) => ({
          label: link.label,
          href: link.href,
          imageUrl: "",
          imageAlt: link.label,
          caption: link.label,
        }))
  ).slice(0, 2);

  return (
    <div className="absolute left-0 right-0 top-full z-40 px-3 pb-3 sm:px-4 sm:pb-4 lg:px-6">
      <div className="menu-sans mx-auto grid max-h-[calc(100vh-10rem)] max-w-7xl items-start gap-7 overflow-y-auto rounded-2xl border border-border bg-surface px-4 py-5 shadow-soft sm:px-6 md:grid-cols-2 lg:grid-cols-[minmax(15rem,0.78fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] lg:gap-6 lg:px-8 lg:py-6">
        <aside className="flex min-w-0 flex-col px-1 py-1 md:col-span-2 lg:col-span-1 lg:border-r lg:border-border lg:pr-6">
          <p className="eyebrow mb-3">Explorer la collection</p>
          <h2 className="menu-editorial max-w-[18rem] text-[clamp(2rem,3vw,2.7rem)] leading-[0.98] font-medium tracking-[-0.02em] text-accent-dark">
            {editorialTitle}
          </h2>
          <div className="my-5 h-px w-12 bg-accent" aria-hidden="true" />
          <p className="max-w-[19rem] text-sm leading-6 text-foreground-muted">
            {editorialDescription}
          </p>

          <div className="mt-6 border-t border-border pt-5">
            <p className="eyebrow mb-3">{sectionTitle}</p>
            <ul
              className={
                useColumns ? "grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2" : "space-y-1"
              }
            >
              {visibleLinks.map((link) => (
                <li key={link.key}>
                  <AppLink
                    href={link.href}
                    onClick={onNavigate}
                    className="group flex min-h-8 items-center gap-2 text-sm leading-5 text-foreground-muted transition-colors hover:text-accent-dark focus-visible:text-accent-dark"
                  >
                    <span
                      className="h-px w-0 shrink-0 bg-accent transition-all duration-200 group-hover:w-3 group-focus-visible:w-3"
                      aria-hidden="true"
                    />
                    <span>{link.label}</span>
                  </AppLink>
                </li>
              ))}
            </ul>
            {hasMore ? (
              <AppLink
                href={categoryHref}
                onClick={onNavigate}
                className="mt-4 inline-flex min-h-8 items-center gap-2 text-sm font-medium text-accent-dark underline decoration-accent/60 underline-offset-4 transition-colors hover:decoration-accent focus-visible:decoration-accent"
              >
                <span>Voir tous les styles</span>
                <span aria-hidden="true" className="text-base leading-none">
                  →
                </span>
              </AppLink>
            ) : null}
          </div>
        </aside>

        {visibleShortcuts.map((shortcut) => {
          const hasImage = Boolean(shortcut.imageUrl.trim());
          return (
            <AppLink
              key={shortcut.href}
              href={shortcut.href}
              onClick={onNavigate}
              aria-label={`Découvrir ${shortcut.label}`}
              className="group min-w-0"
            >
              <div className="relative aspect-[1.42] min-h-52 overflow-hidden rounded-lg bg-surface-muted sm:min-h-60">
                {hasImage ? (
                  <img
                    src={shortcut.imageUrl}
                    alt={shortcut.imageAlt}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 30vw, 90vw"
                    className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  <ShortcutFallback label={shortcut.label} />
                )}
                <span className="absolute bottom-4 left-4 right-4 flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-md bg-surface/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors group-hover:text-accent-dark group-focus-visible:text-accent-dark">
                  <span className="truncate">{shortcut.label}</span>
                  <span aria-hidden="true" className="text-lg leading-none">
                    →
                  </span>
                </span>
              </div>
              <p className="eyebrow mt-3 truncate pl-1 text-[0.625rem] tracking-[0.2em]">
                {shortcut.caption ?? shortcut.label}
              </p>
            </AppLink>
          );
        })}
      </div>
    </div>
  );
}

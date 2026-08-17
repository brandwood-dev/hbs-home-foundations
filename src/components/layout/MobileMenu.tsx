import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { mainNavigation } from "@/fixtures/navigation.fixture";
import { storeConfig } from "@/config/store.config";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
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
        aria-label="Fermer le menu"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        tabIndex={-1}
        className="absolute inset-0 flex h-full w-full flex-col bg-surface"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-display text-xl tracking-wide">{storeConfig.brandName}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le menu"
            className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-surface-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <ul>
            {mainNavigation.map((item) => {
              const hasChildren = Boolean(item.megaMenu?.length);
              const isOpen = expanded === item.id;
              return (
                <li key={item.id} className="border-b border-border/70">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        className="flex min-h-[44px] w-full items-center justify-between px-3 py-3 text-left text-base"
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                      {isOpen && (
                        <div className="pb-3">
                          {item.megaMenu?.map((column) => (
                            <div key={column.title} className="px-3 pt-2">
                              <p className="eyebrow mb-1">{column.title}</p>
                              <ul>
                                {column.links.map((link) => (
                                  <li key={link.label}>
                                    <AppLink
                                      href={link.href}
                                      onClick={onClose}
                                      className="flex min-h-[44px] items-center text-sm text-foreground-muted"
                                    >
                                      {link.label}
                                    </AppLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <AppLink
                      href={item.href}
                      onClick={onClose}
                      className="flex min-h-[44px] items-center px-3 py-3 text-base"
                    >
                      {item.label}
                    </AppLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-4 text-sm text-foreground-muted">
          <AppLink
            href="/suivi-commande"
            onClick={onClose}
            className="flex min-h-[44px] items-center"
          >
            Suivi de commande
          </AppLink>
          <AppLink href="/contact" onClick={onClose} className="flex min-h-[44px] items-center">
            Contact
          </AppLink>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Package, Phone, X } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { storeConfig } from "@/config/store.config";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import type { NavItem } from "@/types/navigation.types";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  navigation: readonly NavItem[];
}

export function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hydrated = useIsHydrated();

  useFocusTrap({
    active: open && hydrated,
    containerRef: panelRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  useEffect(() => {
    if (!open || !hydrated) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, hydrated]);

  if (!open || !hydrated) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        type="button"
        aria-label="Fermer le menu"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/60"
      />
      <div
        ref={panelRef}
        id="mobile-navigation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-navigation-title"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex h-full w-[88%] max-w-sm flex-col bg-surface opacity-100 shadow-2xl outline-none"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <span id="mobile-navigation-title" className="font-display text-xl tracking-wide">
            {storeConfig.brandName}
          </span>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fermer le menu"
            className="flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-surface-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Navigation principale mobile"
          className="flex-1 overflow-y-auto overscroll-contain bg-surface px-2 py-2"
        >
          <ul>
            {navigation.map((item) => {
              const hasChildren = Boolean(item.megaMenu?.length);
              const isOpen = expanded === item.id;
              return (
                <li key={item.id} className="border-b border-border/70">
                  {hasChildren ? (
                    <>
                      <div className="flex items-stretch">
                        <AppLink
                          href={item.href}
                          onClick={onClose}
                          className="flex min-h-12 flex-1 items-center px-3 py-3 text-base font-medium text-foreground"
                        >
                          {item.label}
                        </AppLink>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Masquer" : "Afficher"} les sous-catégories ${item.label}`}
                          onClick={() => setExpanded(isOpen ? null : item.id)}
                          className="flex min-h-12 w-12 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-muted"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                      {isOpen && (
                        <div className="bg-surface-muted/60 pb-3">
                          {item.megaMenu?.map((column) => (
                            <div key={column.title} className="px-3 pt-2">
                              <p className="eyebrow mb-1">{column.title}</p>
                              <ul>
                                {column.links.map((link) => (
                                  <li key={link.label}>
                                    <AppLink
                                      href={link.href}
                                      onClick={onClose}
                                      className="flex min-h-11 items-center text-sm text-foreground-muted"
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
                      className="flex min-h-12 items-center px-3 py-3 text-base font-medium text-foreground"
                    >
                      {item.label}
                    </AppLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-foreground-muted">
          <AppLink
            href="/suivi-commande"
            onClick={onClose}
            className="flex min-h-11 items-center gap-2"
          >
            <Package className="h-4 w-4" aria-hidden="true" /> Suivi de commande
          </AppLink>
          <AppLink href="/contact" onClick={onClose} className="flex min-h-11 items-center gap-2">
            <Phone className="h-4 w-4" aria-hidden="true" /> Contact
          </AppLink>
        </div>
      </div>
    </div>,
    document.body,
  );
}

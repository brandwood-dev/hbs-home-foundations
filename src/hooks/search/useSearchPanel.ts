import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function openSearchPanel() {
  if (isOpen) return;
  isOpen = true;
  emit();
}

export function closeSearchPanel() {
  if (!isOpen) return;
  isOpen = false;
  emit();
}

/** État d'ouverture du panneau de recherche, partagé hors React. */
export function useSearchPanel() {
  const open = useSyncExternalStore(
    subscribe,
    () => isOpen,
    () => false,
  );
  return { isOpen: open, open: openSearchPanel, close: closeSearchPanel };
}

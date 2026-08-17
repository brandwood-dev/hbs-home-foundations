import { useSyncExternalStore } from "react";

/** État purement UI du drawer, hors TanStack Query. */
let open = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function openCartDrawer() {
  if (open) return;
  open = true;
  emit();
}

export function closeCartDrawer() {
  if (!open) return;
  open = false;
  emit();
}

export function useCartDrawer() {
  const isOpen = useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
  return {
    isOpen,
    open: openCartDrawer,
    close: closeCartDrawer,
    setOpen: (value: boolean) => (value ? openCartDrawer() : closeCartDrawer()),
  };
}

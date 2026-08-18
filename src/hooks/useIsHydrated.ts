import { useEffect, useState } from "react";

/** true une fois l'hydratation client terminée : évite tout mismatch SSR. */
export function useIsHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

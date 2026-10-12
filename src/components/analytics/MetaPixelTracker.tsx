import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { META_CONSENT_EVENT } from "@/lib/analytics/consent";
import { trackMetaPageView } from "@/lib/analytics/meta";

/** Loads Meta only after consent and emits PageView on client-side navigation. */
export function MetaPixelTracker() {
  const locationKey = useRouterState({
    // TanStack Router exposes `location.search` as a structured object during
    // SSR. Keep the selector primitive so the server render stays stable and
    // client-side navigation still emits a PageView for each pathname.
    select: (state) => state.location.pathname,
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
    trackMetaPageView();
  }, [locationKey]);

  useEffect(() => {
    const onConsent = () => trackMetaPageView();
    window.addEventListener(META_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(META_CONSENT_EVENT, onConsent);
  }, []);

  return null;
}

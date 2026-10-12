import { useState } from "react";
import { AppLink } from "@/components/ui/app-link";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { getMetaTrackingConsent, setMetaTrackingConsent } from "@/lib/analytics/consent";

/** Compact opt-in banner for the non-essential Meta measurement cookies. */
export function TrackingConsentBanner() {
  const hydrated = useIsHydrated();
  const [consent, setConsent] = useState(() => getMetaTrackingConsent());

  if (!hydrated || consent) return null;

  const decide = (value: "granted" | "denied") => {
    setMetaTrackingConsent(value);
    setConsent(value);
  };

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[180] rounded-lg border border-border bg-background/95 p-4 shadow-xl backdrop-blur sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-md"
      aria-label="Préférences de mesure d’audience"
    >
      <p className="text-sm font-medium text-foreground">Votre confidentialité compte</p>
      <p className="mt-1 text-xs leading-5 text-foreground-muted">
        Nous utilisons une mesure publicitaire non essentielle pour améliorer les campagnes et le
        parcours HBS HOME. Vous pouvez accepter ou refuser à tout moment.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => decide("granted")}
          className="min-h-10 rounded-sm bg-accent px-4 text-xs font-medium text-accent-foreground hover:bg-accent-dark"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => decide("denied")}
          className="min-h-10 rounded-sm border border-border px-4 text-xs font-medium hover:bg-surface-muted"
        >
          Refuser
        </button>
        <AppLink href="/cookies" className="text-xs text-foreground-muted underline">
          En savoir plus
        </AppLink>
      </div>
    </aside>
  );
}

/**
 * Abstraction analytics — aucun pixel ni identifiant réel n'est connecté.
 * Le futur provider (GA4, Meta…) sera branché ici uniquement.
 */
export type AnalyticsEventName =
  | "view_item_list"
  | "select_item"
  | "generate_lead"
  | "newsletter_subscribe"
  | "search"
  | "search_suggestion_click"
  | "search_no_result"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "view_wishlist"
  | "select_search_result";

export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

/** Aucune donnée personnelle ne doit être transmise. */
export function trackEvent(_name: AnalyticsEventName, _payload: AnalyticsPayload = {}): void {
  // Intentionnellement inerte tant qu'aucun provider n'est configuré.
}

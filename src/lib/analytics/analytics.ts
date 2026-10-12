import { META_CONFIG } from "@/config/meta.config";
import { hasMetaTrackingConsent } from "@/lib/analytics/consent";
import {
  createMetaEventId,
  sendMetaServerEvent,
  trackMetaBrowserEvent,
  trackMetaCustomBrowserEvent,
} from "@/lib/analytics/meta";
export type AnalyticsEventName =
  | "view_content"
  | "view_item_list"
  | "select_item"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "generate_lead"
  | "newsletter_subscribe"
  | "search"
  | "search_suggestion_click"
  | "search_no_result"
  | "add_to_wishlist"
  | "remove_from_wishlist"
  | "messenger_click"
  | "view_wishlist"
  | "select_search_result";

export type AnalyticsValue =
  | string
  | number
  | boolean
  | string[]
  | Array<Record<string, string | number | boolean>>
  | undefined;
export type AnalyticsPayload = Record<string, AnalyticsValue>;

const META_STANDARD_EVENTS: Partial<Record<AnalyticsEventName, string>> = {
  view_content: "ViewContent",
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  generate_lead: "Lead",
  newsletter_subscribe: "Lead",
  search: "Search",
  add_to_wishlist: "AddToWishlist",
};

const META_SERVER_EVENTS = new Set<AnalyticsEventName>([
  // Send product views through CAPI as well as the browser Pixel. The
  // server endpoint remains a no-op until its access token is configured.
  "view_content",
  "add_to_cart",
  "begin_checkout",
  "generate_lead",
  "newsletter_subscribe",
]);

function withoutEventId(payload: AnalyticsPayload): Record<string, unknown> {
  const { event_id: _eventId, ...customData } = payload;
  return {
    ...customData,
    site_id: META_CONFIG.siteId,
    catalog_id: META_CONFIG.catalogId,
  };
}

/** Aucune donnée personnelle ne doit être transmise. */
export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}): string {
  const eventId =
    typeof payload["event_id"] === "string" && payload["event_id"]
      ? payload["event_id"]
      : createMetaEventId(name);
  if (!hasMetaTrackingConsent()) return eventId;

  const customData = withoutEventId(payload);
  const metaEventName = META_STANDARD_EVENTS[name];
  if (metaEventName) {
    trackMetaBrowserEvent(metaEventName, customData, eventId);
  } else {
    trackMetaCustomBrowserEvent(name, customData, eventId);
  }

  if (META_SERVER_EVENTS.has(name)) {
    const eventSourceUrl = typeof window !== "undefined" ? window.location.href : undefined;
    void sendMetaServerEvent({
      eventName: metaEventName ?? name,
      eventId,
      ...(eventSourceUrl ? { eventSourceUrl } : {}),
      customData,
    });
  }

  return eventId;
}

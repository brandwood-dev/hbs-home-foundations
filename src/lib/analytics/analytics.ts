import { META_CONFIG } from "@/config/meta.config";
import { hasMetaTrackingConsent } from "@/lib/analytics/consent";
import {
  createMetaEventId,
  sendMetaServerEvent,
  trackMetaBrowserEvent,
  trackMetaCustomBrowserEvent,
} from "@/lib/analytics/meta";
import type { MetaServerEventInput } from "@/lib/analytics/meta";
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

const META_PURCHASE_EVENT_STORAGE_KEY = "hbs_meta_purchase_event_ids";
const sentPurchaseEventIds = new Set<string>();

function withoutEventId(payload: AnalyticsPayload): Record<string, unknown> {
  const { event_id: _eventId, ...customData } = payload;
  return {
    ...customData,
    site_id: META_CONFIG.siteId,
    catalog_id: META_CONFIG.catalogId,
  };
}

function wasPurchaseEventSent(eventId: string): boolean {
  if (sentPurchaseEventIds.has(eventId)) return true;
  if (typeof window === "undefined") return false;

  try {
    const stored = window.sessionStorage.getItem(META_PURCHASE_EVENT_STORAGE_KEY);
    const ids = stored ? (JSON.parse(stored) as unknown) : [];
    return Array.isArray(ids) && ids.includes(eventId);
  } catch {
    return false;
  }
}

function rememberPurchaseEvent(eventId: string): void {
  sentPurchaseEventIds.add(eventId);
  if (typeof window === "undefined") return;

  try {
    const stored = window.sessionStorage.getItem(META_PURCHASE_EVENT_STORAGE_KEY);
    const ids = stored ? (JSON.parse(stored) as unknown) : [];
    const nextIds = Array.isArray(ids)
      ? [...ids.filter((value): value is string => typeof value === "string"), eventId].slice(-50)
      : [eventId];
    window.sessionStorage.setItem(META_PURCHASE_EVENT_STORAGE_KEY, JSON.stringify(nextIds));
  } catch {
    // Storage can be unavailable in privacy-restricted browsers. The in-memory
    // guard still protects duplicate submissions during the current session.
  }
}

/**
 * Send a Purchase once per order while keeping the browser and server events
 * tied to the exact same event_id for Meta deduplication.
 */
export function trackPurchase(
  payload: AnalyticsPayload = {},
  userData?: MetaServerEventInput["userData"],
): string {
  const eventId =
    typeof payload["event_id"] === "string" && payload["event_id"]
      ? payload["event_id"]
      : createMetaEventId("purchase");
  if (!hasMetaTrackingConsent()) return eventId;
  if (wasPurchaseEventSent(eventId)) return eventId;

  rememberPurchaseEvent(eventId);
  const customData = withoutEventId(payload);
  if (META_CONFIG.purchaseTransport !== "server") {
    trackMetaBrowserEvent("Purchase", customData, eventId);
  }

  if (META_CONFIG.purchaseTransport !== "browser") {
    const eventSourceUrl = typeof window !== "undefined" ? window.location.href : undefined;
    void sendMetaServerEvent({
      eventName: "Purchase",
      eventId,
      ...(eventSourceUrl ? { eventSourceUrl } : {}),
      ...(userData ? { userData } : {}),
      customData,
    });
  }

  return eventId;
}

/** Aucune donnée personnelle ne doit être transmise. */
export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}): string {
  if (name === "purchase") return trackPurchase(payload);

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

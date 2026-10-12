import { META_CONFIG } from "@/config/meta.config";
import { hasMetaTrackingConsent } from "@/lib/analytics/consent";

export type MetaCustomData = Record<string, unknown>;

export type MetaServerEventInput = {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  customData?: MetaCustomData;
  userData?: {
    email?: string;
    phone?: string;
    fbp?: string;
    fbc?: string;
  };
};

type Fbq = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  version?: string;
  queue?: unknown[][];
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let pixelInitialized = false;

export function createMetaEventId(prefix: string): string {
  const safePrefix = prefix.replace(/[^a-z0-9_-]/gi, "-").slice(0, 20) || "event";
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${safePrefix}-${random}`.slice(0, 100);
}

function ensureFbq(): Fbq | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;

  // Meta Pixel Helper (and some consent/tag managers) can define fbq before
  // the application bootstraps. Keep that queue instead of replacing it, but
  // do not mistake it for the official fbevents.js script: the helper's stub
  // otherwise prevents the real Pixel from ever loading.
  const existingFbq = typeof window.fbq === "function" ? window.fbq : null;
  let fbq = existingFbq;
  if (!fbq) {
    const stub = ((...args: unknown[]) => {
      stub.queue = stub.queue ?? [];
      stub.queue.push(args);
    }) as Fbq;
    stub.loaded = true;
    stub.version = "2.0";
    window.fbq = stub;
    window._fbq = stub;
    fbq = stub;
  }

  const officialPixelScript = document.querySelector(
    'script[src^="https://connect.facebook.net/en_US/fbevents.js"]',
  );
  if (!document.getElementById("hbs-meta-pixel-script") && !officialPixelScript) {
    const script = document.createElement("script");
    script.id = "hbs-meta-pixel-script";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  return fbq;
}

export function initializeMetaPixel(): boolean {
  if (!hasMetaTrackingConsent() || !META_CONFIG.pixelId) return false;
  const fbq = ensureFbq();
  if (!fbq) return false;
  if (!pixelInitialized) {
    fbq("init", META_CONFIG.pixelId);
    pixelInitialized = true;
  }
  return true;
}

export function trackMetaBrowserEvent(
  eventName: string,
  customData: MetaCustomData,
  eventId: string,
): boolean {
  if (!initializeMetaPixel()) return false;
  window.fbq?.("track", eventName, customData, { eventID: eventId });
  return true;
}

export function trackMetaCustomBrowserEvent(
  eventName: string,
  customData: MetaCustomData,
  eventId: string,
): boolean {
  if (!initializeMetaPixel()) return false;
  window.fbq?.("trackCustom", eventName, customData, { eventID: eventId });
  return true;
}

export function trackMetaPageView(): boolean {
  if (!initializeMetaPixel()) return false;
  window.fbq?.("track", "PageView");
  return true;
}

export function getMetaBrowserIdentifiers(): Pick<
  NonNullable<MetaServerEventInput["userData"]>,
  "fbp" | "fbc"
> {
  if (typeof document === "undefined") return {};
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  const get = (name: string) =>
    cookies.find((cookie) => cookie.startsWith(`${name}=`))?.slice(name.length + 1);
  const fbp = get("_fbp");
  const fbc = get("_fbc");
  return {
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
  };
}

export async function sendMetaServerEvent(input: MetaServerEventInput): Promise<boolean> {
  if (!hasMetaTrackingConsent() || typeof window === "undefined") return false;
  try {
    const response = await fetch("/api/meta/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...input,
        userData: {
          ...input.userData,
          ...getMetaBrowserIdentifiers(),
        },
      }),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

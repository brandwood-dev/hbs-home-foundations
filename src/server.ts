import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { getMarketingRuntimeEnv } from "./services/marketing/brevo";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type MarketingEnv = {
  BREVO_API_KEY?: string;
  BREVO_NEWSLETTER_LIST_ID?: string;
  BREVO_CLIENTS_LIST_ID?: string;
  BREVO_MESSAGING_LIST_ID?: string;
  META_PIXEL_ID?: string;
  META_CONVERSIONS_API_TOKEN?: string;
  META_CAPI_API_VERSION?: string;
  META_TEST_EVENT_CODE?: string;
};

type MarketingCustomer = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
};

type MarketingOrderPayload = {
  orderNumber: string;
  customer: MarketingCustomer;
  emailMarketingOptIn: boolean;
  messagingMarketingOptIn: boolean;
};

const MARKETING_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const META_EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{1,100}$/;
const META_EVENT_NAMES = new Set([
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Search",
  "AddToWishlist",
  "Lead",
]);

const META_CATALOG_FEED_PAGE_SIZE = 100;
const META_CATALOG_FEED_MAX_PAGES = 50;

function envString(env: unknown, key: keyof MarketingEnv): string {
  if (typeof env !== "object" || env === null) return "";
  const value = (env as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

function envListId(env: unknown, key: keyof MarketingEnv): number | null {
  const value = Number.parseInt(envString(env, key), 10);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function metaPixelId(env: unknown): string {
  return envString(env, "META_PIXEL_ID") || import.meta.env.VITE_META_PIXEL_ID?.trim() || "";
}

function catalogFeedApiBaseUrl(): string | null {
  const configured = import.meta.env.VITE_HBS_API_BASE_URL?.trim();
  if (!configured) return null;
  try {
    const base = new URL(configured);
    base.pathname = base.pathname
      .replace(/\/+$/, "")
      .replace(/\/api\/v1$/, "")
      .replace(/\/api$/, "");
    return base.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function csvCell(value: unknown): string {
  const text = typeof value === "string" ? value : value == null ? "" : String(value);
  return /[\t\r\n"]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function absoluteCatalogUrl(value: unknown, origin: string): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";
  try {
    const url = new URL(raw, origin);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function isCatalogPlaceholder(value: string): boolean {
  return /(?:^|\/)placeholder(?:\.[a-z0-9]+)?$/i.test(value);
}

function catalogImageAssets(product: Record<string, unknown>): Record<string, unknown>[] {
  const sources = [product["images"], product["imageAssets"], product["media"]].filter(
    (source): source is unknown[] => Array.isArray(source) && source.length > 0,
  );
  const source = sources[0] ?? [];
  return source.flatMap((image) => {
    if (typeof image === "string") return [{ url: image }];
    return typeof image === "object" && image !== null ? [image as Record<string, unknown>] : [];
  });
}

function catalogImageAssetUrl(image: Record<string, unknown>, origin: string): string {
  const value = asTrimmedString(image["url"]) || asTrimmedString(image["publicUrl"]);
  return value && !isCatalogPlaceholder(value) ? absoluteCatalogUrl(value, origin) : "";
}

function catalogImageUrls(
  variant: Record<string, unknown>,
  product: Record<string, unknown>,
  origin: string,
): { primary: string; additional: string[] } {
  const images = catalogImageAssets(product);
  const imageIds = Array.isArray(variant["imageIds"])
    ? new Set(
        variant["imageIds"].filter(
          (id): id is string => typeof id === "string" && Boolean(id.trim()),
        ),
      )
    : new Set<string>();
  const variantImage = asTrimmedString(variant["imageUrl"]);
  const directVariantImage =
    variantImage && !isCatalogPlaceholder(variantImage)
      ? absoluteCatalogUrl(variantImage, origin)
      : "";
  const variantId = asTrimmedString(variant["id"]);
  const primaryAsset =
    images.find((image) => imageIds.has(asTrimmedString(image["id"]))) ??
    images.find((image) => variantId && asTrimmedString(image["variantId"]) === variantId) ??
    images.find((image) => image["isPrimary"] === true) ??
    images[0];
  const primary =
    directVariantImage || (primaryAsset ? catalogImageAssetUrl(primaryAsset, origin) : "");
  const allUrls = images
    .map((image) => catalogImageAssetUrl(image, origin))
    .filter((imageUrl, index, values) => Boolean(imageUrl) && values.indexOf(imageUrl) === index);
  const additional = allUrls.filter((imageUrl) => imageUrl !== primary).slice(0, 10);
  return { primary, additional };
}

function catalogProductPath(product: Record<string, unknown>): string {
  const canonicalPath = asTrimmedString(product["canonicalPath"]);
  if (canonicalPath.startsWith("/")) return canonicalPath;
  const slug = asTrimmedString(product["slug"]);
  return slug ? `/produit/${encodeURIComponent(slug)}` : "/";
}

function catalogAvailability(variant: Record<string, unknown>): string {
  const availability = asTrimmedString(variant["availability"]);
  const quantity = Number(variant["availableQuantity"]);
  if (availability === "made_to_order") return "available for order";
  return availability === "out_of_stock" || (Number.isFinite(quantity) && quantity <= 0)
    ? "out of stock"
    : "in stock";
}

function catalogMoneyAmount(value: unknown): number | null {
  const amount = Number(asRecord(value)["amountMinor"]);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function catalogPriceFields(variant: Record<string, unknown>): {
  price: string;
  salePrice: string;
} | null {
  const current = catalogMoneyAmount(variant["price"]);
  if (current === null) return null;
  const compareAt = catalogMoneyAmount(variant["compareAtPrice"]);
  const hasSale = compareAt !== null && compareAt > current;
  return {
    price: `${((hasSale ? compareAt : current) / 1000).toFixed(3)} TND`,
    salePrice: hasSale ? `${(current / 1000).toFixed(3)} TND` : "",
  };
}

async function loadCatalogFeedProducts(): Promise<Record<string, unknown>[]> {
  const apiBaseUrl = catalogFeedApiBaseUrl();
  if (!apiBaseUrl) throw new Error("Product API is not configured.");

  const products: Record<string, unknown>[] = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages && page <= META_CATALOG_FEED_MAX_PAGES) {
    const endpoint = new URL(`${apiBaseUrl}/api/v1/products`);
    endpoint.searchParams.set("sort", "recommended");
    endpoint.searchParams.set("page", String(page));
    endpoint.searchParams.set("pageSize", String(META_CATALOG_FEED_PAGE_SIZE));
    const response = await fetch(endpoint, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Product API returned ${response.status}.`);
    const payload = asRecord(await response.json());
    const items = Array.isArray(payload["items"])
      ? payload["items"].filter((item): item is Record<string, unknown> => {
          return typeof item === "object" && item !== null;
        })
      : [];
    products.push(...items);
    const parsedTotalPages = Number(payload["totalPages"]);
    totalPages =
      Number.isInteger(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : page;
    if (items.length === 0) break;
    page += 1;
  }
  return products;
}

async function handleMetaCatalogFeed(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== "/api/meta/catalog-feed") return null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD" },
    });
  }

  try {
    const products = await loadCatalogFeedProducts();
    const rows = [
      [
        "id",
        "title",
        "description",
        "availability",
        "condition",
        "price",
        "sale_price",
        "link",
        "image_link",
        "additional_image_link",
        "brand",
        "item_group_id",
        "custom_label_0",
      ],
    ];

    for (const product of products) {
      const name = asTrimmedString(product["name"]);
      const reference = asTrimmedString(product["reference"]);
      const description =
        asTrimmedString(product["shortDescription"]) || asTrimmedString(product["longDescription"]);
      const variants = Array.isArray(product["variants"])
        ? product["variants"].filter((item): item is Record<string, unknown> => {
            return typeof item === "object" && item !== null;
          })
        : [];
      const heroVariant =
        variants.find((variant) => {
          const sku = asTrimmedString(variant["sku"]);
          const image = catalogImageUrls(variant, product, url.origin).primary;
          return Boolean(sku && image && catalogAvailability(variant) !== "out of stock");
        }) ??
        variants.find((variant) => Boolean(asTrimmedString(variant["sku"]))) ??
        null;
      const heroSku = heroVariant ? asTrimmedString(heroVariant["sku"]) : "";
      const link = absoluteCatalogUrl(catalogProductPath(product), url.origin);

      for (const variant of variants) {
        const sku = asTrimmedString(variant["sku"]);
        const prices = catalogPriceFields(variant);
        if (!sku || !name || !prices) continue;
        const colorLabel = asTrimmedString(variant["colorLabel"]);
        const width = Number(variant["widthCm"]);
        const height = Number(variant["heightCm"]);
        const dimensions =
          Number.isFinite(width) && Number.isFinite(height) ? ` · ${width}×${height} cm` : "";
        const title = `${name}${colorLabel ? ` — ${colorLabel}` : ""}${dimensions}`.slice(0, 150);
        const imageLinks = catalogImageUrls(variant, product, url.origin);
        const row = [
          sku,
          title,
          description,
          catalogAvailability(variant),
          "new",
          prices.price,
          prices.salePrice,
          link,
          imageLinks.primary,
          imageLinks.additional.join(","),
          "HBS HOME",
          reference || asTrimmedString(product["id"]),
          sku === heroSku ? "hero" : "variant",
        ];
        rows.push(row);
      }
    }

    const body = rows.map((row) => row.map(csvCell).join("\t")).join("\n");
    const headers = {
      "content-type": "text/tab-separated-values; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
      "content-disposition": 'inline; filename="hbs-home-catalog.tsv"',
    };
    return new Response(request.method === "HEAD" ? null : body, { status: 200, headers });
  } catch (error) {
    console.error("Meta catalog feed failed.", error);
    return new Response("Product feed temporarily unavailable.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }
}

function sanitizeMetaCustomData(value: unknown): Record<string, unknown> {
  const source = asRecord(value);
  const allowed = new Set([
    "value",
    "currency",
    "content_ids",
    "contents",
    "content_name",
    "content_category",
    "content_type",
    "num_items",
    "order_id",
    "search_string",
    "list_id",
    "site_id",
    "catalog_id",
  ]);
  const result: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(source)) {
    if (!allowed.has(key)) continue;
    if (typeof raw === "string" && raw.length <= 500) result[key] = raw;
    else if (typeof raw === "number" && Number.isFinite(raw)) result[key] = raw;
    else if (typeof raw === "boolean") result[key] = raw;
    else if (
      key === "content_ids" &&
      Array.isArray(raw) &&
      raw.length <= 100 &&
      raw.every((item) => typeof item === "string" && item.length <= 100)
    ) {
      result[key] = raw;
    } else if (
      key === "contents" &&
      Array.isArray(raw) &&
      raw.length <= 100 &&
      raw.every((item) => {
        const record = asRecord(item);
        return typeof record["id"] === "string" && typeof record["quantity"] === "number";
      })
    ) {
      result[key] = raw.map((item) => {
        const record = asRecord(item);
        return {
          id: asTrimmedString(record["id"]).slice(0, 100),
          quantity: Number(record["quantity"]),
        };
      });
    }
  }
  return result;
}

async function hashMetaValue(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function buildMetaUserData(
  value: unknown,
  request: Request,
): Promise<Record<string, unknown>> {
  const input = asRecord(value);
  const output: Record<string, unknown> = {};
  const email = asTrimmedString(input["email"]).toLowerCase();
  const phone = asTrimmedString(input["phone"]).replace(/[^\d+]/g, "");
  if (email && MARKETING_EMAIL_PATTERN.test(email)) output["em"] = [await hashMetaValue(email)];
  if (phone.length >= 8) output["ph"] = [await hashMetaValue(phone)];
  const fbp = asTrimmedString(input["fbp"]);
  const fbc = asTrimmedString(input["fbc"]);
  if (fbp.length <= 200 && fbp) output["fbp"] = fbp;
  if (fbc.length <= 200 && fbc) output["fbc"] = fbc;
  const clientIp = request.headers.get("CF-Connecting-IP")?.trim();
  const userAgent = request.headers.get("User-Agent")?.trim();
  if (clientIp) output["client_ip_address"] = clientIp;
  if (userAgent) output["client_user_agent"] = userAgent.slice(0, 500);
  return output;
}

async function handleMetaRequest(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  const isHealth = url.pathname === "/api/meta/health";
  const isEvent = url.pathname === "/api/meta/events";
  if (!isHealth && !isEvent) return null;

  if (isHealth) {
    if (request.method !== "GET") return jsonResponse({ success: false }, 405);
    const pixelId = metaPixelId(env);
    return jsonResponse({
      success: true,
      pixelConfigured: Boolean(pixelId),
      conversionsApiConfigured: Boolean(pixelId && envString(env, "META_CONVERSIONS_API_TOKEN")),
      datasetId: pixelId || null,
      catalogId: import.meta.env.VITE_META_CATALOG_ID?.trim() || null,
    });
  }

  if (request.method !== "POST") return jsonResponse({ success: false }, 405);
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, message: "Requête invalide." }, 400);
  }
  const body = asRecord(payload);
  const eventName = asTrimmedString(body["eventName"]);
  const eventId = asTrimmedString(body["eventId"]);
  if (!META_EVENT_NAMES.has(eventName) || !META_EVENT_ID_PATTERN.test(eventId)) {
    return jsonResponse({ success: false, message: "Événement Meta invalide." }, 400);
  }

  const pixelId = metaPixelId(env);
  const accessToken = envString(env, "META_CONVERSIONS_API_TOKEN");
  if (!pixelId || !accessToken) {
    return jsonResponse({ success: false, configured: false }, 503);
  }

  const eventSourceUrl = asTrimmedString(body["eventSourceUrl"]);
  const safeEventSourceUrl = /^https:\/\/(preview\.)?hbs-home\.com\//i.test(eventSourceUrl)
    ? eventSourceUrl.slice(0, 2000)
    : url.origin;
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: safeEventSourceUrl,
    user_data: await buildMetaUserData(body["userData"], request),
    custom_data: sanitizeMetaCustomData(body["customData"]),
  };
  const apiVersion = envString(env, "META_CAPI_API_VERSION") || "v23.0";
  const endpoint = new URL(`https://graph.facebook.com/${apiVersion}/${pixelId}/events`);
  endpoint.searchParams.set("access_token", accessToken);
  const testEventCode = envString(env, "META_TEST_EVENT_CODE");
  if (testEventCode) endpoint.searchParams.set("test_event_code", testEventCode);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    if (!response.ok) {
      console.error(`Meta Conversions API returned ${response.status}.`);
      return jsonResponse({ success: false, message: "Conversions API indisponible." }, 502);
    }
    return jsonResponse({ success: true, eventId });
  } catch (error) {
    console.error("Meta Conversions API request failed.", error);
    return jsonResponse({ success: false, message: "Conversions API indisponible." }, 502);
  }
}

async function brevoContactUpsert(env: unknown, body: Record<string, unknown>): Promise<Response> {
  const apiKey = envString(env, "BREVO_API_KEY");
  if (!apiKey) {
    return jsonResponse(
      {
        success: false,
        message: "Le service newsletter n’est pas encore configuré.",
      },
      503,
    );
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Brevo contacts API returned ${response.status}.`);
      return jsonResponse(
        {
          success: false,
          message: "Le service newsletter est temporairement indisponible.",
        },
        502,
      );
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Brevo contacts API request failed.", error);
    return jsonResponse(
      {
        success: false,
        message: "Le service newsletter est temporairement indisponible.",
      },
      502,
    );
  }
}

async function handleMarketingRequest(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  const isNewsletter = url.pathname === "/api/newsletter/subscriptions";
  const isOrderSync = url.pathname === "/api/newsletter/orders";
  if (!isNewsletter && !isOrderSync) return null;

  if (request.method !== "POST") {
    return jsonResponse({ success: false, message: "Méthode non autorisée." }, 405);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, message: "Requête invalide." }, 400);
  }

  if (isNewsletter) {
    const body = asRecord(payload);
    const email = asTrimmedString(body["email"]).toLowerCase();
    const listId = envListId(env, "BREVO_NEWSLETTER_LIST_ID");
    if (!MARKETING_EMAIL_PATTERN.test(email) || email.length > 254) {
      return jsonResponse(
        { success: false, message: "Veuillez saisir une adresse e-mail valide." },
        400,
      );
    }
    if (!listId) {
      return jsonResponse(
        { success: false, message: "Le service newsletter n’est pas encore configuré." },
        503,
      );
    }

    const result = await brevoContactUpsert(env, {
      email,
      listIds: [listId],
      updateEnabled: true,
    });
    if (!result.ok) return result;
    return jsonResponse({
      success: true,
      message: "Merci ! Votre inscription est bien enregistrée.",
    });
  }

  const body = asRecord(payload);
  const customer = asRecord(body["customer"]);
  const orderNumber = asTrimmedString(body["orderNumber"]);
  const email = asTrimmedString(customer["email"]).toLowerCase();
  const phone = asTrimmedString(customer["phone"]);
  const firstName = asTrimmedString(customer["firstName"]);
  const lastName = asTrimmedString(customer["lastName"]);
  const emailMarketingOptIn = body["emailMarketingOptIn"] === true;
  const messagingMarketingOptIn = body["messagingMarketingOptIn"] === true;
  const clientsListId = envListId(env, "BREVO_CLIENTS_LIST_ID");
  const messagingListId = envListId(env, "BREVO_MESSAGING_LIST_ID");

  if (!orderNumber || (!email && !phone)) {
    return jsonResponse({ success: true, synced: false });
  }
  if (email && (!MARKETING_EMAIL_PATTERN.test(email) || email.length > 254)) {
    return jsonResponse({ success: false, message: "Adresse e-mail invalide." }, 400);
  }
  if (!clientsListId) {
    return jsonResponse(
      { success: false, message: "La synchronisation clients n’est pas encore configurée." },
      503,
    );
  }

  const listIds = [clientsListId];
  if (emailMarketingOptIn && email) listIds.push(envListId(env, "BREVO_NEWSLETTER_LIST_ID") ?? 0);
  if (messagingMarketingOptIn && phone && messagingListId) listIds.push(messagingListId);
  const attributes: Record<string, string> = {};
  if (firstName) attributes["FIRSTNAME"] = firstName;
  if (lastName) attributes["LASTNAME"] = lastName;
  if (phone) attributes["SMS"] = phone;

  const result = await brevoContactUpsert(env, {
    ...(email ? { email } : {}),
    attributes,
    listIds: listIds.filter((id) => id > 0),
    updateEnabled: true,
  });
  if (!result.ok) return result;
  return jsonResponse({ success: true, synced: true });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function withDeliveryHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-hbs-release", import.meta.env.VITE_RELEASE_SHA?.trim() || "local");
  if (import.meta.env.VITE_APP_ENVIRONMENT !== "production") {
    headers.set("x-robots-tag", "noindex, nofollow");
  }
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const catalogFeedResponse = await handleMetaCatalogFeed(request);
      if (catalogFeedResponse) return withDeliveryHeaders(catalogFeedResponse);

      const marketingResponse = await handleMarketingRequest(
        request,
        env ?? getMarketingRuntimeEnv(request),
      );
      if (marketingResponse) return withDeliveryHeaders(marketingResponse);

      const metaResponse = await handleMetaRequest(request, env ?? getMarketingRuntimeEnv(request));
      if (metaResponse) return withDeliveryHeaders(metaResponse);

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withDeliveryHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return withDeliveryHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};

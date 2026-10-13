/**
 * Meta configuration shared by the browser Pixel and the server Conversions API.
 * The identifiers are public catalog/dataset identifiers; the access token is
 * deliberately server-only and is never exposed through Vite.
 */
const purchaseTransportOverride = import.meta.env.VITE_META_PURCHASE_TRANSPORT?.trim();
const purchaseTransport =
  purchaseTransportOverride === "browser" ||
  purchaseTransportOverride === "server" ||
  purchaseTransportOverride === "deduplicated"
    ? purchaseTransportOverride
    : import.meta.env.VITE_APP_ENVIRONMENT?.trim() === "staging"
      ? "server"
      : "deduplicated";

export const META_CONFIG = {
  pixelId: import.meta.env.VITE_META_PIXEL_ID?.trim() || "1291821648742747",
  catalogId: import.meta.env.VITE_META_CATALOG_ID?.trim() || "2267753347359429",
  siteId: import.meta.env.VITE_META_SITE_ID?.trim() || "hbs_home_preview",
  // Staging uses CAPI as the single Purchase source to avoid counting the
  // same order once from the browser Pixel and once from the server. Production
  // keeps the deduplicated dual transport unless explicitly overridden.
  purchaseTransport,
} as const;

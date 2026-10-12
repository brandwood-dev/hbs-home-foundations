export const META_CONSENT_STORAGE_KEY = "hbs_meta_tracking_consent";
export const META_CONSENT_EVENT = "hbs:meta-consent";

export type MetaTrackingConsent = "granted" | "denied" | null;

export function getMetaTrackingConsent(): MetaTrackingConsent {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(META_CONSENT_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function hasMetaTrackingConsent(): boolean {
  return getMetaTrackingConsent() === "granted";
}

export function setMetaTrackingConsent(value: Exclude<MetaTrackingConsent, null>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(META_CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new Event(META_CONSENT_EVENT));
}

/**
 * Kept as a compatibility export for older imports. The public shell now
 * renders the Admin-managed HomePromoBanner from SiteLayout, so this module
 * must never reintroduce the former fixture-backed announcement bar.
 */
export { HomePromoBanner as AnnouncementBar } from "@/components/home/HomePromoBanner";

const DEFAULT_FACEBOOK_PAGE = "HBSHomeTN";

function facebookPageRef(value: string): string {
  const normalized = value.trim();
  if (!normalized) return DEFAULT_FACEBOOK_PAGE;

  try {
    const url = new URL(normalized.match(/^https?:\/\//i) ? normalized : `https://${normalized}`);
    if (url.hostname.endsWith("facebook.com") || url.hostname.endsWith("fb.com")) {
      return url.pathname.split("/").filter(Boolean)[0] || DEFAULT_FACEBOOK_PAGE;
    }
  } catch {
    // Fall through to the safe page identifier fallback below.
  }

  const identifier = normalized.replace(/^@/, "").replace(/[^a-zA-Z0-9._-]/g, "");
  return identifier || DEFAULT_FACEBOOK_PAGE;
}

export function messengerPageContext(pathname: string): string {
  const context = pathname === "/" ? "home" : pathname.replace(/^\/+/, "");
  return context.replace(/[^a-zA-Z0-9/_-]/g, "_").slice(0, 120) || "home";
}

export function buildMessengerUrl(facebookUrl: string, pathname: string): string {
  const ref = `site_${messengerPageContext(pathname)}`;
  return `https://m.me/${facebookPageRef(facebookUrl)}?ref=${encodeURIComponent(ref)}`;
}

import { describe, expect, it } from "vitest";
import { buildMessengerUrl } from "@/lib/messenger/messenger-link";

describe("buildMessengerUrl", () => {
  it("uses the configured Facebook page and keeps the page context in the ref", () => {
    expect(
      buildMessengerUrl("https://www.facebook.com/HBSHomeTN", "/rideaux-voilages/velours"),
    ).toBe("https://m.me/HBSHomeTN?ref=site_rideaux-voilages%2Fvelours");
  });

  it("falls back to the confirmed HBS HOME page when settings are empty", () => {
    expect(buildMessengerUrl("", "/")).toBe("https://m.me/HBSHomeTN?ref=site_home");
  });
});

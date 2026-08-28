import { describe, expect, it } from "vitest";
import { HOME_SECTION_CONFIG, getHomeOverviewStatus } from "./home-overview";
import type { AdminHomeContent } from "@/admin/repositories/interfaces";

function content(overrides: Partial<AdminHomeContent>): AdminHomeContent {
  return {
    draft: null,
    published: null,
    ...overrides,
  };
}

function revision(
  status: "draft" | "published",
  version: number,
  isEnabled = true,
): NonNullable<AdminHomeContent["draft"]> {
  return {
    id: `${status}-${version}`,
    status,
    version,
    publishedAt: status === "published" ? "2026-08-28T10:00:00.000Z" : null,
    updatedAt: "2026-08-28T10:00:00.000Z",
    sections: [
      {
        id: `hero-${status}-${version}`,
        sectionKey: "hero",
        sortOrder: 0,
        isEnabled,
        payload: {},
        media: null,
        mobileMedia: null,
        hotspots: [],
      },
    ],
  };
}

describe("homepage Admin overview", () => {
  it("exposes one editor link per homepage section", () => {
    expect(HOME_SECTION_CONFIG.map((item) => item.href)).toEqual([
      "/admin/contenu/accueil/hero",
      "/admin/contenu/accueil/banderole",
      "/admin/contenu/accueil/shop-the-look",
    ]);
  });

  it("reports a section without draft or publication as unconfigured", () => {
    expect(getHomeOverviewStatus(content({}), "hero")).toMatchObject({
      label: "Non configurée",
      tone: "neutral",
    });
  });

  it("reports a newer draft separately from the published version", () => {
    expect(
      getHomeOverviewStatus(
        content({
          draft: revision("draft", 3),
          published: revision("published", 2),
        }),
        "hero",
      ),
    ).toMatchObject({
      label: "Brouillon à publier",
      tone: "warning",
    });
  });

  it("reports a disabled published section without exposing an editor action", () => {
    expect(
      getHomeOverviewStatus(content({ published: revision("published", 4, false) }), "hero"),
    ).toMatchObject({
      label: "Publication masquée",
      tone: "neutral",
    });
  });
});

import { describe, expect, it } from "vitest";
import type { HomeSectionConfig } from "@/domain/content/home-content.types";
import { getVisibleSections } from "@/services/home/home-sections";

describe("homepage sections", () => {
  it("does not render the retired material focus block even when CMS data enables it", () => {
    const sections: HomeSectionConfig[] = [
      { key: "material_focus", isEnabled: true, order: 1 },
      { key: "hero", isEnabled: true, order: 2 },
    ];

    expect(getVisibleSections(sections).map((section) => section.key)).toEqual(["hero"]);
  });

  it("does not render the retired accessories block even when CMS data enables it", () => {
    const sections: HomeSectionConfig[] = [
      { key: "accessories", isEnabled: true, order: 1 },
      { key: "compose_window", isEnabled: true, order: 2 },
    ];

    expect(getVisibleSections(sections).map((section) => section.key)).toEqual(["compose_window"]);
  });

  it("does not render the retired measurement guide even when CMS data enables it", () => {
    const sections: HomeSectionConfig[] = [
      { key: "measurement_guide", isEnabled: true, order: 1 },
      { key: "custom_professional", isEnabled: true, order: 2 },
    ];

    expect(getVisibleSections(sections).map((section) => section.key)).toEqual([
      "custom_professional",
    ]);
  });
});

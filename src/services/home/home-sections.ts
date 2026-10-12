import type { HomeSectionConfig, HomeSectionKey } from "@/domain/content/home-content.types";

/** Blocks removed from the public homepage regardless of stale CMS data. */
const RETIRED_HOME_SECTION_KEYS = new Set<HomeSectionKey>([
  "material_focus",
  "accessories",
  "measurement_guide",
]);

/** Sections actives, triées par `order` — fonction pure, testable. */
export function getVisibleSections(sections: HomeSectionConfig[]): HomeSectionConfig[] {
  return sections
    .filter((section) => section.isEnabled && !RETIRED_HOME_SECTION_KEYS.has(section.key))
    .sort((a, b) => a.order - b.order);
}

export function isSectionEnabled(sections: HomeSectionConfig[], key: HomeSectionKey): boolean {
  return sections.some((section) => section.key === key && section.isEnabled);
}

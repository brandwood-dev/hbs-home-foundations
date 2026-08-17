import type { HomeSectionConfig, HomeSectionKey } from "@/domain/content/home-content.types";

/** Sections actives, triées par `order` — fonction pure, testable. */
export function getVisibleSections(sections: HomeSectionConfig[]): HomeSectionConfig[] {
  return sections.filter((section) => section.isEnabled).sort((a, b) => a.order - b.order);
}

export function isSectionEnabled(sections: HomeSectionConfig[], key: HomeSectionKey): boolean {
  return sections.some((section) => section.key === key && section.isEnabled);
}

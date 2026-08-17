import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import { useHomeContent } from "@/hooks/content/useHomeContent";
import { getVisibleSections } from "@/services/home/home-sections";

export function HomePage() {
  const { data: content } = useHomeContent();
  const sections = getVisibleSections(content.sections);

  return (
    <>
      {sections.map((section) => (
        <HomeSectionRenderer key={section.key} sectionKey={section.key} content={content} />
      ))}
    </>
  );
}

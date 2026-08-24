import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { useHomeContent } from "@/hooks/content/useHomeContent";
import { getVisibleSections } from "@/services/home/home-sections";

export function HomePage() {
  const { data: content } = useHomeContent();
  const sections = getVisibleSections(content.sections);

  return (
    <>
      <HomePromoBanner content={content.promoBanner} />
      {sections.map((section) => (
        <HomeSectionRenderer key={section.key} sectionKey={section.key} content={content} />
      ))}
    </>
  );
}

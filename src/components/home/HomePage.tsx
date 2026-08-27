import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { dataProvider } from "@/config/features.config";
import { useHomeContent } from "@/hooks/content/useHomeContent";
import { mapPublicCategoryCollections } from "@/repositories/api/ApiContentRepository";
import { catalogNavigationQuery } from "@/services/catalog/catalog-category.queries";
import { getVisibleSections } from "@/services/home/home-sections";

export function HomePage() {
  const { data: content } = useHomeContent();
  const navigationQuery = useQuery({
    ...catalogNavigationQuery(),
    // Keep the last successful taxonomy visible while Admin changes are being
    // revalidated. The same query key is used by SiteHeader, so both consumers
    // now share one request and one consistent snapshot.
    placeholderData: keepPreviousData,
  });
  const collections =
    dataProvider === "api"
      ? navigationQuery.data === undefined
        ? []
        : mapPublicCategoryCollections(navigationQuery.data)
      : content.collections;
  const pageContent = { ...content, collections };
  const sections = getVisibleSections(pageContent.sections);

  return (
    <>
      <HomePromoBanner content={pageContent.promoBanner} />
      {sections.map((section) => (
        <HomeSectionRenderer key={section.key} sectionKey={section.key} content={pageContent} />
      ))}
    </>
  );
}

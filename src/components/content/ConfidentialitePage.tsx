import { useSuspenseQuery } from "@tanstack/react-query";
import { EditorialPageNotFound, EditorialPageView } from "@/components/content/EditorialPageView";
import { editorialPageQuery } from "@/hooks/content/useHomeContent";

/**
 * Shared page body for both privacy-policy URLs.
 * The API and editorial fixture keep the stable `confidentialite` slug while
 * the public long-form URL remains available for SEO and existing links.
 */
export function ConfidentialitePage() {
  const { data: page } = useSuspenseQuery(editorialPageQuery("confidentialite"));
  return page ? <EditorialPageView page={page} /> : <EditorialPageNotFound />;
}

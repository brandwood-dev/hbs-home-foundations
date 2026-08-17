import { AccessoriesEditorialSection } from "@/components/home/AccessoriesEditorialSection";
import { AdviceSection } from "@/components/home/AdviceSection";
import { ComposeWindowSection } from "@/components/home/ComposeWindowSection";
import { CustomAndProfessionalSection } from "@/components/home/CustomAndProfessionalSection";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { HomeHero } from "@/components/home/HomeHero";
import { MaterialFocusSection } from "@/components/home/MaterialFocusSection";
import { MeasurementGuideSection } from "@/components/home/MeasurementGuideSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ProductSelectionSection } from "@/components/home/ProductSelectionSection";
import { ShopByNeedSection } from "@/components/home/ShopByNeedSection";
import { ShopTheLookSection } from "@/components/home/ShopTheLookSection";
import { SocialSection } from "@/components/home/SocialSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import type { HomePageContent, HomeSectionKey } from "@/domain/content/home-content.types";

/** Rend une section à partir de sa clé — l'ordre est piloté par la donnée. */
export function HomeSectionRenderer({
  sectionKey,
  content,
}: {
  sectionKey: HomeSectionKey;
  content: HomePageContent;
}) {
  switch (sectionKey) {
    case "hero":
      return <HomeHero content={content.hero} />;
    case "trust":
      return <TrustStrip items={content.trustItems} />;
    case "collections":
      return <FeaturedCollections collections={content.collections} />;
    case "product_selection":
      return <ProductSelectionSection content={content.productSelection} />;
    case "shop_by_need":
      return <ShopByNeedSection content={content.shopByNeed} />;
    case "material_focus":
      return <MaterialFocusSection content={content.materialFocus} />;
    case "compose_window":
      return <ComposeWindowSection content={content.composeWindow} />;
    case "measurement_guide":
      return <MeasurementGuideSection content={content.measurementGuide} />;
    case "shop_the_look":
      return <ShopTheLookSection content={content.shopTheLook} />;
    case "accessories":
      return <AccessoriesEditorialSection content={content.accessories} />;
    case "custom_professional":
      return <CustomAndProfessionalSection content={content.customProfessional} />;
    case "testimonials":
      return <TestimonialsSection testimonials={content.testimonials} />;
    case "advice":
      return <AdviceSection articles={content.adviceArticles} />;
    case "social":
      return <SocialSection content={content.social} />;
    case "newsletter":
      return <NewsletterSection content={content.newsletter} />;
    default:
      return null;
  }
}

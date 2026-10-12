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
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { HomePageContent, HomeSectionKey } from "@/domain/content/home-content.types";
import type { ReactNode } from "react";

/** Rend une section à partir de sa clé — l'ordre est piloté par la donnée. */
export function HomeSectionRenderer({
  sectionKey,
  content,
}: {
  sectionKey: HomeSectionKey;
  content: HomePageContent;
}) {
  let section: ReactNode;

  switch (sectionKey) {
    case "hero":
      section = <HomeHero content={content.hero} />;
      break;
    case "trust":
      section = <TrustStrip items={content.trustItems} />;
      break;
    case "collections":
      section = <FeaturedCollections collections={content.collections} />;
      break;
    case "product_selection":
      section = <ProductSelectionSection content={content.productSelection} />;
      break;
    case "shop_by_need":
      section = <ShopByNeedSection content={content.shopByNeed} />;
      break;
    case "material_focus":
      section = <MaterialFocusSection content={content.materialFocus} />;
      break;
    case "compose_window":
      section = <ComposeWindowSection content={content.composeWindow} />;
      break;
    case "measurement_guide":
      section = <MeasurementGuideSection content={content.measurementGuide} />;
      break;
    case "shop_the_look":
      section = <ShopTheLookSection content={content.shopTheLook} />;
      break;
    case "accessories":
      section = <AccessoriesEditorialSection content={content.accessories} />;
      break;
    case "custom_professional":
      section = <CustomAndProfessionalSection content={content.customProfessional} />;
      break;
    case "testimonials":
      section = <TestimonialsSection testimonials={content.testimonials} />;
      break;
    case "advice":
      section = <AdviceSection articles={content.adviceArticles} />;
      break;
    case "social":
      section = <SocialSection content={content.social} />;
      break;
    case "newsletter":
      section = <NewsletterSection content={content.newsletter} />;
      break;
    default:
      return null;
  }

  if (!section) return null;

  return sectionKey === "hero" ? section : <ScrollReveal>{section}</ScrollReveal>;
}

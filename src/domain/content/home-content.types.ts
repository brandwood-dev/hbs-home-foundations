/**
 * Modèle de contenu de la page d'accueil.
 * Ce contrat sera servi tel quel par le futur backend / CMS
 * (voir API_CONTRACT.md → GET /api/v1/content/home).
 */

export type HomeSectionKey =
  | "hero"
  | "trust"
  | "collections"
  | "product_selection"
  | "shop_by_need"
  | "material_focus"
  | "compose_window"
  | "measurement_guide"
  | "shop_the_look"
  | "accessories"
  | "custom_professional"
  | "testimonials"
  | "advice"
  | "social"
  | "newsletter";

export interface HomeSectionConfig {
  key: HomeSectionKey;
  isEnabled: boolean;
  order: number;
}

export interface HomeImage {
  src: string;
  alt: string;
}

export interface HomeCta {
  label: string;
  href: string;
}

export interface HomeHeroContent {
  tagline: string;
  title: string;
  text: string;
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
  image: HomeImage;
}

export type HomeTrustIcon = "truck" | "banknote" | "package-check" | "message-circle";

export interface HomeTrustItem {
  id: string;
  label: string;
  description: string;
  icon: HomeTrustIcon;
}

export interface HomeCollection {
  id: string;
  title: string;
  description: string;
  href: string;
  image: HomeImage;
}

/** Filtre catalogue appliqué par un onglet de la sélection du moment. */
export type ProductSelectionFilter = "new" | "best_sellers" | "discounted";

export interface ProductSelectionTab {
  id: ProductSelectionFilter;
  label: string;
  ctaHref: string;
}

export interface ProductSelectionContent {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  pageSize: number;
  tabs: ProductSelectionTab[];
}

export interface ShopByNeedCard {
  id: string;
  title: string;
  text: string;
  href: string;
  image: HomeImage;
}

export interface ShopByNeedContent {
  title: string;
  subtitle: string;
  cards: ShopByNeedCard[];
}

export interface MaterialFocusContent {
  tagline: string;
  title: string;
  text: string;
  cta: HomeCta;
  image: HomeImage;
  closeUpImage: HomeImage;
}

export interface ComposeWindowStep {
  id: string;
  title: string;
  text: string;
  href: string;
}

export interface ComposeWindowContent {
  title: string;
  subtitle: string;
  steps: ComposeWindowStep[];
  cta: HomeCta;
}

export interface MeasurementGuideContent {
  title: string;
  text: string;
  primaryCta: HomeCta;
  secondaryCta: HomeCta;
}

export interface ShopTheLookHotspot {
  id: string;
  xPercent: number;
  yPercent: number;
  productId?: string;
  title?: string;
  href?: string;
}

export interface ShopTheLookContent {
  title: string;
  subtitle: string;
  image: HomeImage;
  hotspots: ShopTheLookHotspot[];
}

export interface AccessoryEditorialCard {
  id: string;
  title: string;
  description: string;
  href: string;
  image: HomeImage;
}

export interface AccessoriesEditorialContent {
  title: string;
  subtitle?: string;
  cards: AccessoryEditorialCard[];
}

export interface CustomProfessionalColumn {
  id: string;
  tagline: string;
  title: string;
  text: string;
  cta: HomeCta;
}

export interface CustomProfessionalContent {
  columns: CustomProfessionalColumn[];
}

export interface TestimonialContent {
  id: string;
  rating: number;
  text: string;
  customerFirstName: string;
  city?: string;
  productName?: string;
  createdAt?: string;
  isVerifiedPurchase: boolean;
}

export interface AdviceArticlePreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTimeMinutes: number;
  image: HomeImage;
}

export interface SocialContentItem {
  id: string;
  imageUrl: string;
  alt: string;
  href?: string;
}

export interface SocialContent {
  title: string;
  cta?: HomeCta;
  items: SocialContentItem[];
}

export interface NewsletterContent {
  title: string;
  text: string;
  fieldLabel: string;
  ctaLabel: string;
  consentText: string;
  privacyHref: string;
}

export interface HomePageContent {
  sections: HomeSectionConfig[];

  hero: HomeHeroContent;
  trustItems: HomeTrustItem[];
  collections: HomeCollection[];

  productSelection: ProductSelectionContent;
  shopByNeed: ShopByNeedContent;
  materialFocus: MaterialFocusContent;
  composeWindow: ComposeWindowContent;
  measurementGuide: MeasurementGuideContent;
  shopTheLook: ShopTheLookContent;
  accessories: AccessoriesEditorialContent;
  customProfessional: CustomProfessionalContent;

  testimonials: TestimonialContent[];
  adviceArticles: AdviceArticlePreview[];
  social: SocialContent;

  newsletter: NewsletterContent;
}

export interface NewsletterSubscriptionResult {
  success: boolean;
  message: string;
  isDemo: boolean;
}

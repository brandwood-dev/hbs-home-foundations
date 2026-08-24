import heroImage from "@/assets/hero-rideaux.jpg";
import colRideaux from "@/assets/col-rideaux.jpg";
import colVoilages from "@/assets/col-voilages.jpg";
import colStores from "@/assets/col-stores.jpg";
import colCoussins from "@/assets/col-coussins.jpg";
import colTringles from "@/assets/col-tringles.jpg";
import colEmbrasses from "@/assets/col-embrasses.jpg";
import colMobilier from "@/assets/catalog/mobilier/canape.jpg";
import colPlantes from "@/assets/catalog/plantes/grande-plante.jpg";
import catVelours from "@/assets/catalog/rideau-velours.jpg";
import catLin from "@/assets/catalog/rideau-lin.jpg";
import catOccultant from "@/assets/catalog/rideau-occultant.jpg";
import catJacquard from "@/assets/catalog/rideau-jacquard.jpg";
import textureVelours from "@/assets/product/texture-velours.jpg";
import type {
  AccessoriesEditorialContent,
  ComposeWindowContent,
  CustomProfessionalContent,
  HomeCollection,
  HomeHeroContent,
  HomePromoBannerContent,
  HomeSectionConfig,
  HomeTrustItem,
  MaterialFocusContent,
  MeasurementGuideContent,
  NewsletterContent,
  ProductSelectionContent,
  ShopByNeedContent,
  ShopTheLookContent,
  SocialContent,
  TestimonialContent,
} from "@/domain/content/home-content.types";

/** Ordre et activation des sections — data-driven, remplaçable par le CMS. */
export const homeSections: HomeSectionConfig[] = [
  { key: "hero", isEnabled: true, order: 1 },
  { key: "trust", isEnabled: true, order: 2 },
  { key: "collections", isEnabled: true, order: 3 },
  { key: "product_selection", isEnabled: true, order: 4 },
  { key: "shop_by_need", isEnabled: true, order: 5 },
  { key: "material_focus", isEnabled: true, order: 6 },
  { key: "compose_window", isEnabled: true, order: 7 },
  { key: "measurement_guide", isEnabled: true, order: 8 },
  { key: "shop_the_look", isEnabled: true, order: 9 },
  { key: "accessories", isEnabled: true, order: 10 },
  { key: "custom_professional", isEnabled: true, order: 11 },
  { key: "testimonials", isEnabled: false, order: 12 },
  { key: "advice", isEnabled: true, order: 13 },
  { key: "social", isEnabled: false, order: 14 },
  { key: "newsletter", isEnabled: true, order: 15 },
];

export const homeHero: HomeHeroContent = {
  tagline: "Nouvelle collection",
  title: "Des rideaux qui transforment votre intérieur",
  text: "Découvrez des matières élégantes, des couleurs actuelles et des finitions pensées pour habiller chaque pièce avec style.",
  primaryCta: { label: "Découvrir les rideaux", href: "/rideaux" },
  secondaryCta: { label: "Voir les nouveautés", href: "/nouveautes" },
  image: {
    src: heroImage,
    alt: "Salon lumineux habillé de rideaux en lin devant une grande fenêtre",
  },
};

export const promoBanner: HomePromoBannerContent = {
  isEnabled: true,
  label: "HBS HOME",
  text: "Livraison partout en Tunisie",
  href: "/promotions",
};

export const trustItems: HomeTrustItem[] = [
  {
    id: "delivery",
    label: "Livraison partout en Tunisie",
    description: "Expédition sous 24 à 48 heures",
    icon: "truck",
  },
  {
    id: "cod",
    label: "Paiement à la livraison",
    description: "Réglez à réception de votre commande",
    icon: "banknote",
  },
  {
    id: "free-shipping",
    label: "Livraison gratuite dès 200 DT",
    description: "Sur l'ensemble de nos collections",
    icon: "package-check",
  },
  {
    id: "advice",
    label: "Conseil personnalisé",
    description: "Accompagnement mesures et finitions",
    icon: "message-circle",
  },
];

export const featuredCollections: HomeCollection[] = [
  {
    id: "rideaux",
    title: "Rideaux",
    description: "Velours, satin et lin pour habiller vos fenêtres.",
    href: "/rideaux",
    image: { src: colRideaux, alt: "Rideaux en velours devant une fenêtre" },
  },
  {
    id: "voilages",
    title: "Voilages",
    description: "La lumière filtrée, en toute légèreté.",
    href: "/voilages",
    image: { src: colVoilages, alt: "Voilages blancs traversés par la lumière" },
  },
  {
    id: "stores",
    title: "Stores",
    description: "Des solutions nettes pour chaque ouverture.",
    href: "/stores",
    image: { src: colStores, alt: "Store en fibres naturelles sur une fenêtre" },
  },
  {
    id: "coussins",
    title: "Coussins",
    description: "Matières douces et teintes chaleureuses.",
    href: "/coussins",
    image: { src: colCoussins, alt: "Coussins en lin et velours empilés" },
  },
  {
    id: "mobilier",
    title: "Mobilier",
    description: "Canapés, fauteuils et rangements en matières naturelles.",
    href: "/mobilier",
    image: { src: colMobilier, alt: "Canapé en lin clair dans un salon lumineux" },
  },
  {
    id: "plantes",
    title: "Plantes et déco",
    description: "Verdure artificielle ou naturelle, pots et compositions.",
    href: "/plantes",
    image: { src: colPlantes, alt: "Grande plante verte en pot dans un intérieur clair" },
  },
  {
    id: "tringles",
    title: "Tringles",
    description: "Supports et finitions au bon format.",
    href: "/tringles",
    image: { src: colTringles, alt: "Tringle à rideaux en laiton avec embout décoratif" },
  },
  {
    id: "embrasses",
    title: "Embrasses",
    description: "Le détail qui structure vos rideaux.",
    href: "/embrasses",
    image: { src: colEmbrasses, alt: "Embrasse tressée retenant un rideau clair" },
  },
];

export const productSelection: ProductSelectionContent = {
  title: "Notre sélection du moment",
  subtitle: "Nouveautés, best-sellers et bonnes affaires, mis à jour régulièrement.",
  ctaLabel: "Voir toute la sélection",
  pageSize: 8,
  tabs: [
    { id: "new", label: "Nouveautés", ctaHref: "/nouveautes" },
    { id: "best_sellers", label: "Meilleures ventes", ctaHref: "/rideaux" },
    { id: "discounted", label: "Promotions", ctaHref: "/promotions" },
  ],
};

export const shopByNeed: ShopByNeedContent = {
  title: "Choisissez selon votre besoin",
  subtitle: "Lumière, intimité ou obscurité : trouvez le rideau adapté à chaque pièce.",
  cards: [
    {
      id: "light",
      title: "Faire entrer la lumière",
      text: "Des voilages légers pour préserver la luminosité naturelle.",
      href: "/voilages",
      image: { src: colVoilages, alt: "Voilage léger laissant passer la lumière du jour" },
    },
    {
      id: "privacy",
      title: "Préserver son intimité",
      text: "Des rideaux tamisants pour adoucir la lumière sans assombrir la pièce.",
      href: "/rideaux/tamisants",
      image: { src: catLin, alt: "Rideau tamisant en lin devant une fenêtre de salon" },
    },
    {
      id: "blackout",
      title: "Dormir dans l'obscurité",
      text: "Des rideaux occultants pour limiter efficacement la lumière extérieure.",
      href: "/rideaux/occultants",
      image: { src: catOccultant, alt: "Rideau occultant sombre dans une chambre" },
    },
    {
      id: "comfort",
      title: "Améliorer le confort",
      text: "Des tissus épais et thermiques pour créer un intérieur plus confortable.",
      href: "/rideaux/thermiques",
      image: { src: catJacquard, alt: "Rideau épais en jacquard près d'une fenêtre" },
    },
  ],
};

export const materialFocus: MaterialFocusContent = {
  tagline: "Matière iconique",
  title: "Le velours, profond et chaleureux",
  text: "Avec son tombé généreux et sa texture douce, le velours apporte immédiatement du caractère à un salon ou une chambre.",
  cta: { label: "Découvrir les rideaux en velours", href: "/rideaux/velours" },
  image: { src: catVelours, alt: "Rideaux en velours dans un salon chaleureux" },
  closeUpImage: { src: textureVelours, alt: "Gros plan sur la texture d'un velours de rideau" },
};

export const composeWindow: ComposeWindowContent = {
  title: "Composez votre fenêtre",
  subtitle:
    "Associez rideaux, voilages et accessoires pour créer une installation complète et harmonieuse.",
  steps: [
    {
      id: "curtain",
      title: "Choisir le rideau",
      text: "Sélectionnez la matière, la couleur et le niveau de lumière.",
      href: "/rideaux",
    },
    {
      id: "sheer",
      title: "Ajouter un voilage",
      text: "Préservez la lumière naturelle et votre intimité.",
      href: "/voilages",
    },
    {
      id: "rod",
      title: "Choisir la tringle",
      text: "Trouvez la longueur et la finition adaptées à votre installation.",
      href: "/accessoires/tringles",
    },
    {
      id: "tieback",
      title: "Finaliser avec une embrasse",
      text: "Ajoutez la touche décorative qui mettra votre rideau en valeur.",
      href: "/accessoires/embrasses",
    },
  ],
  cta: { label: "Commencer ma sélection", href: "/rideaux" },
};

export const measurementGuide: MeasurementGuideContent = {
  title: "Trouvez les bonnes dimensions",
  text: "Mesurez votre fenêtre en quelques étapes et découvrez la largeur et la hauteur de rideau recommandées.",
  primaryCta: { label: "Utiliser le guide", href: "/guide-des-mesures" },
  secondaryCta: { label: "Voir comment mesurer", href: "/guide-des-mesures" },
};

export const shopTheLook: ShopTheLookContent = {
  title: "Inspirez-vous de nos ambiances",
  subtitle: "Découvrez les produits qui composent cet intérieur.",
  image: {
    src: heroImage,
    alt: "Séjour lumineux avec rideaux, voilage et tringle assortis",
  },
  hotspots: [
    { id: "h-curtain", xPercent: 26, yPercent: 38, productId: "p-001" },
    { id: "h-sheer", xPercent: 62, yPercent: 30, title: "Voilages", href: "/voilages" },
    { id: "h-rod", xPercent: 48, yPercent: 12, title: "Tringles", href: "/accessoires/tringles" },
    { id: "h-cushion", xPercent: 74, yPercent: 74, title: "Coussins", href: "/coussins" },
  ],
};

export const accessoriesEditorial: AccessoriesEditorialContent = {
  title: "Les détails qui font toute la différence",
  subtitle: "Tringles, embrasses et supports pour une installation soignée.",
  cards: [
    {
      id: "tringles",
      title: "Tringles",
      description: "Le bon format et la bonne finition pour chaque fenêtre.",
      href: "/accessoires/tringles",
      image: { src: colTringles, alt: "Tringle à rideaux en laiton avec embout décoratif" },
    },
    {
      id: "embrasses",
      title: "Embrasses",
      description: "La touche décorative qui structure vos rideaux.",
      href: "/accessoires/embrasses",
      image: { src: colEmbrasses, alt: "Embrasse tressée retenant un rideau clair" },
    },
    {
      id: "supports",
      title: "Supports et embouts",
      description: "Les pièces qui assurent un maintien net et durable.",
      href: "/accessoires",
      image: { src: colStores, alt: "Support mural et embout de tringle sur un mur clair" },
    },
    {
      id: "pose",
      title: "Accessoires de pose",
      description: "Anneaux, crochets et petites fournitures d'installation.",
      href: "/accessoires",
      image: { src: colCoussins, alt: "Petites fournitures de pose pour rideaux" },
    },
  ],
};

export const customProfessional: CustomProfessionalContent = {
  columns: [
    {
      id: "custom",
      tagline: "Un projet unique",
      title: "Des rideaux adaptés à votre intérieur",
      text: "Dimensions particulières, finitions spécifiques ou besoin de conseil : préparez votre demande de sur-mesure.",
      cta: { label: "Découvrir le sur-mesure", href: "/sur-mesure" },
    },
    {
      id: "pro",
      tagline: "Hôtels, restaurants et architectes",
      title: "Un accompagnement pour vos projets professionnels",
      text: "HBS HOME accompagne les projets en volume avec des solutions adaptées aux espaces professionnels.",
      cta: { label: "Espace professionnels", href: "/professionnels" },
    },
  ],
};

/** Aucun avis réel validé à ce jour : la section reste masquée. */
export const testimonials: TestimonialContent[] = [];

/** Aucun contenu social réel configuré : la section reste masquée. */
export const socialContent: SocialContent = {
  title: "HBS HOME chez vous",
  cta: { label: "Suivre HBS HOME", href: "/contact" },
  items: [],
};

export const newsletterContent: NewsletterContent = {
  title: "Entrez dans l'univers HBS HOME",
  text: "Recevez nos nouveautés, nos conseils déco et nos offres directement dans votre boîte mail.",
  fieldLabel: "Votre adresse e-mail",
  ctaLabel: "S'inscrire",
  consentText:
    "En vous inscrivant, vous acceptez de recevoir les communications de HBS HOME. Vous pourrez vous désinscrire à tout moment.",
  privacyHref: "/politique-de-confidentialite",
};

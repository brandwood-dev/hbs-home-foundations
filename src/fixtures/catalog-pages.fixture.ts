import type { CatalogScope } from "@/repositories/interfaces/ProductRepository";

export interface CatalogPageConfig {
  routeId: string;
  path: string;
  title: string;
  description: string;
  scope?: CatalogScope;
  lockedFilterLabel?: string;
  seoTitle: string;
  seoDescription: string;
  seoBlock: string;
}

export const catalogPages: CatalogPageConfig[] = [
  {
    routeId: "rideaux",
    path: "/rideaux",
    title: "Rideaux",
    description:
      "Découvrez notre sélection de rideaux en velours, satin, lin et tissus occultants, disponibles dans plusieurs couleurs, dimensions et finitions.",
    seoTitle: "Rideaux en Tunisie | HBS HOME",
    seoDescription:
      "Rideaux en velours, satin, lin, jacquard et polyester. Occultants, tamisants et thermiques, livrés partout en Tunisie avec paiement à la livraison.",
    seoBlock:
      "Chez HBS HOME, chaque rideau est choisi pour son tombé, sa tenue dans le temps et la justesse de ses teintes. Velours profonds pour le salon, lins lavés pour la chambre, tissus occultants pour les pièces exposées : nos collections couvrent les besoins des intérieurs tunisiens, du petit appartement à la grande baie vitrée. Filtrez par matière, niveau de lumière, finition ou dimensions pour trouver rapidement le modèle adapté à votre fenêtre.",
  },
  {
    routeId: "velours",
    path: "/rideaux/velours",
    title: "Rideaux en velours",
    description:
      "Habillez votre intérieur avec des rideaux au tombé généreux, aux couleurs profondes et à la texture chaleureuse.",
    scope: { materials: ["velours"] },
    lockedFilterLabel: "Collection : Velours",
    seoTitle: "Rideaux en velours | HBS HOME",
    seoDescription:
      "Rideaux en velours épais, chaleureux et isolants. Plusieurs couleurs, largeurs et finitions, livraison partout en Tunisie.",
    seoBlock:
      "Le velours reste la matière la plus demandée pour habiller un salon. Sa densité absorbe la lumière, adoucit l'acoustique de la pièce et apporte une isolation appréciable en hiver comme en été. Nos velours se déclinent en teintes profondes — émeraude, bordeaux, bleu nuit — et en finitions à œillets, sur rail ou à galon fronceur.",
  },
  {
    routeId: "satin",
    path: "/rideaux/satin",
    title: "Rideaux en satin",
    description:
      "Des rideaux au reflet délicat qui captent la lumière et apportent une touche raffinée à vos pièces de réception.",
    scope: { materials: ["satin"] },
    lockedFilterLabel: "Collection : Satin",
    seoTitle: "Rideaux en satin | HBS HOME",
    seoDescription:
      "Rideaux en satin fluide aux reflets lumineux, disponibles en plusieurs coloris et dimensions. Livraison partout en Tunisie.",
    seoBlock:
      "Le satin joue avec la lumière : selon l'heure de la journée, sa surface se nuance et donne du relief à la fenêtre. C'est un choix élégant pour un séjour ou une salle à manger, à associer à un voilage pour préserver l'intimité tout en gardant de la clarté.",
  },
  {
    routeId: "lin",
    path: "/rideaux/lin",
    title: "Rideaux en lin",
    description:
      "Un textile naturel au grain visible, respirant et intemporel, pour une lumière douce du matin au soir.",
    scope: { materials: ["lin"] },
    lockedFilterLabel: "Collection : Lin",
    seoTitle: "Rideaux en lin | HBS HOME",
    seoDescription:
      "Rideaux en lin lavé, naturels et respirants, en teintes sable, grège et ivoire. Livraison partout en Tunisie.",
    seoBlock:
      "Le lin est la matière idéale sous le climat tunisien : il respire, sèche vite et vieillit bien. Ses plis souples et son grain irrégulier donnent un caractère naturel à la pièce, sans jamais l'assombrir. Nos lins existent en version légère, tamisante ou doublée pour plus d'obscurité.",
  },
  {
    routeId: "occultants",
    path: "/rideaux/occultants",
    title: "Rideaux occultants",
    description:
      "Des rideaux conçus pour bloquer la lumière, préserver le sommeil et protéger vos pièces de la chaleur.",
    scope: { opacityLevels: ["occultant"] },
    lockedFilterLabel: "Sélection : Occultants",
    seoTitle: "Rideaux occultants en Tunisie | HBS HOME",
    seoDescription:
      "Rideaux occultants pour chambre et salon : obscurité maîtrisée, isolation thermique et grandes largeurs disponibles.",
    seoBlock:
      "Un rideau occultant se choisit d'abord pour sa doublure et sa densité. Pour une chambre, privilégiez une largeur au moins deux fois supérieure à celle de la fenêtre afin d'obtenir des plis serrés et d'éviter les fuites de lumière sur les côtés. Nos modèles occultants sont également thermiques et limitent la surchauffe en été.",
  },
  {
    routeId: "tamisants",
    path: "/rideaux/tamisants",
    title: "Rideaux tamisants",
    description:
      "Filtrez la lumière sans assombrir la pièce et gardez votre intimité tout au long de la journée.",
    scope: { opacityLevels: ["tamisant", "tamisant_leger"] },
    lockedFilterLabel: "Sélection : Tamisants",
    seoTitle: "Rideaux tamisants | HBS HOME",
    seoDescription:
      "Rideaux tamisants et tamisants légers pour diffuser la lumière naturelle et préserver l'intimité. Livraison en Tunisie.",
    seoBlock:
      "Les rideaux tamisants sont le bon compromis entre clarté et intimité. Ils adoucissent la lumière directe, réduisent l'éblouissement sur les écrans et laissent la pièce lumineuse. On les associe souvent à un rideau occultant pour moduler l'ambiance selon les heures.",
  },
  {
    routeId: "thermiques",
    path: "/rideaux/thermiques",
    title: "Rideaux thermiques",
    description:
      "Des tissus épais ou doublés qui limitent les variations de température et améliorent le confort de vos pièces.",
    scope: { onlyThermal: true },
    lockedFilterLabel: "Sélection : Thermiques",
    seoTitle: "Rideaux thermiques et isolants | HBS HOME",
    seoDescription:
      "Rideaux thermiques doublés pour isoler du froid et de la chaleur. Velours et tissus techniques, livraison partout en Tunisie.",
    seoBlock:
      "Un rideau thermique agit comme une couche isolante devant la fenêtre : il freine les déperditions de chaleur l'hiver et repousse une partie du rayonnement solaire l'été. L'effet est d'autant plus net que le rideau descend jusqu'au sol et couvre largement l'encadrement.",
  },
  {
    routeId: "oeillets",
    path: "/rideaux/oeillets",
    title: "Rideaux à œillets",
    description:
      "La finition la plus simple à installer, avec des plis réguliers et un glissement fluide sur la tringle.",
    scope: { curtainHeaders: ["oeillets"] },
    lockedFilterLabel: "Finition : Œillets",
    seoTitle: "Rideaux à œillets | HBS HOME",
    seoDescription:
      "Rideaux à œillets métalliques, faciles à poser sur une tringle. Plusieurs matières, couleurs et dimensions.",
    seoBlock:
      "Les œillets se glissent directement sur la tringle et créent des vagues régulières sans accessoire supplémentaire. Vérifiez le diamètre de votre tringle avant de commander : nos œillets acceptent les tringles jusqu'à 28 mm.",
  },
  {
    routeId: "rail",
    path: "/rideaux/rail",
    title: "Rideaux pour rail",
    description:
      "Des rideaux pensés pour les rails plafond ou muraux, avec un tombé net sur toute la hauteur.",
    scope: { curtainHeaders: ["rail"] },
    lockedFilterLabel: "Finition : Rail",
    seoTitle: "Rideaux pour rail | HBS HOME",
    seoDescription:
      "Rideaux compatibles rails plafond et muraux, y compris en grandes largeurs pour baies vitrées. Livraison en Tunisie.",
    seoBlock:
      "Le rail est la solution la plus discrète, particulièrement adaptée aux baies vitrées et aux plafonds hauts. Le rideau file d'un mur à l'autre sans rupture visuelle et se manœuvre sans effort, même sur de grandes largeurs.",
  },
  {
    routeId: "packs",
    path: "/rideaux/packs",
    title: "Packs rideau et voilage",
    description:
      "Un rideau et son voilage assortis, sélectionnés ensemble pour habiller une fenêtre en une seule commande.",
    scope: { sellingMode: ["pack"] },
    lockedFilterLabel: "Sélection : Packs",
    seoTitle: "Packs rideau et voilage | HBS HOME",
    seoDescription:
      "Ensembles rideau et voilage coordonnés, prêts à poser. Le duo idéal pour moduler la lumière. Livraison en Tunisie.",
    seoBlock:
      "Le duo rideau et voilage permet de moduler la lumière tout au long de la journée : le voilage seul en journée, le rideau fermé le soir. Nos packs sont assortis en teintes et en dimensions, ce qui évite les erreurs d'association.",
  },
];

export function getCatalogPage(routeId: string): CatalogPageConfig {
  const page = catalogPages.find((entry) => entry.routeId === routeId);
  if (!page) throw new Error(`Unknown catalog page: ${routeId}`);
  return page;
}

export const catalogSubcategories = catalogPages
  .filter((page) => page.routeId !== "rideaux")
  .map((page) => ({ routeId: page.routeId, path: page.path, label: page.title }));

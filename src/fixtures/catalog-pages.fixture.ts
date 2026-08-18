import type { CatalogScope } from "@/repositories/interfaces/ProductRepository";

export type CatalogGroupId = "rideaux" | "voilages" | "stores";

export interface CatalogGroup {
  id: CatalogGroupId;
  label: string;
  path: string;
}

export const catalogGroups: CatalogGroup[] = [
  { id: "rideaux", label: "Rideaux", path: "/rideaux" },
  { id: "voilages", label: "Voilages", path: "/voilages" },
  { id: "stores", label: "Stores", path: "/stores" },
];

export interface CatalogPageConfig {
  routeId: string;
  group: CatalogGroupId;
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
    group: "rideaux",
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
  {
    routeId: "voilages",
    group: "voilages",
    path: "/voilages",
    title: "Voilages",
    description:
      "Des voiles légers qui diffusent la lumière, préservent l'intimité et adoucissent chaque fenêtre.",
    seoTitle: "Voilages en Tunisie | HBS HOME",
    seoDescription:
      "Voilages unis, brodés, rayés et grande largeur. Transparents ou tamisants, livrés partout en Tunisie avec paiement à la livraison.",
    seoBlock:
      "Le voilage est la première couche d'un habillage de fenêtre réussi : il filtre le soleil direct, masque le vis-à-vis en journée et garde la pièce lumineuse. Chez HBS HOME, nos voiles se déclinent en unis lumineux, broderies fines, rayures discrètes et jacquards légers, en largeurs standard comme en grandes largeurs pour les baies vitrées.",
  },
  {
    routeId: "voilages-unis",
    group: "voilages",
    path: "/voilages/unis",
    title: "Voilages unis",
    description:
      "Des voiles sans motif, parfaits pour laisser la lumière et l'architecture parler.",
    scope: { patterns: ["uni"] },
    lockedFilterLabel: "Motif : Uni",
    seoTitle: "Voilages unis | HBS HOME",
    seoDescription:
      "Voilages unis blancs, ivoire et grège, transparents ou tamisants. Livraison partout en Tunisie.",
    seoBlock:
      "Un voilage uni s'accorde avec tout et ne date jamais. Il se choisit surtout par sa transparence : un voile très fin pour une pièce sombre, un voile tamisant pour un salon exposé plein sud.",
  },
  {
    routeId: "voilages-motifs",
    group: "voilages",
    path: "/voilages/motifs",
    title: "Voilages à motifs",
    description: "Broderies, rayures et jacquards légers pour donner du caractère à la fenêtre.",
    scope: { patterns: ["brode", "raye", "imprime", "jacquard"] },
    lockedFilterLabel: "Motif : À motifs",
    seoTitle: "Voilages brodés et à motifs | HBS HOME",
    seoDescription:
      "Voilages brodés, rayés, imprimés et jacquard. Des motifs délicats qui habillent la fenêtre sans l'alourdir.",
    seoBlock:
      "Un voilage à motifs devient l'élément décoratif de la pièce : il suffit alors d'un rideau uni à côté pour équilibrer l'ensemble. Broderies florales, rayures ton sur ton ou jacquards géométriques, chaque motif se révèle en contre-jour.",
  },
  {
    routeId: "voilages-grande-largeur",
    group: "voilages",
    path: "/voilages/grande-largeur",
    title: "Voilages grande largeur",
    description: "Des panneaux de 300 à 400 cm pour couvrir une baie vitrée sans raccord visible.",
    scope: { onlyLargeWidth: true },
    lockedFilterLabel: "Sélection : Grande largeur",
    seoTitle: "Voilages grande largeur pour baie vitrée | HBS HOME",
    seoDescription:
      "Voilages jusqu'à 400 cm de large, sans couture visible, pour habiller une baie vitrée d'un seul tenant.",
    seoBlock:
      "Sur une baie vitrée, mieux vaut un seul panneau très large que deux lés cousus : le tombé reste net et aucune ligne ne vient couper la lumière. Pensez à mesurer la longueur du rail, pas celle du vitrage, et à multiplier par 1,5 pour obtenir de beaux plis.",
  },
  {
    routeId: "voilages-rail",
    group: "voilages",
    path: "/voilages/rail",
    title: "Voilages pour rail",
    description: "Voilages à ruban fronceur ou crochets, compatibles rails plafond et muraux.",
    scope: { curtainHeaders: ["rail"] },
    lockedFilterLabel: "Finition : Rail",
    seoTitle: "Voilages pour rail plafond | HBS HOME",
    seoDescription:
      "Voilages compatibles rails plafond et muraux, avec un tombé net sur toute la hauteur. Livraison en Tunisie.",
    seoBlock:
      "Le rail permet de faire courir le voilage d'un mur à l'autre et de le manœuvrer sans effort. C'est la solution la plus discrète pour une baie vitrée ou un plafond haut.",
  },
  {
    routeId: "stores",
    group: "stores",
    path: "/stores",
    title: "Stores",
    description:
      "Stores enrouleurs, jour/nuit, occultants et bambou : la lumière se règle au geste près.",
    seoTitle: "Stores en Tunisie | HBS HOME",
    seoDescription:
      "Stores enrouleurs, jour/nuit, occultants, tamisants et bambou. Pose murale, plafond ou sans perçage, livrés partout en Tunisie.",
    seoBlock:
      "Le store est la réponse la plus compacte quand la fenêtre manque de recul : pas de tringle, pas de tissu au sol, juste une toile qui se déroule à la hauteur voulue. Nos modèles couvrent tous les usages, du screen anti-reflets pour le bureau à l'occultant thermique pour la chambre, avec une pose murale, plafond ou sans perçage.",
  },
  {
    routeId: "stores-enrouleurs",
    group: "stores",
    path: "/stores/enrouleurs",
    title: "Stores enrouleurs",
    description: "Le classique : une toile, un tube, une chaînette. Simple à poser et à vivre.",
    scope: { blindTypes: ["enrouleur"] },
    lockedFilterLabel: "Type : Enrouleur",
    seoTitle: "Stores enrouleurs | HBS HOME",
    seoDescription:
      "Stores enrouleurs tamisants et occultants, en pose murale, plafond ou sans perçage. Livraison en Tunisie.",
    seoBlock:
      "Un store enrouleur se loge dans l'épaisseur de l'encadrement et libère complètement l'appui de fenêtre. On le choisit d'abord par sa toile : screen pour filtrer, occultante pour dormir.",
  },
  {
    routeId: "stores-jour-nuit",
    group: "stores",
    path: "/stores/jour-nuit",
    title: "Stores jour/nuit",
    description:
      "Des bandes alternées translucides et opaques qui se superposent pour doser la lumière.",
    scope: { blindTypes: ["jour_nuit"] },
    lockedFilterLabel: "Type : Jour/Nuit",
    seoTitle: "Stores jour/nuit zébrés | HBS HOME",
    seoDescription:
      "Stores jour/nuit à bandes alternées : de la pleine lumière à l'intimité totale en un geste. Livraison en Tunisie.",
    seoBlock:
      "Le store jour/nuit combine deux stores en un : en alignant les bandes opaques, on obtient une occultation partielle ; en les décalant, la lumière revient par fines lamelles. C'est le choix le plus polyvalent pour un séjour.",
  },
  {
    routeId: "stores-occultants",
    group: "stores",
    path: "/stores/occultants",
    title: "Stores occultants",
    description: "Toiles occultantes et thermiques pour le noir complet et la fraîcheur en été.",
    scope: { opacityLevels: ["occultant"] },
    lockedFilterLabel: "Sélection : Occultants",
    seoTitle: "Stores occultants et thermiques | HBS HOME",
    seoDescription:
      "Stores occultants à toile enduite, avec dos réfléchissant thermique. Idéals pour les chambres exposées.",
    seoBlock:
      "Pour obtenir le noir complet, le store doit déborder de 4 cm de chaque côté du vitrage : c'est sur les bords que la lumière s'infiltre. Nos toiles occultantes sont enduites au dos, ce qui renvoie aussi une partie de la chaleur du soleil.",
  },
  {
    routeId: "stores-bambou",
    group: "stores",
    path: "/stores/bambou",
    title: "Stores en bambou",
    description:
      "Lamelles de bambou naturel tressées, pour une lumière rayée et une matière chaleureuse.",
    scope: { materials: ["bambou"] },
    lockedFilterLabel: "Matière : Bambou",
    seoTitle: "Stores en bambou naturel | HBS HOME",
    seoDescription:
      "Stores en lamelles de bambou tressées à la main, filtrant la lumière en fines rayures. Livraison en Tunisie.",
    seoBlock:
      "Le bambou apporte immédiatement une note naturelle et se marie très bien avec un voilage blanc placé derrière. La lumière passe entre les lamelles et dessine des rayures douces sur le mur.",
  },
  {
    routeId: "stores-sans-percage",
    group: "stores",
    path: "/stores/sans-percage",
    title: "Stores sans perçage",
    description: "Fixation par clips sur le battant : aucun trou, idéal en location ou sur PVC.",
    scope: { mountings: ["sans_percage"] },
    lockedFilterLabel: "Pose : Sans perçage",
    seoTitle: "Stores sans perçage | HBS HOME",
    seoDescription:
      "Stores à fixation par clips, posés sans perceuse sur le battant de la fenêtre. Livraison partout en Tunisie.",
    seoBlock:
      "La pose sans perçage repose sur des clips qui prennent appui sur le battant ouvrant. Elle convient aux fenêtres PVC et aluminium jusqu'à 2 cm d'épaisseur de dormant et se retire sans laisser de trace.",
  },
];

/** La catégorie du groupe est toujours verrouillée, en plus du scope propre à la page. */
export function getCatalogPage(routeId: string): CatalogPageConfig {
  const page = catalogPages.find((entry) => entry.routeId === routeId);
  if (!page) throw new Error(`Unknown catalog page: ${routeId}`);
  return { ...page, scope: { ...page.scope, categories: [page.group] } };
}

/** Sous-catégories d'un groupe, hors page racine — utilisé par la barre de navigation locale. */
export function getCatalogSubcategories(group: CatalogGroupId) {
  return catalogPages
    .filter((page) => page.group === group && page.routeId !== group)
    .map((page) => ({ routeId: page.routeId, path: page.path, label: page.title }));
}

export function getCatalogGroup(group: CatalogGroupId): CatalogGroup {
  return catalogGroups.find((entry) => entry.id === group) as CatalogGroup;
}

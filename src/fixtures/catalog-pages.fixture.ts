import type { ProductCategory } from "@/domain/product/product.types";
import type { CatalogScope } from "@/repositories/interfaces/ProductRepository";

export type CatalogGroupId = ProductCategory;

export interface CatalogGroup {
  id: CatalogGroupId;
  label: string;
  path: string;
}

export const catalogGroups: CatalogGroup[] = [
  { id: "rideaux", label: "Rideaux", path: "/rideaux" },
  { id: "voilages", label: "Voilages", path: "/voilages" },
  { id: "stores", label: "Stores", path: "/stores" },
  { id: "coussins", label: "Coussins", path: "/coussins" },
  { id: "galettes_de_chaise", label: "Galettes de chaise", path: "/galettes-de-chaise" },
  { id: "accessoires", label: "Accessoires", path: "/accessoires" },
  { id: "mobilier_interieur", label: "Mobilier d'intérieur", path: "/mobilier" },
  { id: "plantes_decoration", label: "Plantes et décoration", path: "/plantes" },
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
  {
    routeId: "coussins",
    group: "coussins",
    path: "/coussins",
    title: "Coussins",
    description:
      "Coussins déco en lin lavé, velours, bouclette et coton : housses déhoussables, garnissage en option et coloris assortis à nos rideaux.",
    seoTitle: "Coussins déco en Tunisie | HBS HOME",
    seoDescription:
      "Housses de coussin en lin, velours, coton et bouclette. Formats carrés, rectangulaires et ronds, garnissage en option, livraison partout en Tunisie.",
    seoBlock:
      "Un coussin se choisit d'abord par sa taille : 45 × 45 cm pour un canapé standard, 50 × 50 cm pour une assise profonde, 30 × 50 cm pour soutenir le bas du dos. Les housses HBS HOME sont déhoussables et lavables en machine ; le garnissage se commande à part ou en supplément selon les modèles.",
  },
  {
    routeId: "coussins-lin",
    group: "coussins",
    path: "/coussins/lin",
    title: "Coussins en lin",
    description:
      "Coussins en lin lavé au grain irrégulier, parfaits pour un intérieur naturel et lumineux.",
    scope: { materials: ["lin"] },
    lockedFilterLabel: "Lin",
    seoTitle: "Coussins en lin lavé | HBS HOME",
    seoDescription:
      "Housses de coussin en lin lavé, douces dès la première utilisation. Formats 45 et 50 cm, livraison en Tunisie.",
    seoBlock:
      "Le lin lavé s'assouplit à chaque passage en machine et garde un aspect légèrement froissé qui vieillit bien. C'est la matière la plus tolérante pour un salon vécu au quotidien.",
  },
  {
    routeId: "coussins-velours",
    group: "coussins",
    path: "/coussins/velours",
    title: "Coussins en velours",
    description:
      "Coussins en velours dense aux reflets profonds, assortis à nos rideaux en velours.",
    scope: { materials: ["velours"] },
    lockedFilterLabel: "Velours",
    seoTitle: "Coussins en velours | HBS HOME",
    seoDescription:
      "Housses de coussin en velours dense, coloris émeraude, bordeaux, bleu nuit et moutarde. Livraison partout en Tunisie.",
    seoBlock:
      "Le velours change de teinte selon l'angle de la lumière : c'est ce qui donne de la profondeur à un canapé uni. Nos coloris reprennent ceux des rideaux Alba pour composer une pièce cohérente.",
  },
  {
    routeId: "coussins-lots",
    group: "coussins",
    path: "/coussins/lots",
    title: "Lots de coussins",
    description: "Duos et lots de housses assorties pour habiller un canapé d'un seul achat.",
    scope: { sellingMode: ["pack"] },
    lockedFilterLabel: "Lots",
    seoTitle: "Lots de coussins assortis | HBS HOME",
    seoDescription:
      "Lots de 2 housses de coussin assorties, unies et rayées. Tarif dégressif et livraison en Tunisie.",
    seoBlock:
      "Acheter par lot évite l'exercice délicat de l'accord des coloris : les housses sont pensées ensemble, une unie et une à motif dans la même gamme.",
  },
  {
    routeId: "galettes-de-chaise",
    group: "galettes_de_chaise",
    path: "/galettes-de-chaise",
    title: "Galettes de chaise",
    description:
      "Galettes de chaise carrées et rondes, mousse haute densité, housses déhoussables et sous-face antidérapante.",
    seoTitle: "Galettes de chaise en Tunisie | HBS HOME",
    seoDescription:
      "Galettes de chaise carrées et rondes, épaisseur 4 à 6 cm, housses lavables en machine. Livraison partout en Tunisie.",
    seoBlock:
      "Mesurez l'assise d'un bord à l'autre avant de choisir : une galette doit couvrir l'assise sans déborder. Les modèles à liens se nouent aux montants du dossier, les modèles à sous-face antidérapante se posent simplement.",
  },
  {
    routeId: "galettes-carrees",
    group: "galettes_de_chaise",
    path: "/galettes-de-chaise/carrees",
    title: "Galettes carrées",
    description: "Galettes carrées 40 et 45 cm pour chaises de salle à manger.",
    scope: { shapes: ["carree"] },
    lockedFilterLabel: "Carrées",
    seoTitle: "Galettes de chaise carrées | HBS HOME",
    seoDescription:
      "Galettes carrées 40 × 40 et 45 × 45 cm, mousse haute densité et housse déhoussable. Livraison en Tunisie.",
    seoBlock:
      "Le format carré convient aux chaises de salle à manger classiques. Prévoyez 40 cm pour une assise standard et 45 cm pour les chaises larges ou les fauteuils de table.",
  },
  {
    routeId: "galettes-rondes",
    group: "galettes_de_chaise",
    path: "/galettes-de-chaise/rondes",
    title: "Galettes rondes",
    description: "Galettes rondes pour chaises bistrot et tabourets de cuisine.",
    scope: { shapes: ["ronde"] },
    lockedFilterLabel: "Rondes",
    seoTitle: "Galettes de chaise rondes | HBS HOME",
    seoDescription:
      "Galettes rondes Ø 38 et 42 cm pour chaises bistrot et tabourets, sous-face antidérapante. Livraison en Tunisie.",
    seoBlock:
      "Sur une assise ronde, la galette doit rester légèrement en retrait du bord pour ne pas se déformer. Le Ø 38 cm couvre la majorité des chaises bistrot.",
  },
  {
    routeId: "accessoires",
    group: "accessoires",
    path: "/accessoires",
    title: "Accessoires",
    description:
      "Tringles, rails, embrasses et petites pièces pour installer et retenir vos rideaux, avec la quincaillerie nécessaire à la pose.",
    seoTitle: "Accessoires pour rideaux en Tunisie | HBS HOME",
    seoDescription:
      "Tringles extensibles, rails plafond, embrasses, anneaux, supports et kits de pose. Livraison partout en Tunisie, paiement à la livraison.",
    seoBlock:
      "Avant de commander une tringle, mesurez la largeur de la fenêtre et ajoutez 15 à 20 cm de chaque côté pour dégager complètement le vitrage. Un support central est recommandé au-delà de 200 cm de largeur.",
  },
  {
    routeId: "accessoires-tringles",
    group: "accessoires",
    path: "/accessoires/tringles",
    title: "Tringles à rideaux",
    description:
      "Tringles extensibles en acier et tringles fixes en bois, supports et embouts inclus.",
    scope: { accessoryTypes: ["tringle_extensible", "tringle_fixe"] },
    lockedFilterLabel: "Tringles",
    seoTitle: "Tringles à rideaux extensibles et bois | HBS HOME",
    seoDescription:
      "Tringles à rideaux Ø 25 et 28 mm, extensibles ou fixes, supports muraux et embouts inclus. Livraison en Tunisie.",
    seoBlock:
      "Une tringle extensible s'ajuste sans découpe entre deux longueurs. Vérifiez la charge maximale annoncée : un rideau en velours doublé pèse nettement plus qu'un voilage.",
  },
  {
    routeId: "accessoires-rails",
    group: "accessoires",
    path: "/accessoires/rails",
    title: "Rails de plafond",
    description: "Rails aluminium à galets silencieux, pose plafond ou murale.",
    scope: { accessoryTypes: ["rail"] },
    lockedFilterLabel: "Rails",
    seoTitle: "Rails à rideaux pour plafond | HBS HOME",
    seoDescription:
      "Rails aluminium recoupables avec galets silencieux, pose plafond ou murale. Livraison partout en Tunisie.",
    seoBlock:
      "Le rail se fixe au plafond et fait descendre le rideau depuis le haut de la pièce : c'est la solution la plus discrète pour les grandes hauteurs et les baies vitrées.",
  },
  {
    routeId: "accessoires-embrasses",
    group: "accessoires",
    path: "/accessoires/embrasses",
    title: "Embrasses et attaches",
    description: "Embrasses en corde tressée et attaches magnétiques pour retenir les rideaux.",
    scope: { accessoryTypes: ["embrasse", "attache_magnetique"] },
    lockedFilterLabel: "Embrasses",
    seoTitle: "Embrasses et attaches à rideaux | HBS HOME",
    seoDescription:
      "Embrasses en corde tressée et attaches magnétiques sans perçage pour retenir vos rideaux. Livraison en Tunisie.",
    seoBlock:
      "L'embrasse se place à mi-hauteur du rideau pour un drapé équilibré. L'attache magnétique évite tout perçage : elle se referme simplement autour du panneau.",
  },
  {
    routeId: "accessoires-petites-pieces",
    group: "accessoires",
    path: "/accessoires/petites-pieces",
    title: "Anneaux, supports et kits de pose",
    description: "Anneaux à clip, crochets, supports muraux et kits de pose complets.",
    scope: {
      accessoryTypes: ["anneau", "crochet", "support", "raccord", "embout", "accessoire_pose"],
    },
    lockedFilterLabel: "Petites pièces",
    seoTitle: "Anneaux, supports et kits de pose rideaux | HBS HOME",
    seoDescription:
      "Anneaux à clip, crochets, supports muraux renforcés et kits de pose avec chevilles et vis. Livraison en Tunisie.",
    seoBlock:
      "Comptez un anneau tous les 15 cm de largeur de tissu pour obtenir des plis réguliers, et un support supplémentaire au centre dès que la tringle dépasse 200 cm.",
  },
  {
    routeId: "mobilier_interieur",
    group: "mobilier_interieur",
    path: "/mobilier",
    title: "Mobilier d'intérieur",
    description:
      "Canapés, fauteuils, tables, rangements et assises d'appoint choisis pour s'accorder aux textiles HBS HOME.",
    seoTitle: "Mobilier d'intérieur en Tunisie | HBS HOME",
    seoDescription:
      "Canapés, fauteuils, tables basses, meubles TV, poufs et têtes de lit. Livraison sur rendez-vous partout en Tunisie.",
    seoBlock:
      "Le mobilier HBS HOME prolonge l'esprit de nos textiles : bois massif, rotin, cannage et tissus naturels, dans des teintes sable, terracotta et vert olive. Chaque pièce est choisie pour tenir dans un appartement tunisien comme dans une grande maison, et se combine avec nos rideaux et coussins. Les meubles volumineux sont livrés sur rendez-vous : les frais de livraison sont confirmés avec vous avant l'expédition.",
  },
  {
    routeId: "mobilier-canapes",
    group: "mobilier_interieur",
    path: "/mobilier/canapes",
    title: "Canapés",
    description: "Canapés 2 et 3 places en lin, velours et bouclette, structures en bois massif.",
    scope: { furnitureTypes: ["canape"] },
    lockedFilterLabel: "Canapés",
    seoTitle: "Canapés en tissu et velours | HBS HOME",
    seoDescription:
      "Canapés 2 et 3 places en lin, velours et bouclette. Livraison sur rendez-vous partout en Tunisie.",
    seoBlock:
      "Mesurez la longueur de mur disponible et laissez 40 cm de circulation devant le canapé. Un 3 places demande environ 210 cm de dégagement ; en dessous, le 2 places reste plus confortable au quotidien.",
  },
  {
    routeId: "mobilier-fauteuils",
    group: "mobilier_interieur",
    path: "/mobilier/fauteuils",
    title: "Fauteuils",
    description: "Fauteuils enveloppants et assises d'appoint pour le salon ou la chambre.",
    scope: { furnitureTypes: ["fauteuil"] },
    lockedFilterLabel: "Fauteuils",
    seoTitle: "Fauteuils de salon et de chambre | HBS HOME",
    seoDescription:
      "Fauteuils en bouclette, velours et rotin pour le salon, la chambre ou le bureau. Livraison en Tunisie.",
    seoBlock:
      "Le fauteuil se place idéalement en diagonale d'un canapé, près d'une source de lumière. Comptez 80 à 90 cm de largeur au sol pour un modèle enveloppant.",
  },
  {
    routeId: "mobilier-chaises",
    group: "mobilier_interieur",
    path: "/mobilier/chaises",
    title: "Chaises",
    description: "Chaises de salle à manger en bois massif, cannage et paille tressée.",
    scope: { furnitureTypes: ["chaise"] },
    lockedFilterLabel: "Chaises",
    seoTitle: "Chaises de salle à manger | HBS HOME",
    seoDescription:
      "Chaises en bois massif, assise cannée ou paillée, à associer à nos galettes de chaise. Livraison en Tunisie.",
    seoBlock:
      "Prévoyez 60 cm de largeur par convive autour de la table. Nos galettes de chaise carrées et rondes sont dimensionnées pour ces assises.",
  },
  {
    routeId: "mobilier-tables",
    group: "mobilier_interieur",
    path: "/mobilier/tables",
    title: "Tables basses et consoles",
    description: "Tables basses, tables d'appoint et consoles en bois, verre et marbre.",
    scope: { furnitureTypes: ["table_basse", "table_appoint", "console"] },
    lockedFilterLabel: "Tables et consoles",
    seoTitle: "Tables basses, tables d'appoint et consoles | HBS HOME",
    seoDescription:
      "Tables basses rondes, tables d'appoint et consoles d'entrée en bois massif, verre ou marbre. Livraison en Tunisie.",
    seoBlock:
      "Une table basse se choisit à la même hauteur que l'assise du canapé, à 40 cm de distance. Les plateaux en verre et en marbre voyagent en emballage renforcé.",
  },
  {
    routeId: "mobilier-rangements",
    group: "mobilier_interieur",
    path: "/mobilier/rangements",
    title: "Meubles TV et rangements",
    description: "Meubles TV, buffets et étagères en bois massif et cannage.",
    scope: { furnitureTypes: ["meuble_tv", "buffet", "etagere"] },
    lockedFilterLabel: "Rangements",
    seoTitle: "Meubles TV, buffets et étagères | HBS HOME",
    seoDescription:
      "Meubles TV bas, buffets et étagères en bois massif et cannage. Livraison sur rendez-vous en Tunisie.",
    seoBlock:
      "Un meuble TV se choisit au moins 20 cm plus large que l'écran. Les buffets et étagères hauts sont livrés avec le nécessaire de fixation murale anti-basculement.",
  },
  {
    routeId: "mobilier-poufs",
    group: "mobilier_interieur",
    path: "/mobilier/poufs",
    title: "Poufs et assises d'appoint",
    description: "Poufs en velours, cuir synthétique et fibres naturelles.",
    scope: { furnitureTypes: ["pouf"] },
    lockedFilterLabel: "Poufs",
    seoTitle: "Poufs et assises d'appoint | HBS HOME",
    seoDescription:
      "Poufs ronds en velours, cuir synthétique et fibres naturelles, à poser au salon ou en bout de lit.",
    seoBlock:
      "Le pouf sert d'assise d'appoint, de repose-pieds ou de table basse avec un plateau. C'est la pièce la plus simple à ajouter dans un petit salon.",
  },
  {
    routeId: "mobilier-tetes-de-lit",
    group: "mobilier_interieur",
    path: "/mobilier/tetes-de-lit",
    title: "Têtes de lit",
    description: "Têtes de lit capitonnées en lin et velours, pour lits 140 à 180 cm.",
    scope: { furnitureTypes: ["tete_de_lit"] },
    lockedFilterLabel: "Têtes de lit",
    seoTitle: "Têtes de lit en lin et velours | HBS HOME",
    seoDescription:
      "Têtes de lit rembourrées en lin lavé et velours pour lits 140, 160 et 180 cm. Livraison en Tunisie.",
    seoBlock:
      "La tête de lit se fixe au mur à environ 60 cm au-dessus du sommier. Choisissez-la à la largeur exacte du lit, ou 10 cm plus large pour un effet enveloppant.",
  },
  {
    routeId: "plantes_decoration",
    group: "plantes_decoration",
    path: "/plantes",
    title: "Plantes et décoration végétale",
    description:
      "Plantes artificielles et naturelles, arbres, suspensions, compositions séchées et cache-pots.",
    seoTitle: "Plantes d'intérieur et cache-pots en Tunisie | HBS HOME",
    seoDescription:
      "Plantes artificielles réalistes, plantes naturelles faciles d'entretien, compositions séchées et cache-pots. Livraison en Tunisie.",
    seoBlock:
      "Le végétal adoucit un intérieur minéral et complète nos textiles. Nos plantes artificielles ne demandent aucun entretien et supportent les pièces sombres ; nos plantes naturelles sont sélectionnées parmi les variétés qui tolèrent la chaleur et un arrosage espacé. Filtrez par nature, taille, luminosité ou niveau d'entretien pour trouver la plante adaptée à votre pièce.",
  },
  {
    routeId: "plantes-artificielles",
    group: "plantes_decoration",
    path: "/plantes/artificielles",
    title: "Plantes artificielles",
    description: "Feuillages réalistes sans entretien, pour les pièces peu lumineuses.",
    scope: { plantNatures: ["artificielle"] },
    lockedFilterLabel: "Plantes artificielles",
    seoTitle: "Plantes artificielles réalistes | HBS HOME",
    seoDescription:
      "Oliviers, monsteras et feuillages artificiels réalistes, sans arrosage ni lumière. Livraison partout en Tunisie.",
    seoBlock:
      "Une plante artificielle se dépoussière au chiffon sec une fois par mois. Placée hors du soleil direct, elle garde ses couleurs pendant des années.",
  },
  {
    routeId: "plantes-naturelles",
    group: "plantes_decoration",
    path: "/plantes/naturelles",
    title: "Plantes naturelles",
    description: "Variétés résistantes adaptées au climat tunisien, livrées en pot.",
    scope: { plantNatures: ["naturelle"] },
    lockedFilterLabel: "Plantes naturelles",
    seoTitle: "Plantes vertes d'intérieur | HBS HOME",
    seoDescription:
      "Plantes vertes faciles d'entretien, livrées en pot avec conseils d'arrosage. Livraison soignée en Tunisie.",
    seoBlock:
      "En Tunisie, l'ennemi des plantes d'intérieur est l'excès d'arrosage plus que la chaleur. Attendez que les premiers centimètres de terre soient secs avant d'arroser de nouveau.",
  },
  {
    routeId: "plantes-grandes",
    group: "plantes_decoration",
    path: "/plantes/grandes-plantes",
    title: "Grandes plantes et arbres",
    description: "Sujets de plus d'un mètre pour habiller un angle de salon.",
    scope: { plantTypes: ["grande_plante", "arbre_artificiel"] },
    lockedFilterLabel: "Grandes plantes",
    seoTitle: "Grandes plantes et arbres d'intérieur | HBS HOME",
    seoDescription:
      "Oliviers, ficus et grandes plantes de plus d'un mètre pour salon et entrée. Livraison sur rendez-vous en Tunisie.",
    seoBlock:
      "Un grand sujet se place dans un angle, à côté d'un canapé ou près d'une fenêtre voilée. Prévoyez un cache-pot d'un diamètre supérieur de 2 à 4 cm à celui du pot de culture.",
  },
  {
    routeId: "plantes-suspendues",
    group: "plantes_decoration",
    path: "/plantes/suspendues",
    title: "Plantes suspendues",
    description: "Retombantes en suspension macramé, pour étagères et fenêtres.",
    scope: { plantTypes: ["plante_suspendue"] },
    lockedFilterLabel: "Plantes suspendues",
    seoTitle: "Plantes suspendues et macramé | HBS HOME",
    seoDescription:
      "Plantes retombantes en suspension macramé pour fenêtres, étagères et coins de salon. Livraison en Tunisie.",
    seoBlock:
      "Une suspension se fixe dans le plafond avec une cheville adaptée au poids en charge, arrosage compris. Comptez 20 cm de dégagement autour du feuillage.",
  },
  {
    routeId: "plantes-compositions",
    group: "plantes_decoration",
    path: "/plantes/compositions",
    title: "Compositions et fleurs séchées",
    description: "Bouquets séchés, pampa et eucalyptus stabilisé.",
    scope: { plantTypes: ["composition"] },
    lockedFilterLabel: "Compositions",
    seoTitle: "Fleurs séchées et compositions | HBS HOME",
    seoDescription:
      "Bouquets de pampa, eucalyptus stabilisé et compositions séchées pour console et table. Livraison en Tunisie.",
    seoBlock:
      "Les tiges séchées n'ont besoin d'aucun entretien : évitez simplement l'humidité et le soleil direct, qui décolorent les épis.",
  },
  {
    routeId: "plantes-cache-pots",
    group: "plantes_decoration",
    path: "/plantes/cache-pots",
    title: "Pots et cache-pots",
    description: "Cache-pots en terre cuite, céramique et fibres tressées.",
    scope: { plantTypes: ["cache_pot"] },
    lockedFilterLabel: "Cache-pots",
    seoTitle: "Pots et cache-pots décoratifs | HBS HOME",
    seoDescription:
      "Cache-pots en terre cuite, céramique émaillée et fibres tressées, plusieurs diamètres. Livraison en Tunisie.",
    seoBlock:
      "Choisissez un cache-pot 2 à 4 cm plus large que le pot de culture, et videz la soucoupe après chaque arrosage pour éviter que les racines ne stagnent dans l'eau.",
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
    .filter((page) => page.group === group && page.scope != null)
    .map((page) => ({ routeId: page.routeId, path: page.path, label: page.title }));
}

export function getCatalogGroup(group: CatalogGroupId): CatalogGroup {
  return catalogGroups.find((entry) => entry.id === group) as CatalogGroup;
}

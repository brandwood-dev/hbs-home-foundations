import textureVelours from "@/assets/product/texture-velours.jpg";
import textureSatin from "@/assets/product/texture-satin.jpg";
import textureLin from "@/assets/product/texture-lin.jpg";
import textureJacquard from "@/assets/product/texture-jacquard.jpg";
import detailOeillets from "@/assets/product/detail-oeillets.jpg";
import detailTete from "@/assets/product/detail-tete.jpg";
import textureVoile from "@/assets/catalog/voilages/voilage-transparence.jpg";
import textureStore from "@/assets/catalog/stores/store-mecanisme.jpg";
import {
  BLIND_MOUNTING_LABELS,
  BLIND_TYPE_LABELS,
  HEADER_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  SELLING_MODE_LABELS,
} from "@/domain/product/product.constants";
import type {
  BlindMountingType,
  BlindType,
  CurtainHeader,
  CurtainMaterial,
  EyeletColor,
  OpacityLevel,
  ProductCategory,
  ProductDetails,
} from "@/domain/product/product.types";

export const MATERIAL_TEXTURES: Record<CurtainMaterial, string> = {
  velours: textureVelours,
  satin: textureSatin,
  lin: textureLin,
  jacquard: textureJacquard,
  polyester: textureSatin,
  voile: textureVoile,
  melange_lin: textureLin,
  jacquard_leger: textureJacquard,
  toile_technique: textureStore,
  bambou: textureStore,
};

export const HEADER_DETAIL_IMAGES: Record<CurtainHeader, string> = {
  oeillets: detailOeillets,
  rail: detailTete,
  galon_fronceur: detailTete,
  passants: detailTete,
};

/** Finitions d'œillets proposées selon la matière. */
export const EYELET_OPTIONS_BY_MATERIAL: Record<CurtainMaterial, EyeletColor[]> = {
  velours: ["argent", "dore"],
  satin: ["dore", "argent"],
  lin: ["argent", "noir"],
  jacquard: ["argent", "dore"],
  polyester: ["argent", "noir"],
  voile: ["argent"],
  melange_lin: ["argent", "noir"],
  jacquard_leger: ["argent", "dore"],
  toile_technique: [],
  bambou: [],
};

/** Supplément appliqué à la doublure thermique (en millimes). */
export const THERMAL_LINING_SURCHARGE_MINOR = 25000;

const MATERIAL_COMPOSITION: Record<CurtainMaterial, string> = {
  velours: "100 % polyester effet velours ras",
  satin: "97 % polyester, 3 % élasthanne, finition satinée",
  lin: "70 % lin lavé, 30 % coton",
  jacquard: "60 % polyester, 40 % viscose tissé jacquard",
  polyester: "100 % polyester tissé serré",
  voile: "100 % polyester voile transparent",
  melange_lin: "55 % lin, 45 % polyester, aspect naturel",
  jacquard_leger: "70 % polyester, 30 % viscose, jacquard aéré",
  toile_technique: "100 % polyester enduit, toile technique pour store",
  bambou: "Lamelles de bambou naturel tressées",
};

const MATERIAL_WEIGHT: Record<CurtainMaterial, number> = {
  velours: 320,
  satin: 180,
  lin: 240,
  jacquard: 280,
  polyester: 210,
  voile: 45,
  melange_lin: 120,
  jacquard_leger: 130,
  toile_technique: 210,
  bambou: 320,
};

const MATERIAL_STORY: Record<CurtainMaterial, string> = {
  velours:
    "Le velours dense absorbe la lumière et les sons : il habille les grandes hauteurs sous plafond et donne immédiatement une atmosphère feutrée au salon comme à la chambre.",
  satin:
    "Le satin capte la lumière et la renvoie en reflets doux. Son tombé fluide convient aux pièces de réception que l'on souhaite lumineuses sans perdre en intimité.",
  lin: "Le lin lavé apporte une texture vivante et légèrement irrégulière. Il filtre la lumière tunisienne en la rendant douce, sans jamais assombrir la pièce.",
  jacquard:
    "Le tissage jacquard dessine son motif dans la matière elle-même. Le relief se révèle différemment selon l'heure de la journée et l'orientation de la fenêtre.",
  polyester:
    "Le polyester tissé serré est facile à vivre : stable au lavage, résistant au soleil et sans repassage, il convient aux pièces très utilisées.",
  voile:
    "Le voile laisse passer la lumière tout en floutant les vis-à-vis, pour une clarté douce toute la journée.",
  melange_lin:
    "Le mélange lin garde le grain naturel du lin avec une meilleure tenue au lavage et moins de plis.",
  jacquard_leger:
    "Le jacquard léger dessine son motif dans le tissage : la lumière révèle le relief sans alourdir la fenêtre.",
  toile_technique:
    "La toile technique est enduite pour résister au soleil, à l'humidité et aux variations de température.",
  bambou:
    "Les lamelles de bambou apportent une chaleur naturelle et filtrent la lumière en fines rayures.",
};

const OPACITY_STORY: Record<OpacityLevel, string> = {
  transparent:
    "Il laisse passer la quasi-totalité de la lumière et se pose seul ou sous un rideau.",
  tamisant_leger: "Il laisse largement passer la clarté tout en voilant les regards extérieurs.",
  tamisant: "Il tamise la lumière et conserve une belle luminosité en journée.",
  obscurcissant: "Il réduit fortement la lumière sans plonger la pièce dans le noir complet.",
  occultant: "Il bloque la quasi-totalité de la lumière, idéal pour une chambre ou une sieste.",
};

const CARE_BY_MATERIAL: Record<CurtainMaterial, string[]> = {
  velours: [
    "Lavage en machine à 30 °C, cycle délicat",
    "Ne pas utiliser d'eau de javel",
    "Séchage à l'air libre, suspendu",
    "Repassage à basse température sur l'envers",
  ],
  satin: [
    "Lavage en machine à 30 °C, cycle délicat",
    "Essorage réduit pour préserver les reflets",
    "Séchage à l'air libre, suspendu",
    "Repassage doux sur l'envers",
  ],
  lin: [
    "Lavage en machine à 30 °C",
    "Séchage à l'air libre, à plat ou suspendu",
    "Repassage légèrement humide",
    "Les plis naturels du lin font partie de la matière",
  ],
  jacquard: [
    "Lavage en machine à 30 °C, cycle délicat",
    "Ne pas essorer fortement",
    "Séchage à l'air libre, suspendu",
    "Repassage à basse température sur l'envers",
  ],
  polyester: [
    "Lavage en machine à 40 °C",
    "Séchage à l'air libre, suspendu",
    "Repassage inutile dans la plupart des cas",
  ],
  voile: [
    "Lavage en machine à 30 °C, filet recommandé",
    "Essorage très réduit",
    "Repose humide sur la tringle, sans repassage",
  ],
  melange_lin: [
    "Lavage en machine à 30 °C",
    "Séchage à l'air libre, suspendu",
    "Repassage légèrement humide",
  ],
  jacquard_leger: [
    "Lavage en machine à 30 °C, cycle délicat",
    "Séchage à l'air libre, suspendu",
    "Repassage doux sur l'envers",
  ],
  toile_technique: [
    "Nettoyage à l'éponge humide, sans détergent agressif",
    "Ne pas immerger, ne pas laver en machine",
    "Laisser sécher déroulé avant de remonter le store",
  ],
  bambou: [
    "Dépoussiérage à l'aspirateur avec brosse douce",
    "Chiffon légèrement humide pour les taches",
    "Ne jamais immerger les lamelles",
  ],
};

/** Nom commun employé dans les textes générés, par catégorie. */
export const CATEGORY_NOUNS: Record<ProductCategory, string> = {
  rideaux: "rideau",
  voilages: "voilage",
  stores: "store",
  coussins: "coussin",
  galettes_de_chaise: "galette de chaise",
  accessoires: "accessoire",
};

const BLIND_TYPE_STORY: Record<BlindType, string> = {
  enrouleur:
    "Le store enrouleur s'enroule sur un tube discret : il libère l'appui de fenêtre et se manœuvre d'un geste.",
  jour_nuit:
    "Les bandes alternées du store jour/nuit permettent de doser la lumière au millimètre, de la pleine clarté à l'intimité totale.",
  occultant:
    "Sa toile occultante plaque la lumière contre l'encadrement et plonge la pièce dans le noir, même en plein après-midi.",
  tamisant:
    "Sa toile tamisante adoucit le soleil direct et supprime les reflets sur les écrans sans assombrir la pièce.",
  bambou:
    "Les lamelles de bambou dessinent de fines rayures de lumière et réchauffent instantanément l'ambiance.",
};

export function buildLongDescription(input: {
  name: string;
  category: ProductCategory;
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  sellingMode: keyof typeof SELLING_MODE_LABELS;
  shortDescription: string;
  isThermal: boolean;
  blindType?: BlindType | undefined;
}): string {
  const noun = CATEGORY_NOUNS[input.category];

  if (input.category === "stores") {
    return [
      `${input.name} est un ${input.blindType ? BLIND_TYPE_LABELS[input.blindType].toLowerCase() : "store"} au rendu ${OPACITY_LABELS[input.opacityLevel].toLowerCase()}.`,
      input.blindType ? BLIND_TYPE_STORY[input.blindType] : "",
      OPACITY_STORY[input.opacityLevel],
      "Il se pose au mur, au plafond ou sans perçage sur le battant, et se coupe à la largeur exacte de votre fenêtre.",
      "Livré avec ses supports, sa chaînette de manœuvre et sa notice de pose.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    `${input.name} est un ${noun} ${MATERIAL_LABELS[input.material].toLowerCase()} au rendu ${OPACITY_LABELS[input.opacityLevel].toLowerCase()}.`,
    MATERIAL_STORY[input.material],
    OPACITY_STORY[input.opacityLevel],
    input.category === "voilages"
      ? "Il s'utilise seul pour préserver l'intimité en journée, ou en second rideau derrière un modèle occultant."
      : input.isThermal
        ? "Sa doublure thermique limite les déperditions de chaleur en hiver et retient la chaleur du soleil en été."
        : "Il se marie facilement avec un voilage pour moduler la lumière au fil de la journée.",
    `Vendu en ${SELLING_MODE_LABELS[input.sellingMode].toLowerCase()}, il est livré prêt à poser.`,
  ].join(" ");
}

export function buildDetails(input: {
  category: ProductCategory;
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  headers: CurtainHeader[];
  mountings?: BlindMountingType[];
  isThermal: boolean;
  isLargeWidth?: boolean;
}): ProductDetails {
  const isBlind = input.category === "stores";

  const features = isBlind
    ? [
        `Occultation : ${OPACITY_LABELS[input.opacityLevel]}`,
        `Toile : ${MATERIAL_LABELS[input.material]}`,
        "Traitement anti-UV et anti-décoloration",
        "Chaînette de manœuvre latérale réversible",
        "Supports et notice de pose inclus",
      ]
    : [
        `Occultation : ${OPACITY_LABELS[input.opacityLevel]}`,
        `Matière : ${MATERIAL_LABELS[input.material]}`,
        input.isThermal ? "Doublure thermique disponible" : "Compatible avec un voilage assorti",
        input.isLargeWidth
          ? "Grande largeur adaptée aux baies vitrées"
          : "Ourlets renforcés haut et bas",
        "Traitement anti-décoloration",
      ];

  const installationNotes = isBlind
    ? [
        `Poses disponibles : ${(input.mountings ?? []).map((mounting) => BLIND_MOUNTING_LABELS[mounting]).join(", ")}`,
        "Mesurer la largeur du vitrage puis ajouter 4 cm de chaque côté pour éviter les fuites de lumière",
        "Prévoir 10 cm au-dessus de l'encadrement pour loger le tube d'enroulement",
      ]
    : [
        `Finitions disponibles : ${input.headers.map((header) => HEADER_LABELS[header]).join(", ")}`,
        "Prévoir une largeur de tissu 1,5 à 2 fois supérieure à celle de la fenêtre",
        "Mesurer de la tringle au sol, puis retirer 1 cm pour éviter le frottement",
      ];

  return {
    composition: MATERIAL_COMPOSITION[input.material],
    weightGsm: MATERIAL_WEIGHT[input.material],
    care: CARE_BY_MATERIAL[input.material],
    features,
    installationNotes,
    originNote: "Confection contrôlée par HBS HOME, expédition depuis Ras Jebel, Bizerte.",
  };
}

export function buildSeo(input: {
  name: string;
  category: ProductCategory;
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  shortDescription: string;
  blindType?: BlindType | undefined;
}) {
  const noun = CATEGORY_NOUNS[input.category];
  const qualifier =
    input.category === "stores" && input.blindType
      ? BLIND_TYPE_LABELS[input.blindType].toLowerCase()
      : `${noun} ${MATERIAL_LABELS[input.material].toLowerCase()}`;
  const title = `${input.name} — ${qualifier.charAt(0).toUpperCase()}${qualifier.slice(1)} ${OPACITY_LABELS[input.opacityLevel].toLowerCase()} | HBS HOME`;
  const description = `${input.shortDescription} Livraison en Tunisie sous 24 à 48 h, paiement à la livraison.`;
  return { title: title.slice(0, 120), description: description.slice(0, 200) };
}

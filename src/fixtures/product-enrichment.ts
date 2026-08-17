import textureVelours from "@/assets/product/texture-velours.jpg";
import textureSatin from "@/assets/product/texture-satin.jpg";
import textureLin from "@/assets/product/texture-lin.jpg";
import textureJacquard from "@/assets/product/texture-jacquard.jpg";
import detailOeillets from "@/assets/product/detail-oeillets.jpg";
import detailTete from "@/assets/product/detail-tete.jpg";
import {
  HEADER_LABELS,
  MATERIAL_LABELS,
  OPACITY_LABELS,
  SELLING_MODE_LABELS,
} from "@/domain/product/product.constants";
import type {
  CurtainHeader,
  CurtainMaterial,
  EyeletColor,
  OpacityLevel,
  ProductDetails,
} from "@/domain/product/product.types";

export const MATERIAL_TEXTURES: Record<CurtainMaterial, string> = {
  velours: textureVelours,
  satin: textureSatin,
  lin: textureLin,
  jacquard: textureJacquard,
  polyester: textureSatin,
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
};

/** Supplément appliqué à la doublure thermique (en millimes). */
export const THERMAL_LINING_SURCHARGE_MINOR = 25000;

const MATERIAL_COMPOSITION: Record<CurtainMaterial, string> = {
  velours: "100 % polyester effet velours ras",
  satin: "97 % polyester, 3 % élasthanne, finition satinée",
  lin: "70 % lin lavé, 30 % coton",
  jacquard: "60 % polyester, 40 % viscose tissé jacquard",
  polyester: "100 % polyester tissé serré",
};

const MATERIAL_WEIGHT: Record<CurtainMaterial, number> = {
  velours: 320,
  satin: 180,
  lin: 240,
  jacquard: 280,
  polyester: 210,
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
};

const OPACITY_STORY: Record<OpacityLevel, string> = {
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
};

export function buildLongDescription(input: {
  name: string;
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  sellingMode: keyof typeof SELLING_MODE_LABELS;
  shortDescription: string;
  isThermal: boolean;
}): string {
  const parts = [
    `${input.name} est un rideau ${MATERIAL_LABELS[input.material].toLowerCase()} au rendu ${OPACITY_LABELS[input.opacityLevel].toLowerCase()}.`,
    MATERIAL_STORY[input.material],
    OPACITY_STORY[input.opacityLevel],
    input.isThermal
      ? "Sa doublure thermique limite les déperditions de chaleur en hiver et retient la chaleur du soleil en été."
      : "Il se marie facilement avec un voilage pour moduler la lumière au fil de la journée.",
    `Vendu en ${SELLING_MODE_LABELS[input.sellingMode].toLowerCase()}, il est livré prêt à poser.`,
  ];
  return parts.join(" ");
}

export function buildDetails(input: {
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  headers: CurtainHeader[];
  isThermal: boolean;
}): ProductDetails {
  return {
    composition: MATERIAL_COMPOSITION[input.material],
    weightGsm: MATERIAL_WEIGHT[input.material],
    care: CARE_BY_MATERIAL[input.material],
    features: [
      `Occultation : ${OPACITY_LABELS[input.opacityLevel]}`,
      `Matière : ${MATERIAL_LABELS[input.material]}`,
      input.isThermal ? "Doublure thermique disponible" : "Compatible avec un voilage assorti",
      "Ourlets renforcés haut et bas",
      "Traitement anti-décoloration",
    ],
    installationNotes: [
      `Finitions disponibles : ${input.headers.map((header) => HEADER_LABELS[header]).join(", ")}`,
      "Prévoir une largeur de tissu 1,5 à 2 fois supérieure à celle de la fenêtre",
      "Mesurer de la tringle au sol, puis retirer 1 cm pour éviter le frottement",
    ],
    originNote: "Confection contrôlée par HBS HOME, expédition depuis Ras Jebel, Bizerte.",
  };
}

export function buildSeo(input: {
  name: string;
  material: CurtainMaterial;
  opacityLevel: OpacityLevel;
  shortDescription: string;
}) {
  const title = `${input.name} — Rideau ${MATERIAL_LABELS[input.material].toLowerCase()} ${OPACITY_LABELS[input.opacityLevel].toLowerCase()} | HBS HOME`;
  const description = `${input.shortDescription} Livraison en Tunisie sous 24 à 48 h, paiement à la livraison.`;
  return { title: title.slice(0, 120), description: description.slice(0, 200) };
}

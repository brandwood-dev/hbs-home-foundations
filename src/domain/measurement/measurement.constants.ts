import type {
  BlindMountingPosition,
  CurtainFloorFinish,
  CurtainFullnessRatio,
  CurtainLengthTarget,
  CurtainSupportType,
  MeasurementProjectType,
  MeasurementRecommendationLevel,
  MeasurementRules,
  OpeningType,
} from "@/domain/measurement/measurement.types";

/**
 * Valeurs de démonstration, volontairement indicatives.
 * Le futur backend ou CMS devra pouvoir les reconfigurer sans redéploiement.
 */
export const DEFAULT_MEASUREMENT_RULES: MeasurementRules = {
  version: 1,
  limits: {
    minWidthCm: 20,
    maxWidthCm: 1000,
    minHeightCm: 20,
    maxHeightCm: 500,
  },
  curtain: {
    allowedFullnessRatios: [1.5, 2, 2.5],
    defaultFullnessRatio: 2,
    floorAdjustmentsCm: {
      aboveFloor: -2,
      kissFloor: 0,
      puddle: 10,
    },
    belowSillExtensionCm: 15,
    defaultSideExtensionCm: 15,
    recommendationWidthToleranceCm: 15,
    recommendationHeightToleranceCm: 10,
  },
  blind: {
    insideRecessClearanceCm: 1,
    outsideOverlapSideCm: 5,
    outsideOverlapTopCm: 10,
    outsideOverlapBottomCm: 10,
    recommendationWidthToleranceCm: 2,
    recommendationHeightToleranceCm: 10,
  },
};

export const MEASUREMENT_DISCLAIMER =
  "Ces recommandations sont indicatives. Vérifiez toujours les contraintes propres à votre fenêtre et au produit sélectionné.";

/** Écart au-delà duquel on alerte l'utilisateur sur une ouverture irrégulière. */
export const MEASUREMENT_DEVIATION_THRESHOLD_CM = 1.5;

export const MEASUREMENT_MAX_PRODUCT_RECOMMENDATIONS = 6;
export const MEASUREMENT_MAX_ACCESSORY_RECOMMENDATIONS = 4;

export const MEASUREMENT_PROJECT_LABELS: Record<MeasurementProjectType, string> = {
  rideaux: "Rideaux",
  voilages: "Voilages",
  stores: "Stores",
};

export const OPENING_TYPE_LABELS: Record<OpeningType, string> = {
  fenetre: "Fenêtre",
  porte_fenetre: "Porte-fenêtre",
  baie_vitree: "Baie vitrée",
};

export const CURTAIN_SUPPORT_LABELS: Record<CurtainSupportType, string> = {
  tringle: "Tringle",
  rail: "Rail",
  inconnu: "Je ne sais pas encore",
};

export const CURTAIN_LENGTH_TARGET_LABELS: Record<CurtainLengthTarget, string> = {
  rebord_fenetre: "Au rebord de fenêtre",
  sous_rebord: "Sous le rebord",
  sol: "Jusqu'au sol",
};

export const CURTAIN_FLOOR_FINISH_LABELS: Record<CurtainFloorFinish, string> = {
  au_dessus_du_sol: "Légèrement au-dessus du sol",
  ras_du_sol: "Au ras du sol",
  tombe_cassant: "Tombé cassant",
};

export const CURTAIN_FULLNESS_LABELS: Record<string, string> = {
  "1.5": "Légère ×1,5",
  "2": "Équilibrée ×2",
  "2.5": "Généreuse ×2,5",
};

export const CURTAIN_FULLNESS_HINTS: Record<string, string> = {
  "1.5": "Plis discrets, idéal pour les voilages et les petites fenêtres.",
  "2": "Le meilleur compromis : des plis réguliers et une bonne tenue.",
  "2.5": "Drapé très dense, recommandé pour le velours et les grandes baies.",
};

export const BLIND_MOUNTING_POSITION_LABELS: Record<BlindMountingPosition, string> = {
  dans_encadrement: "Dans l'encadrement",
  hors_encadrement: "Hors encadrement",
};

export const RECOMMENDATION_LEVEL_LABELS: Record<MeasurementRecommendationLevel, string> = {
  exact: "Correspondance exacte",
  compatible: "Compatible",
  approximate: "Approchant",
  custom_required: "Sur mesure recommandé",
};

export const FULLNESS_RATIOS: CurtainFullnessRatio[] = [1.5, 2, 2.5];

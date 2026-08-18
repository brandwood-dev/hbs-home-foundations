import type {
  BlindMountingType,
  BlindType,
  CurtainHeader,
  Product,
  ProductVariant,
} from "@/domain/product/product.types";

export type MeasurementProjectType = "rideaux" | "voilages" | "stores";

export type CurtainSupportType = "tringle" | "rail" | "inconnu";

export type OpeningType = "fenetre" | "porte_fenetre" | "baie_vitree";

export type CurtainLengthTarget = "rebord_fenetre" | "sous_rebord" | "sol";

export type CurtainFloorFinish = "au_dessus_du_sol" | "ras_du_sol" | "tombe_cassant";

export type CurtainFullnessRatio = 1.5 | 2 | 2.5;

export type CurtainPanelCount = 1 | 2;

export type BlindMountingPosition = "dans_encadrement" | "hors_encadrement";

export type MeasurementRecommendationLevel =
  | "exact"
  | "compatible"
  | "approximate"
  | "custom_required";

/** Règles de calcul configurables — servies par MeasurementRulesRepository. */
export interface MeasurementRules {
  version: 1;

  limits: {
    minWidthCm: number;
    maxWidthCm: number;
    minHeightCm: number;
    maxHeightCm: number;
  };

  curtain: {
    allowedFullnessRatios: CurtainFullnessRatio[];
    defaultFullnessRatio: CurtainFullnessRatio;

    floorAdjustmentsCm: {
      aboveFloor: number;
      kissFloor: number;
      puddle: number;
    };

    belowSillExtensionCm: number;
    defaultSideExtensionCm: number;

    recommendationWidthToleranceCm: number;
    recommendationHeightToleranceCm: number;
  };

  blind: {
    insideRecessClearanceCm: number;

    outsideOverlapSideCm: number;
    outsideOverlapTopCm: number;
    outsideOverlapBottomCm: number;

    recommendationWidthToleranceCm: number;
    recommendationHeightToleranceCm: number;
  };
}

export interface CurtainMeasurementInput {
  projectType: "rideaux" | "voilages";

  openingType: OpeningType;
  supportType: CurtainSupportType;

  openingWidthCm?: number;
  supportWidthCm?: number;

  leftExtensionCm?: number;
  rightExtensionCm?: number;

  measuredHeightCm: number;

  lengthTarget: CurtainLengthTarget;
  floorFinish?: CurtainFloorFinish;

  fullnessRatio: CurtainFullnessRatio;
  panelCount: CurtainPanelCount;

  preferredHeader?: CurtainHeader;
}

export interface CurtainMeasurementResult {
  supportWidthCm: number;

  requiredTotalFabricWidthCm: number;
  recommendedWidthPerPanelCm: number;

  recommendedFinishedHeightCm: number;

  panelCount: CurtainPanelCount;
  fullnessRatio: CurtainFullnessRatio;

  calculationNotes: string[];

  recommendationLevel: MeasurementRecommendationLevel;
}

export interface BlindMeasurementInput {
  projectType: "stores";

  mountingPosition: BlindMountingPosition;

  widthMeasurementsCm: [number, number, number];
  heightMeasurementsCm: [number, number, number];

  preferredBlindType?: BlindType;
  preferredMountingType?: BlindMountingType;
}

export interface BlindMeasurementResult {
  openingWidthCm: number;
  openingHeightCm: number;

  recommendedProductWidthCm: number;
  recommendedProductHeightCm: number;

  mountingPosition: BlindMountingPosition;

  calculationNotes: string[];
  warnings: string[];

  recommendationLevel: MeasurementRecommendationLevel;
}

export type MeasurementResult = CurtainMeasurementResult | BlindMeasurementResult;

export interface MeasurementRecommendationContext {
  projectType: MeasurementProjectType;
  preferredHeader?: CurtainHeader | undefined;
  supportType?: CurtainSupportType | undefined;
  mountingPosition?: BlindMountingPosition | undefined;
  preferredBlindType?: BlindType | undefined;
  preferredMountingType?: BlindMountingType | undefined;
  panelCount?: CurtainPanelCount | undefined;
}

export interface MeasurementProductRecommendation {
  product: Product;
  variant: ProductVariant;

  requiredQuantity: number;

  recommendationLevel: "exact" | "compatible" | "approximate";

  widthDifferenceCm: number;
  heightDifferenceCm: number;

  reasons: string[];
}

export interface MeasurementAccessoryRecommendation {
  product: Product;
  variant: ProductVariant;
  reasons: string[];
}

export function isBlindResult(result: MeasurementResult): result is BlindMeasurementResult {
  return "recommendedProductWidthCm" in result;
}

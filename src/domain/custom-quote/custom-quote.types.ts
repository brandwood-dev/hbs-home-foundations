import type { OpeningType } from "@/domain/measurement/measurement.types";
import type {
  BlindType,
  CurtainHeader,
  CurtainLining,
  OpacityLevel,
} from "@/domain/product/product.types";

export type CustomQuoteProductType = "rideaux" | "voilages" | "stores" | "ensemble_fenetre";

export interface CustomOpeningInput {
  id: string;
  label: string;

  openingType: OpeningType;

  widthCm: number;
  heightCm: number;

  quantity: number;

  installationType?: string;
}

export interface CustomQuotePreferences {
  material?: string;
  colorFamily?: string;
  opacityLevel?: OpacityLevel;
  curtainHeader?: CurtainHeader;
  lining?: CurtainLining;
  blindType?: BlindType;

  wantsAccessories: boolean;

  notes?: string;
}

export interface CustomQuoteContact {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;

  governorate: string;
  city: string;

  preferredContact: "phone" | "whatsapp" | "email";
}

/** Métadonnées locales uniquement : aucun contenu de fichier n'est conservé. */
export interface PendingAttachmentMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface CustomQuoteRequest {
  productType: CustomQuoteProductType;

  openings: CustomOpeningInput[];

  preferences: CustomQuotePreferences;

  contact: CustomQuoteContact;

  attachmentMetadata: PendingAttachmentMetadata[];

  acceptedPrivacy: boolean;
}

export interface CustomQuoteSubmissionResult {
  reference: string;
  submittedAt: string;
  isDemo: boolean;
}

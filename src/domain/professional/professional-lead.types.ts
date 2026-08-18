export type ProfessionalActivity =
  | "hotellerie"
  | "restauration"
  | "bureaux"
  | "architecte"
  | "decorateur"
  | "promoteur"
  | "commerce"
  | "autre";

export type ProfessionalProjectVolume = "moins_10" | "10_50" | "50_200" | "plus_200";

export interface ProfessionalLeadRequest {
  companyName: string;
  activity: ProfessionalActivity;
  taxId?: string;

  contactName: string;
  phone: string;
  email: string;

  governorate: string;
  city?: string;

  projectVolume: ProfessionalProjectVolume;
  desiredDeadline?: string;
  message: string;

  acceptedPrivacy: boolean;
}

export interface ProfessionalLeadSubmissionResult {
  reference: string;
  submittedAt: string;
  isDemo: boolean;
}

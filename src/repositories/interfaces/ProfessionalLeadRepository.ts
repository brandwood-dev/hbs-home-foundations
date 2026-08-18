import type {
  ProfessionalLeadRequest,
  ProfessionalLeadSubmissionResult,
} from "@/domain/professional/professional-lead.types";

export interface ProfessionalLeadRepository {
  submit(request: ProfessionalLeadRequest): Promise<ProfessionalLeadSubmissionResult>;
}

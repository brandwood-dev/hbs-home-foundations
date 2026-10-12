import { HbsApiClient } from "@/api";
import type {
  ProfessionalLeadRequest,
  ProfessionalLeadSubmissionResult,
} from "@/domain/professional/professional-lead.types";
import type { ProfessionalLeadRepository } from "@/repositories/interfaces/ProfessionalLeadRepository";

type ApiProfessionalLeadResponse = {
  reference: string;
  createdAt: string;
};

/** Envoie les demandes B2B dans la même boîte de réception que les devis particuliers. */
export class ApiProfessionalLeadRepository implements ProfessionalLeadRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  async submit(
    request: ProfessionalLeadRequest,
  ): Promise<ProfessionalLeadSubmissionResult> {
    const response = await this.client.post<ApiProfessionalLeadResponse>(
      "/api/v1/custom-quotes",
      { requestType: "professionnels", ...request },
    );
    return {
      reference: response.reference,
      submittedAt: response.createdAt,
      isDemo: false,
    };
  }
}

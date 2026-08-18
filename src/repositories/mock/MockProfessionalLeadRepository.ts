import type {
  ProfessionalLeadRequest,
  ProfessionalLeadSubmissionResult,
} from "@/domain/professional/professional-lead.types";
import type { ProfessionalLeadRepository } from "@/repositories/interfaces/ProfessionalLeadRepository";

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/** Référence lisible : PRO-YYMMDD-XXXX. */
export function buildProfessionalLeadReference(date = new Date()): string {
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `PRO-${year}${month}${day}-${randomSuffix()}`;
}

/**
 * Démo : aucune donnée n'est envoyée ni persistée.
 * Le backend remplacera cette classe par un POST /api/v1/professional-leads.
 */
export class MockProfessionalLeadRepository implements ProfessionalLeadRepository {
  async submit(_request: ProfessionalLeadRequest): Promise<ProfessionalLeadSubmissionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      reference: buildProfessionalLeadReference(),
      submittedAt: new Date().toISOString(),
      isDemo: true,
    };
  }
}

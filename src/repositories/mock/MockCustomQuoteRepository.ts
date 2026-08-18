import type {
  CustomQuoteRequest,
  CustomQuoteSubmissionResult,
} from "@/domain/custom-quote/custom-quote.types";
import type { CustomQuoteRepository } from "@/repositories/interfaces/CustomQuoteRepository";

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

/** Référence lisible : DEV-YYMMDD-XXXX. */
export function buildQuoteReference(date = new Date()): string {
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `DEV-${year}${month}${day}-${randomSuffix()}`;
}

/**
 * Démo : aucune donnée n'est envoyée ni persistée.
 * Le backend remplacera cette classe par un POST /api/v1/custom-quotes.
 */
export class MockCustomQuoteRepository implements CustomQuoteRepository {
  async submit(_request: CustomQuoteRequest): Promise<CustomQuoteSubmissionResult> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      reference: buildQuoteReference(),
      submittedAt: new Date().toISOString(),
      isDemo: true,
    };
  }
}

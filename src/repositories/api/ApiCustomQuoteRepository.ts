import { HbsApiClient } from "@/api";
import type {
  CustomQuoteRequest,
  CustomQuoteSubmissionResult,
} from "@/domain/custom-quote/custom-quote.types";
import type { CustomQuoteRepository } from "@/repositories/interfaces/CustomQuoteRepository";

type ApiCustomQuoteResponse = {
  reference: string;
  createdAt: string;
};

export class ApiCustomQuoteRepository implements CustomQuoteRepository {
  constructor(private readonly client = new HbsApiClient()) {}

  async submit(request: CustomQuoteRequest): Promise<CustomQuoteSubmissionResult> {
    const response = await this.client.post<ApiCustomQuoteResponse>(
      "/api/v1/custom-quotes",
      request,
    );
    return {
      reference: response.reference,
      submittedAt: response.createdAt,
    };
  }
}

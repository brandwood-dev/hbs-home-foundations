import type {
  CustomQuoteRequest,
  CustomQuoteSubmissionResult,
} from "@/domain/custom-quote/custom-quote.types";

export interface CustomQuoteRepository {
  submit(request: CustomQuoteRequest): Promise<CustomQuoteSubmissionResult>;
}

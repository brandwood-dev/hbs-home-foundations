import type { NewsletterSubscriptionResult } from "@/domain/content/home-content.types";

export interface NewsletterRepository {
  /** Futur `POST /api/v1/newsletter/subscriptions`. */
  subscribe(email: string): Promise<NewsletterSubscriptionResult>;
}

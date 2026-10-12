import type { NewsletterSubscriptionResult } from "@/domain/content/home-content.types";
import type {
  NewsletterOrderSyncInput,
  NewsletterRepository,
} from "@/repositories/interfaces/NewsletterRepository";
import {
  isValidEmail,
  NEWSLETTER_ERROR_MESSAGE,
  NEWSLETTER_INVALID_EMAIL_MESSAGE,
  normalizeEmail,
} from "@/services/newsletter/newsletter-validation";

type NewsletterApiResponse = {
  success: boolean;
  message: string;
};

/**
 * Marketing calls stay same-origin so the Brevo API key remains in the
 * pre-production Worker secret, never in the browser bundle.
 */
export class ApiNewsletterRepository implements NewsletterRepository {
  private readonly fetchImplementation: typeof globalThis.fetch;

  constructor(fetchImplementation: typeof globalThis.fetch = globalThis.fetch.bind(globalThis)) {
    this.fetchImplementation = fetchImplementation;
  }

  async subscribe(email: string): Promise<NewsletterSubscriptionResult> {
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return { success: false, message: NEWSLETTER_INVALID_EMAIL_MESSAGE, isDemo: false };
    }

    const response = await this.fetchImplementation("/api/newsletter/subscriptions", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify({ email: normalizedEmail, source: "home_page" }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(NEWSLETTER_ERROR_MESSAGE);
    }

    const payload = (await response.json()) as NewsletterApiResponse;
    return { success: payload.success, message: payload.message, isDemo: false };
  }

  async syncOrder(input: NewsletterOrderSyncInput): Promise<void> {
    const response = await this.fetchImplementation("/api/newsletter/orders", {
      method: "POST",
      headers: { accept: "application/json", "content-type": "application/json" },
      body: JSON.stringify(input),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("La synchronisation marketing de la commande a échoué.");
    }
  }
}

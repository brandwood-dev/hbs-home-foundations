import type { NewsletterSubscriptionResult } from "@/domain/content/home-content.types";
import type { NewsletterRepository } from "@/repositories/interfaces/NewsletterRepository";
import {
  isValidEmail,
  NEWSLETTER_DEMO_SUCCESS_MESSAGE,
  NEWSLETTER_INVALID_EMAIL_MESSAGE,
} from "@/services/newsletter/newsletter-validation";

/**
 * Inscription simulée : aucune requête réseau, aucun stockage, aucun log de l'e-mail.
 */
export class MockNewsletterRepository implements NewsletterRepository {
  async subscribe(email: string): Promise<NewsletterSubscriptionResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!isValidEmail(email)) {
      return { success: false, message: NEWSLETTER_INVALID_EMAIL_MESSAGE, isDemo: true };
    }

    return { success: true, message: NEWSLETTER_DEMO_SUCCESS_MESSAGE, isDemo: true };
  }
}

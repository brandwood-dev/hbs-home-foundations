import type { NewsletterSubscriptionResult } from "@/domain/content/home-content.types";

export interface NewsletterOrderSyncInput {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  emailMarketingOptIn: boolean;
  messagingMarketingOptIn: boolean;
}

export interface NewsletterRepository {
  /** Enregistre l'adresse dans l'audience newsletter Brevo. */
  subscribe(email: string): Promise<NewsletterSubscriptionResult>;
  /** Synchronise un client ayant passé commande avec les audiences Brevo. */
  syncOrder(input: NewsletterOrderSyncInput): Promise<void>;
}

/** Validation d'e-mail — fonction pure, testable. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export const NEWSLETTER_INVALID_EMAIL_MESSAGE = "Veuillez saisir une adresse e-mail valide.";
export const NEWSLETTER_DEMO_SUCCESS_MESSAGE =
  "Votre inscription a été validée en mode démonstration.";
export const NEWSLETTER_DEMO_NOTICE = "Mode démonstration : aucune donnée n'est envoyée.";
export const NEWSLETTER_ERROR_MESSAGE =
  "L'inscription n'a pas pu aboutir. Merci de réessayer dans un instant.";

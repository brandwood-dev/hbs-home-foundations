import { useMutation } from "@tanstack/react-query";
import type { NewsletterSubscriptionResult } from "@/domain/content/home-content.types";
import { getNewsletterRepository } from "@/repositories/repositoryFactory";

export function useNewsletterSubscription() {
  return useMutation<NewsletterSubscriptionResult, Error, string>({
    mutationFn: (email: string) => getNewsletterRepository().subscribe(email),
  });
}

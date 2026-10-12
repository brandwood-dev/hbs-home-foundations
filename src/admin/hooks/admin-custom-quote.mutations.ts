import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";

export function useMarkCustomQuoteRead() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.customQuotes.markRead(id),
    successMessage: "Demande marquée comme lue.",
    invalidate: [adminKeys.customQuotes()],
  });
}

export function useArchiveCustomQuote() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.customQuotes.archive(id),
    successMessage: "Demande archivée.",
    invalidate: [adminKeys.customQuotes()],
  });
}

export function useConvertCustomQuoteToCustomer() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.customQuotes.convertToCustomer(id),
    successMessage: "Le prospect a été ajouté aux clients.",
    invalidate: [adminKeys.customQuotes(), adminKeys.customers()],
  });
}

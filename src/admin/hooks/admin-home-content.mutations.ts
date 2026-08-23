import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type { AdminHomeDraftInput } from "@/admin/repositories/interfaces";

export function useUpdateAdminHomeContent() {
  return useAdminMutation({
    mutationFn: (input: AdminHomeDraftInput) => adminRepositories.homeContent.update(input),
    successMessage: "Brouillon de la page d’accueil enregistré.",
    invalidate: [adminKeys.homeContent()],
  });
}

export function usePublishAdminHomeContent() {
  return useAdminMutation({
    mutationFn: () => adminRepositories.homeContent.publish(),
    successMessage: "Page d’accueil publiée.",
    invalidate: [adminKeys.homeContent()],
  });
}

export function useArchiveAdminHomeContent() {
  return useAdminMutation({
    mutationFn: () => adminRepositories.homeContent.archive(),
    successMessage: "Publication de la page d’accueil archivée.",
    invalidate: [adminKeys.homeContent()],
  });
}

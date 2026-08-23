import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type { AdminMediaInput, AdminMediaPatch } from "@/admin/repositories/interfaces";

export function useCreateAdminMedia() {
  return useAdminMutation({
    mutationFn: (input: AdminMediaInput) => adminRepositories.media.create(input),
    successMessage: "Média ajouté.",
    invalidate: [adminKeys.media()],
  });
}

export function useUpdateAdminMedia() {
  return useAdminMutation({
    mutationFn: (variables: { id: string; input: AdminMediaPatch }) =>
      adminRepositories.media.update(variables.id, variables.input),
    successMessage: "Média enregistré.",
    invalidate: [adminKeys.media()],
  });
}

export function useDeleteAdminMedia() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.media.delete(id),
    successMessage: "Média archivé.",
    invalidate: [adminKeys.media()],
  });
}

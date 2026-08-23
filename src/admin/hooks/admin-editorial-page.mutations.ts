import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type {
  AdminEditorialPageInput,
  AdminEditorialPagePatch,
} from "@/admin/repositories/interfaces";

export function useCreateAdminEditorialPage() {
  return useAdminMutation({
    mutationFn: (input: AdminEditorialPageInput) => adminRepositories.pages.create(input),
    successMessage: "Page enregistrée en brouillon.",
    invalidate: [adminKeys.pages()],
  });
}

export function useUpdateAdminEditorialPage() {
  return useAdminMutation({
    mutationFn: (variables: { id: string; input: AdminEditorialPagePatch }) =>
      adminRepositories.pages.update(variables.id, variables.input),
    successMessage: "Page enregistrée.",
    invalidate: [adminKeys.pages()],
  });
}

export function usePublishAdminEditorialPage() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.pages.publish(id),
    successMessage: "Page publiée.",
    invalidate: [adminKeys.pages()],
  });
}

export function useArchiveAdminEditorialPage() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.pages.archive(id),
    successMessage: "Page archivée.",
    invalidate: [adminKeys.pages()],
  });
}

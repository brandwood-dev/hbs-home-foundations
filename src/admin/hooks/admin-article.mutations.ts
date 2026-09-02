import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type { AdminArticleInput, AdminArticlePatch } from "@/admin/repositories/interfaces";

export function useCreateAdminArticle() {
  return useAdminMutation({
    mutationFn: (input: AdminArticleInput) => adminRepositories.articles.create(input),
    successMessage: "Article enregistré en brouillon.",
    invalidate: [adminKeys.articles()],
  });
}

export function useUpdateAdminArticle() {
  return useAdminMutation({
    mutationFn: (variables: { id: string; input: AdminArticlePatch }) =>
      adminRepositories.articles.update(variables.id, variables.input),
    successMessage: "Article enregistré.",
    invalidate: [adminKeys.articles()],
  });
}

export function usePublishAdminArticle() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.articles.publish(id),
    successMessage: "Article publié.",
    invalidate: [adminKeys.articles()],
  });
}

export function useArchiveAdminArticle() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.articles.archive(id),
    successMessage: "Article archivé.",
    invalidate: [adminKeys.articles()],
  });
}

export function useDeleteAdminArticle() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.articles.delete(id),
    successMessage: "Article supprimé définitivement.",
    invalidate: [adminKeys.articles()],
  });
}

export function useDuplicateAdminArticle() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.articles.duplicate(id),
    successMessage: "Article dupliqué en brouillon.",
    invalidate: [adminKeys.articles()],
  });
}

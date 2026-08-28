import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type {
  AdminHomeDraftInput,
  AdminHomeSectionInput,
  AdminHomeSectionKey,
} from "@/admin/repositories/interfaces";

export function useUpdateAdminHomeContent() {
  return useAdminMutation({
    mutationFn: (input: AdminHomeDraftInput) => adminRepositories.homeContent.update(input),
    successMessage: "Brouillon de la page d’accueil enregistré.",
    invalidate: [adminKeys.homeContent()],
  });
}

export function useUpdateAdminHomeSection() {
  return useAdminMutation({
    mutationFn: (input: {
      sectionKey: AdminHomeSectionKey;
      section: AdminHomeSectionInput & { expectedVersion?: number };
    }) => adminRepositories.homeContent.updateSection(input.sectionKey, input.section),
    successMessage: "Brouillon de la section enregistré.",
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

export function usePublishAdminHomeSection() {
  return useAdminMutation({
    mutationFn: (sectionKey: AdminHomeSectionKey) =>
      adminRepositories.homeContent.publishSection(sectionKey),
    successMessage: "Section publiée.",
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

export function useArchiveAdminHomeSection() {
  return useAdminMutation({
    mutationFn: (sectionKey: AdminHomeSectionKey) =>
      adminRepositories.homeContent.archiveSection(sectionKey),
    successMessage: "Section archivée.",
    invalidate: [adminKeys.homeContent()],
  });
}

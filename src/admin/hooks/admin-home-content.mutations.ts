import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type { AdminHomeSectionInput, AdminHomeSectionKey } from "@/admin/repositories/interfaces";

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

export function usePublishAdminHomeSection() {
  return useAdminMutation({
    mutationFn: (sectionKey: AdminHomeSectionKey) =>
      adminRepositories.homeContent.publishSection(sectionKey),
    successMessage: "Section publiée.",
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

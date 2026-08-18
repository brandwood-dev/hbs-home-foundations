import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type {
  AdminAttributeInput,
  AdminCategoryInput,
  AdminProductInput,
  StockAdjustmentInput,
  StockSettingsInput,
} from "@/admin/repositories/interfaces";
import type { AdminProduct } from "@/admin/types/admin.types";

const catalogKeys = [adminKeys.products(), adminKeys.inventory(), adminKeys.dashboard()];

export function useCreateAdminProduct(onDone?: (product: AdminProduct) => void) {
  return useAdminMutation({
    mutationFn: (input: AdminProductInput) => adminRepositories.products.create(input),
    successMessage: "Produit créé.",
    invalidate: catalogKeys,
    ...(onDone ? { onSuccess: onDone } : {}),
  });
}

export function useUpdateAdminProduct(onDone?: (product: AdminProduct) => void) {
  return useAdminMutation({
    mutationFn: (variables: { id: string; input: Partial<AdminProductInput> }) =>
      adminRepositories.products.update(variables.id, variables.input),
    successMessage: "Produit enregistré.",
    invalidate: catalogKeys,
    ...(onDone ? { onSuccess: onDone } : {}),
  });
}

export function useDeleteAdminProduct() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.products.delete(id),
    successMessage: "Produit supprimé.",
    invalidate: catalogKeys,
  });
}

export function useDuplicateAdminProduct() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.products.duplicate(id),
    successMessage: "Produit dupliqué en brouillon.",
    invalidate: catalogKeys,
  });
}

export function useSetAdminProductStatus() {
  return useAdminMutation({
    mutationFn: (variables: { id: string; status: AdminProduct["status"] }) =>
      adminRepositories.products.setStatus(variables.id, variables.status),
    successMessage: "Statut mis à jour.",
    invalidate: catalogKeys,
  });
}

export function useSaveAdminCategory() {
  return useAdminMutation({
    mutationFn: (variables: { id?: string; input: AdminCategoryInput }) =>
      variables.id
        ? adminRepositories.categories.update(variables.id, variables.input)
        : adminRepositories.categories.create(variables.input),
    successMessage: "Catégorie enregistrée.",
    invalidate: [adminKeys.categories(), adminKeys.products()],
  });
}

export function useDeleteAdminCategory() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.categories.delete(id),
    successMessage: "Catégorie supprimée.",
    invalidate: [adminKeys.categories()],
  });
}

export function useMoveAdminCategory() {
  return useAdminMutation({
    mutationFn: (variables: { id: string; direction: "up" | "down" }) =>
      adminRepositories.categories.move(variables.id, variables.direction),
    successMessage: "Ordre mis à jour.",
    invalidate: [adminKeys.categories()],
  });
}

export function useSaveAdminAttribute() {
  return useAdminMutation({
    mutationFn: (variables: { id?: string; input: AdminAttributeInput }) =>
      variables.id
        ? adminRepositories.attributes.update(variables.id, variables.input)
        : adminRepositories.attributes.create(variables.input),
    successMessage: "Attribut enregistré.",
    invalidate: [adminKeys.attributes(), adminKeys.products()],
  });
}

export function useDeleteAdminAttribute() {
  return useAdminMutation({
    mutationFn: (id: string) => adminRepositories.attributes.delete(id),
    successMessage: "Attribut supprimé.",
    invalidate: [adminKeys.attributes()],
  });
}

export function useAdjustStock() {
  return useAdminMutation({
    mutationFn: (input: StockAdjustmentInput) => adminRepositories.inventory.adjust(input),
    successMessage: "Stock ajusté.",
    invalidate: [
      adminKeys.inventory(),
      adminKeys.movements(),
      adminKeys.products(),
      adminKeys.dashboard(),
    ],
  });
}

export function useUpdateStockSettings() {
  return useAdminMutation({
    mutationFn: (variables: StockSettingsInput) =>
      adminRepositories.inventory.updateSettings(variables),
    successMessage: "Paramètres de stock mis à jour.",
    invalidate: [adminKeys.inventory(), adminKeys.products()],
  });
}

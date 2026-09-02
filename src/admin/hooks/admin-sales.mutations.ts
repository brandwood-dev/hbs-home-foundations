import { isMfaRequiredError } from "@/admin/auth/AdminMfaContext";
import { adminKeys, useAdminMutation } from "@/admin/hooks/admin.queries";
import { adminRepositories } from "@/admin/repositories/adminRepositoryFactory";
import type {
  AdminCustomerAddressInput,
  CancelAdminOrderInput,
  MergeAdminCustomersInput,
  ReturnAdminOrderInput,
  UpdateAdminCustomerInput,
  UpdateAdminOrderShippingInput,
  UpdateAdminOrderStatusInput,
  UpdateAdminPaymentStatusInput,
} from "@/admin/repositories/interfaces";
import type { AdminOrderAddress, AdminOrderContact } from "@/admin/types/admin.types";

const salesKeys = [
  adminKeys.orders(),
  adminKeys.customers(),
  adminKeys.dashboard(),
  adminKeys.inventory(),
  adminKeys.audit(),
];

export function useUpdateOrderStatus() {
  return useAdminMutation({
    mutationFn: (input: UpdateAdminOrderStatusInput) =>
      adminRepositories.orders.updateStatus(input),
    successMessage: "Statut de la commande mis à jour.",
    invalidate: salesKeys,
  });
}

/** Actions groupées : chaque commande est traitée indépendamment. */
export function useBulkUpdateOrderStatus() {
  return useAdminMutation({
    mutationFn: async (input: {
      orderIds: string[];
      status: UpdateAdminOrderStatusInput["status"];
    }) => {
      const succeeded: string[] = [];
      const failures: Array<{ orderId: string; message: string }> = [];
      for (const orderId of input.orderIds) {
        try {
          await adminRepositories.orders.updateStatus({ orderId, status: input.status });
          succeeded.push(orderId);
        } catch (error) {
          // Let the generic mutation wrapper open the step-up challenge. A
          // security failure must not be converted into a partial result.
          if (isMfaRequiredError(error)) throw error;
          failures.push({
            orderId,
            message: error instanceof Error ? error.message : "Erreur inconnue.",
          });
        }
      }
      return { succeeded, failures };
    },
    successMessage: "Action groupée terminée.",
    invalidate: salesKeys,
  });
}

export function useUpdateOrderPaymentStatus() {
  return useAdminMutation({
    mutationFn: (input: UpdateAdminPaymentStatusInput) =>
      adminRepositories.orders.updatePaymentStatus(input),
    successMessage: "Statut de paiement mis à jour.",
    invalidate: salesKeys,
  });
}

export function useUpdateOrderShipping() {
  return useAdminMutation({
    mutationFn: (input: UpdateAdminOrderShippingInput) =>
      adminRepositories.orders.updateShipping(input),
    successMessage: "Frais de livraison enregistrés.",
    invalidate: salesKeys,
  });
}

export function useUpdateOrderContact() {
  return useAdminMutation({
    mutationFn: (variables: { orderId: string; contact: AdminOrderContact }) =>
      adminRepositories.orders.updateContact(variables.orderId, variables.contact),
    successMessage: "Coordonnées mises à jour.",
    invalidate: salesKeys,
  });
}

export function useUpdateOrderAddress() {
  return useAdminMutation({
    mutationFn: (variables: { orderId: string; address: AdminOrderAddress }) =>
      adminRepositories.orders.updateAddress(variables.orderId, variables.address),
    successMessage: "Adresse de livraison mise à jour.",
    invalidate: salesKeys,
  });
}

export function useAddOrderNote() {
  return useAdminMutation({
    mutationFn: (variables: { orderId: string; text: string }) =>
      adminRepositories.orders.addNote(variables.orderId, variables.text),
    successMessage: "Note interne ajoutée.",
    invalidate: [adminKeys.orders()],
  });
}

export function useCancelOrder() {
  return useAdminMutation({
    mutationFn: (input: CancelAdminOrderInput) => adminRepositories.orders.cancelOrder(input),
    successMessage: "Commande annulée.",
    invalidate: salesKeys,
  });
}

export function useReturnOrder() {
  return useAdminMutation({
    mutationFn: (input: ReturnAdminOrderInput) => adminRepositories.orders.returnOrder(input),
    successMessage: "Retour traité.",
    invalidate: salesKeys,
  });
}

export function useUpdateCustomer() {
  return useAdminMutation({
    mutationFn: (variables: { customerId: string; input: UpdateAdminCustomerInput }) =>
      adminRepositories.customers.update(variables.customerId, variables.input),
    successMessage: "Fiche client enregistrée.",
    invalidate: [adminKeys.customers(), adminKeys.audit()],
  });
}

export function useAddCustomerAddress() {
  return useAdminMutation({
    mutationFn: (variables: { customerId: string; address: AdminCustomerAddressInput }) =>
      adminRepositories.customers.addAddress(variables.customerId, variables.address),
    successMessage: "Adresse ajoutée.",
    invalidate: [adminKeys.customers()],
  });
}

export function useUpdateCustomerAddress() {
  return useAdminMutation({
    mutationFn: (variables: {
      customerId: string;
      addressId: string;
      input: AdminCustomerAddressInput;
    }) =>
      adminRepositories.customers.updateAddress(
        variables.customerId,
        variables.addressId,
        variables.input,
      ),
    successMessage: "Adresse mise à jour.",
    invalidate: [adminKeys.customers()],
  });
}

export function useDeleteCustomerAddress() {
  return useAdminMutation({
    mutationFn: (variables: { customerId: string; addressId: string }) =>
      adminRepositories.customers.deleteAddress(variables.customerId, variables.addressId),
    successMessage: "Adresse supprimée.",
    invalidate: [adminKeys.customers()],
  });
}

export function useSetDefaultCustomerAddress() {
  return useAdminMutation({
    mutationFn: (variables: { customerId: string; addressId: string }) =>
      adminRepositories.customers.setDefaultAddress(variables.customerId, variables.addressId),
    successMessage: "Adresse par défaut définie.",
    invalidate: [adminKeys.customers()],
  });
}

export function useUpdateCustomerTags() {
  return useAdminMutation({
    mutationFn: (variables: { customerId: string; tags: string[] }) =>
      adminRepositories.customers.updateTags(variables.customerId, variables.tags),
    successMessage: "Étiquettes mises à jour.",
    invalidate: [adminKeys.customers()],
  });
}

export function useAddCustomerNote() {
  return useAdminMutation({
    mutationFn: (variables: { customerId: string; text: string }) =>
      adminRepositories.customers.addNote(variables.customerId, variables.text),
    successMessage: "Note ajoutée.",
    invalidate: [adminKeys.customers()],
  });
}

export function useMergeCustomers() {
  return useAdminMutation({
    mutationFn: (input: MergeAdminCustomersInput) =>
      adminRepositories.customers.mergeCustomers(input),
    successMessage: "Clients fusionnés.",
    invalidate: [adminKeys.customers(), adminKeys.orders(), adminKeys.audit()],
  });
}

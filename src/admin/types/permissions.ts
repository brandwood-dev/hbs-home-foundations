import type { AdminPermission, AdminRoleId } from "@/admin/types/admin.types";

export const ADMIN_PERMISSIONS: AdminPermission[] = [
  "dashboard.read",
  "products.read",
  "products.create",
  "products.update",
  "products.delete",
  "categories.manage",
  "attributes.manage",
  "inventory.manage",
  "orders.read",
  "orders.update",
  "customers.read",
  "promotions.manage",
  "content.manage",
  "settings.manage",
  "users.manage",
  "audit.read",
];

export const ADMIN_ROLE_LABELS: Record<AdminRoleId, string> = {
  super_admin: "Super administrateur",
  catalog_manager: "Gestionnaire catalogue",
  orders_manager: "Gestionnaire commandes",
  content_editor: "Éditeur de contenu",
  read_only: "Lecture seule",
};

export const ROLE_PERMISSIONS: Record<AdminRoleId, AdminPermission[]> = {
  super_admin: ADMIN_PERMISSIONS,
  catalog_manager: [
    "dashboard.read",
    "products.read",
    "products.create",
    "products.update",
    "products.delete",
    "categories.manage",
    "attributes.manage",
    "inventory.manage",
  ],
  orders_manager: ["dashboard.read", "orders.read", "orders.update", "customers.read"],
  content_editor: ["dashboard.read", "content.manage", "promotions.manage"],
  read_only: ["dashboard.read", "products.read", "orders.read", "customers.read", "audit.read"],
};

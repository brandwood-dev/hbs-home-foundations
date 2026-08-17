import {
  MockAdminAttributeRepository,
  MockAdminAuditRepository,
  MockAdminCategoryRepository,
  MockAdminContentRepository,
  MockAdminCustomerRepository,
  MockAdminDashboardRepository,
  MockAdminInventoryRepository,
  MockAdminOrderRepository,
  MockAdminProductRepository,
  MockAdminPromotionRepository,
  MockAdminSettingsRepository,
  MockAdminUserRepository,
} from "@/admin/repositories/mock/admin-mock-repositories";

/**
 * Point d'entrée unique du back-office.
 * Quand `adminConfig.dataProvider` passera à "api", il suffira de remplacer
 * les implémentations mock par les implémentations HTTP ici.
 */
export const adminRepositories = {
  dashboard: new MockAdminDashboardRepository(),
  products: new MockAdminProductRepository(),
  categories: new MockAdminCategoryRepository(),
  attributes: new MockAdminAttributeRepository(),
  inventory: new MockAdminInventoryRepository(),
  orders: new MockAdminOrderRepository(),
  customers: new MockAdminCustomerRepository(),
  promotions: new MockAdminPromotionRepository(),
  content: new MockAdminContentRepository(),
  settings: new MockAdminSettingsRepository(),
  users: new MockAdminUserRepository(),
  audit: new MockAdminAuditRepository(),
};

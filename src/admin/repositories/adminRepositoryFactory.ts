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
import {
  ApiAdminAttributeRepository,
  ApiAdminCategoryRepository,
  ApiAdminProductRepository,
} from "@/admin/repositories/api/admin-catalog-api-repositories";
import { adminConfig } from "@/admin/config/admin.config";

/**
 * Point d'entrée unique du back-office.
 * Le catalogue est maintenant branché sur l'API. Les autres modules restent
 * explicitement mockés jusqu'à leurs phases d'intégration respectives.
 */
export const adminRepositories = {
  dashboard: new MockAdminDashboardRepository(),
  products:
    adminConfig.catalogDataProvider === "api"
      ? new ApiAdminProductRepository()
      : new MockAdminProductRepository(),
  categories:
    adminConfig.catalogDataProvider === "api"
      ? new ApiAdminCategoryRepository()
      : new MockAdminCategoryRepository(),
  attributes:
    adminConfig.catalogDataProvider === "api"
      ? new ApiAdminAttributeRepository()
      : new MockAdminAttributeRepository(),
  inventory: new MockAdminInventoryRepository(),
  orders: new MockAdminOrderRepository(),
  customers: new MockAdminCustomerRepository(),
  promotions: new MockAdminPromotionRepository(),
  content: new MockAdminContentRepository(),
  settings: new MockAdminSettingsRepository(),
  users: new MockAdminUserRepository(),
  audit: new MockAdminAuditRepository(),
};

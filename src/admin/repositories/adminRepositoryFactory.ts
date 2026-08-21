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
  ApiAdminInventoryRepository,
  ApiAdminProductRepository,
} from "@/admin/repositories/api/admin-catalog-api-repositories";
import { ApiAdminPromotionRepository } from "@/admin/repositories/api/admin-promotion-api-repository";
import { ApiAdminOrderRepository } from "@/admin/repositories/api/admin-order-api-repository";
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
  inventory:
    adminConfig.catalogDataProvider === "api"
      ? new ApiAdminInventoryRepository()
      : new MockAdminInventoryRepository(),
  orders:
    adminConfig.orderDataProvider === "api"
      ? new ApiAdminOrderRepository()
      : new MockAdminOrderRepository(),
  customers: new MockAdminCustomerRepository(),
  promotions:
    adminConfig.promotionDataProvider === "api"
      ? new ApiAdminPromotionRepository()
      : new MockAdminPromotionRepository(),
  content: new MockAdminContentRepository(),
  settings: new MockAdminSettingsRepository(),
  users: new MockAdminUserRepository(),
  audit: new MockAdminAuditRepository(),
};

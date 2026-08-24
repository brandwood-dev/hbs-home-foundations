import {
  MockAdminAttributeRepository,
  MockAdminAuditRepository,
  MockAdminCategoryRepository,
  MockAdminContentRepository,
  MockAdminEditorialPageRepository,
  MockAdminMediaRepository,
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
import { ApiAdminCustomerRepository } from "@/admin/repositories/api/admin-customer-api-repository";
import { ApiAdminMediaRepository } from "@/admin/repositories/api/admin-content-api-repository";
import { ApiAdminEditorialPageRepository } from "@/admin/repositories/api/admin-editorial-page-api-repository";
import { ApiAdminArticleRepository } from "@/admin/repositories/api/admin-article-api-repository";
import { ApiAdminHomeContentRepository } from "@/admin/repositories/api/admin-home-content-api-repository";
import { adminConfig } from "@/admin/config/admin.config";

/**
 * Point d'entrée unique du back-office.
 * Le catalogue est maintenant branché sur l'API. Les autres modules restent
 * explicitement mockés jusqu'à leurs phases d'intégration respectives. L'éditeur
 * homepage est branché sur le repository API depuis la phase 9D.2.
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
  customers:
    adminConfig.customerDataProvider === "api"
      ? new ApiAdminCustomerRepository()
      : new MockAdminCustomerRepository(),
  promotions:
    adminConfig.promotionDataProvider === "api"
      ? new ApiAdminPromotionRepository()
      : new MockAdminPromotionRepository(),
  content: new MockAdminContentRepository(),
  homeContent: new ApiAdminHomeContentRepository(),
  pages:
    adminConfig.editorialDataProvider === "api"
      ? new ApiAdminEditorialPageRepository()
      : new MockAdminEditorialPageRepository(),
  articles: new ApiAdminArticleRepository(),
  media:
    adminConfig.mediaDataProvider === "api"
      ? new ApiAdminMediaRepository()
      : new MockAdminMediaRepository(),
  settings: new MockAdminSettingsRepository(),
  users: new MockAdminUserRepository(),
  audit: new MockAdminAuditRepository(),
};

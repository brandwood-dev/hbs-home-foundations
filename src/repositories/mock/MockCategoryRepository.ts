import { catalogGroups, catalogPages } from "@/fixtures/catalog-pages.fixture";
import type {
  CategoryRepository,
  PublicCategory,
} from "@/repositories/interfaces/CategoryRepository";

export class MockCategoryRepository implements CategoryRepository {
  async list(): Promise<PublicCategory[]> {
    return catalogGroups.map((group) => ({
      slug: group.id,
      name: group.label,
      description: null,
      parentSlug: null,
      path: group.path,
      imageUrl: null,
      seoTitle: null,
      seoDescription: null,
      attributes: [],
      children: catalogPages
        .filter((page) => page.group === group.id)
        .filter((page) => page.routeId !== group.id && page.scope?.materials)
        .map((page) => ({
          slug: page.routeId,
          name: page.title,
          description: page.description,
          parentSlug: group.id,
          path: page.path,
          imageUrl: null,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          attributes: [],
          children: [],
        })),
    }));
  }

  async getBySlug(slug: string): Promise<PublicCategory | null> {
    const categories = await this.list();
    const pending = [...categories];
    while (pending.length > 0) {
      const category = pending.shift();
      if (!category) continue;
      if (category.slug === slug) return category;
      pending.push(...category.children);
    }
    return null;
  }
}

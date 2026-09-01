export interface CategoryAttributeOption {
  value: string;
  label: string;
  sortOrder: number;
  hex: string | null;
  family: string | null;
}

export interface CategoryAttribute {
  key: string;
  name: string;
  valueType: string;
  isRequired: boolean;
  sortOrder: number;
  options: CategoryAttributeOption[];
}

/** Latest published product media used by desktop navigation shortcuts. */
export interface CategoryLatestProduct {
  slug: string;
  name: string;
  imageUrl: string;
  imageAlt: string;
  createdAt: string;
}

export interface PublicCategory {
  slug: string;
  name: string;
  description: string | null;
  parentSlug: string | null;
  path: string;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  attributes: CategoryAttribute[];
  /** Optional for backwards compatibility with an older API deployment. */
  latestProduct?: CategoryLatestProduct | null;
  children: PublicCategory[];
}

export interface CategoryRepository {
  list(options?: { navigationOnly?: boolean }): Promise<PublicCategory[]>;
  getBySlug(slug: string): Promise<PublicCategory | null>;
}

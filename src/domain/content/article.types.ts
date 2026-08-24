export interface ArticleCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface ArticleCover {
  publicUrl: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface ArticleBlock {
  type: "heading" | "paragraph" | "image" | "quote" | "product_link" | "product_grid" | "cta";
  [key: string]: unknown;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ArticleCategory;
  cover: ArticleCover | null;
  readingTimeMinutes: number;
  authorName: string;
  publishedAt: string;
  updatedAt: string;
  isFeatured: boolean;
}

export interface Article extends ArticleSummary {
  bodyBlocks: ArticleBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ArticleList {
  items: ArticleSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ArticleListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  query?: string;
  featured?: boolean;
}

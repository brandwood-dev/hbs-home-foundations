export interface EditorialPageMedia {
  publicUrl: string;
  alt: string;
}

export interface EditorialPageBlock {
  sortOrder: number;
  blockType: string;
  payload: Record<string, unknown>;
  media: EditorialPageMedia | null;
}

export interface EditorialPage {
  slug: string;
  title: string;
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
  version: number;
  publishedAt: string;
  updatedAt: string;
  blocks: EditorialPageBlock[];
}

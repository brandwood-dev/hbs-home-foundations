import { getSupabaseBrowserClient } from "@/auth/supabase-browser";

export const PRODUCT_MEDIA_BUCKET = "product-media";
export const PRODUCT_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const PRODUCT_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

type ProductMediaMimeType = (typeof PRODUCT_MEDIA_MIME_TYPES)[number];

export interface UploadedProductImage {
  storagePath: string;
  publicUrl: string;
}

function extensionFor(file: File): string {
  const byMime: Record<ProductMediaMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return byMime[file.type as ProductMediaMimeType] ?? "bin";
}

function productFolder(slug: string | undefined): string {
  const normalized = slug
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  return normalized?.replace(/^-+|-+$/g, "") || "draft";
}

export async function uploadProductImage(file: File, slug?: string): Promise<UploadedProductImage> {
  if (!(PRODUCT_MEDIA_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Format non accepté. Utilisez JPG, PNG, WebP ou AVIF.");
  }
  if (file.size > PRODUCT_MEDIA_MAX_BYTES) {
    throw new Error("L’image ne doit pas dépasser 10 Mo.");
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase Storage n’est pas configuré pour cet environnement.");
  }

  const storagePath = `products/${productFolder(slug)}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Téléversement impossible : ${error.message}`);

  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl };
}

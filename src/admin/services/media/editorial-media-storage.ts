import { getSupabaseBrowserClient } from "@/auth/supabase-browser";

export const EDITORIAL_MEDIA_BUCKET = "editorial-media";
export const EDITORIAL_MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const EDITORIAL_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

type EditorialMediaMimeType = (typeof EDITORIAL_MEDIA_MIME_TYPES)[number];

export interface UploadedEditorialMedia {
  storagePath: string;
  publicUrl: string;
  mimeType: EditorialMediaMimeType;
}

function extensionFor(file: File): string {
  const byMime: Record<EditorialMediaMimeType, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return byMime[file.type as EditorialMediaMimeType] ?? "bin";
}

export async function uploadEditorialMedia(file: File): Promise<UploadedEditorialMedia> {
  if (!(EDITORIAL_MEDIA_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Format non accepté. Utilisez JPG, PNG, WebP ou AVIF.");
  }
  if (file.size > EDITORIAL_MEDIA_MAX_BYTES) {
    throw new Error("L’image ne doit pas dépasser 10 Mo.");
  }

  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error("Supabase Storage n’est pas configuré pour cet environnement.");
  }

  const storagePath = `editorial/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage.from(EDITORIAL_MEDIA_BUCKET).upload(storagePath, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(`Téléversement impossible : ${error.message}`);

  const { data } = supabase.storage.from(EDITORIAL_MEDIA_BUCKET).getPublicUrl(storagePath);
  return { storagePath, publicUrl: data.publicUrl, mimeType: file.type as EditorialMediaMimeType };
}

import crypto from "crypto";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Inline images (data:image/...;base64,...) must never live inside database JSON: they are
 * shipped to every visitor with the page and re-sent on every save. This moves them to
 * Supabase Storage (public "product-images" bucket) and leaves only the URL behind.
 *
 * Safe by design: if storage is unavailable or an upload fails, the original value is kept
 * (nothing is lost) and the next save/migration simply tries again.
 */

const BUCKET = "product-images";
const MIN_INLINE_LENGTH = 2000; // ignore tiny data URIs (icons/placeholders)
const DATA_URI = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function hasInlineImages(value: unknown, depth = 0): boolean {
  if (depth > 8 || value == null) return false;
  if (typeof value === "string") return value.length > MIN_INLINE_LENGTH && value.startsWith("data:image/");
  if (Array.isArray(value)) return value.some((v) => hasInlineImages(v, depth + 1));
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((v) => hasInlineImages(v, depth + 1));
  return false;
}

export async function externalizeInlineImages<T>(
  input: T,
  folder: string
): Promise<{ value: T; migrated: number; failed: number }> {
  if (!isSupabaseConfigured() || !hasInlineImages(input)) {
    return { value: input, migrated: 0, failed: 0 };
  }

  const supabase = getSupabaseAdminClient();
  const cache = new Map<string, string>(); // same image used twice => one upload
  let migrated = 0;
  let failed = 0;

  const upload = async (dataUri: string): Promise<string> => {
    const hit = cache.get(dataUri);
    if (hit) return hit;
    const match = DATA_URI.exec(dataUri);
    if (!match) return dataUri;
    const mime = match[1];
    try {
      const buffer = Buffer.from(match[2].replace(/\s+/g, ""), "base64");
      const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 24);
      const path = `${folder}/${hash}.${EXT[mime] || "jpg"}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
        contentType: mime,
        upsert: true,
        cacheControl: "31536000",
      });
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("no public url");
      cache.set(dataUri, data.publicUrl);
      migrated += 1;
      return data.publicUrl;
    } catch (err) {
      failed += 1;
      console.warn("externalizeInlineImages: upload failed, keeping inline image:", err);
      return dataUri;
    }
  };

  const walk = async (v: unknown, depth: number): Promise<unknown> => {
    if (depth > 8 || v == null) return v;
    if (typeof v === "string") {
      return v.length > MIN_INLINE_LENGTH && v.startsWith("data:image/") ? upload(v) : v;
    }
    if (Array.isArray(v)) return Promise.all(v.map((x) => walk(x, depth + 1)));
    if (typeof v === "object") {
      const entries = await Promise.all(
        Object.entries(v as Record<string, unknown>).map(async ([k, x]) => [k, await walk(x, depth + 1)] as const)
      );
      return Object.fromEntries(entries);
    }
    return v;
  };

  const value = (await walk(input, 0)) as T;
  return { value, migrated, failed };
}

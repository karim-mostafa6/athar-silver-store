// Auto-generated dynamic Build ID & Version Tracker
// Evaluated and frozen at build time on Vercel
export const BUILD_TIMESTAMP = Date.now();
export const BUILD_ID = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 8)
  : `build-${BUILD_TIMESTAMP}`;
export const STORE_VERSION = `v1.2.${BUILD_TIMESTAMP}`;

/**
 * Image Cache Buster:
 * Appends dynamic build/version query parameters to images and logos
 * to force mobile browsers (Safari/Chrome) to fetch the newest version immediately
 * without using stale cached images.
 */
export function getCacheBustedImageUrl(url: string | undefined | null, version: string = BUILD_ID): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  // Do not append query params to inline data URIs or blob URLs
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}v=${version}`;
}

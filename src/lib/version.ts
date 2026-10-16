// Deterministic build identity.
//
// IMPORTANT: these values are injected ONCE at build time by next.config.mjs (via `env`),
// so the server bundle, every serverless instance and the browser bundle all see the exact
// same BUILD_ID for a given deployment. (Previously BUILD_ID fell back to `Date.now()` at
// module-load time, which differs per serverless cold start and made clients think a new
// deployment had shipped, triggering reloads and local cache wipes.)
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
export const BUILD_TIMESTAMP = Number(process.env.NEXT_PUBLIC_BUILD_TIME) || 0;
export const STORE_VERSION = `v1.2.${BUILD_TIMESTAMP}`;

/**
 * Image URL helper. Uploaded product/logo images get a unique file name on every upload, so
 * the URL itself already identifies the content. We only append the (deterministic) build id
 * so a new deployment re-validates image URLs once.
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

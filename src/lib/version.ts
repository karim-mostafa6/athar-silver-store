// Auto-generated dynamic Build ID & Version Tracker
// Evaluated and frozen at build time on Vercel
export const BUILD_TIMESTAMP = Date.now();
export const BUILD_ID = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
  ? process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 8)
  : `build-${BUILD_TIMESTAMP}`;
export const STORE_VERSION = `v1.2.${BUILD_TIMESTAMP}`;

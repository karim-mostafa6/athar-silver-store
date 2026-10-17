/** @type {import('next').NextConfig} */

// One build identity per deployment, shared by server + client bundles (see src/lib/version.ts).
const BUILD_ID = (
  process.env.VERCEL_GIT_COMMIT_SHA ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
  `local-${Date.now()}`
).slice(0, 12);
const BUILD_TIME = String(Date.now());

const NO_STORE = "private, no-cache, no-store, max-age=0, must-revalidate";

const nextConfig = {
  poweredByHeader: false,
  generateBuildId: async () => BUILD_ID,
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
    NEXT_PUBLIC_BUILD_TIME: BUILD_TIME,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Baseline security headers on every response.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        // HTML documents / RSC payloads: never stored by browsers, CDN or bfcache, so every
        // visit (including back/forward and in-app browsers) gets the fresh storefront.
        // Hashed build assets (/_next/static, /_next/image) and public files keep Next's
        // own long-lived caching headers because their URLs change when content changes.
        source: "/((?!_next/static|_next/image|images/|favicon.ico|icon.png|apple-touch-icon.png|og-image.jpg).*)",
        headers: [
          { key: "Cache-Control", value: NO_STORE },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ],
      },
      {
        // Internal API routes & server mutations: absolute zero-cache
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;

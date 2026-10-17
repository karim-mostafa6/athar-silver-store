import type { Metadata } from "next";
import { Tajawal, Cairo } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

import { SiteShell } from "@/components/SiteShell";
import { BUILD_ID, STORE_VERSION } from "@/lib/version";
import { getPublicStoreSnapshotCached as getPublicStoreSnapshot } from "@/lib/serverStore";

// Settings document also holds private values (mail password, payment keys, sub-admin accounts).
// Never put them into the HTML that every visitor receives.
const PRIVATE_SETTING_KEYS = ["gmailAppPassword", "paymobApiKey", "adminUsers"];

async function loadInitialStore() {
  try {
    const data = await getPublicStoreSnapshot();
    const settings: Record<string, unknown> = { ...(data.settings || {}) };
    for (const key of PRIVATE_SETTING_KEYS) delete settings[key];
    return {
      products: data.products,
      settings,
      version: data.updatedAt || "",
    };
  } catch {
    return null; // client falls back to fetching /api/data
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://orma-silver.vercel.app"
  ),
  title: "ORMA | Not Given, But Left - مجوهرات فضة إسترليني 925",
  description:
    "مش بتتهدي.. بتتساب. مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى. تشكيلة ORMA الحصرية.",
  keywords: [
    "ORMA",
    "أورما",
    "orma silver",
    "فضة 925",
    "فضة إسترليني",
    "خواتم فضة",
    "سلاسل إيطالي",
    "أساور فضة",
    "مجوهرات فضة مصر",
  ],
  openGraph: {
    title: "ORMA | Not Given, But Left",
    description:
      "مش بتتهدي.. بتتساب. مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى. تشكيلة ORMA الحصرية.",
    url: "/",
    siteName: "ORMA | أورما لفضة 925",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/images/orma/orma-logo-card.jpg",
        width: 1200,
        height: 630,
        alt: "ORMA | Not Given, But Left",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORMA | Not Given, But Left",
    description:
      "مش بتتهدي.. بتتساب. مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.",
    images: ["/images/orma/orma-logo-card.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialStore = await loadInitialStore();

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        {/* Dynamic Build Version / Hash tags: auto-generated at build time */}
        <meta name="build-id" content={BUILD_ID} />
        <meta name="store-version" content={STORE_VERSION} />
        {/* Anti-stale browser caching meta tags: ensures latest products & styles load instantly without wiping auth/tokens */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body
        className={`${tajawal.variable} ${cairo.variable} font-tajawal bg-[#F5F0E7] text-[#292722] antialiased selection:bg-[#B7A078] selection:text-[#292722] min-h-screen`}
      >
        <SiteShell initialStore={initialStore}>{children}</SiteShell>
      </body>
    </html>
  );
}

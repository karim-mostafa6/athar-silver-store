import type { Metadata } from "next";
import { Cairo, Alexandria } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-alexandria",
  display: "swap",
});

import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://athar-silver-store.vercel.app"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body
        className={`${cairo.variable} ${alexandria.variable} font-cairo bg-[#F5F0E7] text-[#292722] antialiased selection:bg-[#B7A078] selection:text-[#292722] min-h-screen`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

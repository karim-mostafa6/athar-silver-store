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
  title: "أَثَر | ATHAR",
  description:
    "كل قطعة وراها حكاية، وكل تفصيلة تترك أثراً. اكتشف تشكيلة «أَثَر» الفريدة من الفضة عيار 925، المصممة بعناية لتعكس شخصيتك وتمنح إطلالتك لمسة من الأصالة.",
  keywords: [
    "أَثَر",
    "ATHAR",
    "فضة 925",
    "فضة إسترليني",
    "خواتم فضة",
    "سلاسل إيطالي",
    "أساور فضة",
    "مجوهرات فضة مصر",
  ],
  openGraph: {
    title: "أَثَر | ATHAR",
    description:
      "كل قطعة وراها حكاية، وكل تفصيلة تترك أثراً. اكتشف تشكيلة «أَثَر» الفريدة من الفضة عيار 925، المصممة بعناية لتعكس شخصيتك وتمنح إطلالتك لمسة من الأصالة.",
    url: "/",
    siteName: "أَثَر | ATHAR",
    locale: "ar_EG",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "أَثَر | ATHAR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أَثَر | ATHAR",
    description:
      "كل قطعة وراها حكاية، وكل تفصيلة تترك أثراً. اكتشف تشكيلة «أَثَر» الفريدة من الفضة عيار 925، المصممة بعناية لتعكس شخصيتك وتمنح إطلالتك لمسة من الأصالة.",
    images: ["/og-image.jpg"],
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
        className={`${cairo.variable} ${alexandria.variable} font-cairo bg-[#f7f4ee] text-[#161412] antialiased selection:bg-[#dfd2bf] selection:text-[#161412] min-h-screen`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

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
  title: "أَثَر | ATHAR - متجر الفضة الإسترليني عيار 925",
  description: "أَثَر للفضة عيار 925 - تشكيلة راقية من السلاسل والخواتم والأساور والحلقان المصنوعة من الفضة الإسترليني الأصلية بأعلى درجات النقاء.",
  keywords: ["فضة 925", "خواتم فضة", "سلاسل فضة", "أساور فضة", "أثر للفضة", "مجوهرات فضة مصر", "فضة إسترليني"],
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

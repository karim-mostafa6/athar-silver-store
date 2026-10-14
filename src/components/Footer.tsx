"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { AtharLogo } from "@/components/AtharLogo";

interface FooterProps {
  onOpenSizeGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { storeSettings } = useStore();

  const currentYear = new Date().getFullYear();
  const slogan = "الأثر لا يُهدى بل يُترك";
  const handle = "@theathar.eg";
  const email = storeSettings.contactEmail || storeSettings.senderEmail || "theathar.eg@gmail.com";

  return (
    <footer id="footer" className="bg-[#141210] text-[#ded5c7] border-t border-[#26221e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 text-center md:text-right">
          {/* Right: Athar Calligraphic Brand Logo + Slogan */}
          <div className="flex flex-col items-center md:items-start space-y-2">
            <AtharLogo variant="dark" size="lg" />
            <p className="font-amiri text-xs sm:text-sm text-[#9c8e7e] font-light">
              {slogan}
            </p>
          </div>

          {/* Center: Essential Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-[#c4b6a4]">
            <Link href="/page/contact" className="hover:text-white transition-colors">
              تواصل معنا
            </Link>
            <Link href="/page/care" className="hover:text-white transition-colors">
              العناية بالفضة
            </Link>
            <Link href="/page/about" className="hover:text-white transition-colors">
              عن أَثَر
            </Link>
            <Link href="/page/returns" className="hover:text-white transition-colors">
              الاستبدال والاسترجاع
            </Link>
            <Link href="/page/warranty" className="hover:text-white transition-colors">
              سياسة الضمان
            </Link>

            {/* Custom Dynamic Pages added from Dashboard */}
            {storeSettings.customPages
              ?.filter(
                (p) =>
                  p.isPublished &&
                  p.showInFooter &&
                  !["contact", "care", "about", "returns", "warranty"].includes(p.slug)
              )
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/page/${p.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {p.footerLabel || p.title}
                </Link>
              ))}
          </nav>

          {/* Left: Social Handle & Contact */}
          <div className="flex flex-col items-center md:items-end space-y-1.5 text-xs text-[#9c8e7e]">
            {storeSettings.instagramUrl ? (
              <a
                href={storeSettings.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-[#ded5c7] hover:text-white transition-colors dir-ltr"
              >
                {handle}
              </a>
            ) : (
              <span className="font-mono text-sm text-[#ded5c7] dir-ltr">
                {handle}
              </span>
            )}
            <a
              href={`mailto:${email}`}
              className="hover:text-white transition-colors font-mono text-xs dir-ltr"
            >
              {email}
            </a>
          </div>
        </div>

        {/* Bottom Line: Copyright */}
        <div className="mt-12 pt-6 border-t border-[#26221e] text-center">
          <p className="font-amiri text-xs text-[#756a5e]">
            © {currentYear} أَثَر
          </p>
        </div>
      </div>
    </footer>
  );
};

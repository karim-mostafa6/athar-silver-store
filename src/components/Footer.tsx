"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { AtharLogo } from "@/components/AtharLogo";
import { Mail, Phone } from "lucide-react";

interface FooterProps {
  onOpenSizeGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { storeSettings } = useStore();

  const currentYear = new Date().getFullYear();
  const slogan = "الأثر لا يُهدى بل يُترك";
  const email = storeSettings.contactEmail || storeSettings.senderEmail || "theathar.eg@gmail.com";
  const phone = storeSettings.contactPhone || storeSettings.whatsappNumber || "01143837730";
  const instagram = storeSettings.instagramUrl || "https://instagram.com/theathar.eg";
  const facebook = storeSettings.facebookUrl || "https://facebook.com/theathar.eg";
  const tiktok = storeSettings.tiktokUrl || "https://tiktok.com/@theathar.eg";

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

          {/* Left: Social & Contact Icons */}
          <div className="flex flex-col items-center md:items-end space-y-2">
            <span className="text-[11px] text-[#9c8e7e] font-light">
              تابعنا وتواصل معنا
            </span>
            <div className="flex items-center gap-2">
              {/* Instagram */}
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="إنستجرام"
                className="w-8 h-8 rounded-full bg-[#1c1815] border border-[#2e2925] flex items-center justify-center text-[#ded5c7] hover:text-[#c5a880] hover:border-[#c5a880] hover:bg-[#25201c] transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="فيسبوك"
                className="w-8 h-8 rounded-full bg-[#1c1815] border border-[#2e2925] flex items-center justify-center text-[#ded5c7] hover:text-[#c5a880] hover:border-[#c5a880] hover:bg-[#25201c] transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                title="تيك توك"
                className="w-8 h-8 rounded-full bg-[#1c1815] border border-[#2e2925] flex items-center justify-center text-[#ded5c7] hover:text-[#c5a880] hover:border-[#c5a880] hover:bg-[#25201c] transition-all hover:scale-110 shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.4a6.33 6.33 0 0 0-.86-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.86-4.48V8.71a8.21 8.21 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
                </svg>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                title={email}
                className="w-8 h-8 rounded-full bg-[#1c1815] border border-[#2e2925] flex items-center justify-center text-[#ded5c7] hover:text-[#c5a880] hover:border-[#c5a880] hover:bg-[#25201c] transition-all hover:scale-110 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>

              {/* Phone */}
              <a
                href={`tel:${phone}`}
                aria-label="Phone"
                title={phone}
                className="w-8 h-8 rounded-full bg-[#1c1815] border border-[#2e2925] flex items-center justify-center text-[#ded5c7] hover:text-[#c5a880] hover:border-[#c5a880] hover:bg-[#25201c] transition-all hover:scale-110 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
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

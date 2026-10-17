"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { OrmaLogo } from "@/components/OrmaLogo";
import { Mail, Phone } from "lucide-react";

interface FooterProps {
  onOpenSizeGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { storeSettings } = useStore();

  const currentYear = new Date().getFullYear();
  const sloganArabic = "مش بتتهدي.. بتتساب";
  const sloganEnglish = "Not Given, But Left";
  const email = storeSettings.contactEmail || storeSettings.senderEmail || "theorma.eg@gmail.com";
  const phone = storeSettings.contactPhone || storeSettings.whatsappNumber || "01143837730";
  const instagram = storeSettings.instagramUrl || "https://instagram.com/ormasilver";
  const facebook = storeSettings.facebookUrl || "https://facebook.com";
  const tiktok = storeSettings.tiktokUrl || "https://tiktok.com";

  const helpLinks = [
    { href: "/page/returns", label: "الاستبدال والاسترجاع" },
    { href: "/page/warranty", label: "سياسة الضمان" },
    { href: "/page/care", label: "العناية بالفضة" },
    { href: "/page/about", label: "عن ORMA" },
    { href: "/page/contact", label: "تواصل معنا" },
  ];
  const customLinks = (storeSettings.customPages || []).filter(
    (p) =>
      p.isPublished &&
      p.showInFooter &&
      !["contact", "care", "about", "returns", "warranty"].includes(p.slug)
  );

  return (
    <footer id="footer" className="bg-[#1E1C18] text-[#F5F0E7]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-14 sm:pt-20 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 text-right">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <OrmaLogo variant="dark" size="lg" showSlogan={false} href="/" />
            <p className="font-cormorant italic text-lg text-[#B7A078] tracking-wide">{sloganEnglish}</p>
            <p className="font-tajawal text-sm sm:text-[15px] text-[#D8C8B3]/85 leading-[1.9] max-w-sm">
              مجوهرات فضة إسترليني عيار 925 بتصميم يحكي قصتك. {sloganArabic}.
            </p>
            <a
              href={instagram}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-mono text-[#B7A078] hover:text-[#F5F0E7] transition-colors dir-ltr py-2"
            >
              @ormasilver
            </a>
          </div>

          {/* Shop */}
          <nav aria-label="تسوّق" className="md:col-span-2 flex flex-col gap-1 text-sm sm:text-[15px] text-[#D8C8B3]/85">
            <b className="text-[#F5F0E7] mb-2 font-cairo">تسوّق</b>
            <Link href="/collection/women" className="py-2 hover:text-[#F5F0E7] transition-colors">تشكيلة نسائية</Link>
            <Link href="/collection/men" className="py-2 hover:text-[#F5F0E7] transition-colors">تشكيلة رجالية</Link>
            <Link href="/collection/all" className="py-2 hover:text-[#F5F0E7] transition-colors">كل القطع</Link>
            <Link href="/track" className="py-2 hover:text-[#F5F0E7] transition-colors">تتبّع طلبك</Link>
          </nav>

          {/* Help */}
          <nav aria-label="المساعدة" className="md:col-span-3 flex flex-col gap-1 text-sm sm:text-[15px] text-[#D8C8B3]/85">
            <b className="text-[#F5F0E7] mb-2 font-cairo">المساعدة</b>
            {helpLinks.map((l) => (
              <Link key={l.href} href={l.href} className="py-2 hover:text-[#F5F0E7] transition-colors">
                {l.label}
              </Link>
            ))}
            {customLinks.map((p) => (
              <Link key={p.slug} href={`/page/${p.slug}`} className="py-2 hover:text-[#F5F0E7] transition-colors">
                {p.footerLabel || p.title}
              </Link>
            ))}
          </nav>

          {/* Contact */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <b className="text-[#F5F0E7] mb-1 font-cairo text-sm sm:text-[15px]">تواصل معنا</b>
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Instagram */}
              <a
                href={instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="إنستجرام"
                className="w-11 h-11 rounded-full bg-transparent border border-[#F5F0E7]/20 flex items-center justify-center text-[#F5F0E7]/75 hover:text-[#B7A078] hover:border-[#B7A078] transition-all hover:scale-110 shadow-xs"
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
                className="w-11 h-11 rounded-full bg-transparent border border-[#F5F0E7]/20 flex items-center justify-center text-[#F5F0E7]/75 hover:text-[#B7A078] hover:border-[#B7A078] transition-all hover:scale-110 shadow-xs"
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
                className="w-11 h-11 rounded-full bg-transparent border border-[#F5F0E7]/20 flex items-center justify-center text-[#F5F0E7]/75 hover:text-[#B7A078] hover:border-[#B7A078] transition-all hover:scale-110 shadow-xs"
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
                className="w-11 h-11 rounded-full bg-transparent border border-[#F5F0E7]/20 flex items-center justify-center text-[#F5F0E7]/75 hover:text-[#B7A078] hover:border-[#B7A078] transition-all hover:scale-110 shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>

              {/* Phone */}
              <a
                href={`tel:${phone}`}
                aria-label="Phone"
                title={phone}
                className="w-11 h-11 rounded-full bg-transparent border border-[#F5F0E7]/20 flex items-center justify-center text-[#F5F0E7]/75 hover:text-[#B7A078] hover:border-[#B7A078] transition-all hover:scale-110 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#D8C8B3]/18 text-right">
          <p className="font-tajawal text-xs sm:text-[13px] text-[#a39682]">
            © {currentYear} ORMA • جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
};

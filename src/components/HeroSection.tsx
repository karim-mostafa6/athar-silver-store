"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";
import { getCacheBustedImageUrl } from "@/lib/version";

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenSizeGuide?: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const { storeSettings, products } = useStore();
  const reduce = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60]);

  const headline = storeSettings.heroTitle || "القطعة اللي بتفضل..\nبعد ما اللحظة تعدّي";
  const slogan = storeSettings.heroTagline || "Not Given, But Left";
  const subtitle =
    storeSettings.heroSubtitle ||
    "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.";
  const primaryButtonText = storeSettings.heroButtonText || "تسوّق المجموعة";
  const secondaryButtonText = storeSettings.heroSecondaryButtonText || "اكتشف ORMA";
  const showPrimary = storeSettings.heroButtonShow !== false;
  const showSecondary = storeSettings.heroSecondaryButtonShow !== false;
  const primaryLink = (storeSettings.heroButtonLink || "").trim();
  const secondaryLink = (storeSettings.heroSecondaryButtonLink || "").trim() || "#story";
  const headlineLines = headline.split("\n");
  const hasCustomImage = Boolean(storeSettings.heroImageUrl && storeSettings.heroImageUrl.trim());

  // Spotlight card: a real best-selling piece from the catalogue (read-only, no data changes).
  const featured = products.find((p) => p.isBestSeller && p.inStock !== false) || products.find((p) => p.inStock !== false);

  const stats = [
    { value: "925", label: "فضة إسترليني أصلية" },
    { value: String(storeSettings.returnPolicyDays || 14), label: "يوم استرجاع واستبدال" },
    { value: "24–48", label: "ساعة توصيل للقاهرة والجيزة" },
  ];

  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.12 * i, ease: EASE },
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#F5F0E7] border-b border-[#292722]/12"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-10 pb-14 sm:pt-14 sm:pb-20 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center lg:min-h-[680px]">
        {/* Text column */}
        <div className="lg:col-span-6 text-right space-y-5 sm:space-y-7 order-2 lg:order-1">
          <motion.div {...item(0)} className="eyebrow text-lg sm:text-xl">
            {slogan}
          </motion.div>

          <h1 className="font-cairo font-light text-[44px] leading-[1.18] sm:text-7xl xl:text-[88px] tracking-tight text-[#292722]">
            {headlineLines.map((line, idx) => (
              <motion.span key={idx} {...item(1 + idx)} className="block">
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p {...item(3)} className="font-tajawal text-base sm:text-lg text-[#5c5346] leading-[1.9] max-w-md">
            {subtitle}
          </motion.p>

          <motion.div {...item(4)} className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-1">
            {showPrimary && (
              <button
                onClick={() => {
                  if (primaryLink && !primaryLink.startsWith("/#") && primaryLink !== "#products") {
                    window.location.href = primaryLink;
                  } else {
                    onExploreClick();
                  }
                }}
                className="btn-shine group inline-flex items-center justify-center gap-2.5 min-h-[56px] px-10 rounded-full bg-[#292722] text-[#F5F0E7] font-cairo text-sm font-bold transition-all duration-300 hover:bg-[#3a352d] hover:shadow-xl active:scale-95 cursor-pointer"
              >
                <span>{primaryButtonText}</span>
                <ArrowLeft className="w-4 h-4 text-[#B7A078] transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
            )}
            {showSecondary && (
              <a
                href={secondaryLink}
                className="inline-flex items-center justify-center min-h-[56px] px-9 rounded-full border border-[#292722] text-[#292722] font-cairo text-sm font-medium transition-all duration-300 hover:bg-[#292722] hover:text-[#F5F0E7] cursor-pointer"
              >
                {secondaryButtonText}
              </a>
            )}
          </motion.div>

          <motion.dl
            {...item(5)}
            className="grid grid-cols-3 gap-3 sm:gap-8 pt-6 sm:pt-8 mt-2 sm:mt-4 border-t border-[#292722]/14 max-w-xl"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-cairo text-2xl sm:text-3xl font-semibold text-[#292722] leading-none">{s.value}</dt>
                <dd className="text-[11px] sm:text-sm text-[#5c5346] mt-2 leading-snug">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Arched visual column */}
        <div className="lg:col-span-6 order-1 lg:order-2 relative">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="relative mx-auto w-full max-w-[520px] lg:max-w-none h-[400px] sm:h-[520px] lg:h-[580px]"
          >
            <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#D8C8B3] to-[#B7A078] shadow-[0_40px_80px_-40px_rgba(41,39,34,0.45)]" style={{ borderRadius: "999px 999px 28px 28px / 300px 300px 28px 28px" }}>
              {hasCustomImage ? (
                <motion.img
                  src={getCacheBustedImageUrl(storeSettings.heroImageUrl)}
                  alt={headline.replace(/\n/g, " ")}
                  fetchPriority="high"
                  decoding="async"
                  style={{ y: imageY }}
                  className="absolute inset-x-0 -top-[30px] w-full h-[calc(100%+60px)] object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#292722]">
                  <ConcentricRipples variant="hero" strokeColor="#B7A078" ringCount={14} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              )}
            </div>

            {featured && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
                className="absolute -bottom-5 right-2 sm:right-[-20px] sm:bottom-12"
              >
                <Link
                  href={`/product/${featured.id}`}
                  className="animate-gentle-float block min-w-[200px] rounded-2xl bg-[#F5F0E7] border border-[#292722]/14 px-5 py-4 shadow-[0_20px_44px_-18px_rgba(41,39,34,0.35)] transition-transform hover:scale-[1.03]"
                >
                  <div className="text-xs text-[#8E7545] tracking-wider">الأكثر طلباً</div>
                  <div className="font-cairo font-semibold text-sm mt-1 text-[#292722] line-clamp-1 max-w-[190px]">{featured.arabicName}</div>
                  <div className="text-sm text-[#5c5346] mt-0.5">{featured.price.toLocaleString("en-US")} ج.م</div>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

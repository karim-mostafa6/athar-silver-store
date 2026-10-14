"use client";

import React from "react";
import Link from "next/link";
import { StoreSettings } from "@/context/StoreContext";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ConcentricRipples } from "@/components/ConcentricRipples";

interface CustomPromoBannerProps {
  settings?: StoreSettings;
  position: "top" | "after_hero" | "between_products" | "before_care" | "before_footer";
}

export const CustomPromoBanner: React.FC<CustomPromoBannerProps> = ({ settings, position }) => {
  // If not enabled or position doesn't match, don't render
  if (!settings?.promoBannerShow) return null;
  if ((settings?.promoBannerPosition || "after_hero") !== position) return null;

  const title = settings?.promoBannerTitle || "تألقي ببريق الفضة الإيطالية عيار 925";
  const subtitle = settings?.promoBannerSubtitle || "خصومات استثنائية وشحن مجاني لكافة المحافظات";
  const badge = settings?.promoBannerBadge || "عرض حصري ✦";
  const buttonText = settings?.promoBannerButtonText || "تسوق العرض الآن";
  const buttonLink = settings?.promoBannerButtonLink || "#products";
  const showButton = settings?.promoBannerButtonShow !== false;
  const theme = settings?.promoBannerTheme || "charcoal";
  const imageUrl = settings?.promoBannerImageUrl;

  // Theme styling
  const themeClasses = {
    charcoal: "bg-[#161412] text-[#f7f4ee] border-[#2e2925]",
    sand: "bg-[#eee4d5] text-[#161412] border-[#ded1be]",
    gold: "bg-gradient-to-r from-[#211a14] via-[#2d2319] to-[#1a140f] text-[#fbf7f0] border-[#c5a880]/40",
    burgundy: "bg-gradient-to-r from-[#201014] via-[#2a131a] to-[#1c0c10] text-[#fdf6f7] border-[#913d4b]/40",
  }[theme] || "bg-[#161412] text-[#f7f4ee] border-[#2e2925]";

  const buttonStyle = {
    charcoal: "bg-[#f7f4ee] text-[#161412] hover:bg-white",
    sand: "bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925]",
    gold: "bg-[#c5a880] text-[#161412] hover:bg-[#d6bc96]",
    burgundy: "bg-[#d9777f] text-white hover:bg-[#e48b92]",
  }[theme] || "bg-[#f7f4ee] text-[#161412]";

  return (
    <section id="custom-promo-banner" className="relative overflow-hidden py-6 sm:py-8 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className={`max-w-7xl mx-auto rounded-2xl border shadow-lg relative overflow-hidden transition-all duration-300 ${themeClasses}`}>
        {/* Subtle Watermark Ripple */}
        <div className="absolute -left-20 -bottom-20 w-80 h-80 opacity-15 pointer-events-none">
          <ConcentricRipples variant="emblem" />
        </div>

        <div className={`p-6 sm:p-10 flex flex-col ${imageUrl ? "md:flex-row items-center justify-between gap-8" : "items-center text-center max-w-3xl mx-auto"}`}>
          {/* Text Content */}
          <div className="space-y-3 z-10 flex-1">
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/10 border border-white/15">
                <Sparkles className="w-3 h-3 text-[#c5a880]" />
                <span>{badge}</span>
              </div>
            )}

            <h3 className="font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs sm:text-sm font-light opacity-85 leading-relaxed max-w-xl">
                {subtitle}
              </p>
            )}

            {showButton && buttonText && (
              <div className="pt-3">
                <Link
                  href={buttonLink}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${buttonStyle}`}
                >
                  <span>{buttonText}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Optional Promo Image Preview */}
          {imageUrl && (
            <div className="w-full md:w-72 lg:w-96 shrink-0 aspect-[16/10] md:aspect-square rounded-xl overflow-hidden shadow-inner border border-white/10 z-10 bg-black/20">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

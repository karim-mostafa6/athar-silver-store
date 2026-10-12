"use client";

import React from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenSizeGuide: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onOpenSizeGuide,
}) => {
  const { storeSettings } = useStore();

  return (
    <div>
      {/* Full-Width Luxury Editorial Banner - ATHAR Signature Brand */}
      <section className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] overflow-hidden bg-[#1c1815] select-none">
        {/* Background Editorial Image */}
        <img
          src={storeSettings.heroImageUrl}
          alt={storeSettings.heroTitle}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.78] contrast-[1.05]"
        />

        {/* Soft Vignette & Subtle Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

        {/* Top Edition Tag */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-10 hidden sm:block">
          <div className="text-white/80 font-mono text-[11px] tracking-[0.3em] uppercase">
            {storeSettings.heroBadge}
          </div>
        </div>

        {/* Centered Editorial Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 text-center items-center">
          {/* Tagline */}
          <div className="text-white/90 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-white/40" />
            <span>بصمةٌ تُميّز حضورك • 925 STERLING SILVER</span>
            <span className="w-6 h-px bg-white/40" />
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-[#faf8f5] tracking-tight font-alexandria max-w-3xl leading-tight">
            {storeSettings.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-white/85 font-light mt-2 max-w-xl">
            {storeSettings.heroSubtitle}
          </p>

          {/* Minimalist Pill Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreClick}
              className="px-9 py-3.5 rounded-full bg-white text-[#1c1815] text-xs sm:text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#f2ece1] transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-2"
            >
              <span>{storeSettings.heroButtonText || "تسوق التشكيلة • EXPLORE COLLECTION"}</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenSizeGuide}
              className="px-6 py-3.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium hover:bg-black/60 transition-all duration-300 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>دليل المقاسات</span>
            </button>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="bg-[#f2ece1] border-b border-[#e2d5c2] py-4 text-center text-xs text-[#524436]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8c7865]" />
            <span className="font-medium">فضة إسترليني معتمدة عيار 925 ومختومة رسمياً</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8c7865]" />
            <span className="font-medium">معاينة ومطابقة عند الاستلام قبل الدفع</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8c7865]" />
            <span className="font-medium">استبدال واسترجاع سلس خلال 14 يوماً</span>
          </div>
        </div>
      </div>
    </div>
  );
};

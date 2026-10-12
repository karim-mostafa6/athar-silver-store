"use client";

import React from "react";
import { ArrowDown, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenSizeGuide: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onOpenSizeGuide,
}) => {
  return (
    <div>
      {/* Full-Width Luxury Editorial Banner - ATHAR Signature Brand */}
      <section className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] overflow-hidden bg-[#1c1815] select-none">
        {/* Background Editorial Image */}
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=90"
          alt="ATHAR 925 Sterling Silver Signature Collection"
          className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.78] contrast-[1.05]"
        />

        {/* Soft Vignette & Subtle Lighting Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />

        {/* Top Edition Tag */}
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-10 hidden sm:block">
          <div className="text-white/80 font-mono text-[11px] tracking-[0.3em] uppercase">
            ATHAR SIGNATURE • 2026 EDITION
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

          {/* Main Title - Original Prestigious ATHAR Identity */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-[#faf8f5] tracking-tight font-alexandria max-w-3xl leading-tight">
            أناقةٌ تدوم.. وأَثَـرٌ لا يُمحى
          </h1>
          <p className="text-sm sm:text-base text-white/85 font-light mt-2 max-w-xl">
            مجوهرات فضة إسترليني عيار 925 بصياغة إيطالية معتمدة تروي قصة تميزك
          </p>

          {/* Minimalist Pill Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onExploreClick}
              className="px-9 py-3.5 rounded-full bg-white text-[#1c1815] text-xs sm:text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#f2ece1] transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-2"
            >
              <span>تسوق التشكيلة • EXPLORE COLLECTION</span>
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

          {/* Editorial Carousel Indicator Dots */}
          <div className="flex items-center gap-2 mt-8">
            <div className="w-8 h-0.5 bg-white rounded-full" />
            <div className="w-8 h-0.5 bg-white/30 rounded-full" />
            <div className="w-8 h-0.5 bg-white/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* 4-Column Minimal Stats Bar */}
      <section className="border-b border-[#e8ded0] bg-[#faf8f5] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#e8ded0]">
          {/* Stat 1 */}
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria tracking-tight">
              +200K
            </div>
            <div className="text-xs text-[#705e4d] mt-1 font-medium">
              عميل فخور في مصر
            </div>
          </div>

          {/* Stat 2 */}
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria tracking-tight">
              +8K
            </div>
            <div className="text-xs text-[#705e4d] mt-1 font-medium">
              تقييم 5 نجوم موثق
            </div>
          </div>

          {/* Stat 3 */}
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria tracking-tight">
              14 يوماً
            </div>
            <div className="text-xs text-[#705e4d] mt-1 font-medium">
              استبدال واسترجاع مضمون
            </div>
          </div>

          {/* Stat 4 */}
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria tracking-tight">
              ضمان معتمد
            </div>
            <div className="text-xs text-[#705e4d] mt-1 font-medium">
              فضة 925 نقية مدى الحياة
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

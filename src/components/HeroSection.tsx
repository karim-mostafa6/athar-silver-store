"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";
import { AtharLogo } from "@/components/AtharLogo";

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenSizeGuide?: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
}) => {
  const { storeSettings } = useStore();

  const headline = storeSettings.heroTitle || "الأَثَر لا يُهدى\nبل يُترك";
  const subtitle =
    storeSettings.heroSubtitle ||
    "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.";
  const primaryButtonText = storeSettings.heroButtonText || "تسوق المجموعة";
  const secondaryButtonText = storeSettings.heroSecondaryButtonText || "اكتشف أثر";

  // Parse lines for headline
  const headlineLines = headline.split("\n");

  return (
    <section id="hero" className="relative w-full bg-[#f7f4ee] overflow-hidden border-b border-[#e8ded0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Typography & CTA Side (Left on visual LTR, Right on RTL flow or natural split) */}
          <div className="flex flex-col justify-center order-2 lg:order-1 text-center lg:text-right space-y-6 sm:space-y-8">
            {/* Signature Headline */}
            <h1 className="font-amiri text-4xl sm:text-6xl lg:text-7xl font-bold text-[#161412] leading-[1.25] tracking-tight">
              {headlineLines.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-[#756555] font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* Action Buttons Matching Mockup */}
            <div className="flex items-center justify-center lg:justify-start gap-5 pt-2">
              {/* Primary Solid Dark Button */}
              <button
                onClick={onExploreClick}
                className="px-8 sm:px-10 py-3.5 rounded-md bg-[#161412] text-[#f7f4ee] text-xs sm:text-sm font-medium hover:bg-[#2e2925] transition-all duration-300 shadow-md active:scale-95"
              >
                {primaryButtonText}
              </button>

              {/* Secondary Clean Text Link with Underline */}
              <a
                href="#story"
                className="text-xs sm:text-sm font-medium text-[#161412] hover:text-[#8c7865] transition-colors py-2 border-b border-[#161412] hover:border-[#8c7865] flex items-center gap-1.5"
              >
                <span>{secondaryButtonText}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Dark Charcoal Ripple Box Side (Right in visual layout) */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-[480px] aspect-square rounded-lg bg-[#161412] overflow-hidden shadow-2xl flex items-center justify-center border border-[#2b2724]">
              {/* Concentric Watermark Ripples */}
              <ConcentricRipples variant="hero" strokeColor="#ffffff" ringCount={14} />

              {/* Centered White Athar Calligraphic Mark */}
              <div className="relative z-10 flex flex-col items-center justify-center p-8">
                <AtharLogo variant="dark" size="xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

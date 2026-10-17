"use client";

import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";
import { getCacheBustedImageUrl } from "@/lib/version";

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenSizeGuide?: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
}) => {
  const { storeSettings } = useStore();

  const headline =
    storeSettings.heroTitle || "القطعة اللي بتفضل..\nبعد ما اللحظة تعدّي";
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

  // Parse lines for headline
  const headlineLines = headline.split("\n");

  const hasCustomImage = Boolean(storeSettings.heroImageUrl && storeSettings.heroImageUrl.trim());

  return (
    <section
      id="hero"
      className="relative w-full min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] xl:min-h-[780px] bg-[#1a1815] overflow-hidden flex items-end sm:items-center border-b border-[#292722]/12"
    >
      {/* =========================================================
          FULL-WIDTH BACKGROUND IMAGE / LUXURY CANVAS (Edge-to-Edge)
          ========================================================= */}
      {hasCustomImage ? (
        <div className="absolute inset-0 w-full h-full">
          <img
            src={getCacheBustedImageUrl(storeSettings.heroImageUrl)}
            alt={headline}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center scale-[1.01] hover:scale-105 transition-transform duration-[7000ms] ease-out"
          />
          {/* Multi-layer Cinematic Overlay for Pristine Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/25 sm:bg-gradient-to-r sm:from-transparent sm:via-black/50 sm:to-black/85 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>
      ) : (
        /* Full-width Luxury Brand Canvas when no image is uploaded */
        <div className="absolute inset-0 w-full h-full bg-[#181614] overflow-hidden flex items-center justify-center">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] rounded-full bg-gradient-to-br from-[#8E7545]/15 via-[#B7A078]/5 to-transparent blur-3xl pointer-events-none" />
          {/* Watermark Ripples */}
          <ConcentricRipples variant="hero" strokeColor="#B7A078" ringCount={16} />
          {/* Cinematic Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>
      )}

      {/* =========================================================
          CONTENT OVERLAY: Artsy-Style Luxury Typography
          ========================================================= */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-14 py-16 sm:py-24 lg:py-28">
        <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6 text-right">
          {/* English Slogan Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#B7A078]/40 shadow-sm animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-[#B7A078]" />
            <span className="font-cairo text-[#B7A078] text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
              {slogan}
            </span>
          </div>

          {/* Signature Headline in Cairo Font (Crystal-clear, luxury geometric Arabic, refined medium weight) */}
          <h1 className="font-cairo text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal sm:font-medium text-white/95 leading-[1.3] sm:leading-[1.25] tracking-normal drop-shadow-md">
            {headlineLines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h1>

          {/* Subtitle in Tajawal (Elegant, crisp, comfortable to read) */}
          <p className="font-tajawal text-sm sm:text-base lg:text-lg text-stone-200/90 leading-relaxed max-w-xl drop-shadow-sm font-normal">
            {subtitle}
          </p>

          {/* Action Buttons matching luxury e-commerce standards */}
          <div className="flex items-center justify-start gap-4 pt-3 flex-wrap">
            {/* Primary Action Button */}
            {showPrimary && (
            <button
              onClick={() => {
                if (primaryLink && !primaryLink.startsWith("/#") && primaryLink !== "#products") {
                  window.location.href = primaryLink;
                } else {
                  onExploreClick();
                }
              }}
              className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white text-[#161412] hover:bg-[#F5F0E7] font-cairo text-xs sm:text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-2.5 group cursor-pointer"
            >
              <span>{primaryButtonText}</span>
              <ArrowLeft className="w-4 h-4 text-[#8E7545] group-hover:-translate-x-1 transition-transform" />
            </button>
            )}

            {/* Secondary Action Link */}
            {showSecondary && (
            <a
              href={secondaryLink}
              className="px-7 sm:px-8 py-3.5 sm:py-4 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white hover:bg-white/10 hover:border-white/60 font-cairo text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span>{secondaryButtonText}</span>
            </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

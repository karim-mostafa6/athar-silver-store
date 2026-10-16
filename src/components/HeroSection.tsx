"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";
import { OrmaLogo } from "@/components/OrmaLogo";

interface HeroSectionProps {
  onExploreClick: () => void;
  onOpenSizeGuide?: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
}) => {
  const { storeSettings } = useStore();

  const headline = storeSettings.heroTitle || "مش بتتهدي..\nبتتساب";
  const slogan = storeSettings.heroTagline || "Not Given, But Left";
  const subtitle =
    storeSettings.heroSubtitle ||
    "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.";
  const primaryButtonText = storeSettings.heroButtonText || "تسوّق المجموعة";
  const secondaryButtonText = storeSettings.heroSecondaryButtonText || "اكتشف ORMA";

  // Parse lines for headline
  const headlineLines = headline.split("\n");

  return (
    <section id="hero" className="relative w-full bg-[#F5F0E7] overflow-hidden border-b border-[#292722]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Typography & CTA Side */}
          <div className="flex flex-col justify-center order-2 lg:order-1 text-center lg:text-right space-y-6 sm:space-y-7">
            {/* Slogan in Hero: Lora Italic, Gold #8E7545 */}
            <p className="font-lora italic text-[#8E7545] text-base sm:text-lg tracking-wider">
              {slogan}
            </p>

            {/* Signature Headline: Aref Ruqaa, Charcoal #292722 */}
            <h1 className="font-aref text-5xl sm:text-7xl lg:text-8xl font-bold text-[#292722] leading-[1.2] tracking-tight">
              {headlineLines.map((line, idx) => (
                <span key={idx} className="block">
                  {line}
                </span>
              ))}
            </h1>

            {/* Subtitle: Amiri, Charcoal with 75% opacity */}
            <p className="text-sm sm:text-base text-[#292722]/75 font-amiri leading-relaxed max-w-lg mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* Action Buttons Matching Mockup */}
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-3">
              {/* Primary Solid Charcoal Button: تسوّق المجموعة */}
              <button
                onClick={onExploreClick}
                className="px-8 sm:px-10 py-3.5 rounded-sm bg-[#292722] text-[#F5F0E7] font-amiri text-sm sm:text-base font-medium hover:bg-[#3d3a33] transition-all duration-300 shadow-md active:scale-95"
              >
                {primaryButtonText}
              </button>

              {/* Secondary Link: اكتشف ORMA with Gold #8E7545 Underline */}
              <a
                href="#story"
                className="text-sm sm:text-base font-amiri font-medium text-[#292722] hover:text-[#8E7545] transition-colors py-2 border-b-2 border-[#8E7545] flex items-center gap-1.5"
              >
                <span>{secondaryButtonText}</span>
                <ArrowLeft className="w-3.5 h-3.5 text-[#8E7545]" />
              </a>
            </div>
          </div>

          {/* Hero Visual Display Side (Custom CMS Image or Signature Ring Art) */}
          <div className="relative order-1 lg:order-2 flex justify-center">
            {storeSettings.heroImageUrl && storeSettings.heroImageUrl.trim() ? (
              <div className="relative w-full max-w-[480px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-[#292722]/30 group bg-[#292722]">
                <img
                  src={storeSettings.heroImageUrl}
                  alt={headline}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-[#292722]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#B7A078]/40 text-[#B7A078] text-[11px] font-tajawal font-medium shadow-md">
                  {slogan}
                </div>
              </div>
            ) : (
              <div className="relative w-full max-w-[480px] aspect-square rounded-2xl bg-[#292722] overflow-hidden shadow-2xl flex items-center justify-center border border-[#292722]/30">
                {/* Concentric Watermark Ripples in Champagne #B7A078 */}
                <ConcentricRipples variant="hero" strokeColor="#B7A078" ringCount={14} />

                {/* The Hero Ring in Champagne Gold #B7A078 + Centered ORMA Logo */}
                <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-[#B7A078]/40 flex items-center justify-center shadow-[0_0_50px_rgba(183,160,120,0.15)]">
                    {/* Subtle Inner Ring */}
                    <div className="absolute inset-2 rounded-full border border-[#B7A078]/25" />
                    
                    {/* Bead on Ring Accent */}
                    <div className="absolute top-4 right-10 w-3 h-3 rounded-full bg-[#B7A078] shadow-[0_0_10px_#B7A078]" />

                    {/* Centered ORMA Logo & Slogan */}
                    <OrmaLogo variant="dark" size="xl" showSlogan={true} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Eye,
  RotateCcw,
  Gift,
  CheckCircle2,
  Truck,
  MessageCircle,
} from "lucide-react";
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

  // Dynamic Height
  const heightClass =
    storeSettings.heroHeight === "compact"
      ? "h-[480px] sm:h-[540px] lg:h-[580px]"
      : storeSettings.heroHeight === "large"
      ? "h-[620px] sm:h-[720px] lg:h-[84vh]"
      : "h-[520px] sm:h-[620px] lg:h-[680px]";

  // Dynamic Overlay Darkness
  const overlayClass =
    storeSettings.heroOverlayDarkness === "light"
      ? "bg-gradient-to-t from-black/60 via-black/20 to-black/35"
      : storeSettings.heroOverlayDarkness === "dark"
      ? "bg-gradient-to-t from-black/90 via-black/45 to-black/65"
      : "bg-gradient-to-t from-black/80 via-black/30 to-black/45";

  // Dynamic Content Alignment
  const alignClass =
    storeSettings.heroContentAlign === "right"
      ? "text-right items-end sm:items-start"
      : "text-center items-center";

  // Ken Burns Animation
  const kenBurnsClass = storeSettings.heroKenBurns !== false ? "animate-ken-burns" : "";

  // Helper for Secondary Button Click
  const handleSecondaryClick = () => {
    if (storeSettings.heroSecondaryButtonAction === "whatsapp") {
      window.open(`https://wa.me/${storeSettings.whatsappNumber}`, "_blank");
    } else if (storeSettings.heroSecondaryButtonAction === "link" && storeSettings.heroSecondaryButtonLink) {
      window.location.href = storeSettings.heroSecondaryButtonLink;
    } else {
      onOpenSizeGuide();
    }
  };

  // Helper for Trust Icon
  const renderTrustIcon = (icon?: string) => {
    switch (icon) {
      case "eye":
        return <Eye className="w-3.5 h-3.5 text-amber-600" />;
      case "refresh":
        return <RotateCcw className="w-3.5 h-3.5 text-amber-600" />;
      case "gift":
        return <Gift className="w-3.5 h-3.5 text-rose-500" />;
      case "truck":
        return <Truck className="w-3.5 h-3.5 text-amber-600" />;
      case "check":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div>
      {/* Full-Width Luxury Editorial Banner - ATHAR Signature Brand */}
      <section className={`relative w-full ${heightClass} overflow-hidden bg-[#1c1815] select-none`}>
        {/* Background Editorial Image with Ken Burns Zoom */}
        <img
          src={storeSettings.heroImageUrl}
          alt={storeSettings.heroTitle}
          className={`absolute inset-0 w-full h-full object-cover object-center brightness-[0.80] contrast-[1.05] will-change-transform ${kenBurnsClass}`}
        />

        {/* Soft Vignette & Subtle Lighting Overlay */}
        <div className={`absolute inset-0 ${overlayClass}`} />

        {/* Floating Luxury Sparkles */}
        <div className="absolute top-1/4 right-12 text-amber-300/40 pointer-events-none animate-sparkle-glow hidden sm:block">
          ✦
        </div>
        <div className="absolute top-1/3 left-16 text-white/30 pointer-events-none animate-sparkle-glow hidden sm:block" style={{ animationDelay: "1.5s" }}>
          ✦
        </div>
        <div className="absolute bottom-1/4 right-1/4 text-amber-200/30 pointer-events-none animate-sparkle-glow hidden sm:block" style={{ animationDelay: "2.5s" }}>
          ✦
        </div>

        {/* Top Edition Tag */}
        {storeSettings.heroBadge && (
          <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-10 hidden sm:block">
            <div className="text-white/90 font-mono text-[11px] tracking-[0.3em] uppercase bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              {storeSettings.heroBadge}
            </div>
          </div>
        )}

        {/* Centered Editorial Content */}
        <div className={`relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-20 ${alignClass}`}>
          {/* Tagline */}
          <div className="text-white/90 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-3 flex items-center gap-2">
            <span className="w-6 h-px bg-white/40" />
            <span>{storeSettings.heroTagline || "بصمةٌ تُميّز حضورك • 925 STERLING SILVER"}</span>
            <span className="w-6 h-px bg-white/40" />
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-[#faf8f5] tracking-tight font-alexandria max-w-3xl leading-tight drop-shadow-md">
            {storeSettings.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-light mt-2.5 max-w-xl drop-shadow">
            {storeSettings.heroSubtitle}
          </p>

          {/* Minimalist Pill Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Primary Button */}
            {storeSettings.heroButtonShow !== false && (
              <>
                {storeSettings.heroButtonLink && storeSettings.heroButtonLink !== "#products" ? (
                  <Link
                    href={storeSettings.heroButtonLink}
                    className="btn-metallic-shine px-9 py-3.5 rounded-full bg-white text-[#1c1815] text-xs sm:text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#f2ece1] transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-2"
                  >
                    <span>{storeSettings.heroButtonText || "اكتشف التشكيلة الكاملة"}</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={onExploreClick}
                    className="btn-metallic-shine px-9 py-3.5 rounded-full bg-white text-[#1c1815] text-xs sm:text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#f2ece1] transition-all duration-300 shadow-xl active:scale-95 flex items-center gap-2"
                  >
                    <span>{storeSettings.heroButtonText || "اكتشف التشكيلة الكاملة"}</span>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {/* Secondary Button */}
            {storeSettings.heroSecondaryButtonShow !== false && (
              <button
                onClick={handleSecondaryClick}
                className="btn-metallic-shine px-7 py-3.5 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-white text-xs sm:text-sm font-medium hover:bg-black/65 hover:border-white/40 transition-all duration-300 flex items-center gap-2 shadow-lg active:scale-95"
              >
                {storeSettings.heroSecondaryButtonAction === "whatsapp" ? (
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{storeSettings.heroSecondaryButtonText || "دليل المقاسات"}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Trust Strip / Value Proposition Bar */}
      {storeSettings.showTrustBar !== false && (
        <div
          className={`border-b py-4 text-center text-xs transition-colors select-none ${
            storeSettings.trustBarBg === "dark"
              ? "bg-[#1c1815] text-[#e8ded3] border-[#382f27]"
              : storeSettings.trustBarBg === "white"
              ? "bg-white text-[#1c1815] border-[#ebdcca]"
              : "bg-[#f2ece1] text-[#524436] border-[#e2d5c2]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-5 sm:gap-10">
            {/* Item 1 */}
            <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-default">
              {renderTrustIcon(storeSettings.trustItem1Icon || "shield")}
              <span className="font-medium">
                {storeSettings.trustItem1 || "فضة إسترليني معتمدة عيار 925 ومختومة رسمياً"}
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-default">
              {renderTrustIcon(storeSettings.trustItem2Icon || "truck")}
              <span className="font-medium">
                {storeSettings.trustItem2 || "شحن سريع وتغليف آمن ومحكم لكافة المحافظات"}
              </span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-default">
              {renderTrustIcon(storeSettings.trustItem3Icon || "refresh")}
              <span className="font-medium">
                {storeSettings.trustItem3 || "استبدال واسترجاع سلس خلال 14 يوماً"}
              </span>
            </div>

            {/* Item 4 (Optional) */}
            {storeSettings.trustItem4Show && (
              <div className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 cursor-default">
                {renderTrustIcon(storeSettings.trustItem4Icon || "gift")}
                <span className="font-medium">
                  {storeSettings.trustItem4 || "تغليف هدايا ملكي وعلبة فاخرة مجاناً"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { getCacheBustedImageUrl } from "@/lib/version";

export interface OrmaLogoProps {
  className?: string;
  variant?: "dark" | "light"; // "dark" = Ivory text + Champagne gold for dark bg; "light" = Charcoal text + Logo gold for light bg
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showSlogan?: boolean;
  sloganText?: string;
  href?: string;
  customImageUrl?: string;
  customHeight?: number;
  customType?: "text" | "image" | "both";
}

export const OrmaLogo: React.FC<OrmaLogoProps> = ({
  className = "",
  variant = "light",
  size = "md",
  showSlogan = false,
  sloganText,
  href,
  customImageUrl,
  customHeight,
  customType,
}) => {
  const { storeSettings } = useStore();

  const isDark = variant === "dark";

  // Colors per brand guidelines:
  // Charcoal: #292722
  // Ivory: #F5F0E7
  // Champagne (gold on dark): #B7A078
  // Gold (on light): #8E7545
  // Logo Gold (bead/jewel on light): #A88F5F
  const sloganColorClass = isDark ? "text-[#B7A078]" : "text-[#8E7545]";

  // Dynamic values resolved from dashboard storeSettings or explicit overrides
  const effectiveImageUrl =
    customImageUrl !== undefined ? customImageUrl : storeSettings.logoImageUrl;
  const effectiveLogoType =
    customType !== undefined ? customType : (storeSettings.logoType || "both");
  const effectiveBaseHeight =
    customHeight !== undefined ? customHeight : (storeSettings.logoHeight || 42);

  const hasCustomImage = Boolean(effectiveImageUrl && effectiveImageUrl.trim());
  const showImage = hasCustomImage && effectiveLogoType !== "text";
  const showVector =
    effectiveLogoType === "text" || !hasCustomImage || effectiveLogoType === "both";

  // Proportional sizing based on size preset and configured base logoHeight
  const sizeMultiplier =
    size === "xs" ? 0.65 : size === "sm" ? 0.8 : size === "lg" ? 1.25 : size === "xl" ? 1.5 : 1;
  const targetHeight = Math.round(effectiveBaseHeight * sizeMultiplier);
  const targetWidth = Math.round(targetHeight * (210 / 60)); // aspect ratio 3.5

  const brandTitle =
    storeSettings.brandNameArabic || storeSettings.brandNameEnglish || "ORMA";
  const effectiveSlogan =
    sloganText || storeSettings.brandSubtitle || "Not Given, But Left";

  const logoContent = (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <div className="flex items-center justify-center gap-2 group">
        {/* 1. Custom Uploaded/Linked Image from Dashboard */}
        {showImage && (
          <img
            src={getCacheBustedImageUrl(effectiveImageUrl)}
            alt={brandTitle}
            style={{ height: `${targetHeight}px` }}
            className={`w-auto object-contain transition-all duration-300 ${
              isDark ? "brightness-110 drop-shadow-sm" : ""
            }`}
          />
        )}

        {/* 2. Official ORMA logo artwork (same file everywhere on the site) */}
        {showVector && (
          <img
            src={isDark ? "/images/orma/logo-on-dark.png" : "/images/orma/logo-on-light.png"}
            alt={brandTitle}
            width={targetWidth}
            height={Math.round(targetWidth / 4.885)}
            style={{ width: `${targetWidth}px`, height: "auto" }}
            className="select-none transition-transform duration-300 group-hover:scale-[1.02]"
            draggable={false}
          />
        )}
      </div>

      {/* Slogan underneath */}
      {showSlogan && (
        <span
          className={`font-lora italic font-normal tracking-[0.16em] text-[11px] sm:text-xs mt-1 transition-colors ${sloganColorClass}`}
        >
          {effectiveSlogan}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block group focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

// Backwards compatibility alias
export const AtharLogo = OrmaLogo;
export default OrmaLogo;

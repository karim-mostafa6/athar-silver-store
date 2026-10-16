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
  const letterColor = isDark ? "#F5F0E7" : "#292722";
  const jewelColor = isDark ? "#B7A078" : "#A88F5F";
  const FACET = isDark ? "#292722" : "#F5F0E7"; // gem facet lines
  const INK = letterColor;
  const GOLD = jewelColor;
  const logoMarkup = `<path d="M-363.9 -176.5A93.4 93.4 0 1 1 -436.2 -200.0" fill="none" stroke="${INK}" stroke-width="27.3"/><circle cx="-363.9" cy="-176.5" r="34.1" fill="${GOLD}"/><path d="M-105.3 0.0 -155.1 -85.5H-188.1V0.0H-215.4V-209.1H-147.9Q-124.2 -209.1 -107.9 -201.0Q-91.5 -192.9 -83.4 -179.1Q-75.3 -165.2 -75.3 -147.6Q-75.3 -126.0 -87.8 -109.5Q-100.2 -93.0 -125.1 -87.6L-72.6 0.0ZM-188.1 -107.3H-147.9Q-125.7 -107.3 -114.6 -118.35Q-103.5 -129.2 -103.5 -147.6Q-103.5 -166.2 -114.5 -176.3Q-125.4 -186.6 -147.9 -186.6H-188.1Z" fill="${INK}"/><rect x="36.9" y="-214.2" width="27.3" height="214.2" fill="${INK}"/><rect x="221.7" y="-214.2" width="27.3" height="214.2" fill="${INK}"/><ellipse cx="56.3" cy="-186.5" rx="8.5" ry="4.7" transform="rotate(62.3 56.3 -186.5)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="62.6" cy="-175.0" rx="5.3" ry="2.5" transform="rotate(60.5 62.6 -175.0)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="69.3" cy="-163.6" rx="8.5" ry="4.7" transform="rotate(58.3 69.3 -163.6)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="76.5" cy="-152.6" rx="5.3" ry="2.5" transform="rotate(55.6 76.5 -152.6)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="84.2" cy="-141.9" rx="8.5" ry="4.7" transform="rotate(52.2 84.2 -141.9)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="92.7" cy="-131.8" rx="5.3" ry="2.5" transform="rotate(47.9 92.7 -131.8)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="101.9" cy="-122.5" rx="8.5" ry="4.7" transform="rotate(42.0 101.9 -122.5)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="112.3" cy="-114.3" rx="5.3" ry="2.5" transform="rotate(34.0 112.3 -114.3)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="123.8" cy="-108.0" rx="8.5" ry="4.7" transform="rotate(22.8 123.8 -108.0)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="136.4" cy="-104.4" rx="5.3" ry="2.5" transform="rotate(8.2 136.4 -104.4)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="149.6" cy="-104.4" rx="8.5" ry="4.7" transform="rotate(-8.3 149.6 -104.4)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="162.2" cy="-108.0" rx="5.3" ry="2.5" transform="rotate(-22.9 162.2 -108.0)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="173.8" cy="-114.3" rx="8.5" ry="4.7" transform="rotate(-34.1 173.8 -114.3)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="184.1" cy="-122.5" rx="5.3" ry="2.5" transform="rotate(-42.1 184.1 -122.5)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="193.4" cy="-131.8" rx="8.5" ry="4.7" transform="rotate(-47.9 193.4 -131.8)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="201.8" cy="-141.9" rx="5.3" ry="2.5" transform="rotate(-52.3 201.8 -141.9)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="209.6" cy="-152.7" rx="8.5" ry="4.7" transform="rotate(-55.7 209.6 -152.7)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="216.7" cy="-163.7" rx="5.3" ry="2.5" transform="rotate(-58.3 216.7 -163.7)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="223.4" cy="-175.1" rx="8.5" ry="4.7" transform="rotate(-60.5 223.4 -175.1)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><ellipse cx="229.7" cy="-186.6" rx="5.3" ry="2.5" transform="rotate(-62.3 229.7 -186.6)" fill="none" stroke="${INK}" stroke-width="3" opacity="1.00"/><circle cx="143.0" cy="-97.9" r="6.5" fill="none" stroke="${INK}" stroke-width="3"/><polygon points="110.9,-72.4 123.7,-91.9 162.3,-91.9 175.1,-72.4 143.0,-30.9" fill="${GOLD}" stroke="${GOLD}" stroke-width="3" stroke-linejoin="round"/><g stroke="${FACET}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"><line x1="110.9" y1="-72.4" x2="175.1" y2="-72.4"/><line x1="123.7" y1="-91.9" x2="134.0" y2="-72.4"/><line x1="162.3" y1="-91.9" x2="152.0" y2="-72.4"/><line x1="134.0" y1="-72.4" x2="143.0" y2="-30.9"/><line x1="152.0" y1="-72.4" x2="143.0" y2="-30.9"/></g><path d="M488.8 -46.5H397.65L380.8 0.0H352.0L427.65 -207.9H459.15L534.4 0.0H505.65ZM481.0 -68.7 443.25 -174.2 405.45 -68.7Z" fill="${INK}"/>`;
  const sloganColorClass = isDark ? "text-[#B7A078]" : "text-[#8E7545]";

  // Dynamic values resolved from dashboard storeSettings or explicit overrides
  const effectiveImageUrl =
    customImageUrl !== undefined ? customImageUrl : storeSettings.logoImageUrl;
  const effectiveLogoType =
    customType !== undefined ? customType : (storeSettings.logoType || "both");
  const effectiveBaseHeight =
    customHeight !== undefined ? customHeight : (storeSettings.logoHeight || 42);

  const hasCustomImage = Boolean(effectiveImageUrl && effectiveImageUrl.trim());
  // The official vector logo is the default. A custom uploaded image is used only when
  // the dashboard logo type is explicitly "image".
  const showImage = hasCustomImage && effectiveLogoType === "image";
  const showVector = !showImage;

  // Proportional sizing based on size preset and configured base logoHeight
  const sizeMultiplier =
    size === "xs" ? 0.65 : size === "sm" ? 0.8 : size === "lg" ? 1.25 : size === "xl" ? 1.5 : 1;
  const targetHeight = Math.round(effectiveBaseHeight * sizeMultiplier);
  const targetWidth = Math.round(targetHeight * (1076.2 / 222.5)); // official logo aspect ratio ≈ 4.84

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

        {/* 2. Official ORMA vector logo (open-ring O + chain-and-gem M) — transparent, no image upload needed */}
        {showVector && (
          <svg
            width={targetWidth}
            height={targetHeight}
            viewBox="-537.7 -218.3 1076.2 222.5"
            role="img"
            aria-label={brandTitle}
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-[1.02]"
            dangerouslySetInnerHTML={{ __html: logoMarkup }}
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

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

export interface OrmaLogoProps {
  className?: string;
  variant?: "dark" | "light"; // "dark" = Ivory text + Champagne gold for dark bg; "light" = Charcoal text + Logo gold for light bg
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showSlogan?: boolean;
  sloganText?: string;
  href?: string;
}

export const OrmaLogo: React.FC<OrmaLogoProps> = ({
  className = "",
  variant = "light",
  size = "md",
  showSlogan = false,
  sloganText = "Not Given, But Left",
  href,
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
  const chainColor = isDark ? "#B7A078" : "#292722";
  const chainOpacity = isDark ? 0.75 : 0.45;
  const sloganColorClass = isDark ? "text-[#B7A078]" : "text-[#8E7545]";

  const sizeDimensions = {
    xs: { width: 85, height: 26 },
    sm: { width: 110, height: 34 },
    md: { width: 145, height: 44 },
    lg: { width: 185, height: 56 },
    xl: { width: 230, height: 70 },
  };

  const dim = sizeDimensions[size] || sizeDimensions.md;

  const logoContent = (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* If custom logo image uploaded in dashboard */}
      {storeSettings.logoImageUrl && storeSettings.logoType === "image" ? (
        <img
          src={storeSettings.logoImageUrl}
          alt={storeSettings.brandNameArabic || "ORMA"}
          style={{ height: `${storeSettings.logoHeight || 42}px` }}
          className="w-auto object-contain"
        />
      ) : (
        <div className="flex flex-col items-center group">
          {/* Precise Vector Signature ORMA Wordmark */}
          <svg
            width={dim.width}
            height={dim.height}
            viewBox="0 0 210 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-[1.02]"
          >
            {/* ================= LETTER O ================= */}
            {/* Open Ring: from angle ~45 deg to ~-45 deg (leaving top-right open) */}
            <path
              d="M 32 15 A 19 19 0 1 0 35 32"
              stroke={letterColor}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            {/* Solid Gold Bead nestled at the opening (top right ~1 o'clock) */}
            <circle cx="35" cy="18" r="4.8" fill={jewelColor} />

            {/* ================= LETTER R ================= */}
            {/* Vertical Left Stem */}
            <rect x="58" y="12" width="4.2" height="37" rx="1.5" fill={letterColor} />
            {/* Top Loop */}
            <path
              d="M 61 14.1 H 73 C 80 14.1 84 18 84 24.5 C 84 31 80 34.5 73 34.5 H 61 Z"
              stroke={letterColor}
              strokeWidth="4.2"
              strokeLinejoin="round"
            />
            {/* Diagonal Leg */}
            <path
              d="M 71 33.5 L 83 49"
              stroke={letterColor}
              strokeWidth="4.2"
              strokeLinecap="round"
            />

            {/* ================= LETTER M ================= */}
            {/* Left Vertical Column */}
            <rect x="102" y="12" width="4.2" height="37" rx="1.5" fill={letterColor} />
            {/* Right Vertical Column */}
            <rect x="138" y="12" width="4.2" height="37" rx="1.5" fill={letterColor} />
            {/* Delicate Hanging Necklace Chain */}
            <path
              d="M 104.5 13.5 C 109 25, 115 31, 122 31.5 C 129 31, 135 25, 139.5 13.5"
              stroke={chainColor}
              strokeWidth="1.4"
              strokeDasharray="2.2 1.5"
              strokeOpacity={chainOpacity}
            />
            {/* Faceted Sparkling Diamond Jewel Pendant */}
            <g transform="translate(122, 36)">
              {/* Diamond Outline */}
              <polygon
                points="-5.5,-5 5.5,-5 3.5,4 0,7 -3.5,4"
                fill={jewelColor}
                stroke={letterColor}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              {/* Facet Lines */}
              <line x1="-3.5" y1="-5" x2="0" y2="7" stroke={isDark ? "#292722" : "#F5F0E7"} strokeWidth="0.6" strokeOpacity="0.85" />
              <line x1="3.5" y1="-5" x2="0" y2="7" stroke={isDark ? "#292722" : "#F5F0E7"} strokeWidth="0.6" strokeOpacity="0.85" />
              <line x1="-5.5" y1="-5" x2="0" y2="-1" stroke={isDark ? "#292722" : "#F5F0E7"} strokeWidth="0.6" strokeOpacity="0.85" />
              <line x1="5.5" y1="-5" x2="0" y2="-1" stroke={isDark ? "#292722" : "#F5F0E7"} strokeWidth="0.6" strokeOpacity="0.85" />
            </g>

            {/* ================= LETTER A ================= */}
            {/* Left Diagonal */}
            <line x1="162" y1="49" x2="175" y2="12" stroke={letterColor} strokeWidth="4.2" strokeLinecap="round" />
            {/* Right Diagonal */}
            <line x1="175" y1="12" x2="188" y2="49" stroke={letterColor} strokeWidth="4.2" strokeLinecap="round" />
            {/* Horizontal Crossbar */}
            <line x1="167" y1="36" x2="183" y2="36" stroke={letterColor} strokeWidth="3.6" strokeLinecap="round" />
          </svg>

          {/* Slogan underneath */}
          {showSlogan && (
            <span
              className={`font-lora italic font-normal tracking-[0.16em] text-[11px] sm:text-xs mt-1 transition-colors ${sloganColorClass}`}
            >
              {sloganText}
            </span>
          )}
        </div>
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

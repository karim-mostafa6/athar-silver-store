import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

interface AtharLogoProps {
  className?: string;
  variant?: "dark" | "light"; // "dark" means white text for dark bg, "light" means charcoal text for light bg
  size?: "sm" | "md" | "lg" | "xl";
  showSlogan?: boolean;
  sloganText?: string;
  href?: string;
}

export const AtharLogo: React.FC<AtharLogoProps> = ({
  className = "",
  variant = "light",
  size = "md",
  showSlogan = false,
  sloganText = "الأثر لا يُهدى بل يُترك",
  href,
}) => {
  const { storeSettings } = useStore();

  const isDark = variant === "dark";
  const textColor = isDark ? "text-[#f7f4ee]" : "text-[#161412]";
  const sloganColor = isDark ? "text-[#a89b8c]" : "text-[#756555]";

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl",
    xl: "text-5xl sm:text-7xl",
  };

  const sloganSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  };

  const logoContent = (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* If custom logo image uploaded in dashboard */}
      {storeSettings.logoImageUrl && storeSettings.logoType !== "text" ? (
        <img
          src={storeSettings.logoImageUrl}
          alt={storeSettings.brandNameArabic || "أَثَر"}
          style={{ height: `${storeSettings.logoHeight || 40}px` }}
          className="w-auto object-contain"
        />
      ) : (
        <div className="flex flex-col items-center">
          {/* Signature Calligraphic Athar Wordmark */}
          <span
            className={`font-amiri font-bold tracking-wider leading-none transition-colors ${sizeClasses[size]} ${textColor}`}
            style={{ fontFeatureSettings: '"cv01", "cv02"' }}
          >
            أَثَـر
          </span>
          {showSlogan && (
            <span
              className={`font-amiri font-normal tracking-wide mt-1.5 transition-colors ${sloganSizeClasses[size]} ${sloganColor}`}
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

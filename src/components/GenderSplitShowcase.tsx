"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";

export const GenderSplitShowcase: React.FC = () => {
  const { storeSettings } = useStore();

  // Read dynamically from storeSettings (configured via Admin Dashboard - القصة والعناية)
  const womenTitle =
    storeSettings.splitWomenEnglishTitle?.trim() ||
    storeSettings.splitWomenTitle?.trim() ||
    "Women's";
  const womenButtonText =
    storeSettings.splitWomenButtonText?.trim() || "EXPLORE NOW";
  const womenLink =
    storeSettings.splitWomenLink?.trim() || "/collection/women";
  const womenImage =
    storeSettings.splitWomenImage?.trim() ||
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1400&q=85";

  const menTitle =
    storeSettings.splitMenEnglishTitle?.trim() ||
    storeSettings.splitMenTitle?.trim() ||
    "Men's";
  const menButtonText =
    storeSettings.splitMenButtonText?.trim() || "EXPLORE NOW";
  const menLink =
    storeSettings.splitMenLink?.trim() || "/collection/men";
  const menImage =
    storeSettings.splitMenImage?.trim() ||
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1400&q=85";

  return (
    <section className="w-full bg-[#F5F0E7] py-6 sm:py-10 border-b border-[#292722]/12">
      {/* Full-width container with responsive outer margin and elegant rounded corners */}
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {/* Women's Showcase Banner */}
          <Link
            href={womenLink}
            className="group relative h-[380px] sm:h-[480px] lg:h-[560px] xl:h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 block border border-[#292722]/10"
          >
            {/* Background Photography */}
            <img
              src={womenImage}
              alt={womenTitle}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay for Crisp Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />

            {/* Editorial Content: Title + Rectangular EXPLORE NOW Button */}
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-10 text-left dir-ltr space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold font-cairo tracking-tight text-white drop-shadow-md">
                {womenTitle}
              </h3>

              <div>
                <span className="inline-block px-5 py-2 sm:px-6 sm:py-2.5 border border-white/85 bg-black/25 group-hover:bg-white text-white group-hover:text-[#161412] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm">
                  {womenButtonText}
                </span>
              </div>
            </div>
          </Link>

          {/* Men's Showcase Banner */}
          <Link
            href={menLink}
            className="group relative h-[380px] sm:h-[480px] lg:h-[560px] xl:h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 block border border-[#292722]/10"
          >
            {/* Background Photography */}
            <img
              src={menImage}
              alt={menTitle}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay for Crisp Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:from-black/90 transition-colors duration-300" />

            {/* Editorial Content: Title + Rectangular EXPLORE NOW Button */}
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-10 text-left dir-ltr space-y-3 sm:space-y-4">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold font-cairo tracking-tight text-white drop-shadow-md">
                {menTitle}
              </h3>

              <div>
                <span className="inline-block px-5 py-2 sm:px-6 sm:py-2.5 border border-white/85 bg-black/25 group-hover:bg-white text-white group-hover:text-[#161412] text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-sm">
                  {menButtonText}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const GenderSplitShowcase: React.FC = () => {
  const { storeSettings } = useStore();

  const showTopButton = storeSettings.splitTopButtonShow !== false && Boolean(storeSettings.splitTopButtonText?.trim());
  const topButtonText = storeSettings.splitTopButtonText || "VIEW ALL • كافة القطع";

  const womenTag = storeSettings.splitWomenTag !== undefined ? storeSettings.splitWomenTag : "COLLECTION FOR HER";
  const womenEnglishTitle = storeSettings.splitWomenEnglishTitle !== undefined ? storeSettings.splitWomenEnglishTitle : "Women's";
  const womenTitle = storeSettings.splitWomenTitle || "";
  const womenSubtitle = storeSettings.splitWomenSubtitle || "";
  const womenButtonText = storeSettings.splitWomenButtonText !== undefined ? storeSettings.splitWomenButtonText : "EXPLORE NOW";

  const menTag = storeSettings.splitMenTag !== undefined ? storeSettings.splitMenTag : "COLLECTION FOR HIM";
  const menEnglishTitle = storeSettings.splitMenEnglishTitle !== undefined ? storeSettings.splitMenEnglishTitle : "Men's";
  const menTitle = storeSettings.splitMenTitle || "";
  const menSubtitle = storeSettings.splitMenSubtitle || "";
  const menButtonText = storeSettings.splitMenButtonText !== undefined ? storeSettings.splitMenButtonText : "EXPLORE NOW";

  return (
    <section className="w-full bg-[#F5F0E7] py-12 sm:py-16 border-b border-[#292722]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Centered "VIEW ALL" Button - Links to /collection/all */}
        {showTopButton && (
          <div className="flex justify-center mb-10">
            <Link
              href="/collection/all"
              className="px-8 py-3 rounded-full bg-[#292722] hover:bg-[#3d3a33] text-[#F5F0E7] font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 inline-flex items-center gap-2"
            >
              <span>{topButtonText}</span>
            </Link>
          </div>
        )}

        {/* Dual Split 50/50 Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Women's Showcase Banner -> Links to /collection/women */}
          <Link
            href="/collection/women"
            className="group relative h-[380px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 block"
          >
            {/* Background Editorial Photo */}
            <img
              src={storeSettings.splitWomenImage}
              alt={womenTitle || "التشكيلة النسائية"}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300" />

            {/* Content Bottom */}
            <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 text-right text-white z-10 space-y-3">
              {womenTag.trim() && (
                <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/75">
                  {womenTag}
                </div>
              )}
              {(womenEnglishTitle.trim() || womenTitle.trim()) && (
                <h3 className="text-3xl sm:text-4xl font-medium font-tajawal tracking-tight text-[#faf8f5]">
                  {womenEnglishTitle.trim() && <span>{womenEnglishTitle}</span>}
                  {womenTitle.trim() && (
                    <span className="block text-sm font-normal text-white/80 mt-1">
                      {womenTitle}
                    </span>
                  )}
                </h3>
              )}
              {womenSubtitle.trim() && (
                <p className="text-xs text-white/75 line-clamp-1 max-w-xs">
                  {womenSubtitle}
                </p>
              )}

              {womenButtonText.trim() && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/70 text-white text-xs font-bold uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-[#1c1815] transition-all duration-300 shadow-sm">
                    <span>{womenButtonText}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Men's Showcase Banner -> Links to /collection/men */}
          <Link
            href="/collection/men"
            className="group relative h-[380px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 block"
          >
            {/* Background Editorial Photo */}
            <img
              src={storeSettings.splitMenImage}
              alt={menTitle || "التشكيلة الرجالية"}
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300" />

            {/* Content Bottom */}
            <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 text-right text-white z-10 space-y-3">
              {menTag.trim() && (
                <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/75">
                  {menTag}
                </div>
              )}
              {(menEnglishTitle.trim() || menTitle.trim()) && (
                <h3 className="text-3xl sm:text-4xl font-medium font-tajawal tracking-tight text-[#faf8f5]">
                  {menEnglishTitle.trim() && <span>{menEnglishTitle}</span>}
                  {menTitle.trim() && (
                    <span className="block text-sm font-normal text-white/80 mt-1">
                      {menTitle}
                    </span>
                  )}
                </h3>
              )}
              {menSubtitle.trim() && (
                <p className="text-xs text-white/75 line-clamp-1 max-w-xs">
                  {menSubtitle}
                </p>
              )}

              {menButtonText.trim() && (
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/70 text-white text-xs font-bold uppercase tracking-[0.15em] group-hover:bg-white group-hover:text-[#1c1815] transition-all duration-300 shadow-sm">
                    <span>{menButtonText}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";

export const BrandStorySection: React.FC = () => {
  const { storeSettings } = useStore();

  if (storeSettings.storySectionShow === false) {
    return null;
  }

  const headline =
    storeSettings.storyTitle || "أثر: ما يبقى طويلاً\nبعد أن تمضي اللحظة";
  const storyText =
    storeSettings.storySubtitle ||
    "نصنع كل قطعة في أثر من الفضة الإسترليني عيار 925 لتكون أكثر من مجرد زينة، بل بصمة وذكرى تتناقلها الأيام وتخلد أدق تفاصيلك.";

  const headlineLines = headline.split("\n");

  return (
    <section
      id="story"
      className="relative w-full py-24 sm:py-32 bg-[#161412] text-[#f7f4ee] overflow-hidden border-b border-[#2d2926]"
    >
      {/* Background Concentric Ripples */}
      <ConcentricRipples variant="story" strokeColor="#c5a880" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center space-y-6">
        {/* Concentric Gold Emblem Icon */}
        <div className="mb-2">
          <ConcentricRipples variant="emblem" strokeColor="#c5a880" className="w-12 h-12" />
        </div>

        {/* Brand Story Headline in Amiri Calligraphy */}
        <h2 className="font-amiri text-3xl sm:text-5xl font-bold leading-relaxed tracking-tight text-[#f7f4ee]">
          {headlineLines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
        </h2>

        {/* Narrative Paragraph */}
        <p className="text-sm sm:text-base text-[#b8a998] font-light leading-loose max-w-2xl mx-auto">
          {storyText}
        </p>
      </div>
    </section>
  );
};

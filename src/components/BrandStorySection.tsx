"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";
import { OrmaLogo } from "@/components/OrmaLogo";
import { ScrollReveal } from "@/components/ScrollReveal";

export const BrandStorySection: React.FC = () => {
  const { storeSettings } = useStore();

  if (storeSettings.storySectionShow === false) {
    return null;
  }

  const headline =
    storeSettings.storyTitle || "القطعة اللي بتفضل\nبعد ما اللحظة تعدّي";
  const storyText =
    storeSettings.storySubtitle ||
    "نصنع كل قطعة في ORMA من الفضة الإسترليني عيار 925 لتكون أكثر من مجرد زينة، بل بصمة وشعور يخلد أدق تفاصيلك ويبقى للأبد.";

  const headlineLines = headline.split("\n");

  const pillars = [
    { title: storeSettings.storyPillar1Title, desc: storeSettings.storyPillar1Desc, show: storeSettings.storyPillar1Show },
    { title: storeSettings.storyPillar2Title, desc: storeSettings.storyPillar2Desc, show: storeSettings.storyPillar2Show },
    { title: storeSettings.storyPillar3Title, desc: storeSettings.storyPillar3Desc, show: storeSettings.storyPillar3Show },
    { title: storeSettings.storyPillar4Title, desc: storeSettings.storyPillar4Desc, show: storeSettings.storyPillar4Show },
  ].filter((p) => p.show !== false && (p.title || p.desc));

  return (
    <section
      id="story"
      className="relative w-full py-24 sm:py-32 bg-[#292722] text-[#F5F0E7] overflow-hidden border-b border-[#292722]/30"
    >
      {/* Background Concentric Ripples in Champagne Gold */}
      <ConcentricRipples variant="story" strokeColor="#B7A078" ringCount={12} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center space-y-6">
        {/* Emblem / ORMA Logo */}
        <ScrollReveal direction="none" delay={0} duration={800} threshold={0.15}>
          <div className="mb-2">
            <OrmaLogo variant="dark" size="lg" showSlogan={false} />
          </div>
        </ScrollReveal>

        {/* Badge */}
        {storeSettings.storyBadge && (
          <ScrollReveal direction="up" delay={80} duration={700} threshold={0.12}>
            <span className="inline-block text-[10px] font-mono tracking-[0.3em] uppercase text-[#B7A078] border border-[#B7A078]/40 px-4 py-1.5 rounded-full">
              {storeSettings.storyBadge}
            </span>
          </ScrollReveal>
        )}

        {/* Headline in Aref Ruqaa */}
        <ScrollReveal direction="up" delay={150} duration={800} threshold={0.12}>
          <h2 className="font-aref text-4xl sm:text-6xl font-bold leading-tight tracking-tight text-[#F5F0E7]">
            {headlineLines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h2>
        </ScrollReveal>

        {/* Decorative line: Champagne #B7A078 under title */}
        <ScrollReveal direction="none" delay={250} duration={600}>
          <div className="w-14 h-[2px] bg-[#B7A078] mx-auto rounded-full" />
        </ScrollReveal>

        {/* Body Text: Tajawal, Ivory with 80% opacity */}
        <ScrollReveal direction="up" delay={300} duration={700} threshold={0.12}>
          <p className="text-sm sm:text-base text-[#F5F0E7]/80 font-tajawal font-normal leading-relaxed max-w-2xl mx-auto">
            {storyText}
          </p>
        </ScrollReveal>

        {/* Story Pillars */}
        {pillars.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 w-full text-center">
            {pillars.map((p, idx) => (
              <ScrollReveal key={idx} direction="up" delay={400 + idx * 100} duration={700} threshold={0.1}>
                <div className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#B7A078]/30 transition-colors">
                  <div className="w-8 h-[1px] bg-[#B7A078]/50 mx-auto mb-3" />
                  {p.title && (
                    <div className="text-xs sm:text-sm font-bold text-[#B7A078] font-tajawal tracking-wide">
                      {p.title}
                    </div>
                  )}
                  {p.desc && (
                    <div className="text-xs text-[#F5F0E7]/75 font-tajawal font-normal leading-relaxed">
                      {p.desc}
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";
import { ScrollReveal } from "@/components/ScrollReveal";

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

  const pillars = [
    { title: storeSettings.storyPillar1Title, desc: storeSettings.storyPillar1Desc, show: storeSettings.storyPillar1Show },
    { title: storeSettings.storyPillar2Title, desc: storeSettings.storyPillar2Desc, show: storeSettings.storyPillar2Show },
    { title: storeSettings.storyPillar3Title, desc: storeSettings.storyPillar3Desc, show: storeSettings.storyPillar3Show },
    { title: storeSettings.storyPillar4Title, desc: storeSettings.storyPillar4Desc, show: storeSettings.storyPillar4Show },
  ].filter((p) => p.show !== false && (p.title || p.desc));

  return (
    <section
      id="story"
      className="relative w-full py-24 sm:py-32 bg-[#161412] text-[#f7f4ee] overflow-hidden border-b border-[#2d2926]"
    >
      {/* Background Concentric Ripples */}
      <ConcentricRipples variant="story" strokeColor="#c5a880" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center space-y-6">
        {/* Emblem */}
        <ScrollReveal direction="none" delay={0} duration={800} threshold={0.15}>
          <div className="mb-2">
            <ConcentricRipples variant="emblem" strokeColor="#c5a880" className="w-12 h-12" />
          </div>
        </ScrollReveal>

        {/* Badge */}
        {storeSettings.storyBadge && (
          <ScrollReveal direction="up" delay={80} duration={700} threshold={0.12}>
            <span className="inline-block text-[10px] font-mono tracking-[0.3em] uppercase text-[#c5a880] border border-[#c5a880]/30 px-4 py-1.5 rounded-full">
              {storeSettings.storyBadge}
            </span>
          </ScrollReveal>
        )}

        {/* Headline */}
        <ScrollReveal direction="up" delay={150} duration={800} threshold={0.12}>
          <h2 className="font-amiri text-3xl sm:text-5xl font-bold leading-relaxed tracking-tight text-[#f7f4ee]">
            {headlineLines.map((line, idx) => (
              <span key={idx} className="block">
                {line}
              </span>
            ))}
          </h2>
        </ScrollReveal>

        {/* Decorative line */}
        <ScrollReveal direction="none" delay={250} duration={600}>
          <div className="w-12 h-[1px] bg-[#c5a880]/50 mx-auto" />
        </ScrollReveal>

        {/* Body Text */}
        <ScrollReveal direction="up" delay={300} duration={700} threshold={0.12}>
          <p className="text-sm sm:text-base text-[#b8a998] font-light leading-loose max-w-2xl mx-auto">
            {storyText}
          </p>
        </ScrollReveal>

        {/* Story Pillars */}
        {pillars.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 w-full text-center">
            {pillars.map((p, idx) => (
              <ScrollReveal key={idx} direction="up" delay={400 + idx * 100} duration={700} threshold={0.1}>
                <div className="space-y-2">
                  <div className="w-8 h-[1px] bg-[#c5a880]/40 mx-auto mb-3" />
                  {p.title && (
                    <div className="text-[11px] font-bold text-[#d4b896] tracking-wider uppercase">
                      {p.title}
                    </div>
                  )}
                  {p.desc && (
                    <div className="text-[11px] text-[#8c7865] font-light leading-relaxed">
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

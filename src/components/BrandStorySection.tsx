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

  const image = storeSettings.storyImageUrl?.trim();

  return (
    <>
      <section
        id="story"
        className="relative w-full py-16 sm:py-28 bg-[#292722] text-[#F5F0E7] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          {/* Visual: workshop photo if configured, otherwise the brand emblem on rippled panel */}
          <div className="lg:col-span-5">
          <ScrollReveal direction="up" delay={0} duration={800} threshold={0.1}>
            <div className="relative h-[320px] sm:h-[440px] rounded-3xl overflow-hidden bg-[#1E1C18] border border-white/10">
              {image ? (
                <img src={image} alt={headlineLines.join(" ")} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              ) : (
                <>
                  <ConcentricRipples variant="story" strokeColor="#B7A078" ringCount={9} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <OrmaLogo variant="dark" size="lg" showSlogan={false} />
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>
          </div>

          <div className="lg:col-start-7 lg:col-span-6 flex flex-col gap-5 sm:gap-6 text-right">
            <ScrollReveal direction="up" delay={80} duration={700} threshold={0.1}>
              <div className="flex flex-col gap-5 sm:gap-6">
                <div className="self-start">
                  <OrmaLogo variant="dark" size="md" showSlogan={false} />
                </div>
                {storeSettings.storyBadge && (
                  <span className="font-cormorant italic text-lg tracking-wide text-[#B7A078]">
                    {storeSettings.storyBadge}
                  </span>
                )}
                <h2 className="font-cairo font-light text-4xl sm:text-5xl leading-[1.35] text-[#F5F0E7]">
                  {headlineLines.map((line, idx) => (
                    <span key={idx} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                <p className="text-base sm:text-lg text-[#D8C8B3] font-tajawal leading-[2] max-w-xl">
                  {storyText}
                </p>
                <a
                  href="/page/about"
                  className="btn-shine self-start inline-flex items-center justify-center min-h-[52px] px-9 rounded-full bg-[#F5F0E7] text-[#292722] font-bold text-sm hover:bg-white transition-colors"
                >
                  اقرأ قصتنا
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Trust strip: the four pillars configured in the dashboard */}
      {pillars.length > 0 && (
        <section className="w-full bg-[#F5F0E7] py-14 sm:py-[72px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {pillars.map((p, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 90} duration={700} threshold={0.1}>
                <div className="h-full flex flex-col gap-2 p-6 rounded-[18px] border border-[#292722]/12 bg-[#fbf8f3] hover:-translate-y-1 hover:border-[#8E7545]/50 transition-all duration-300">
                  {p.title && <div className="font-cairo font-semibold text-[17px] text-[#292722]">{p.title}</div>}
                  {p.desc && <div className="text-sm leading-[1.8] text-[#5c5346] font-tajawal">{p.desc}</div>}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

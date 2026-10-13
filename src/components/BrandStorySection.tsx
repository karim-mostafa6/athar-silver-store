"use client";

import React from "react";
import { ShieldCheck, Gem, PackageCheck, RefreshCw } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const BrandStorySection: React.FC = () => {
  const { storeSettings } = useStore();

  if (storeSettings.storySectionShow === false) {
    return null;
  }

  const badge = storeSettings.storyBadge !== undefined ? storeSettings.storyBadge : "ABOUT ATHAR • عن أَثَر";
  const title = storeSettings.storyTitle !== undefined ? storeSettings.storyTitle : "أناقة صُممت لتترك أثراً";
  const subtitle = storeSettings.storySubtitle !== undefined ? storeSettings.storySubtitle : "قطع استثنائية من الفضة النقية تلائم كل تفاصيل يومك ومناسباتك.";

  const rawPillars = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#1c1815]" />,
      title: storeSettings.storyPillar1Title !== undefined ? storeSettings.storyPillar1Title : "فضة 925 معتمدة",
      desc: storeSettings.storyPillar1Desc !== undefined ? storeSettings.storyPillar1Desc : "نقاء إسترليني أصلي مختوم مع بطاقة ضمان رسمية.",
      show: storeSettings.storyPillar1Show !== false,
    },
    {
      icon: <Gem className="w-5 h-5 text-[#1c1815]" />,
      title: storeSettings.storyPillar2Title !== undefined ? storeSettings.storyPillar2Title : "معالجة روديوم إيطالية",
      desc: storeSettings.storyPillar2Desc !== undefined ? storeSettings.storyPillar2Desc : "حماية فائقة من الخدش ولمعان دائم لا يتغير.",
      show: storeSettings.storyPillar2Show !== false,
    },
    {
      icon: <PackageCheck className="w-5 h-5 text-[#1c1815]" />,
      title: storeSettings.storyPillar3Title !== undefined ? storeSettings.storyPillar3Title : "تغليف إهداء فاخر",
      desc: storeSettings.storyPillar3Desc !== undefined ? storeSettings.storyPillar3Desc : "علبة مخملية أنيقة، كيس هدايا، ومنديل عناية مجاني.",
      show: storeSettings.storyPillar3Show !== false,
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#1c1815]" />,
      title: storeSettings.storyPillar4Title !== undefined ? storeSettings.storyPillar4Title : "استبدال واسترجاع سلس",
      desc: storeSettings.storyPillar4Desc !== undefined ? storeSettings.storyPillar4Desc : "استبدال مقاس واسترجاع مضمون وسهل خلال 14 يوماً.",
      show: storeSettings.storyPillar4Show !== false,
    },
  ];

  const visiblePillars = rawPillars.filter((p) => p.show && (p.title.trim() || p.desc.trim()));

  const hasHeader = Boolean(badge.trim() || title.trim() || subtitle.trim());

  if (!hasHeader && visiblePillars.length === 0) {
    return null;
  }

  return (
    <section id="story" className="py-20 border-b border-[#e8ded0] bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Minimal Header - Only rendered if fields exist */}
        {hasHeader && (
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            {badge.trim() && (
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8a7663] uppercase block">
                {badge}
              </span>
            )}
            {title.trim() && (
              <h2 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-alexandria">
                {title}
              </h2>
            )}
            {subtitle.trim() && (
              <p className="text-xs sm:text-sm text-[#705e4d] font-light">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Dynamic Pillars */}
        {visiblePillars.length > 0 && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${visiblePillars.length === 3 ? "lg:grid-cols-3" : visiblePillars.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-6 text-center`}>
            {visiblePillars.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#ece4d8] hover:border-[#c8b7a0] transition-all flex flex-col items-center space-y-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#f6efe4] flex items-center justify-center">
                  {item.icon}
                </div>
                {item.title.trim() && (
                  <h3 className="text-sm font-bold text-[#1c1815] font-alexandria">
                    {item.title}
                  </h3>
                )}
                {item.desc.trim() && (
                  <p className="text-xs text-[#705e4d] font-light leading-relaxed">
                    {item.desc}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

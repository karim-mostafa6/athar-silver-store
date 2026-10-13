"use client";

import React from "react";
import { Droplets, Box, Sparkles, HeartHandshake } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const SilverCareSection: React.FC = () => {
  const { storeSettings } = useStore();

  if (storeSettings.careSectionShow === false) {
    return null;
  }

  const badge = storeSettings.careBadge !== undefined ? storeSettings.careBadge : "CARE GUIDE • العناية";
  const title = storeSettings.careTitle !== undefined ? storeSettings.careTitle : "العناية بالفضة الإسترليني 925";
  const subtitle = storeSettings.careSubtitle !== undefined ? storeSettings.careSubtitle : "خطوات بسيطة وسريعة لتظل قطعتك متألقة مدى الحياة.";

  const rawTips = [
    {
      icon: <Droplets className="w-4 h-4 text-[#1c1815]" />,
      title: storeSettings.careTip1Title !== undefined ? storeSettings.careTip1Title : "العطور والمواد الكيميائية",
      desc: storeSettings.careTip1Desc !== undefined ? storeSettings.careTip1Desc : "ارتدِ قطعتك بعد رش العطر لحماية الفضة من التفاعل.",
      show: storeSettings.careTip1Show !== false,
    },
    {
      icon: <Box className="w-4 h-4 text-[#1c1815]" />,
      title: storeSettings.careTip2Title !== undefined ? storeSettings.careTip2Title : "الحفظ في العلبة",
      desc: storeSettings.careTip2Desc !== undefined ? storeSettings.careTip2Desc : "احفظها في علبة أَثَر المبطنة بمكان جاف عند عدم ارتدائها.",
      show: storeSettings.careTip2Show !== false,
    },
    {
      icon: <Sparkles className="w-4 h-4 text-[#1c1815]" />,
      title: storeSettings.careTip3Title !== undefined ? storeSettings.careTip3Title : "المنديل الخاص المرفق",
      desc: storeSettings.careTip3Desc !== undefined ? storeSettings.careTip3Desc : "مسحة لطيفة بمنديل التلميع المجاني تعيد بريقها فوراً.",
      show: storeSettings.careTip3Show !== false,
    },
    {
      icon: <HeartHandshake className="w-4 h-4 text-[#1c1815]" />,
      title: storeSettings.careTip4Title !== undefined ? storeSettings.careTip4Title : "الارتداء المستمر",
      desc: storeSettings.careTip4Desc !== undefined ? storeSettings.careTip4Desc : "الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها.",
      show: storeSettings.careTip4Show !== false,
    },
  ];

  const visibleTips = rawTips.filter((t) => t.show && (t.title.trim() || t.desc.trim()));
  const hasHeader = Boolean(badge.trim() || title.trim() || subtitle.trim());

  if (!hasHeader && visibleTips.length === 0) {
    return null;
  }

  return (
    <section id="care" className="py-20 border-b border-[#e8ded0] bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {hasHeader && (
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
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

        {visibleTips.length > 0 && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleTips.length === 3 ? "lg:grid-cols-3" : visibleTips.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-4"} gap-5 text-center`}>
            {visibleTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#ece4d8] hover:border-[#c8b7a0] transition-all flex flex-col items-center space-y-2.5"
              >
                <div className="w-9 h-9 rounded-full bg-[#f6efe4] flex items-center justify-center">
                  {tip.icon}
                </div>
                {tip.title.trim() && (
                  <h3 className="text-xs sm:text-sm font-bold text-[#1c1815]">
                    {tip.title}
                  </h3>
                )}
                {tip.desc.trim() && (
                  <p className="text-[11px] sm:text-xs text-[#705e4d] font-light leading-relaxed">
                    {tip.desc}
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

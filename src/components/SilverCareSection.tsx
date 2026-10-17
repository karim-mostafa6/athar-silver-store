"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ConcentricRipples } from "@/components/ConcentricRipples";

export const SilverCareSection: React.FC = () => {
  const { storeSettings } = useStore();

  if (storeSettings.careSectionShow === false) {
    return null;
  }

  const sectionTitle = storeSettings.careTitle || "العناية بقطعتك";

  // The 4 Signature Care Tips from Mockup
  const careCards = [
    {
      title: storeSettings.careTip4Title || "الارتداء المستمر",
      desc:
        storeSettings.careTip4Desc ||
        "الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها.",
      show: storeSettings.careTip4Show !== false,
    },
    {
      title: storeSettings.careTip3Title || "المسح بعد الاستخدام",
      desc:
        storeSettings.careTip3Desc ||
        "امسحها بقطعة قماش ناعمة وجافة بعد كل استخدام.",
      show: storeSettings.careTip3Show !== false,
    },
    {
      title: storeSettings.careTip2Title || "الحفظ في العلبة",
      desc:
        storeSettings.careTip2Desc ||
        "احفظها في علبة ORMA المبطنة بمكان جاف عند عدم ارتدائها.",
      show: storeSettings.careTip2Show !== false,
    },
    {
      title: storeSettings.careTip1Title || "العطور والمواد الكيميائية",
      desc:
        storeSettings.careTip1Desc ||
        "ارتدِ قطعتك بعد رش العطر لحماية الفضة من التفاعل.",
      show: storeSettings.careTip1Show !== false,
    },
  ];

  const visibleCards = careCards.filter((c) => c.show && c.title.trim());

  return (
    <section id="care" className="py-20 sm:py-28 bg-[#D8C8B3] border-b border-[#292722]/12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title in Aref Ruqaa */}
        <div className="text-center mb-14">
          <h2 className="font-cairo text-4xl sm:text-6xl font-bold text-[#292722]">
            {sectionTitle}
          </h2>
          <div className="w-12 h-[2px] bg-[#8E7545] mx-auto mt-4 rounded-full" />
        </div>

        {/* 4 Clean Ivory Cards with Charcoal 12% border */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-[#F5F0E7] rounded-xl p-6 sm:p-7 text-center shadow-xs border border-[#292722]/12 hover:border-[#8E7545] hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-between min-h-[220px]"
            >
              {/* Circular Gold Seal Emblem */}
              <div className="mb-4">
                <ConcentricRipples variant="emblem" strokeColor="#8E7545" className="w-9 h-9" />
              </div>

              {/* Card Title */}
              <h3 className="font-tajawal text-base sm:text-lg font-bold text-[#292722] mb-3 leading-snug">
                {card.title}
              </h3>

              {/* Card Description */}
              <p className="text-xs sm:text-sm text-[#292722]/80 font-tajawal font-normal leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

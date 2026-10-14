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
        "احفظها في علبة أثر المبطنة بمكان جاف عند عدم ارتدائها.",
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
    <section id="care" className="py-20 sm:py-28 bg-[#ddd2c1] border-b border-[#cfc2af]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-14">
          <h2 className="font-amiri text-3xl sm:text-5xl font-bold text-[#161412]">
            {sectionTitle}
          </h2>
        </div>

        {/* 4 Clean White Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-6 sm:p-7 text-center shadow-sm border border-[#e8dfd2] hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between min-h-[220px]"
            >
              {/* Circular Bronze Seal Emblem */}
              <div className="mb-4">
                <ConcentricRipples variant="emblem" strokeColor="#b39369" className="w-9 h-9" />
              </div>

              {/* Card Title */}
              <h3 className="font-amiri text-lg sm:text-xl font-bold text-[#161412] mb-3 leading-snug">
                {card.title}
              </h3>

              {/* Card Description */}
              <p className="text-xs sm:text-sm text-[#756555] font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

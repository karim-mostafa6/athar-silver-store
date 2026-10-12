"use client";

import React from "react";
import { Droplets, Box, Sparkles, HeartHandshake } from "lucide-react";

export const SilverCareSection: React.FC = () => {
  const tips = [
    {
      icon: <Droplets className="w-4 h-4 text-[#1c1815]" />,
      title: "العطور والمواد الكيميائية",
      desc: "ارتدِ قطعتك بعد رش العطر لحماية الفضة من التفاعل.",
    },
    {
      icon: <Box className="w-4 h-4 text-[#1c1815]" />,
      title: "الحفظ في العلبة",
      desc: "احفظها في علبة أَثَر المبطنة بمكان جاف عند عدم ارتدائها.",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-[#1c1815]" />,
      title: "المنديل الخاص المرفق",
      desc: "مسحة لطيفة بمنديل التلميع المجاني تعيد بريقها فوراً.",
    },
    {
      icon: <HeartHandshake className="w-4 h-4 text-[#1c1815]" />,
      title: "الارتداء المستمر",
      desc: "الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها.",
    },
  ];

  return (
    <section id="care" className="py-20 border-b border-[#e8ded0] bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#8a7663] uppercase">
            CARE GUIDE • العناية
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-alexandria">
            العناية بالفضة الإسترليني 925
          </h2>
          <p className="text-xs sm:text-sm text-[#705e4d] font-light">
            خطوات بسيطة وسريعة لتظل قطعتك متألقة مدى الحياة.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-center">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#ece4d8] hover:border-[#c8b7a0] transition-all flex flex-col items-center space-y-2.5"
            >
              <div className="w-9 h-9 rounded-full bg-[#f6efe4] flex items-center justify-center">
                {tip.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#1c1815]">
                {tip.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#705e4d] font-light leading-relaxed">
                {tip.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

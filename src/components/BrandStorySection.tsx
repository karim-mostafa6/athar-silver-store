"use client";

import React from "react";
import { ShieldCheck, Gem, PackageCheck, RefreshCw } from "lucide-react";

export const BrandStorySection: React.FC = () => {
  const pillars = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#1c1815]" />,
      title: "فضة 925 معتمدة",
      desc: "نقاء إسترليني أصلي مختوم مع بطاقة ضمان رسمية.",
    },
    {
      icon: <Gem className="w-5 h-5 text-[#1c1815]" />,
      title: "معالجة روديوم إيطالية",
      desc: "حماية فائقة من الخدش ولمعان دائم لا يتغير.",
    },
    {
      icon: <PackageCheck className="w-5 h-5 text-[#1c1815]" />,
      title: "تغليف إهداء فاخر",
      desc: "علبة مخملية أنيقة، كيس هدايا، ومنديل عناية مجاني.",
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-[#1c1815]" />,
      title: "استبدال واسترجاع سلس",
      desc: "استبدال مقاس واسترجاع مضمون وسهل خلال 14 يوماً.",
    },
  ];

  return (
    <section id="story" className="py-20 border-b border-[#e8ded0] bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Simple Minimal Header */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#8a7663] uppercase">
            ABOUT ATHAR • عن أَثَر
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-alexandria">
            أناقة صُممت لتترك أثراً
          </h2>
          <p className="text-xs sm:text-sm text-[#705e4d] font-light">
            قطع استثنائية من الفضة النقية تلائم كل تفاصيل يومك ومناسباتك.
          </p>
        </div>

        {/* 4 Minimal Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-[#ece4d8] hover:border-[#c8b7a0] transition-all flex flex-col items-center space-y-3"
            >
              <div className="w-10 h-10 rounded-full bg-[#f6efe4] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-sm font-bold text-[#1c1815] font-alexandria">
                {item.title}
              </h3>
              <p className="text-xs text-[#705e4d] font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

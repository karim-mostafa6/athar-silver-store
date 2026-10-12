"use client";

import React from "react";
import { Star, CheckCircle } from "lucide-react";

export const ReviewsSection: React.FC = () => {
  const reviews = [
    {
      name: "مروان الجوهري",
      city: "القاهرة",
      product: "سلسلة كبح كوبية 925",
      text: "الوزن ثقيل والختم واضح جداً. التغليف والبوكس المخملي كان فخم زيادة عن توقعاتي والمعاينة قبل الدفع ممتازة.",
    },
    {
      name: "سارة عبد الرحمن",
      city: "الإسكندرية",
      product: "خاتم سوليتير ملكي 925",
      text: "الخاتم يجنن ولمعة الزركون زي الألماظ بالظبط. التوصيل وصلني في 48 ساعة فقط وتعامل راقٍ جداً.",
    },
    {
      name: "عمر الشافعي",
      city: "المنصورة",
      product: "خاتم عقيق يماني أسود",
      text: "صياغة الخاتم والنقش العثماني شغل محترفين. الحجر طبيعي ولونه أسود عميق. فخور بالبراند.",
    },
    {
      name: "نوران الشريف",
      city: "الشيخ زايد",
      product: "طقم أثر الملكي الكامل",
      text: "طلبته لخطوبة وكان أجمل هدية في الحفلة. كل تفصيلة في الطقم من السلسلة للحلق غاية في الأناقة.",
    },
  ];

  return (
    <section id="reviews" className="py-20 border-b border-[#e8ded0] bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#8a7663] uppercase">
            REVIEWS • آراء العملاء
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-alexandria">
            ثقة أكثر من 200,000 عميل
          </h2>
          <div className="flex items-center justify-center gap-1 text-amber-500 pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-xs font-bold text-[#1c1815] mr-2">5.0 / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-right">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#ece4d8] hover:border-[#c8b7a0] transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#524436] font-light leading-relaxed">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              <div className="pt-2 border-t border-[#f2ede4] flex items-center justify-between text-[11px]">
                <div>
                  <span className="font-bold text-[#1c1815] block">{rev.name}</span>
                  <span className="text-[#8c7865]">{rev.city}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  <span>شراء مؤكد</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

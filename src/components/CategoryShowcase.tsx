"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { getCacheBustedImageUrl } from "@/lib/version";

/**
 * "Shop by category" tiles. Read-only: categories come from store settings and each tile shows the
 * first product photo of that category, so it follows whatever is managed from the dashboard.
 */
export const CategoryShowcase: React.FC = () => {
  const { storeSettings, products } = useStore();

  const tiles = useMemo(() => {
    const list =
      storeSettings?.categories && storeSettings.categories.length > 0
        ? storeSettings.categories
        : [
            { id: "rings", label: "خواتم" },
            { id: "chains", label: "سلاسل" },
            { id: "bracelets", label: "أساور" },
            { id: "earrings", label: "أقراط" },
          ];
    return list
      .map((c) => {
        const inCat = products.filter((p) => p.category === c.id);
        const page = storeSettings?.collectionPages?.[c.id];
        const image =
          (page?.showBanner !== false && page?.bannerImage) || inCat.find((p) => p.images?.[0])?.images?.[0] || "";
        return { id: c.id, label: page?.title || c.label, count: inCat.length, image };
      })
      .filter((t) => t.count > 0)
      .slice(0, 4);
  }, [storeSettings?.categories, storeSettings?.collectionPages, products]);

  if (tiles.length < 2) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-14 sm:pt-20">
      <ScrollReveal direction="up">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <h2 className="font-cairo font-light text-3xl sm:text-5xl text-[#292722]">تسوّق حسب الفئة</h2>
          <Link href="/collection/all" className="link-underline text-sm text-[#292722] pb-1">
            كل القطع
          </Link>
        </div>
      </ScrollReveal>
      <div className={`grid grid-cols-2 ${tiles.length >= 4 ? "lg:grid-cols-4" : tiles.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-3 sm:gap-5`}>
        {tiles.map((t, i) => (
          <ScrollReveal key={t.id} direction="up" delay={i * 90}>
            <Link
              href={`/collection/${t.id}`}
              className="group relative block overflow-hidden rounded-2xl sm:rounded-[20px] h-[240px] sm:h-[340px] lg:h-[420px] bg-gradient-to-br from-[#D8C8B3] to-[#8E7545]"
            >
              {t.image && (
                <img
                  src={getCacheBustedImageUrl(t.image)}
                  alt={t.label}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#292722]/65 via-[#292722]/10 to-transparent" />
              <div className="absolute inset-x-4 sm:inset-x-6 bottom-4 sm:bottom-5 flex items-end justify-between text-[#F5F0E7]">
                <div>
                  <div className="font-cairo text-xl sm:text-2xl font-semibold">{t.label}</div>
                  <div className="text-xs sm:text-sm opacity-80 mt-0.5">{t.count} قطعة</div>
                </div>
                <span className="hidden sm:flex w-10 h-10 rounded-full border border-[#F5F0E7]/60 items-center justify-center transition-all duration-300 group-hover:bg-[#F5F0E7] group-hover:text-[#292722] group-hover:-translate-x-1">
                  <ArrowLeft className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

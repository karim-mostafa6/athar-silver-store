"use client";

import React, { useState, useMemo, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { BrandStorySection } from "@/components/BrandStorySection";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useStore } from "@/context/StoreContext";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { products, storeSettings, addToCart, toggleWishlist, isWishlisted, addToast, setIsSizeGuideOpen } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const showAllProducts = false;
  const [searchQuery, setSearchQuery] = useState("");

  const productsSectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  // dir = -1 moves toward the next items (leftwards in RTL), +1 back
  const scrollCarousel = (dir: 1 | -1) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" });
  };

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesArabic = product.arabicName.toLowerCase().includes(query);
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(query));
        const matchesDesc = product.description.toLowerCase().includes(query);
        if (!matchesArabic && !matchesTags && !matchesDesc) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, products]);

  const displayedProducts = useMemo(() => {
    if (showAllProducts || selectedCategory !== "all" || searchQuery.trim()) {
      return filteredProducts;
    }
    return filteredProducts.slice(0, 20);
  }, [filteredProducts, showAllProducts, selectedCategory, searchQuery]);

  return (
    <>

      <HeroSection
        onExploreClick={scrollToProducts}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onNotify={addToast}
      />

      <CategoryShowcase />

      {/* Products Section (المجموعات والمصوغات) */}
      <section
        ref={productsSectionRef}
        id="products"
        className="py-16 sm:py-24 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16"
      >
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-12 sm:mb-16">
            <div className="eyebrow text-lg sm:text-xl mb-1">
              {storeSettings.productsSectionBadge || "The Collection"}
            </div>
            <h2 className="font-cairo font-light text-4xl sm:text-[44px] text-[#292722]">
              {storeSettings.productsSectionTitle || "المجموعة"}
            </h2>
          </div>
        </ScrollReveal>

        {/* Active Search Notice */}
        {searchQuery && (
          <ScrollReveal direction="up" delay={0} once={false}>
            <div className="mb-6 p-3 rounded-xl bg-[#eee5d8] border border-[#ded1be] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#5c4c3b]">
                <span>نتائج البحث عن:</span>
                <strong className="text-[#161412] font-bold">&ldquo;{searchQuery}&rdquo;</strong>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#7d6b58] hover:text-[#161412] flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                <span>إلغاء البحث</span>
              </button>
            </div>
          </ScrollReveal>
        )}

        {/* Product Grid with staggered scroll reveal */}
        {displayedProducts.length === 0 ? (
          <ScrollReveal direction="up">
            <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-[#ded1be]">
              <h3 className="text-sm font-medium text-[#161412]">لا توجد قطع تطابق هذا الاختيار حالياً</h3>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="px-6 py-2 rounded bg-[#161412] text-[#f7f4ee] font-medium text-xs"
              >
                عرض كافة القطع
              </button>
            </div>
          </ScrollReveal>
        ) : (
          <div className="relative">
            {/* Horizontal swipe row: swipe with a finger on phones, arrows / trackpad on desktop */}
            <div
              ref={carouselRef}
              className="flex gap-3 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-4 px-4 scroll-px-4 sm:-mx-8 sm:px-8 sm:scroll-px-8 lg:mx-0 lg:px-0 lg:scroll-px-0 pb-2 overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start shrink-0 w-[42%] sm:w-[31%] lg:w-[calc(25%-15px)]"
                >
                  <ProductCard
                    product={product}
                    isWishlisted={isWishlisted(product.id)}
                    onToggleWishlist={toggleWishlist}
                    onAddToCart={addToCart}
                    onNotify={addToast}
                  />
                </div>
              ))}
            </div>
            {displayedProducts.length > 2 && (
              <>
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={() => scrollCarousel(1)}
                  className="hidden lg:flex absolute top-[40%] -right-5 z-10 w-10 h-10 items-center justify-center rounded-full bg-[#F5F0E7] border border-[#292722]/20 shadow-md hover:bg-[#292722] hover:text-[#F5F0E7] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  aria-label="التالي"
                  onClick={() => scrollCarousel(-1)}
                  className="hidden lg:flex absolute top-[40%] -left-5 z-10 w-10 h-10 items-center justify-center rounded-full bg-[#F5F0E7] border border-[#292722]/20 shadow-md hover:bg-[#292722] hover:text-[#F5F0E7] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}

        <ScrollReveal direction="up" delay={100}>
          <div className="text-center mt-12 sm:mt-14">
            <Link
              href="/collection/all"
              className="inline-flex items-center justify-center min-h-[54px] px-11 rounded-full border border-[#292722] text-[#292722] hover:bg-[#292722] hover:text-[#F5F0E7] transition-all duration-300 text-sm font-tajawal font-medium active:scale-95"
            >
              عرض كل المنتجات
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* Brand Story */}
      <ScrollReveal direction="up" threshold={0.08}>
        <BrandStorySection />
      </ScrollReveal>

    </>
  );
}

"use client";

import React, { useState, useMemo, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { BrandStorySection } from "@/components/BrandStorySection";
import { SilverCareSection } from "@/components/SilverCareSection";
import { useStore } from "@/context/StoreContext";
import { X } from "lucide-react";

export default function Home() {
  const { products, storeSettings, addToCart, toggleWishlist, isWishlisted, addToast, setIsSizeGuideOpen } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAllProducts, setShowAllProducts] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");

  const productsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const categories = useMemo(() => {
    const list =
      storeSettings?.categories && storeSettings.categories.length > 0
        ? storeSettings.categories
        : [
            { id: "rings", label: "خواتم" },
            { id: "chains", label: "سلاسل" },
            { id: "bracelets", label: "أساور" },
            { id: "sets", label: "أطقم" },
          ];
    return [
      { id: "all", label: "الكل" },
      ...list.map((c) => ({
        id: c.id,
        label: storeSettings?.collectionPages?.[c.id]?.title || c.label,
      })),
    ];
  }, [storeSettings?.categories, storeSettings?.collectionPages]);

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

  // In Mockup: default displays 4 featured products in a 4-col row, expandable via "عرض كل القطع"
  const displayedProducts = useMemo(() => {
    if (showAllProducts || selectedCategory !== "all" || searchQuery.trim()) {
      return filteredProducts;
    }
    return filteredProducts.slice(0, 4);
  }, [filteredProducts, showAllProducts, selectedCategory, searchQuery]);

  return (
    <>
      {/* Hero Section matching 50/50 visual mockup */}
      <HeroSection
        onExploreClick={scrollToProducts}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onNotify={addToast}
      />

      {/* Featured Collection Section ("المجموعة") matching mockup */}
      <section
        ref={productsSectionRef}
        id="products"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#f7f4ee]"
      >
        {/* Calligraphic Header: "المجموعة" with subtle divider line */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-amiri text-3xl sm:text-5xl font-bold text-[#161412]">
            المجموعة
          </h2>
          <div className="w-10 h-[1.5px] bg-[#161412]/30 mx-auto mt-3 rounded-full" />
        </div>

        {/* Minimal Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 pb-3 mb-10 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-[#161412] text-[#f7f4ee] font-medium"
                  : "bg-white/70 text-[#615243] border border-[#e2d5c2] hover:bg-[#ede3d3] hover:text-[#161412] font-light"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Search Notice if any */}
        {searchQuery && (
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
        )}

        {/* 4-Column Product Grid matching mockup */}
        {displayedProducts.length === 0 ? (
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
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={isWishlisted(product.id)}
                onToggleWishlist={toggleWishlist}
                onAddToCart={addToCart}
                onNotify={addToast}
              />
            ))}
          </div>
        )}

        {/* "عرض كل القطع" Outline Button from Mockup */}
        {filteredProducts.length > 4 && selectedCategory === "all" && !searchQuery && (
          <div className="text-center mt-12 sm:mt-16">
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="px-10 sm:px-14 py-3 rounded border border-[#161412] text-[#161412] hover:bg-[#161412] hover:text-[#f7f4ee] transition-all duration-300 text-xs sm:text-sm font-medium active:scale-95 shadow-sm"
            >
              {showAllProducts ? "عرض أقل" : "عرض كل القطع"}
            </button>
          </div>
        )}
      </section>

      {/* Brand Story Section matching mockup ("عن أثر") */}
      <BrandStorySection />

      {/* Silver Care Guide matching mockup ("العناية بقطعتك") */}
      <SilverCareSection />
    </>
  );
}

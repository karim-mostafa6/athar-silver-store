"use client";

import React, { useState, useMemo, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { GenderSplitShowcase } from "@/components/GenderSplitShowcase";
import { ProductCard } from "@/components/ProductCard";
import { BrandStorySection } from "@/components/BrandStorySection";
import { SilverCareSection } from "@/components/SilverCareSection";
import { useStore } from "@/context/StoreContext";
import { X } from "lucide-react";

export default function Home() {
  const { products, storeSettings, addToCart, toggleWishlist, isWishlisted, addToast, setIsSizeGuideOpen } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "newest">("popular");
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
            { id: "rings", label: "خواتم وسوليتير" },
            { id: "chains", label: "سلاسل إيطالي" },
            { id: "bracelets", label: "أساور وتنس" },
            { id: "sets", label: "أطقم ملكية" },
            { id: "earrings", label: "أقراط وحلقان" },
          ];
    return [{ id: "all", label: "كافة القطع" }, ...list];
  }, [storeSettings?.categories]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (selectedGender !== "all" && product.gender !== selectedGender && product.gender !== "unisex") {
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
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, selectedGender, sortBy, products]);

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        onExploreClick={scrollToProducts}
        onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
        onNotify={addToast}
      />

      {/* Gender Split Showcase (Women's / Men's 50-50 Dual Editorial Banner) */}
      <GenderSplitShowcase />

      {/* Product Catalog Section */}
      <section
        ref={productsSectionRef}
        id="products"
        className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#e8ded0]"
      >
        {/* Centered Luxury Section Header */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#8a7663] uppercase">
            ATHAR SIGNATURE • روائع الفضة
          </span>
          <h2 className="text-2xl sm:text-4xl font-light text-[#1c1815] font-alexandria tracking-tight">
            تشكيلة أَثَـر الخالدة
          </h2>
          <p className="text-xs sm:text-sm text-[#705e4d] font-light">
            صيغت بعناية من الفضة الإسترليني عيار 925 لتترك أثراً استثنائياً في كل حضور
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 pb-3 mb-10 overflow-x-auto scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap active:scale-95 ${
                selectedCategory === cat.id
                  ? "bg-[#1c1815] text-[#faf8f5] font-bold shadow-md"
                  : "bg-white/80 text-[#5c4d3f] border border-[#e2d5c2] hover:bg-[#ede3d3] hover:text-[#1c1815] font-medium"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Clean Gender & Sort Controls */}
        <div className="flex items-center justify-between gap-4 mb-8 text-xs">
          <div className="flex items-center gap-1 bg-[#f4ece0] p-1 rounded-full border border-[#e4d8c7]">
            <button
              onClick={() => setSelectedGender("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedGender === "all" ? "bg-[#1c1815] text-[#faf8f5]" : "text-[#6d5b4a] hover:text-[#1c1815]"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedGender("women")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedGender === "women" ? "bg-[#1c1815] text-[#faf8f5]" : "text-[#6d5b4a] hover:text-[#1c1815]"
              }`}
            >
              نسائي
            </button>
            <button
              onClick={() => setSelectedGender("men")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedGender === "men" ? "bg-[#1c1815] text-[#faf8f5]" : "text-[#6d5b4a] hover:text-[#1c1815]"
              }`}
            >
              رجالي
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#705e4d]">ترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "popular" | "price-asc" | "price-desc" | "newest")}
              className="bg-transparent text-[#1c1815] font-bold text-xs focus:outline-none cursor-pointer border-b border-[#d8c8b4] pb-0.5"
            >
              <option value="popular">الأكثر طلباً</option>
              <option value="newest">الأحدث وصولاً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>
        </div>

        {/* Active Search Notice if any */}
        {searchQuery && (
          <div className="mb-6 p-3 rounded-2xl bg-[#f5efe4] border border-[#ded1be] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#5c4c3b]">
              <span>نتائج البحث عن:</span>
              <strong className="text-[#1c1815] font-bold">&ldquo;{searchQuery}&rdquo;</strong>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[#7d6b58] hover:text-[#1c1815] flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>إلغاء البحث</span>
            </button>
          </div>
        )}

        {/* Products Grid - 5 Columns */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-white rounded-3xl border border-[#ded1be]">
            <h3 className="text-base font-bold text-[#1c1815]">لا توجد قطع تطابق هذا الاختيار حالياً</h3>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedGender("all");
              }}
              className="px-6 py-2.5 rounded-full bg-[#1c1815] text-[#faf8f5] font-bold text-xs"
            >
              عرض كافة القطع
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
            {filteredProducts.map((product) => (
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
      </section>

      {/* Brand Story Section */}
      <BrandStorySection />

      {/* Silver Care Guide */}
      <SilverCareSection />
    </>
  );
}

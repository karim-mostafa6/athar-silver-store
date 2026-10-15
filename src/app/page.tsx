"use client";

import React, { useState, useMemo, useRef } from "react";
import { HeroSlider, HeroSlide } from "@/components/HeroSlider";
import { HeroSection } from "@/components/HeroSection";
import { ProductCard } from "@/components/ProductCard";
import { BrandStorySection } from "@/components/BrandStorySection";
import { SilverCareSection } from "@/components/SilverCareSection";
import { CustomPromoBanner } from "@/components/CustomPromoBanner";
import { GenderSplitShowcase } from "@/components/GenderSplitShowcase";
import { ScrollReveal } from "@/components/ScrollReveal";
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
            { id: "earrings", label: "أقراط" },
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

  const displayedProducts = useMemo(() => {
    if (showAllProducts || selectedCategory !== "all" || searchQuery.trim()) {
      return filteredProducts;
    }
    return filteredProducts.slice(0, 8);
  }, [filteredProducts, showAllProducts, selectedCategory, searchQuery]);

  // Build hero slides from settings (only if explicit slider slides are configured)
  const heroSlides: HeroSlide[] = useMemo(() => {
    const settingsSlides = storeSettings?.heroSlides?.filter((s) => s.enabled);
    if (settingsSlides && settingsSlides.length > 0) {
      return settingsSlides.map((s) => ({
        id: s.id,
        imageUrl: s.imageUrl,
        badge: s.badge,
        title: s.title,
        titleLine2: s.titleLine2,
        subtitle: s.subtitle,
        primaryButtonText: s.primaryButtonText,
        primaryButtonLink: s.primaryButtonLink,
        secondaryButtonText: s.secondaryButtonText,
        secondaryButtonLink: s.secondaryButtonLink,
        overlayDarkness: s.overlayDarkness || "medium",
        contentAlign: s.contentAlign || "right",
      }));
    }
    return [];
  }, [storeSettings]);

  const hasSlider = heroSlides.length > 0;

  return (
    <>
      {/* Position 1: Top of page (below navbar) */}
      <CustomPromoBanner settings={storeSettings} position="top" />

      {/* Hero: Either multi-slide carousel OR classic split hero matching mockup */}
      {hasSlider ? (
        <HeroSlider
          slides={heroSlides}
          autoPlayInterval={5000}
          onExploreClick={scrollToProducts}
        />
      ) : (
        <HeroSection
          onExploreClick={scrollToProducts}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          onNotify={addToast}
        />
      )}

      {/* Position 2: After Hero */}
      <CustomPromoBanner settings={storeSettings} position="after_hero" />

      {/* Gender Split Showcase */}
      <ScrollReveal direction="up" threshold={0.08}>
        <GenderSplitShowcase />
      </ScrollReveal>

      {/* Products Section */}
      <section
        ref={productsSectionRef}
        id="products"
        className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-12 sm:mb-16">
            {storeSettings.productsSectionBadge && (
              <span className="inline-block text-[10px] font-mono tracking-[0.3em] uppercase text-[#8E7545] mb-3 border border-[#292722]/12 px-4 py-1.5 rounded-full bg-[#F5F0E7]">
                {storeSettings.productsSectionBadge}
              </span>
            )}
            <h2 className="font-aref text-4xl sm:text-6xl font-bold text-[#292722]">
              {storeSettings.productsSectionTitle || "المجموعة"}
            </h2>
            {storeSettings.productsSectionSubtitle && (
              <p className="text-sm sm:text-base text-[#292722]/75 mt-3 font-amiri font-light max-w-md mx-auto leading-relaxed">
                {storeSettings.productsSectionSubtitle}
              </p>
            )}
            <div className="w-12 h-[2px] bg-[#8E7545] mx-auto mt-4 rounded-full" />
          </div>
        </ScrollReveal>

        {/* Category Filter Pills */}
        <ScrollReveal direction="up" delay={80}>
          <div className="flex items-center justify-center gap-2 sm:gap-3 pb-3 mb-10 overflow-x-auto scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap active:scale-95 font-amiri ${
                  selectedCategory === cat.id
                    ? "bg-[#292722] text-[#F5F0E7] font-medium"
                    : "bg-[#D8C8B3]/50 text-[#292722] border border-[#292722]/12 hover:bg-[#D8C8B3] hover:text-[#292722] font-light"
                }`}
              >
                {cat.label}
              </button>
            ))}
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {displayedProducts.map((product, idx) => (
              <ScrollReveal
                key={product.id}
                direction="up"
                delay={Math.min(idx % 4, 3) * 80}
                threshold={0.06}
              >
                <ProductCard
                  product={product}
                  isWishlisted={isWishlisted(product.id)}
                  onToggleWishlist={toggleWishlist}
                  onAddToCart={addToCart}
                  onNotify={addToast}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        {/* Show All / Show Less Button */}
        {filteredProducts.length > 8 && selectedCategory === "all" && !searchQuery && (
          <ScrollReveal direction="up" delay={100}>
            <div className="text-center mt-12 sm:mt-16">
              <button
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="px-10 sm:px-14 py-3 rounded-sm border border-[#292722] text-[#292722] hover:bg-[#292722] hover:text-[#F5F0E7] transition-all duration-300 text-xs sm:text-sm font-amiri font-medium active:scale-95 shadow-xs"
              >
                {showAllProducts ? "عرض أقل" : "عرض كل القطع"}
              </button>
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Position 3: Between Products and Story */}
      <CustomPromoBanner settings={storeSettings} position="between_products" />

      {/* Brand Story */}
      <ScrollReveal direction="up" threshold={0.08}>
        <BrandStorySection />
      </ScrollReveal>

      {/* Position 4: Before Care Guide */}
      <CustomPromoBanner settings={storeSettings} position="before_care" />

      {/* Silver Care Guide */}
      <ScrollReveal direction="up" threshold={0.08}>
        <SilverCareSection />
      </ScrollReveal>

      {/* Position 5: Before Footer */}
      <CustomPromoBanner settings={storeSettings} position="before_footer" />
    </>
  );
}

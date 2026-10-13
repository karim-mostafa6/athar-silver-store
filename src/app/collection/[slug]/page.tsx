"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import { ArrowUpDown } from "lucide-react";

import { DEFAULT_CATEGORIES } from "@/data/products";

export default function CollectionPage() {
  const { products: allStoreProducts, storeSettings } = useStore();
  const params = useParams();
  const slug = (params?.slug as string) || "all";

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "newest">("popular");

  // Collection metadata
  const collectionInfo = useMemo(() => {
    let base = {
      title: "كافة روائع أَثَـر",
      englishTitle: "THE COMPLETE COLLECTION",
      subtitle: "تشكيلة الفضة الإسترليني عيار 925 الإيطالية والتركية الكاملة",
      bannerImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1600&q=85",
      showBanner: true,
      filterGender: undefined as string | undefined,
      filterCategory: undefined as string | undefined,
    };

    switch (slug) {
      case "women":
        base = {
          title: "التشكيلة النسائية",
          englishTitle: "WOMEN'S COLLECTION",
          subtitle: "مجوهرات رقيقة صُممت لتبرز أنوثتك وتترك أثراً استثنائياً في كل إطلالة",
          bannerImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: "women",
          filterCategory: undefined,
        };
        break;
      case "men":
        base = {
          title: "التشكيلة الرجالية",
          englishTitle: "MEN'S COLLECTION",
          subtitle: "صياغة ثقيلة وتصاميم عصرية تعكس الهيبة والأصالة بالفضة الإسترليني 925",
          bannerImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: "men",
          filterCategory: undefined,
        };
        break;
      case "rings":
        base = {
          title: "خواتم وسوليتير",
          englishTitle: "RINGS & SOLITAIRES",
          subtitle: "خواتم سوليتير مرصعة بالزركون السويسري وعقيق يماني طبيعي عيار 925",
          bannerImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: undefined,
          filterCategory: "rings",
        };
        break;
      case "chains":
        base = {
          title: "سلاسل إيطالي ودلايات",
          englishTitle: "ITALIAN CHAINS",
          subtitle: "سلاسل كبح وحبل مجدولة بتشطيب إيطالي بلاتيني مقاوم لتغير اللون",
          bannerImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: undefined,
          filterCategory: "chains",
        };
        break;
      case "bracelets":
        base = {
          title: "أساور وتنس",
          englishTitle: "BRACELETS & TENNIS",
          subtitle: "أساور تنس متلألئة وبناجر فضة وجلد طبيعي لإطلالة معصم ساحرة",
          bannerImage: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: undefined,
          filterCategory: "bracelets",
        };
        break;
      case "sets":
        base = {
          title: "أطقم ملكية وهدايا",
          englishTitle: "ROYAL GIFT SETS",
          subtitle: "أطقم متكاملة فاخرة للمناسبات الكبرى وشبكة الفضة مع تغليف ملكي",
          bannerImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: undefined,
          filterCategory: "sets",
        };
        break;
      case "earrings":
        base = {
          title: "أقراط وحلقان",
          englishTitle: "EARRINGS",
          subtitle: "أقراط فضة إسترليني 925 متدلية ونواعم بتصاميم ساحرة",
          bannerImage: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1600&q=85",
          showBanner: true,
          filterGender: undefined,
          filterCategory: "earrings",
        };
        break;
      default: {
        const catList = storeSettings?.categories && storeSettings.categories.length > 0 ? storeSettings.categories : DEFAULT_CATEGORIES;
        const matched = catList.find((c) => c.id === slug || c.slug === slug);
        if (matched) {
          base = {
            title: matched.label,
            englishTitle: (matched.slug || matched.id).toUpperCase(),
            subtitle: matched.description || `تشكيلة ${matched.label} الفاخرة من الفضة الإسترليني عيار 925`,
            bannerImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1600&q=85",
            showBanner: true,
            filterGender: undefined,
            filterCategory: matched.id,
          };
        }
        break;
      }
    }

    // Merge with custom overrides from storeSettings.collectionPages
    const custom = storeSettings?.collectionPages?.[slug];
    if (custom) {
      return {
        ...base,
        title: custom.title !== undefined ? custom.title : base.title,
        englishTitle: custom.englishTitle !== undefined ? custom.englishTitle : base.englishTitle,
        subtitle: custom.subtitle !== undefined ? custom.subtitle : base.subtitle,
        bannerImage: custom.bannerImage ? custom.bannerImage : base.bannerImage,
        showBanner: custom.showBanner !== undefined ? custom.showBanner : base.showBanner,
      };
    }
    return base;
  }, [slug, storeSettings?.categories, storeSettings?.collectionPages]);

  // Subcategories
  const subCategories = useMemo(() => {
    const list =
      storeSettings?.categories && storeSettings.categories.length > 0
        ? storeSettings.categories
        : DEFAULT_CATEGORIES;
    return [
      { id: "all", label: "الكل" },
      ...list.map((c) => ({
        id: c.id,
        label: storeSettings?.collectionPages?.[c.id]?.title || c.label,
      })),
    ];
  }, [storeSettings?.categories, storeSettings?.collectionPages]);

  // Filtering products
  const products = useMemo(() => {
    return allStoreProducts.filter((p) => {
      // By gender
      if (collectionInfo.filterGender) {
        if (p.gender !== collectionInfo.filterGender && p.gender !== "unisex") {
          return false;
        }
      }
      // By category
      if (collectionInfo.filterCategory) {
        if (p.category !== collectionInfo.filterCategory) {
          return false;
        }
      }
      // Sub-category filter
      if (selectedSubCategory !== "all" && p.category !== selectedSubCategory) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [collectionInfo, selectedSubCategory, sortBy, allStoreProducts]);

  return (
    <div>
      {/* Editorial Collection Banner or Clean Header */}
      {collectionInfo.showBanner !== false && collectionInfo.bannerImage ? (
        <div className="relative w-full h-[280px] sm:h-[380px] overflow-hidden bg-[#1c1815] select-none">
          <img
            src={collectionInfo.bannerImage}
            alt={collectionInfo.title || "تشكيلة أَثَر"}
            className="w-full h-full object-cover object-center brightness-[0.7] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

          <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 sm:pb-12 text-right">
            {collectionInfo.englishTitle && (
              <div className="text-[11px] font-sans tracking-[0.25em] text-white/80 uppercase mb-2 font-light">
                {collectionInfo.englishTitle}
              </div>
            )}
            {collectionInfo.title && (
              <h1 className="text-3xl sm:text-5xl font-light text-[#faf8f5] font-cairo tracking-tight">
                {collectionInfo.title}
              </h1>
            )}
            {collectionInfo.subtitle && (
              <p className="text-xs sm:text-sm text-white/85 font-light mt-2 max-w-xl">
                {collectionInfo.subtitle}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Minimal Banner if Banner Image Hidden or Disabled */
        (collectionInfo.title || collectionInfo.englishTitle || collectionInfo.subtitle) && (
          <div className="bg-[#f5efe6] border-b border-[#e2d5c2] py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
              {collectionInfo.englishTitle && (
                <div className="text-[11px] font-sans tracking-[0.25em] text-[#8c7865] uppercase mb-1 font-light">
                  {collectionInfo.englishTitle}
                </div>
              )}
              {collectionInfo.title && (
                <h1 className="text-2xl sm:text-4xl font-light text-[#1c1815] font-cairo tracking-tight">
                  {collectionInfo.title}
                </h1>
              )}
              {collectionInfo.subtitle && (
                <p className="text-xs sm:text-sm text-[#705e4d] font-light mt-2 max-w-xl">
                  {collectionInfo.subtitle}
                </p>
              )}
            </div>
          </div>
        )
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in-up">
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs text-[#705e4d] mb-8 font-light">
          <Link href="/" className="hover:text-[#1c1815] transition-colors">
            الرئيسية
          </Link>
          <span className="text-[#c4b5a5]">/</span>
          <span className="text-[#1c1815] font-normal">{collectionInfo.title}</span>
        </nav>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8ded0] mb-10">
          {/* Subcategory Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCategory(sub.id)}
                className={`px-4 py-2 rounded-full transition-all duration-200 active:scale-95 whitespace-nowrap hover-lift ${
                  selectedSubCategory === sub.id
                    ? "bg-[#1c1815] text-[#faf8f5] font-medium shadow-sm"
                    : "bg-white text-[#5c4d3f] border border-[#e2d5c2] hover:bg-[#ede3d3] font-light"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown & Product Count */}
          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
            <span className="text-[#705e4d] font-light">
              عرض <strong className="text-[#1c1815] font-medium font-sans">{products.length}</strong> قطعة
            </span>

            <div className="flex items-center gap-1.5 bg-white border border-[#ded2c0] px-3 py-1.5 rounded-full shadow-sm hover-lift">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7d6852]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "popular" | "price-asc" | "price-desc" | "newest")}
                className="bg-transparent text-[#1c1815] font-medium focus:outline-none cursor-pointer"
              >
                <option value="popular">الأكثر طلباً</option>
                <option value="newest">الأحدث وصولاً</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5-Column Product Grid */}
        {products.length === 0 ? (
          <div className="py-24 text-center space-y-4 bg-white rounded-3xl border border-[#ded1be]">
            <h3 className="text-base font-bold text-[#1c1815]">لا توجد قطع تطابق هذا الفلتر حالياً</h3>
            <button
              onClick={() => setSelectedSubCategory("all")}
              className="px-6 py-2.5 rounded-full bg-[#1c1815] text-[#faf8f5] font-bold text-xs"
            >
              عرض كافة قطع التشكيلة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

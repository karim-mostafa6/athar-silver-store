"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import { ArrowUpDown } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/data/products";

function CollectionPageContent() {
  const { products: allStoreProducts, storeSettings } = useStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "all";
  const genderQuery = searchParams.get("gender"); // "men" | "women" | null

  const isGenderPage = slug === "men" || slug === "women";
  const isAllPage = slug === "all";
  const isCategoryPage = !isGenderPage && !isAllPage;

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(() => {
    if (genderQuery === "men" || genderQuery === "women") return genderQuery;
    return "all";
  });
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "newest">("popular");

  // Keep selectedSubCategory synced with ?gender= URL query param
  useEffect(() => {
    if (genderQuery === "men" || genderQuery === "women") {
      setSelectedSubCategory(genderQuery);
    } else if (!genderQuery && isCategoryPage) {
      setSelectedSubCategory("all");
    }
  }, [genderQuery, isCategoryPage]);

  // Collection metadata
  const collectionInfo = useMemo(() => {
    let base = {
      title: "كافة روائع أورما",
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
          subtitle: "مجوهرات رقيقة صُممت لتبرز أنوثتك وتبقى بصمة استثنائية في كل إطلالة",
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
            englishTitle: matched.englishTitle || (matched.slug || matched.id).toUpperCase(),
            subtitle: matched.description || `تشكيلة ${matched.label} الفاخرة من الفضة الإسترليني عيار 925`,
            bannerImage: matched.bannerImage || "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1600&q=85",
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
      base = {
        ...base,
        title: custom.title !== undefined ? custom.title : base.title,
        englishTitle: custom.englishTitle !== undefined ? custom.englishTitle : base.englishTitle,
        subtitle: custom.subtitle !== undefined ? custom.subtitle : base.subtitle,
        bannerImage: custom.bannerImage ? custom.bannerImage : base.bannerImage,
        showBanner: custom.showBanner !== undefined ? custom.showBanner : base.showBanner,
      };
    }

    // Dynamic Title Adjustment if filtering by gender on category page
    if (isCategoryPage && (selectedSubCategory === "men" || selectedSubCategory === "women")) {
      const genderLabel = selectedSubCategory === "men" ? "رجالي" : "حريمي";
      const englishGender = selectedSubCategory === "men" ? "MEN'S" : "WOMEN'S";
      return {
        ...base,
        title: `${base.title} (${genderLabel})`,
        englishTitle: `${englishGender} ${base.englishTitle}`,
      };
    }

    return base;
  }, [slug, isCategoryPage, selectedSubCategory, storeSettings?.categories, storeSettings?.collectionPages]);

  // Subcategories
  const subCategories = useMemo(() => {
    // 1. If on Category Page: Show Gender Options
    if (isCategoryPage) {
      if (slug === "rings") {
        return [
          { id: "all", label: "كافة الخواتم" },
          { id: "men", label: "خواتم رجالي" },
          { id: "women", label: "خواتم حريمي وسوليتير" },
        ];
      }
      if (slug === "chains") {
        return [
          { id: "all", label: "كافة السلاسل" },
          { id: "men", label: "سلاسل رجالي" },
          { id: "women", label: "سلاسل حريمي" },
        ];
      }
      if (slug === "bracelets") {
        return [
          { id: "all", label: "كافة الأساور" },
          { id: "men", label: "أساور رجالي" },
          { id: "women", label: "أساور وتنس حريمي" },
        ];
      }
      if (slug === "sets") {
        return [
          { id: "all", label: "كافة الأطقم" },
          { id: "men", label: "أطقم رجالية" },
          { id: "women", label: "أطقم نسائية" },
        ];
      }
      if (slug === "earrings") {
        return [
          { id: "all", label: "كافة الأقراط" },
          { id: "women", label: "أقراط حريمي" },
        ];
      }
      return [
        { id: "all", label: "الكل" },
        { id: "men", label: "رجالي" },
        { id: "women", label: "حريمي" },
      ];
    }

    // 2. If on Men's Collection: Show Men's Categories
    if (slug === "men") {
      return [
        { id: "all", label: "كافة التشكيلة الرجالية" },
        { id: "rings", label: "خواتم رجالي" },
        { id: "chains", label: "سلاسل رجالي" },
        { id: "bracelets", label: "أساور رجالي" },
        { id: "sets", label: "أطقم وهدايا" },
      ];
    }

    // 3. If on Women's Collection: Show Women's Categories
    if (slug === "women") {
      return [
        { id: "all", label: "كافة التشكيلة النسائية" },
        { id: "rings", label: "خواتم وسوليتير" },
        { id: "chains", label: "سلاسل ودلايات" },
        { id: "bracelets", label: "أساور وتنس" },
        { id: "earrings", label: "أقراط وحلقان" },
        { id: "sets", label: "أطقم ملكية" },
      ];
    }

    // 4. Default / All
    const list =
      storeSettings?.categories && storeSettings.categories.length > 0
        ? storeSettings.categories
        : DEFAULT_CATEGORIES;
    return [
      { id: "all", label: "كافة القطع" },
      { id: "men", label: "تشكيلة رجالية" },
      { id: "women", label: "تشكيلة نسائية" },
      ...list.map((c) => ({
        id: c.id,
        label: storeSettings?.collectionPages?.[c.id]?.title || c.label,
      })),
    ];
  }, [slug, isCategoryPage, storeSettings?.categories, storeSettings?.collectionPages]);

  // Filtering products
  const products = useMemo(() => {
    return allStoreProducts.filter((p) => {
      // 1. Strict Category isolation when on a Category Page:
      if (isCategoryPage && collectionInfo.filterCategory) {
        const matchCat = p.category === collectionInfo.filterCategory;
        const matchCol = Array.isArray(p.collections) && p.collections.includes(collectionInfo.filterCategory);
        if (!matchCat && !matchCol) {
          return false;
        }

        // Gender filter inside this category
        if (selectedSubCategory === "men") {
          return p.gender === "men" || p.gender === "unisex";
        }
        if (selectedSubCategory === "women") {
          return p.gender === "women" || p.gender === "unisex";
        }
        return true;
      }

      // 2. Strict Gender isolation when on a Gender Page:
      if (isGenderPage && collectionInfo.filterGender) {
        const matchGender = p.gender === collectionInfo.filterGender || p.gender === "unisex";
        const inCollections = Array.isArray(p.collections) && p.collections.includes(collectionInfo.filterGender);
        if (!matchGender && !inCollections) {
          return false;
        }

        // Subcategory category filter
        if (selectedSubCategory !== "all") {
          const inCat = p.category === selectedSubCategory;
          const inCol = Array.isArray(p.collections) && p.collections.includes(selectedSubCategory);
          if (!inCat && !inCol) {
            return false;
          }
        }
        return true;
      }

      // 3. For 'all' collection page:
      if (selectedSubCategory !== "all") {
        if (selectedSubCategory === "men") {
          return p.gender === "men" || p.gender === "unisex";
        }
        if (selectedSubCategory === "women") {
          return p.gender === "women" || p.gender === "unisex";
        }
        const inCat = p.category === selectedSubCategory;
        const inCol = Array.isArray(p.collections) && p.collections.includes(selectedSubCategory);
        if (!inCat && !inCol) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });
  }, [allStoreProducts, isCategoryPage, isGenderPage, collectionInfo.filterCategory, collectionInfo.filterGender, selectedSubCategory, sortBy]);

  return (
    <div>
      {/* Collection title band (image shown as an arch when a banner is enabled in the dashboard) */}
      <div className="bg-[#F5F0E7] border-b border-[#292722]/12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 text-right">
            {collectionInfo.englishTitle && (
              <div className="eyebrow text-base sm:text-lg mb-2 normal-case">{collectionInfo.englishTitle}</div>
            )}
            {collectionInfo.title && (
              <h1 className="font-cairo font-light text-4xl sm:text-6xl leading-[1.2] text-[#292722]">
                {collectionInfo.title}
              </h1>
            )}
            {collectionInfo.subtitle && (
              <p className="text-sm sm:text-lg text-[#5c5346] mt-4 max-w-xl leading-[1.9]">{collectionInfo.subtitle}</p>
            )}
          </div>
          {collectionInfo.showBanner !== false && collectionInfo.bannerImage && (
            <div className="hidden md:block md:col-span-4">
              <div className="relative h-[220px] overflow-hidden bg-[#D8C8B3] ml-auto max-w-[320px]" style={{ borderRadius: "999px 999px 20px 20px / 160px 160px 20px 20px" }}>
                <img
                  src={collectionInfo.bannerImage}
                  alt={collectionInfo.title || "تشكيلة أورما"}
                  className="img-fade-in absolute inset-0 w-full h-full object-cover object-center"
                  decoding="async"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 animate-fade-in-up">
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs text-[#705e4d] mb-8 font-light">
          <Link href="/" className="py-3 -my-3 hover:text-[#1c1815] transition-colors">
            الرئيسية
          </Link>
          <span className="text-[#c4b5a5]">/</span>
          <span className="text-[#1c1815] font-normal">{collectionInfo.title}</span>
        </nav>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8ded0] mb-10">
          {/* Subcategory / Gender Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCategory(sub.id)}
                className={`min-h-[44px] px-5 rounded-full transition-all duration-200 active:scale-95 whitespace-nowrap ${
                  selectedSubCategory === sub.id
                    ? "bg-[#292722] text-[#F5F0E7] font-bold shadow-sm"
                    : "bg-transparent text-[#292722] border border-[#292722]/25 hover:border-[#292722] font-medium"
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
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5]" />}>
      <CollectionPageContent />
    </Suspense>
  );
}

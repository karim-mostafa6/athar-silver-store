"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import { DEFAULT_CATEGORIES } from "@/data/products";

// Reads ?gender= without making the whole page wait (useSearchParams would otherwise force the
// page to render empty on the server and pop in after load, which looked like a jump on phones).
function GenderParamSync({ onChange }: { onChange: (g: string | null) => void }) {
  const searchParams = useSearchParams();
  const g = searchParams.get("gender");
  useEffect(() => {
    onChange(g);
  }, [g, onChange]);
  return null;
}

function CollectionPageContent() {
  const { products: allStoreProducts, storeSettings } = useStore();
  const params = useParams();
  const slug = (params?.slug as string) || "all";
  const [genderQuery, setGenderQuery] = useState<string | null>(null); // "men" | "women" | null (set by <GenderParamSync/>)

  const isGenderPage = slug === "men" || slug === "women";
  const isAllPage = slug === "all";
  const isCategoryPage = !isGenderPage && !isAllPage;

  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "newest">("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const PAGE_SIZE = 12;

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
      if (inStockOnly && (p.inStock === false || (p.stockQuantity !== undefined && p.stockQuantity <= 0))) return false;
      if (priceMin !== "" && p.price < Number(priceMin)) return false;
      if (priceMax !== "" && p.price > Number(priceMax)) return false;
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
  }, [allStoreProducts, isCategoryPage, isGenderPage, collectionInfo.filterCategory, collectionInfo.filterGender, selectedSubCategory, sortBy, inStockOnly, priceMin, priceMax]);

  useEffect(() => {
    setPage(1);
  }, [slug, selectedSubCategory, sortBy, inStockOnly, priceMin, priceMax]);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (selectedSubCategory !== "all") {
    const cur = subCategories.find((x) => x.id === selectedSubCategory);
    if (cur) activeChips.push({ key: "sub", label: cur.label, clear: () => setSelectedSubCategory("all") });
  }
  if (inStockOnly) activeChips.push({ key: "stock", label: "متوفر", clear: () => setInStockOnly(false) });
  if (priceMin !== "" || priceMax !== "") {
    activeChips.push({ key: "price", label: `السعر ${priceMin || 0} – ${priceMax || "∞"}`, clear: () => { setPriceMin(""); setPriceMax(""); } });
  }

  const filtersPanel = (
    <div className="flex flex-col gap-7">
      <div>
        <div className="font-bold text-[15px] mb-3">الفئة</div>
        <div className="flex flex-col gap-1">
          {subCategories.map((sub) => (
            <label key={sub.id} className="flex items-center gap-2.5 min-h-[40px] text-[15px] cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSubCategory === sub.id}
                onChange={() => setSelectedSubCategory(selectedSubCategory === sub.id ? "all" : sub.id)}
                className="w-5 h-5 accent-[#292722]"
              />
              {sub.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="font-bold text-[15px] mb-3">السعر (ج.م)</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="من"
            aria-label="السعر من"
            className="w-full h-11 rounded-xl border border-[#292722]/25 bg-[#fbf8f3] px-3 text-sm"
          />
          <span className="text-[#7d6c5c]">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="إلى"
            aria-label="السعر إلى"
            className="w-full h-11 rounded-xl border border-[#292722]/25 bg-[#fbf8f3] px-3 text-sm"
          />
        </div>
      </div>
      <div>
        <div className="font-bold text-[15px] mb-3">التوفر</div>
        <label className="flex items-center gap-2.5 min-h-[40px] text-[15px] cursor-pointer">
          <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="w-5 h-5 accent-[#292722]" />
          متوفر بالمخزن فقط
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <Suspense fallback={null}>
        <GenderParamSync onChange={setGenderQuery} />
      </Suspense>
      {/* Title band */}
      <section className="border-b border-[#292722]/12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-10 sm:pt-14 pb-8 sm:pb-10 flex items-end justify-between gap-6">
          <div className="text-right">
            <nav className="text-[13px] text-[#7d6c5c] mb-3.5">
              <Link href="/" className="hover:text-[#292722] transition-colors">الرئيسية</Link> / {collectionInfo.title}
            </nav>
            <h1 className="font-cairo font-light text-4xl sm:text-6xl leading-[1.2] text-[#292722]">{collectionInfo.title}</h1>
            {collectionInfo.subtitle && (
              <p className="text-base sm:text-[17px] text-[#5c5346] mt-3 max-w-[520px] leading-[1.9]">{collectionInfo.subtitle}</p>
            )}
          </div>
          <div className="text-sm text-[#7d6c5c] whitespace-nowrap">{products.length} قطعة</div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8 sm:pt-9 pb-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-6 items-start">
        {/* Filters: sidebar on desktop, collapsible on mobile */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="lg:hidden w-full min-h-[48px] flex items-center justify-between px-4 rounded-xl border border-[#292722]/25 font-bold text-sm"
          >
            <span>تصفية</span>
            <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
          </button>
          <div className={`${filtersOpen ? "block" : "hidden"} lg:block mt-4 lg:mt-0`}>{filtersPanel}</div>
        </aside>

        <div className="lg:col-span-9 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {activeChips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={c.clear}
                  className="text-[13px] px-3.5 min-h-[40px] border border-[#292722] rounded-full hover:bg-[#292722] hover:text-[#F5F0E7] transition-colors"
                >
                  {c.label} ×
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              ترتيب حسب
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "popular" | "price-asc" | "price-desc" | "newest")}
                className="h-11 rounded-full border border-[#292722]/25 bg-transparent px-4 text-sm cursor-pointer focus:outline-none"
              >
                <option value="newest">الأحدث</option>
                <option value="popular">الأكثر طلباً</option>
                <option value="price-asc">السعر: الأقل</option>
                <option value="price-desc">السعر: الأعلى</option>
              </select>
            </label>
          </div>

          {products.length === 0 ? (
            <div className="py-24 text-center space-y-4 border border-[#292722]/12 rounded-3xl">
              <h3 className="text-base font-bold text-[#292722]">لا توجد قطع تطابق هذا الفلتر حالياً</h3>
              <button
                onClick={() => {
                  setSelectedSubCategory("all");
                  setInStockOnly(false);
                  setPriceMin("");
                  setPriceMax("");
                }}
                className="px-6 min-h-[44px] rounded-full bg-[#292722] text-[#F5F0E7] font-bold text-xs"
              >
                عرض كافة قطع التشكيلة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 sm:gap-x-5 gap-y-8 sm:gap-y-9">
              {pageProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} animateIn={false} priority={i < 6} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="الصفحات" className="flex justify-center gap-2 mt-12 sm:mt-14">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setPage(n);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  aria-current={n === page ? "page" : undefined}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                    n === page ? "bg-[#292722] text-[#F5F0E7]" : "border border-[#292722]/25 hover:border-[#292722]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <CollectionPageContent />
  );
}

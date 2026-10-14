"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, X, Menu, User, ChevronDown } from "lucide-react";
import { MarqueeAnnouncement } from "@/components/MarqueeAnnouncement";
import { AtharLogo } from "@/components/AtharLogo";
import { useStore, NavLinkItem } from "@/context/StoreContext";

interface SubNavItem {
  label: string;
  href: string;
  badge?: string;
  description?: string;
}

const getSubNavItems = (item: NavLinkItem): SubNavItem[] | null => {
  const href = (item.href || "").toLowerCase();
  const id = (item.id || "").toLowerCase();
  const label = item.label || "";

  // Rings
  if (href.includes("/collection/rings") || id === "rings" || label.includes("خواتم")) {
    return [
      { label: "كافة الخواتم", href: "/collection/rings", description: "جميع تشكيلات السوليتير والفضة 925" },
      { label: "خواتم رجالي", href: "/collection/rings?gender=men", badge: "رجالي", description: "صياغة ثقيلة وعقيق يماني كلاسيكي" },
      { label: "خواتم حريمي وسوليتير", href: "/collection/rings?gender=women", badge: "حريمي", description: "سوليتير زركون سويسري مرصع بدقة" },
    ];
  }

  // Chains
  if (href.includes("/collection/chains") || id === "chains" || label.includes("سلاسل")) {
    return [
      { label: "كافة السلاسل", href: "/collection/chains", description: "مسبوكات كبح وحبل إيطالي 925" },
      { label: "سلاسل رجالي", href: "/collection/chains?gender=men", badge: "رجالي", description: "كبح إيطالي كوبان وتصاميم فخمة" },
      { label: "سلاسل ودلايات حريمي", href: "/collection/chains?gender=women", badge: "حريمي", description: "سلاسل ناعمة مع دلايات مرصعة" },
    ];
  }

  // Bracelets
  if (href.includes("/collection/bracelets") || id === "bracelets" || label.includes("أساور")) {
    return [
      { label: "كافة الأساور", href: "/collection/bracelets", description: "أساور تنس وموديلات كلاسيكية" },
      { label: "أساور رجالي", href: "/collection/bracelets?gender=men", badge: "رجالي", description: "أساور فضة ثقيلة وجلد طبيعي" },
      { label: "أساور وتنس حريمي", href: "/collection/bracelets?gender=women", badge: "حريمي", description: "تنس ألماس سويسري وبناجر ملكية" },
    ];
  }

  // Sets
  if (href.includes("/collection/sets") || id === "sets" || label.includes("أطقم")) {
    return [
      { label: "كافة الأطقم الملكية", href: "/collection/sets", description: "أطقم مناسبات وشبكة فضة فاخرة" },
      { label: "أطقم رجالية", href: "/collection/sets?gender=men", badge: "رجالي", description: "طقم خاتم وسلسلة متناسق" },
      { label: "أطقم نسائية فاخرة", href: "/collection/sets?gender=women", badge: "حريمي", description: "طقم متكامل (خاتم، عقد، حلق، إسورة)" },
    ];
  }

  // Earrings
  if (href.includes("/collection/earrings") || id === "earrings" || label.includes("أقراط")) {
    return [
      { label: "كافة الأقراط", href: "/collection/earrings", description: "أقراط فضة 925 متدلية ونواعم" },
      { label: "أقراط حريمي كلاسيكية", href: "/collection/earrings?gender=women", badge: "حريمي", description: "مرصعة بأحجار زركون براقة" },
    ];
  }

  // Men collection
  if (href.includes("/collection/men") || id === "men" || label.includes("رجالي")) {
    return [
      { label: "كافة التشكيلة الرجالية", href: "/collection/men", description: "استعرض كل روائع الفضة 925 الرجالية" },
      { label: "خواتم رجالي", href: "/collection/rings?gender=men", description: "خواتم عقيق وسوليتير رجالي" },
      { label: "سلاسل رجالي", href: "/collection/chains?gender=men", description: "سلاسل كبح وحبل إيطالي" },
      { label: "أساور رجالي", href: "/collection/bracelets?gender=men", description: "أساور فضة وجلد طبيعي" },
      { label: "أطقم رجالية", href: "/collection/sets?gender=men", description: "أطقم هدايا وإكسسوارات متناسقة" },
    ];
  }

  // Women collection
  if (href.includes("/collection/women") || id === "women" || label.includes("نسائ") || label.includes("حريمي")) {
    return [
      { label: "كافة التشكيلة النسائية", href: "/collection/women", description: "استعرض كل روائع الفضة 925 النسائية" },
      { label: "خواتم وسوليتير حريمي", href: "/collection/rings?gender=women", description: "خواتم خطوبة وسوليتير ملكي" },
      { label: "سلاسل ودلايات حريمي", href: "/collection/chains?gender=women", description: "سلاسل ناعمة وميداليات براقة" },
      { label: "أساور وتنس حريمي", href: "/collection/bracelets?gender=women", description: "أساور تنس متلألئة" },
      { label: "أقراط وأطقم ملكية", href: "/collection/earrings?gender=women", description: "أقراط وأطقم شبكة متكاملة" },
    ];
  }

  // All collection
  if (href.includes("/collection/all") || id === "all") {
    return [
      { label: "كافة المصوغات", href: "/collection/all", description: "جميع روائع دار أَثَـر" },
      { label: "التشكيلة الرجالية", href: "/collection/men", badge: "رجالي" },
      { label: "التشكيلة النسائية", href: "/collection/women", badge: "حريمي" },
      { label: "خواتم وسوليتير", href: "/collection/rings" },
      { label: "سلاسل إيطالي", href: "/collection/chains" },
      { label: "أساور وتنس", href: "/collection/bracelets" },
    ];
  }

  return null;
};

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
  onOpenCart?: () => void;
  onOpenWishlist?: () => void;
  onOpenSizeGuide?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (cat: string) => void;
  selectedGender?: string;
  setSelectedGender?: (gender: string) => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSizeGuide,
  searchQuery = "",
  setSearchQuery,
  onNotify,
}) => {
  const store = useStore();
  const { storeSettings } = store;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [internalQuery, setInternalQuery] = useState("");

  const effectiveCartCount = cartCount !== undefined ? cartCount : store.cartCount;
  const effectiveWishlistCount = wishlistCount !== undefined ? wishlistCount : store.wishlistCount;
  const handleOpenCart = onOpenCart || (() => store.setIsCartOpen(true));
  const handleOpenWishlist = onOpenWishlist || (() => store.setIsWishlistOpen(true));
  const handleOpenSizeGuide = onOpenSizeGuide || (() => store.setIsSizeGuideOpen(true));
  const handleNotify = onNotify || store.addToast;

  const currentQuery = setSearchQuery ? searchQuery : internalQuery;
  const handleQueryChange = (val: string) => {
    if (setSearchQuery) {
      setSearchQuery(val);
    } else {
      setInternalQuery(val);
    }
  };

  // Mockup-aligned Default Nav Links
  const defaultNavItems: NavLinkItem[] = [
    { id: "home", label: "الرئيسية", href: "/", visible: true },
    { id: "products", label: "المصوغات", href: "/#products", visible: true },
    { id: "story", label: "عن أَثَر", href: "/#story", visible: true },
    { id: "care", label: "العناية بالفضة", href: "/#care", visible: true },
    { id: "contact", label: "تواصل معنا", href: "/#footer", visible: true },
  ];

  const activeNavLinks =
    storeSettings.navLinks && storeSettings.navLinks.length > 0
      ? storeSettings.navLinks.filter((l) => l.visible)
      : defaultNavItems;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f7f4ee]/95 backdrop-blur-md border-b border-[#e8ded0] transition-colors">
      {/* Live Marquee Ticker */}
      <MarqueeAnnouncement onNotify={handleNotify} />

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Right: Mobile Menu & Calligraphic Athar Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-[#5c4f42] hover:text-[#161412] hover:bg-[#ede3d3] transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Athar Calligraphic Logo */}
            <AtharLogo variant="light" size="md" href="/" />
          </div>

          {/* Center: Navigation Links with Hover Dropdown Popups */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-xs sm:text-sm font-medium text-[#4a3f35]">
            {activeNavLinks.map((item) => {
              const subItems = getSubNavItems(item);
              const badgeNode = item.badge ? (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none mr-1 ${
                    item.badgeColor === "rose"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : item.badgeColor === "purple"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : item.badgeColor === "emerald"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : item.badgeColor === "blue"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null;

              if (item.href === "#sizeguide") {
                return (
                  <button
                    key={item.id}
                    onClick={handleOpenSizeGuide}
                    className="hover:text-[#161412] transition-colors whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <div key={item.id} className="relative group py-5">
                  <Link
                    href={item.href}
                    target={item.targetBlank ? "_blank" : undefined}
                    rel={item.targetBlank ? "noreferrer" : undefined}
                    className="flex items-center gap-1 hover:text-[#161412] transition-colors whitespace-nowrap"
                  >
                    <span>{item.label}</span>
                    {badgeNode}
                    {subItems && (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8c7865] group-hover:rotate-180 group-hover:text-[#161412] transition-transform duration-200" />
                    )}
                  </Link>

                  {/* Luxury Dropdown Popup */}
                  {subItems && (
                    <div className="absolute top-full right-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-[#faf8f5]/98 border border-[#ded2c0] rounded-2xl shadow-2xl p-2.5 min-w-[240px] text-right backdrop-blur-md ring-1 ring-black/5">
                        <div className="space-y-1">
                          {subItems.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              className="group/item flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-[#ede3d3]/90 transition-colors"
                            >
                              <div className="flex flex-col text-right">
                                <span className="text-xs font-bold text-[#161412] group-hover/item:text-[#a07e52] transition-colors">
                                  {sub.label}
                                </span>
                                {sub.description && (
                                  <span className="text-[10px] text-[#8c7865] font-light mt-0.5 leading-snug">
                                    {sub.description}
                                  </span>
                                )}
                              </div>
                              {sub.badge && (
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#161412] text-[#f7f4ee] shrink-0">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Left: User Admin, Wishlist, Search, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop Search Input */}
            <div className="hidden xl:flex relative items-center w-40 2xl:w-48">
              <input
                type="text"
                placeholder={storeSettings.searchPlaceholder || "ابحث عن خاتم، سلسلة..."}
                value={currentQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full bg-[#ede5d8]/60 text-xs text-[#161412] placeholder-[#8f806f] rounded-full py-2 pr-9 pl-8 border border-[#ded2c0] focus:outline-none focus:border-[#7d6953] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-3.5 h-3.5 text-[#8c7865] absolute right-3 pointer-events-none" />
              {currentQuery && (
                <button
                  onClick={() => handleQueryChange("")}
                  className="absolute left-2.5 p-0.5 text-[#8c7865] hover:text-[#161412]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="xl:hidden p-2 rounded-full text-[#5c4f42] hover:bg-[#ede3d3] transition-colors"
              aria-label="البحث"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Account / Admin Portal Link */}
            <Link
              href="/admin"
              className="p-2 rounded-full text-[#5c4f42] hover:bg-[#ede3d3] hover:text-[#161412] transition-colors"
              title="لوحة الإدارة"
              aria-label="لوحة الإدارة"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            {/* Wishlist Button */}
            <button
              onClick={handleOpenWishlist}
              className="relative p-2 rounded-full text-[#5c4f42] hover:bg-[#ede3d3] hover:text-[#161412] transition-colors"
              aria-label="قائمة المفضلة"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {effectiveWishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {effectiveWishlistCount}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={handleOpenCart}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#161412] hover:bg-[#2d2926] text-white text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">السلة</span>
              {effectiveCartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#c5a880] text-[#161412] text-[10px] font-black flex items-center justify-center">
                  {effectiveCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="xl:hidden pb-3 pt-1">
            <div className="relative">
              <input
                type="text"
                placeholder={storeSettings.searchPlaceholder || "ابحث عن خاتم، سلسلة..."}
                value={currentQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                autoFocus
                className="w-full bg-[#f4ece0] text-xs text-[#1c1815] rounded-full py-2.5 pr-9 pl-9 border border-[#ded2c0] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
              {currentQuery && (
                <button
                  onClick={() => handleQueryChange("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-[#8c7865]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#ebdcca] bg-[#faf8f5] px-6 py-6 space-y-4 text-right shadow-2xl">
          <div className="flex flex-col space-y-3 text-sm font-medium text-[#4d4034]">
            {activeNavLinks.map((item) => {
              const subItems = getSubNavItems(item);
              const badgeNode = item.badge ? (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none mr-2 ${
                    item.badgeColor === "rose"
                      ? "bg-rose-100 text-rose-800 border-rose-300"
                      : item.badgeColor === "purple"
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : item.badgeColor === "emerald"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : item.badgeColor === "blue"
                      ? "bg-blue-100 text-blue-800 border-blue-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null;

              if (item.href === "#sizeguide") {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenSizeGuide();
                    }}
                    className="text-right py-2 hover:text-[#1c1815] border-b border-[#ebdcca]/50 flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {badgeNode}
                  </button>
                );
              }
              return (
                <div key={item.id} className="border-b border-[#ebdcca]/50 pb-2">
                  <Link
                    href={item.href}
                    target={item.targetBlank ? "_blank" : undefined}
                    rel={item.targetBlank ? "noreferrer" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 hover:text-[#1c1815] flex items-center justify-between font-medium"
                  >
                    <span>{item.label}</span>
                    {badgeNode}
                  </Link>
                  {subItems && (
                    <div className="pr-3 pt-1 pb-1 space-y-1.5 border-r-2 border-[#d9ccba] mr-1 mt-1">
                      {subItems.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-1 text-xs text-[#705e4d] hover:text-[#1c1815]"
                        >
                          <span>{sub.label}</span>
                          {sub.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#161412] text-white">
                              {sub.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

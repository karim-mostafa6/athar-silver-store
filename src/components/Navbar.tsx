"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, Sparkles, X, Menu } from "lucide-react";
import { MarqueeAnnouncement } from "@/components/MarqueeAnnouncement";
import { useStore } from "@/context/StoreContext";

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

  return (
    <header className="sticky top-0 z-40 w-full bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8ded0] transition-colors">
      {/* Live Marquee Ticker */}
      <MarqueeAnnouncement onNotify={handleNotify} />

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#5c4f42] hover:text-[#1c1815] hover:bg-[#ede3d3] transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo Link to Home */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl sm:text-3xl font-light tracking-[0.15em] text-[#1c1815] font-alexandria uppercase">
                ATHAR
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#8c7865] border-r border-[#d8c8b4] pr-2 uppercase">
                أَثَـر • 925
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links with Multi-Page Routing */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-[#5c4c3b]">
            <Link
              href="/collection/all"
              className="hover:text-[#1c1815] transition-colors"
            >
              كافة القطع
            </Link>
            <Link
              href="/collection/women"
              className="hover:text-[#1c1815] transition-colors font-semibold"
            >
              تشكيلة نسائية
            </Link>
            <Link
              href="/collection/men"
              className="hover:text-[#1c1815] transition-colors font-semibold"
            >
              تشكيلة رجالية
            </Link>
            <Link
              href="/collection/rings"
              className="hover:text-[#1c1815] transition-colors"
            >
              خواتم وسوليتير
            </Link>
            <Link
              href="/collection/chains"
              className="hover:text-[#1c1815] transition-colors"
            >
              سلاسل إيطالي
            </Link>
            <button
              onClick={handleOpenSizeGuide}
              className="hover:text-[#1c1815] transition-colors"
            >
              دليل المقاسات
            </button>
            <Link href="/#story" className="hover:text-[#1c1815] transition-colors">
              عن أَثَر
            </Link>
            <Link href="/#care" className="hover:text-[#1c1815] transition-colors">
              العناية بالفضة
            </Link>
          </nav>

          {/* Right: Search, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search Input */}
            <div className="hidden md:flex relative items-center w-52 lg:w-60">
              <input
                type="text"
                placeholder="ابحث عن خاتم، سلسلة..."
                value={currentQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full bg-[#f4ece0] text-xs text-[#1c1815] placeholder-[#8f806f] rounded-full py-2.5 pr-9 pl-8 border border-[#ded2c0] focus:outline-none focus:border-[#7d6953] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-[#7d6953] absolute right-3 pointer-events-none" />
              {currentQuery && (
                <button
                  onClick={() => handleQueryChange("")}
                  className="absolute left-3 text-[#7d6953] hover:text-[#1c1815]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2.5 rounded-xl bg-[#f4ece0] border border-[#ded2c0] text-[#554638] hover:text-[#1c1815] transition-colors"
              aria-label="البحث"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleOpenWishlist}
              className="relative p-2.5 rounded-2xl bg-[#f4ece0] border border-[#ded2c0] text-[#554638] hover:text-[#1c1815] hover:bg-[#eae0d2] transition-colors shadow-sm"
              aria-label="قائمة المفضلة"
            >
              <Heart className="w-5 h-5" />
              {effectiveWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm animate-pop font-mono">
                  {effectiveWishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={handleOpenCart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1c1815] text-[#faf8f5] hover:bg-[#2f2721] active:scale-95 transition-all shadow-md shadow-[#1c1815]/10"
              aria-label="سلة التسوق"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-[#f5f1eb]" />
                {effectiveCartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-500 text-[#1c1815] text-[10px] font-bold flex items-center justify-center font-mono shadow-sm">
                    {effectiveCartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline">السلة</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input Drawer */}
        {searchOpen && (
          <div className="md:hidden pb-4 pt-1 px-1">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="ابحث عن خاتم، سلسلة، إسوارة..."
                value={currentQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                autoFocus
                className="w-full bg-[#f4ece0] text-xs text-[#1c1815] placeholder-[#8f806f] rounded-2xl py-3 pr-10 pl-9 border border-[#ded2c0] focus:outline-none focus:border-[#7d6953] shadow-inner"
              />
              <Search className="w-4 h-4 text-[#7d6953] absolute right-3 pointer-events-none" />
              {currentQuery && (
                <button
                  onClick={() => handleQueryChange("")}
                  className="absolute left-3 text-[#7d6953]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#e8ded0] bg-[#faf8f5] px-6 py-5 space-y-3 animate-fadeIn">
          <Link
            href="/collection/all"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-[#1c1815] border-b border-[#eee4d6]"
          >
            كافة القطع
          </Link>
          <Link
            href="/collection/women"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-[#1c1815] border-b border-[#eee4d6]"
          >
            تشكيلة نسائية
          </Link>
          <Link
            href="/collection/men"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-[#1c1815] border-b border-[#eee4d6]"
          >
            تشكيلة رجالية
          </Link>
          <Link
            href="/collection/rings"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#5c4c3b] border-b border-[#eee4d6]"
          >
            خواتم وسوليتير
          </Link>
          <Link
            href="/collection/chains"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#5c4c3b] border-b border-[#eee4d6]"
          >
            سلاسل ودلايات
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleOpenSizeGuide();
            }}
            className="w-full text-right py-2 text-sm font-medium text-[#5c4c3b] border-b border-[#eee4d6] flex items-center justify-between"
          >
            <span>دليل مقاسات الخواتم</span>
            <Sparkles className="w-4 h-4 text-[#8a7258]" />
          </button>
          <Link
            href="/#story"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#5c4c3b]"
          >
            عن أَثَر
          </Link>
          <Link
            href="/#care"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#5c4c3b]"
          >
            العناية بالفضة
          </Link>
        </div>
      )}
    </header>
  );
};

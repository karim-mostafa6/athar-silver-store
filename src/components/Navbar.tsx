"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, X, Menu, User } from "lucide-react";
import { MarqueeAnnouncement } from "@/components/MarqueeAnnouncement";
import { AtharLogo } from "@/components/AtharLogo";
import { useStore, NavLinkItem } from "@/context/StoreContext";

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

          {/* Center: Navigation Links matching mockup */}
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-medium text-[#4a3f35]">
            {activeNavLinks.map((item) => {
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
                <Link
                  key={item.id}
                  href={item.href}
                  className="hover:text-[#161412] transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
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
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.targetBlank ? "_blank" : undefined}
                  rel={item.targetBlank ? "noreferrer" : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 hover:text-[#1c1815] border-b border-[#ebdcca]/50 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  {badgeNode}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

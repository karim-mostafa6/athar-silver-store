"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, X, Menu, User, ChevronDown } from "lucide-react";
import { MarqueeAnnouncement } from "@/components/MarqueeAnnouncement";
import { OrmaLogo } from "@/components/OrmaLogo";
import { useStore, NavLinkItem } from "@/context/StoreContext";

interface SubNavItem {
  label: string;
  href: string;
}

const getSubNavItems = (item: NavLinkItem): SubNavItem[] | null => {
  // 1. If custom subItems configured in dashboard, use them
  if (item.subItems && item.subItems.length > 0) {
    return item.subItems;
  }

  const href = (item.href || "").toLowerCase();
  const id = (item.id || "").toLowerCase();
  const label = item.label || "";

  // Rings
  if (href.includes("/collection/rings") || id === "rings" || label.includes("خواتم")) {
    return [
      { label: "كافة الخواتم", href: "/collection/rings" },
      { label: "خواتم رجالي", href: "/collection/rings?gender=men" },
      { label: "خواتم حريمي", href: "/collection/rings?gender=women" },
    ];
  }

  // Chains
  if (href.includes("/collection/chains") || id === "chains" || label.includes("سلاسل")) {
    return [
      { label: "كافة السلاسل", href: "/collection/chains" },
      { label: "سلاسل رجالي", href: "/collection/chains?gender=men" },
      { label: "سلاسل حريمي", href: "/collection/chains?gender=women" },
    ];
  }

  // Bracelets
  if (href.includes("/collection/bracelets") || id === "bracelets" || label.includes("أساور")) {
    return [
      { label: "كافة الأساور", href: "/collection/bracelets" },
      { label: "أساور رجالي", href: "/collection/bracelets?gender=men" },
      { label: "أساور حريمي", href: "/collection/bracelets?gender=women" },
    ];
  }

  // Sets
  if (href.includes("/collection/sets") || id === "sets" || label.includes("أطقم")) {
    return [
      { label: "كافة الأطقم", href: "/collection/sets" },
      { label: "أطقم رجالية", href: "/collection/sets?gender=men" },
      { label: "أطقم نسائية فاخرة", href: "/collection/sets?gender=women" },
    ];
  }

  // Earrings
  if (href.includes("/collection/earrings") || id === "earrings" || label.includes("أقراط")) {
    return [
      { label: "كافة الأقراط", href: "/collection/earrings" },
      { label: "أقراط حريمي", href: "/collection/earrings?gender=women" },
    ];
  }

  // Men collection
  if (href.includes("/collection/men") || id === "men" || label.includes("رجالي")) {
    return [
      { label: "كافة التشكيلة الرجالية", href: "/collection/men" },
      { label: "خواتم رجالي", href: "/collection/rings?gender=men" },
      { label: "سلاسل رجالي", href: "/collection/chains?gender=men" },
      { label: "أساور رجالي", href: "/collection/bracelets?gender=men" },
      { label: "أطقم وهدايا", href: "/collection/sets?gender=men" },
    ];
  }

  // Women collection
  if (href.includes("/collection/women") || id === "women" || label.includes("نسائ") || label.includes("حريمي")) {
    return [
      { label: "كافة التشكيلة النسائية", href: "/collection/women" },
      { label: "خواتم وسوليتير", href: "/collection/rings?gender=women" },
      { label: "سلاسل ودلايات", href: "/collection/chains?gender=women" },
      { label: "أساور وتنس", href: "/collection/bracelets?gender=women" },
      { label: "أقراط وأطقم", href: "/collection/earrings?gender=women" },
    ];
  }

  // All collection
  if (href.includes("/collection/all") || id === "all" || label.includes("جميع") || label.includes("المصوغات")) {
    return [
      { label: "كافة المصوغات", href: "/collection/all" },
      { label: "التشكيلة الرجالية", href: "/collection/men" },
      { label: "التشكيلة النسائية", href: "/collection/women" },
      { label: "خواتم وسوليتير", href: "/collection/rings" },
      { label: "سلاسل إيطالي", href: "/collection/chains" },
      { label: "أساور وتنس", href: "/collection/bracelets" },
      { label: "أطقم ملكية", href: "/collection/sets" },
      { label: "أقراط وحلقان", href: "/collection/earrings" },
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
  onOpenCustomerModal?: () => void;
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
  onOpenWishlist,
  onOpenSizeGuide,
  onOpenCustomerModal,
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
  const handleOpenWishlist = onOpenWishlist || (() => store.setIsWishlistOpen(true));
  const handleOpenSizeGuide = onOpenSizeGuide || (() => store.setIsSizeGuideOpen(true));
  const handleOpenCustomerModal = onOpenCustomerModal || (() => store.setIsCustomerModalOpen(true));
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
    { id: "story", label: "عن ORMA", href: "/#story", visible: true },
    { id: "care", label: "العناية بالفضة", href: "/#care", visible: true },
    { id: "contact", label: "تواصل معنا", href: "/#footer", visible: true },
  ];

  const activeNavLinks =
    storeSettings.navLinks && storeSettings.navLinks.length > 0
      ? storeSettings.navLinks.filter((l) => l.visible)
      : defaultNavItems;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F5F0E7] border-b border-[#292722]/12 transition-colors shadow-xs">
      {/* Live Marquee Ticker */}
      <MarqueeAnnouncement onNotify={handleNotify} />

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Right: Mobile Menu & Signature ORMA Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl text-[#292722] hover:bg-[#D8C8B3]/40 transition-colors"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* ORMA Signature Logo */}
            <OrmaLogo variant="light" size="md" href="/" />
          </div>

          {/* Center: Navigation Links with Animated Underline and Solid Opaque Dropdowns */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs sm:text-sm font-medium text-[#292722]">
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
                    className="relative flex items-center gap-1 text-[#3b3127] hover:text-[#161412] transition-colors whitespace-nowrap py-1"
                  >
                    <span>{item.label}</span>
                    {badgeNode}
                    {subItems && (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8c7865] group-hover:rotate-180 group-hover:text-[#161412] transition-transform duration-200" />
                    )}
                    {/* Animated underline from start to end (right-to-left in RTL) */}
                    <span className="absolute bottom-0 right-0 left-0 h-[2px] bg-[#161412] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>

                  {/* 100% Solid Opaque Dropdown Popup matching reference image */}
                  {subItems && (
                    <div className="absolute top-full right-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white border border-[#ded2c0] rounded-xl shadow-2xl py-2 px-1 min-w-[200px] text-right">
                        {subItems.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            className="block px-4 py-2.5 text-xs sm:text-sm text-[#2d251e] hover:text-[#161412] hover:bg-[#f7f4ee] hover:pr-5 rounded-lg transition-all font-medium text-right whitespace-nowrap"
                          >
                            {sub.label}
                          </Link>
                        ))}
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
                className="w-full bg-[#D8C8B3]/35 text-xs text-[#292722] placeholder-[#292722]/50 rounded-full py-2 pr-9 pl-8 border border-[#292722]/12 focus:outline-none focus:border-[#8E7545] focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-3.5 h-3.5 text-[#292722]/60 absolute right-3 pointer-events-none" />
              {currentQuery && (
                <button
                  onClick={() => handleQueryChange("")}
                  className="absolute left-2.5 p-0.5 text-[#292722]/60 hover:text-[#292722]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="xl:hidden p-2 rounded-full text-[#292722]/75 hover:bg-[#D8C8B3]/40 transition-colors"
              aria-label="البحث"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Customer Account & Order Tracking */}
            <button
              type="button"
              onClick={handleOpenCustomerModal}
              className="p-2 rounded-full text-[#292722]/75 hover:bg-[#D8C8B3]/40 hover:text-[#292722] transition-colors"
              title="حسابي / تتبع طلبي"
              aria-label="حسابي / تتبع طلبي"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleOpenWishlist}
              className="relative p-2 rounded-full text-[#292722]/75 hover:bg-[#D8C8B3]/40 hover:text-[#292722] transition-colors"
              aria-label="قائمة المفضلة"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {effectiveWishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {effectiveWishlistCount}
                </span>
              )}
            </button>

            {/* Cart Standalone Page Link */}
            <Link
              href="/checkout"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#292722] hover:bg-[#3d3a33] text-[#F5F0E7] text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">السلة</span>
              {effectiveCartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8E7545] text-white text-[10px] font-black flex items-center justify-center">
                  {effectiveCartCount}
                </span>
              )}
            </Link>
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
        <div className="lg:hidden border-t border-[#292722]/12 bg-[#F5F0E7] px-6 py-6 space-y-4 text-right shadow-2xl">
          <div className="flex flex-col space-y-3 text-sm font-medium text-[#292722]">
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
                      : "bg-[#D8C8B3] text-[#292722] border-[#292722]/20"
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
                    className="text-right py-2 hover:text-[#8E7545] border-b border-[#292722]/10 flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    {badgeNode}
                  </button>
                );
              }
              return (
                <div key={item.id} className="border-b border-[#292722]/10 pb-2">
                  <Link
                    href={item.href}
                    target={item.targetBlank ? "_blank" : undefined}
                    rel={item.targetBlank ? "noreferrer" : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 hover:text-[#8E7545] flex items-center justify-between font-medium"
                  >
                    <span>{item.label}</span>
                    {badgeNode}
                  </Link>
                  {subItems && (
                    <div className="pr-3 pt-1 pb-1 space-y-1.5 border-r-2 border-[#D8C8B3] mr-1 mt-1">
                      {subItems.map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1 text-xs text-[#292722]/70 hover:text-[#292722]"
                        >
                          {sub.label}
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

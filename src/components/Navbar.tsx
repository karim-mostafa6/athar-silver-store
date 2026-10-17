"use client";

import React, { useState, useEffect } from "react";
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
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Only the "scrolled" shadow depends on scroll. The announcement bar scrolls away with the page
  // (no height toggling), which removed the show/hide flicker caused by layout shifts.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

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
    <>
    {/* Announcement ticker: normal page flow, scrolls away with the page */}
    <MarqueeAnnouncement onNotify={handleNotify} />
    <header className={`sticky top-0 z-40 w-full border-b border-[#292722]/12 backdrop-blur-md transition-colors duration-300 ${scrolled ? "bg-[#F5F0E7]/90 shadow-[0_8px_30px_-16px_rgba(41,39,34,0.28)]" : "bg-[#F5F0E7]"}`}>

      {/* Main Navbar */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className={`flex items-center justify-between gap-3 sm:gap-6 transition-all duration-300 ${scrolled ? "h-14 sm:h-[68px]" : "h-16 sm:h-20"}`}>
          {/* Right: Mobile Menu & Signature ORMA Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

          {/* Center: Navigation Links with Animated Underline and Solid Opaque Dropdowns (No badges to prevent horizontal clutter) */}
          <nav className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-2 gap-2 xl:gap-3 2xl:gap-6 text-xs xl:text-[13px] 2xl:text-sm font-medium text-[#292722]">
            {activeNavLinks.map((item) => {
              const subItems = getSubNavItems(item);

              if (item.href === "#sizeguide") {
                return (
                  <button
                    key={item.id}
                    onClick={handleOpenSizeGuide}
                    className="hover:text-[#8E7545] transition-colors whitespace-nowrap font-tajawal font-medium py-1"
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
                    className="relative flex items-center gap-1 text-[#292722] hover:text-[#8E7545] transition-colors whitespace-nowrap py-1 font-tajawal font-medium"
                  >
                    <span>{item.label}</span>
                    {subItems && (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8E7545] group-hover:rotate-180 transition-transform duration-200" />
                    )}
                    {/* Animated underline from start to end (right-to-left in RTL) */}
                    <span className="absolute bottom-0 right-0 left-0 h-[2px] bg-[#8E7545] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
                  </Link>

                  {/* 100% Solid Opaque Dropdown Popup */}
                  {subItems && (
                    <div className="absolute top-full right-0 pt-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white border border-[#ded2c0] rounded-xl shadow-2xl py-2 px-1 min-w-[200px] text-right">
                        {subItems.map((sub, sIdx) => (
                          <Link
                            key={sIdx}
                            href={sub.href}
                            className="block px-4 py-2.5 text-xs sm:text-sm text-[#2d251e] hover:text-[#161412] hover:bg-[#f7f4ee] hover:pr-5 rounded-lg transition-all font-medium text-right whitespace-nowrap font-tajawal"
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

          {/* Left: Search Toggle, Customer Account, Wishlist, Cart */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
            {/* Search Icon Button (Desktop & Mobile) */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${
                searchOpen
                  ? "bg-[#292722] text-[#F5F0E7]"
                  : "text-[#292722]/80 hover:bg-[#D8C8B3]/40 hover:text-[#292722]"
              }`}
              title="البحث في المصوغات"
              aria-label="البحث"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Customer Account & Order Tracking */}
            <button
              type="button"
              onClick={handleOpenCustomerModal}
              className="p-2 rounded-full text-[#292722]/80 hover:bg-[#D8C8B3]/40 hover:text-[#292722] transition-colors"
              title="حسابي / تتبع طلبي"
              aria-label="حسابي / تتبع طلبي"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleOpenWishlist}
              className="relative p-2 rounded-full text-[#292722]/80 hover:bg-[#D8C8B3]/40 hover:text-[#292722] transition-colors"
              title="قائمة المفضلة"
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
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-[#292722] hover:bg-[#3d3a33] text-[#F5F0E7] text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
              title="سلة المشتريات"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B7A078]" />
              <span className="hidden sm:inline font-cairo">السلة</span>
              {effectiveCartCount > 0 ? (
                <span className="w-4 h-4 rounded-full bg-[#8E7545] text-white text-[10px] font-black flex items-center justify-center">
                  {effectiveCartCount}
                </span>
              ) : (
                <span className="text-[10px] text-[#D8C8B3] font-mono">0</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Search Input (Full Width for all screens when toggled) */}
      {searchOpen && (
        <div className="w-full bg-[#F5F0E7] border-t border-[#292722]/10 px-4 sm:px-6 lg:px-10 py-3 shadow-md transition-all animate-fadeIn">
          <div className="max-w-2xl mx-auto relative flex items-center">
            <input
              type="text"
              placeholder={storeSettings.searchPlaceholder || "ابحث عن خاتم، سلسلة، أسورة، عيار 925..."}
              value={currentQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              autoFocus
              className="w-full bg-white text-xs sm:text-sm text-[#292722] placeholder-[#292722]/50 rounded-full py-2.5 pr-10 pl-10 border border-[#292722]/20 focus:outline-none focus:border-[#8E7545] shadow-inner font-tajawal"
            />
            <Search className="w-4 h-4 text-[#8E7545] absolute right-3.5 pointer-events-none" />
            {currentQuery ? (
              <button
                onClick={() => handleQueryChange("")}
                className="absolute left-3.5 p-1 text-[#292722]/60 hover:text-[#292722] transition-colors"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            ) : (
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute left-3.5 p-1 text-[#292722]/60 hover:text-[#292722] transition-colors"
                title="إغلاق البحث"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#292722]/12 bg-[#F5F0E7] px-6 py-6 space-y-4 text-right shadow-2xl max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain">
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
                  {subItems && subItems.length > 0 ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={openMobileSection === item.id}
                        onClick={() => setOpenMobileSection(openMobileSection === item.id ? null : item.id)}
                        className="w-full py-1.5 hover:text-[#8E7545] flex items-center justify-between font-medium text-right"
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.label}</span>
                          {badgeNode}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#292722]/60 transition-transform duration-200 ${openMobileSection === item.id ? "rotate-180" : ""}`} />
                      </button>
                      {openMobileSection === item.id && (
                        <div className="pr-3 pt-1 pb-1 space-y-1.5 border-r-2 border-[#D8C8B3] mr-1 mt-1">
                          {!subItems.some((sub) => sub.href === item.href) && (
                            <Link
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-1 text-xs font-bold text-[#8E7545]"
                            >
                              عرض الكل
                            </Link>
                          )}
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
                    </>
                  ) : (
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
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </header>
    </>
  );
};

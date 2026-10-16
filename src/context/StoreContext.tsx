"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import { Product, CartItem, PRODUCTS, StoreCategory, DEFAULT_CATEGORIES, CustomPage, DEFAULT_CUSTOM_PAGES } from "@/data/products";
import { ToastMessage } from "@/components/Toast";
import { getAdminAuthHeaders } from "@/lib/clientAdmin";
import { BUILD_ID } from "@/lib/version";

export type { StoreCategory, CustomPage };
export { DEFAULT_CATEGORIES, DEFAULT_CUSTOM_PAGES };

export interface NavSubItem {
  id?: string;
  label: string;
  href: string;
}

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  isSpecial?: boolean;
  badge?: string;
  badgeColor?: "amber" | "rose" | "emerald" | "blue" | "purple";
  targetBlank?: boolean;
  subItems?: NavSubItem[];
}

export interface MarqueeExtraMessage {
  id: string;
  text: string;
  icon?: string;
  visible: boolean;
}

export type AdminRole = "super_admin" | "orders_customers" | "store_editor" | "all";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  password: string;
  role: "orders_customers" | "store_editor" | "all";
  createdAt: string;
  isActive: boolean;
}

export interface StoreSettings {
  // Sub-admins and Permissions
  adminUsers?: AdminUser[];
  whatsappNumber: string;
  announcementText: string;
  freeShippingThreshold: number;
  promoCode: string;
  promoDiscountPercent: number;
  shippingCairoGiza: number;
  shippingAlex: number;
  shippingDeltaCanal: number;
  shippingUpperEgypt: number;
  governorateShippingRates?: Record<string, number>;
  // Deep Store Customization (Shopify-like Theme)
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroTagline?: string;
  heroButtonText: string;
  heroButtonLink?: string;
  heroButtonShow?: boolean;
  heroSecondaryButtonText?: string;
  heroSecondaryButtonAction?: "sizeguide" | "link" | "whatsapp";
  heroSecondaryButtonLink?: string;
  heroSecondaryButtonShow?: boolean;
  heroOverlayDarkness?: "light" | "medium" | "dark";
  heroHeight?: "compact" | "normal" | "large";
  heroContentAlign?: "center" | "right";
  heroKenBurns?: boolean;
  heroImageUrl: string;

  // Trust Strip / Value Proposition Bar
  showTrustBar?: boolean;
  trustBarBg?: "default" | "dark" | "white";
  trustItem1?: string;
  trustItem1Icon?: string;
  trustItem2?: string;
  trustItem2Icon?: string;
  trustItem3?: string;
  trustItem3Icon?: string;
  trustItem4?: string;
  trustItem4Icon?: string;
  trustItem4Show?: boolean;
  splitWomenTitle: string;
  splitWomenSubtitle: string;
  splitWomenImage: string;
  splitMenTitle: string;
  splitMenSubtitle: string;
  splitMenImage: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;

  // Logo & Identity Customizer
  logoType: "text" | "image" | "both";
  logoImageUrl: string;
  brandNameArabic: string;
  brandNameEnglish: string;
  brandSubtitle: string;
  logoHeight: number;

  // Marquee Ticker Customizer
  showMarquee: boolean;
  marqueeSpeed?: "slow" | "normal" | "fast";
  marqueeTheme?: "default" | "dark" | "gold" | "burgundy";
  marqueePauseOnHover?: boolean;

  marqueeShowCountdown: boolean;
  marqueeCountdownLabel?: string;
  marqueeCountdownHours: number;

  marqueeShowFreeShipping: boolean;
  marqueeFreeShippingText?: string;

  marqueeShowPromo: boolean;
  marqueePromoPrefix?: string;

  marqueeShowWarranty: boolean;
  marqueeWarrantyText?: string;

  marqueeShowGiftWrap: boolean;
  marqueeGiftWrapText?: string;

  marqueeCustomText: string;
  marqueeExtraMessages?: MarqueeExtraMessage[];

  // Header Nav & Collections Customizer
  navLinks: NavLinkItem[];
  searchPlaceholder: string;

  // Payment Gateways & Electronic Wallets (InstaPay & Vodafone Cash)
  instaPayNumber: string;
  instaPayAccountName?: string;
  instaPayUsername?: string;
  vodafoneCashNumber: string;
  walletInstructions?: string;
  requireReceiptUpload?: boolean;

  // Paymob Card Payment Gateway
  paymobEnabled?: boolean;
  paymobApiKey?: string;
  paymobIntegrationId?: string;
  paymobIframeId?: string;
  paymobMode?: "test" | "live";

  // Official Outgoing Email (Gmail SMTP)
  senderEmail: string;
  senderEmailName?: string;
  gmailAppPassword?: string;

  // Standalone Shopify-Style Checkout Customizer
  checkoutHeaderTitle?: string;
  checkoutShippingMethodTitle?: string;
  checkoutSecurityBadgeText?: string;
  checkoutEnableCOD?: boolean;
  checkoutEnableWallets?: boolean;
  checkoutEnableCards?: boolean;
  checkoutEnableGiftOption?: boolean;

  // Return & Exchange & Warranty Policies
  returnPolicyDays: number;
  returnPolicyInspectionAllowed: boolean;
  returnPolicyFreeExchange: boolean;
  returnPolicyTitle: string;
  returnPolicyText: string;
  warrantyPolicyText: string;
  shippingPolicyTimeline: string;

  // Custom Categories & Collections
  categories?: StoreCategory[];

  // Individual Collection / Page Customizer
  collectionPages?: Record<string, CollectionPageSetting>;

  // Products Section on Homepage
  productsSectionBadge?: string;
  productsSectionTitle?: string;
  productsSectionSubtitle?: string;

  // Gender Split Showcase Copy
  splitTopButtonText?: string;
  splitTopButtonShow?: boolean;
  splitWomenTag?: string;
  splitWomenEnglishTitle?: string;
  splitWomenButtonText?: string;
  splitWomenLink?: string;
  splitMenTag?: string;
  splitMenEnglishTitle?: string;
  splitMenButtonText?: string;
  splitMenLink?: string;

  // Brand Story Section Copy
  storySectionShow?: boolean;
  storyBadge?: string;
  storyTitle?: string;
  storySubtitle?: string;
  storyPillar1Title?: string;
  storyPillar1Desc?: string;
  storyPillar1Show?: boolean;
  storyPillar2Title?: string;
  storyPillar2Desc?: string;
  storyPillar2Show?: boolean;
  storyPillar3Title?: string;
  storyPillar3Desc?: string;
  storyPillar3Show?: boolean;
  storyPillar4Title?: string;
  storyPillar4Desc?: string;
  storyPillar4Show?: boolean;

  // Silver Care Section Copy
  careSectionShow?: boolean;
  careBadge?: string;
  careTitle?: string;
  careSubtitle?: string;
  careTip1Title?: string;
  careTip1Desc?: string;
  careTip1Show?: boolean;
  careTip2Title?: string;
  careTip2Desc?: string;
  careTip2Show?: boolean;
  careTip3Title?: string;
  careTip3Desc?: string;
  careTip3Show?: boolean;
  careTip4Title?: string;
  careTip4Desc?: string;
  careTip4Show?: boolean;

  // Footer Section Copy & Controls
  footerBrandTitle?: string;
  footerBrandBio?: string;
  footerEnglishTag?: string;
  footerColCategoriesTitle?: string;
  footerColCategoriesShow?: boolean;
  footerColCustomerServiceTitle?: string;
  footerColCustomerServiceShow?: boolean;
  footerSizeGuideText?: string;
  footerSilverCareText?: string;
  footerColContactTitle?: string;
  footerColContactShow?: boolean;
  footerPaymentTitle?: string;
  footerPaymentBadgesText?: string;
  footerCopyrightText?: string;
  footerPassionTagline?: string;

  // Custom Promotional Banner (Positionable)
  promoBannerShow?: boolean;
  promoBannerTitle?: string;
  promoBannerSubtitle?: string;
  promoBannerBadge?: string;
  promoBannerButtonText?: string;
  promoBannerButtonLink?: string;
  promoBannerButtonShow?: boolean;
  promoBannerPosition?: "top" | "after_hero" | "between_products" | "before_care" | "before_footer";
  promoBannerTheme?: "charcoal" | "sand" | "gold" | "burgundy";
  promoBannerImageUrl?: string;

  // Hero Slider Slides (multi-image banner carousel)
  heroSlides?: HeroSlideItem[];

  // Custom Pages
  customPages?: CustomPage[];
}

export interface HeroSlideItem {
  id: string;
  imageUrl: string;
  badge?: string;
  title: string;
  titleLine2?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  overlayDarkness?: "light" | "medium" | "dark";
  contentAlign?: "center" | "right" | "left";
  enabled: boolean;
}

export interface CollectionPageSetting {
  title?: string;
  englishTitle?: string;
  subtitle?: string;
  bannerImage?: string;
  showBanner?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  arabicName: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  image?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  governorate: string;
  address: string;
  notes?: string;
  isGift?: boolean;
  giftMessage?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: "cod" | "wallet" | "card";
  paymentReceiptImage?: string;
  senderWalletNumber?: string;
  cardDetails?: {
    cardHolder?: string;
    cardLast4?: string;
    paymentStatus?: "mock_success" | "pending_paymob" | "authorized";
    transactionId?: string;
  };
  createdAt: string;
  status: "pending" | "confirmed_phone" | "confirmed_whatsapp" | "processing" | "shipped" | "completed" | "cancelled";
  cancellationReason?: string;
  cancelledAt?: string;
  adminNotes?: string;
  phoneConfirmed?: boolean;
  phoneConfirmedAt?: string;
  phoneConfirmationNotes?: string;
  whatsappConfirmed?: boolean;
  whatsappConfirmedAt?: string;
  whatsappCancellation?: boolean;
}

interface StoreContextType {
  // Products
  products: Product[];
  isProductsLoaded: boolean;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;

  // Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;

  // Orders
  orders: Order[];
  refreshOrders: () => Promise<void>;
  addOrder: (orderData: Omit<Order, "id" | "createdAt" | "status">, skipApiPost?: boolean) => string;
  submitOrder: (orderData: Omit<Order, "id" | "createdAt" | "status"> & { promoCode?: string; honeypot?: string }) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  bulkUpdateOrderStatus: (orderIds: string[], status: Order["status"]) => void;
  updateOrderStatus: (orderId: string, status: Order["status"], cancellationReason?: string) => void;
  confirmOrderViaPhone: (orderId: string, phoneNotes?: string) => void;
  confirmOrderViaWhatsApp: (orderId: string) => void;
  cancelOrderViaWhatsApp: (orderId: string, reason: string) => void;
  cancelOrder: (orderId: string, reason: string, adminNotes?: string) => void;
  restoreOrder: (orderId: string) => void;
  updateOrderAdminNotes: (orderId: string, adminNotes: string) => void;
  deleteOrder: (orderId: string) => void;

  // Cart & Wishlist
  cartItems: CartItem[];
  wishlist: Product[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isCheckoutOpen: boolean;
  isSizeGuideOpen: boolean;
  isCustomerModalOpen: boolean;
  quickViewProduct: Product | null;
  appliedPromo: string;
  toasts: ToastMessage[];
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsSizeGuideOpen: (open: boolean) => void;
  setIsCustomerModalOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setAppliedPromo: (promo: string) => void;
  addToast: (title: string, message: string, type?: "cart" | "wishlist" | "promo" | "info") => void;
  removeToast: (id: string) => void;
}

export const DEFAULT_COLLECTION_PAGES: Record<string, CollectionPageSetting> = {
  women: {
    title: "التشكيلة النسائية",
    englishTitle: "WOMEN'S COLLECTION",
    subtitle: "مجوهرات رقيقة صُممت لتبرز أنوثتك وتبقى بصمة استثنائية في كل إطلالة",
    bannerImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  men: {
    title: "التشكيلة الرجالية",
    englishTitle: "MEN'S COLLECTION",
    subtitle: "صياغة ثقيلة وتصاميم عصرية تعكس الهيبة والأصالة بالفضة الإسترليني 925",
    bannerImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  rings: {
    title: "خواتم وسوليتير",
    englishTitle: "RINGS & SOLITAIRES",
    subtitle: "خواتم سوليتير مرصعة بالزركون السويسري وعقيق يماني طبيعي عيار 925",
    bannerImage: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  chains: {
    title: "سلاسل إيطالي ودلايات",
    englishTitle: "ITALIAN CHAINS",
    subtitle: "سلاسل كبح وحبل مجدولة بتشطيب إيطالي بلاتيني مقاوم لتغير اللون",
    bannerImage: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  bracelets: {
    title: "أساور وتنس",
    englishTitle: "BRACELETS & TENNIS",
    subtitle: "أساور تنس متلألئة وبناجر فضة وجلد طبيعي لإطلالة معصم ساحرة",
    bannerImage: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  sets: {
    title: "أطقم ملكية وهدايا",
    englishTitle: "ROYAL GIFT SETS",
    subtitle: "أطقم متكاملة فاخرة للمناسبات الكبرى وشبكة الفضة مع تغليف ملكي",
    bannerImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  earrings: {
    title: "أقراط وحلقان",
    englishTitle: "EARRINGS",
    subtitle: "أقراط فضة إسترليني 925 متدلية ونواعم بتصاميم ساحرة",
    bannerImage: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
  all: {
    title: "كافة روائع ORMA",
    englishTitle: "THE COMPLETE COLLECTION",
    subtitle: "تشكيلة الفضة الإسترليني عيار 925 الإيطالية والتركية الكاملة",
    bannerImage: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1600&q=85",
    showBanner: true,
  },
};

const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: "01143837730",
  announcementText: "شحن مجاني لكافة محافظات مصر على الطلبات المؤكدة اليوم - فضة إسترليني 925 معتمدة",
  freeShippingThreshold: 1500,
  promoCode: "ORMA10",
  promoDiscountPercent: 10,
  shippingCairoGiza: 45,
  shippingAlex: 55,
  shippingDeltaCanal: 65,
  shippingUpperEgypt: 80,
  heroTitle: "مش بتتهدي..\nبتتساب",
  heroSubtitle: "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.",
  heroBadge: "تشكيلة ORMA الحصرية • فضة 925 معتمدة",
  heroTagline: "Not Given, But Left",
  heroButtonText: "تسوّق المجموعة",
  heroButtonLink: "#products",
  heroButtonShow: true,
  heroSecondaryButtonText: "اكتشف ORMA",
  heroSecondaryButtonAction: "link",
  heroSecondaryButtonLink: "#story",
  heroSecondaryButtonShow: true,
  heroOverlayDarkness: "medium",
  heroHeight: "normal",
  heroContentAlign: "center",
  heroKenBurns: true,
  heroImageUrl: "/images/orma/orma-logo-card.jpg",

  // Trust Strip Defaults
  showTrustBar: true,
  trustBarBg: "default",
  trustItem1: "فضة إسترليني معتمدة عيار 925 ومختومة رسمياً",
  trustItem1Icon: "shield",
  trustItem2: "شحن سريع وتغليف آمن ومحكم لكافة المحافظات",
  trustItem2Icon: "truck",
  trustItem3: "استبدال واسترجاع سلس خلال 14 يوماً",
  trustItem3Icon: "refresh",
  trustItem4: "تغليف هدايا ملكي وعلبة فاخرة مجاناً",
  trustItem4Icon: "gift",
  trustItem4Show: false,
  splitWomenTitle: "التشكيلة النسائية",
  splitWomenSubtitle: "مجوهرات رقيقة تبرز أنوثتك وتبقى بصمة استثنائية",
  splitWomenImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
  splitMenTitle: "التشكيلة الرجالية",
  splitMenSubtitle: "صياغة ثقيلة وتصاميم عصرية تعكس الهيبة والأصالة",
  splitMenImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85",
  contactEmail: "theorma.eg@gmail.com",
  senderEmail: "theorma.eg@gmail.com",
  senderEmailName: "ORMA للفضة 925",
  gmailAppPassword: "",
  contactPhone: "+20 114 383 7730",
  contactAddress: "القاهرة، جمهورية مصر العربية (شحن لجميع المحافظات)",
  instagramUrl: "https://instagram.com/ormasilver",
  facebookUrl: "https://facebook.com",
  tiktokUrl: "https://tiktok.com",
  // Logo Defaults
  logoType: "text",
  logoImageUrl: "",
  brandNameArabic: "أورما",
  brandNameEnglish: "ORMA",
  brandSubtitle: "Not Given, But Left",
  logoHeight: 38,
  // Marquee Ticker Defaults
  showMarquee: true,
  marqueeSpeed: "normal",
  marqueeTheme: "default",
  marqueePauseOnHover: true,
  marqueeShowCountdown: true,
  marqueeCountdownLabel: "ينتهي العرض الخاص خلال",
  marqueeCountdownHours: 6,
  marqueeShowFreeShipping: true,
  marqueeFreeShippingText: "شحن مجاني على كافة الطلبات بقيمة 2,500 ج.م أو أكثر لجميع المحافظات",
  marqueeShowPromo: true,
  marqueePromoPrefix: "كوبون ترحيبي 10% خصم إضافي:",
  marqueeShowWarranty: true,
  marqueeWarrantyText: "فضة إسترليني إيطالية وتركية عيار 925 مختومة بضمان رسمي مدى الحياة",
  marqueeShowGiftWrap: true,
  marqueeGiftWrapText: "تغليف إهداء مخملي فاخر مجاناً مع كارت معايدة مخصص لكل طلب",
  marqueeCustomText: "",
  marqueeExtraMessages: [],
  // Nav Links & Collections Defaults
  navLinks: [
    {
      id: "all",
      label: "جميع المنتجات",
      href: "/collection/all",
      visible: true,
      subItems: [
        { label: "كافة المصوغات", href: "/collection/all" },
        { label: "التشكيلة الرجالية", href: "/collection/men" },
        { label: "التشكيلة النسائية", href: "/collection/women" },
        { label: "خواتم وسوليتير", href: "/collection/rings" },
        { label: "سلاسل إيطالي", href: "/collection/chains" },
        { label: "أساور وتنس", href: "/collection/bracelets" },
        { label: "أطقم ملكية", href: "/collection/sets" },
        { label: "أقراط وحلقان", href: "/collection/earrings" },
      ],
    },
    {
      id: "women",
      label: "تشكيلة نسائية",
      href: "/collection/women",
      visible: true,
      badge: "جديد",
      badgeColor: "rose",
      subItems: [
        { label: "كافة التشكيلة النسائية", href: "/collection/women" },
        { label: "خواتم وسوليتير", href: "/collection/rings?gender=women" },
        { label: "سلاسل ودلايات", href: "/collection/chains?gender=women" },
        { label: "أساور وتنس", href: "/collection/bracelets?gender=women" },
        { label: "أقراط وأطقم", href: "/collection/earrings?gender=women" },
        { label: "أطقم ملكية", href: "/collection/sets?gender=women" },
      ],
    },
    {
      id: "men",
      label: "تشكيلة رجالية",
      href: "/collection/men",
      visible: true,
      subItems: [
        { label: "كافة التشكيلة الرجالية", href: "/collection/men" },
        { label: "خواتم رجالي", href: "/collection/rings?gender=men" },
        { label: "سلاسل رجالي", href: "/collection/chains?gender=men" },
        { label: "أساور رجالي", href: "/collection/bracelets?gender=men" },
        { label: "أطقم وهدايا", href: "/collection/sets?gender=men" },
      ],
    },
    {
      id: "rings",
      label: "خواتم",
      href: "/collection/rings",
      visible: true,
      badge: "الأكثر طلباً",
      badgeColor: "amber",
      subItems: [
        { label: "كافة الخواتم", href: "/collection/rings" },
        { label: "خواتم رجالي", href: "/collection/rings?gender=men" },
        { label: "خواتم حريمي", href: "/collection/rings?gender=women" },
      ],
    },
    {
      id: "chains",
      label: "سلاسل",
      href: "/collection/chains",
      visible: true,
      subItems: [
        { label: "كافة السلاسل", href: "/collection/chains" },
        { label: "سلاسل رجالي", href: "/collection/chains?gender=men" },
        { label: "سلاسل حريمي", href: "/collection/chains?gender=women" },
      ],
    },
    {
      id: "bracelets",
      label: "أساور",
      href: "/collection/bracelets",
      visible: true,
      subItems: [
        { label: "كافة الأساور", href: "/collection/bracelets" },
        { label: "أساور رجالي", href: "/collection/bracelets?gender=men" },
        { label: "أساور حريمي", href: "/collection/bracelets?gender=women" },
      ],
    },
    {
      id: "sets",
      label: "أطقم ملكية",
      href: "/collection/sets",
      visible: true,
      badge: "VIP",
      badgeColor: "purple",
      subItems: [
        { label: "كافة الأطقم", href: "/collection/sets" },
        { label: "أطقم رجالية", href: "/collection/sets?gender=men" },
        { label: "أطقم نسائية فاخرة", href: "/collection/sets?gender=women" },
      ],
    },
    { id: "sizeguide", label: "دليل المقاسات", href: "#sizeguide", visible: true },
    { id: "story", label: "عن ORMA", href: "/#story", visible: true },
    { id: "care", label: "العناية بالفضة", href: "/#care", visible: true },
  ],
  searchPlaceholder: "ابحث عن خاتم، سلسلة، عيار 925...",

  // Payment Gateways & Electronic Wallets Defaults
  instaPayNumber: "01143837730",
  instaPayAccountName: "karim mostafa",
  instaPayUsername: "karim@instapay",
  vodafoneCashNumber: "01143837730",
  walletInstructions: "يرجى تحويل إجمالي المبلغ إلى حساب إنستاباي أو محفظة فودافون كاش على الرقم أعلاه، ثم كتابة رقم المحول ورفع لقطة شاشة للإيصال لتأكيد وتجهيز طلبك فورياً.",
  requireReceiptUpload: true,

  // Paymob Defaults
  paymobEnabled: true,
  paymobApiKey: "",
  paymobIntegrationId: "",
  paymobIframeId: "",
  paymobMode: "test",

  // Standalone Shopify-Style Checkout Defaults
  checkoutHeaderTitle: "ORMA للفضة الإسترليني 925",
  checkoutShippingMethodTitle: "شحن قياسي سريع (خلال 2-4 أيام عمل)",
  checkoutSecurityBadgeText: "جميع المعاملات مشفرة وآمنة بنسبة 100%",
  checkoutEnableCOD: true,
  checkoutEnableWallets: true,
  checkoutEnableCards: true,
  checkoutEnableGiftOption: true,
  adminUsers: [],

  // Policies & Guarantee Defaults
  returnPolicyDays: 14,
  returnPolicyInspectionAllowed: false,
  returnPolicyFreeExchange: true,
  returnPolicyTitle: "سياسة الاستبدال والاسترجاع والضمان الملكي",
  returnPolicyText: "شحنات مغلفة بأمان وشرائط حماية لضمان وصول القطعة بحالتها الأصلية. استبدال واسترجاع سلس خلال 14 يوماً في حالة وجود أي عيب مصنعي أو رغبة في استبدال المقاس، بشرط الحفاظ على القطعة والعلبة الأصلية وكارت الضمان.",
  warrantyPolicyText: "ضمان رسمي مدى الحياة على أصالة وجودة الفضة الإسترليني عيار 925 الإيطالية والسويسرية، مع خدمة تلميع وتنظيف احترافي مجانية لجميع عملاء ORMA.",
  shippingPolicyTimeline: "توصيل سريع خلال 24 - 48 ساعة للقاهرة والجيزة والإسكندرية، وخلال 2 - 3 أيام لباقي محافظات الجمهورية مع التنسيق الهاتفي لميعاد الاستلام المناسب لك.",
  categories: DEFAULT_CATEGORIES,
  governorateShippingRates: {
    "القاهرة": 45,
    "الجيزة": 45,
    "القليوبية": 50,
    "الإسكندرية": 50,
    "مطروح (الساحل الشمالي)": 75,
    "الدقهلية (المنصورة)": 55,
    "الشرقية (الزقازيق)": 55,
    "الغربية (طنطا)": 55,
    "المنوفية": 55,
    "البحيرة": 55,
    "كفر الشيخ": 55,
    "دمياط": 55,
    "بورسعيد": 55,
    "الإسماعيلية": 55,
    "السويس": 55,
    "جنوب سيناء (شرم الشيخ)": 80,
    "شمال سيناء": 80,
    "الفيوم": 60,
    "بني سويف": 60,
    "المنيا": 65,
    "أسيوط": 65,
    "سوهاج": 70,
    "قنا": 70,
    "الأقصر": 75,
    "أسوان": 75,
    "البحر الأحمر (الغردقة)": 75,
    "الوادي الجديد": 85,
  },

  // Individual Collection / Page Customizer Defaults
  collectionPages: DEFAULT_COLLECTION_PAGES,

  // Products Section on Homepage
  productsSectionBadge: "SIGNATURE PIECES • روائع ORMA",
  productsSectionTitle: "المجموعة",
  productsSectionSubtitle: "صيغت بعناية من الفضة الإسترليني عيار 925 لتخلد حضورك وتبقى بصمة لا تُمحى",

  // Gender Split Showcase Copy
  splitTopButtonText: "VIEW ALL • كافة القطع",
  splitTopButtonShow: true,
  splitWomenTag: "COLLECTION FOR HER",
  splitWomenEnglishTitle: "Women's",
  splitWomenButtonText: "EXPLORE NOW",
  splitWomenLink: "/collection/women",
  splitMenTag: "COLLECTION FOR HIM",
  splitMenEnglishTitle: "Men's",
  splitMenButtonText: "EXPLORE NOW",
  splitMenLink: "/collection/men",

  // Brand Story Section Copy
  storySectionShow: true,
  storyBadge: "ABOUT ORMA • عن ORMA",
  storyTitle: "القطعة اللي بتفضل\nبعد ما اللحظة تعدّي",
  storySubtitle: "الـ M بين عمودين بيشيل السلسلة والجوهرة، والـ O خاتم مفتوح بخرزة",
  storyPillar1Title: "فضة 925 معتمدة",
  storyPillar1Desc: "نقاء إسترليني أصلي مختوم مع بطاقة ضمان رسمية.",
  storyPillar1Show: true,
  storyPillar2Title: "معالجة روديوم إيطالية",
  storyPillar2Desc: "حماية فائقة من الخدش ولمعان دائم لا يتغير.",
  storyPillar2Show: true,
  storyPillar3Title: "تغليف إهداء فاخر",
  storyPillar3Desc: "علبة مخملية أنيقة، كيس هدايا، ومنديل عناية مجاني.",
  storyPillar3Show: true,
  storyPillar4Title: "استبدال واسترجاع سلس",
  storyPillar4Desc: "استبدال مقاس واسترجاع مضمون وسهل خلال 14 يوماً.",
  storyPillar4Show: true,

  // Silver Care Section Copy
  careSectionShow: true,
  careBadge: "CARE GUIDE • العناية",
  careTitle: "العناية بقطعتك",
  careSubtitle: "خطوات بسيطة للحفاظ على نقاء وبريق قطعتك مدى الحياة.",
  careTip1Title: "الارتداء المستمر",
  careTip1Desc: "الارتداء اليومي الطبيعي يحافظ على نقاء القطعة وحيويتها.",
  careTip1Show: true,
  careTip2Title: "المسح بعد الاستخدام",
  careTip2Desc: "امسحها بقطعة قماش ناعمة وجافة بعد كل استخدام.",
  careTip2Show: true,
  careTip3Title: "الوضع في العلبة",
  careTip3Desc: "احفظها في علبة ORMA المبطنة بمكان جاف عند عدم ارتدائها.",
  careTip3Show: true,
  careTip4Title: "العطور والمواد الكيميائية",
  careTip4Desc: "ارتدِ قطعتك بعد رش العطر لحماية الفضة من التفاعل.",
  careTip4Show: true,

  // Footer Defaults
  footerBrandTitle: "ORMA",
  footerBrandBio: "دار ORMA للمجوهرات الفضية عيار 925 الإيطالية والتركية، نصوغ قطعاً خالدة تجمع بين أصالة المعدن النفيس والأناقة العصرية... Not Given, But Left.",
  footerEnglishTag: "ORMA SILVER JEWELRY 925",
  footerColCategoriesTitle: "أقسام المتجر",
  footerColCategoriesShow: true,
  footerColCustomerServiceTitle: "خدمة العملاء",
  footerColCustomerServiceShow: true,
  footerSizeGuideText: "دليل مقاسات الخواتم",
  footerSilverCareText: "طرق العناية بالفضة",
  footerColContactTitle: "تواصل معنا",
  footerColContactShow: true,
  footerPaymentTitle: "طرق الدفع المعتمدة:",
  footerPaymentBadgesText: "دفع عند الاستلام, فودافون كاش, إنستاباي InstaPay, Visa / Master",
  footerCopyrightText: "© 2026 ORMA (أورما) لفضة 925. جميع الحقوق محفوظة.",
  footerPassionTagline: "Not Given, But Left",

  // Custom Promotional Banner Defaults
  promoBannerShow: true,
  promoBannerTitle: "تألقي ببريق الفضة الإيطالية عيار 925",
  promoBannerSubtitle: "احصل على خصم 10% فوري عند استخدام كود ORMA10 مع شحن مجاني للطلبات المؤكدة اليوم.",
  promoBannerBadge: "عرض استثنائي لفترة محدودة",
  promoBannerButtonText: "تسوق العروض الآن",
  promoBannerButtonLink: "#products",
  promoBannerButtonShow: true,
  promoBannerPosition: "after_hero",
  promoBannerTheme: "charcoal",
  promoBannerImageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=85",
  customPages: DEFAULT_CUSTOM_PAGES,
  heroSlides: [],
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Deleted Orders Blacklist to prevent deleted orders from ever resurrecting
function getDeletedOrderIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("athar_deleted_order_ids");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

function recordDeletedOrderId(orderId: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedOrderIds();
    set.add(orderId);
    localStorage.setItem("athar_deleted_order_ids", JSON.stringify(Array.from(set)));
  } catch {}
}

export function getDeletedProductIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("athar_deleted_product_ids");
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
}

export function recordDeletedProductId(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getDeletedProductIds();
    set.add(productId);
    localStorage.setItem("athar_deleted_product_ids", JSON.stringify(Array.from(set)));
  } catch {}
}

const DEMO_ORDER_IDS = new Set(["ATH-819230", "ATH-928174", "ATH-583920", "ATH-741952", "ORM-819230"]);

// Monotonic sequence tracking: sequence counter NEVER decreases even if orders are deleted
export function getLastOrderSeq(): number {
  if (typeof window === "undefined") return 999;
  try {
    const raw = localStorage.getItem("athar_last_order_seq");
    if (raw) {
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 999) return n;
    }
  } catch {}
  return 999;
}

export function recordLastOrderSeq(seq: number): number {
  if (typeof window === "undefined") return seq;
  try {
    const curr = getLastOrderSeq();
    const highest = Math.max(curr, seq);
    localStorage.setItem("athar_last_order_seq", String(highest));
    return highest;
  } catch {
    return seq;
  }
}

export function extractOrderSequence(id: string): number | null {
  if (!id) return null;
  const m = id.match(/(?:#?(?:ATH|ORM)-?)(\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1000 && n < 100000 && !DEMO_ORDER_IDS.has(id)) {
      return n;
    }
  }
  return null;
}

export function calculateHighestOrderSeq(
  ordersList: Order[] = [],
  storedLastSeq?: number,
  deletedIds: string[] = []
): number {
  let highest = Math.max(999, Number(storedLastSeq) || 999);

  if (Array.isArray(ordersList)) {
    for (const o of ordersList) {
      if (o && o.id) {
        const seq = extractOrderSequence(o.id);
        if (seq !== null && seq > highest) {
          highest = seq;
        }
      }
    }
  }

  if (Array.isArray(deletedIds)) {
    for (const id of deletedIds) {
      if (!id) continue;
      const seq = extractOrderSequence(String(id));
      if (seq !== null && seq > highest) {
        highest = seq;
      }
    }
  }

  return highest;
}

// Helper to generate sequential 4-digit order numbers starting from ORM-1000 (#ORM-1000, #ORM-1001, etc.)
// Strictly monotonic: even if orders are deleted, this sequence never goes backward
export function getNextSequentialOrderId(
  ordersList: Order[] = [],
  storedLastSeq?: number,
  deletedIds: string[] = []
): string {
  const highest = calculateHighestOrderSeq(ordersList, storedLastSeq, deletedIds);
  return `ORM-${highest + 1}`;
}

// Helper to filter out any old demo/mock sample orders or explicitly deleted orders
function sanitizeOrders(rawOrders: unknown): Order[] {
  if (!Array.isArray(rawOrders)) return [];
  const deletedIds = getDeletedOrderIds();
  return (rawOrders as Order[]).filter(
    (o) =>
      o &&
      o.id &&
      !DEMO_ORDER_IDS.has(o.id) &&
      !deletedIds.has(o.id)
  );
}

/** Live snapshot rendered on the server for every request (see app/layout.tsx). */
export interface InitialStoreSnapshot {
  products: Product[];
  settings: Partial<StoreSettings>;
  version: string;
}

/** Merge raw server settings on top of clean defaults (single place used by SSR + client sync). */
function buildSettingsFromServer(raw: Partial<StoreSettings>): StoreSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...raw,
    categories: Array.isArray(raw.categories) ? raw.categories : DEFAULT_CATEGORIES,
    collectionPages: {
      ...DEFAULT_COLLECTION_PAGES,
      ...(raw.collectionPages || {}),
    },
    governorateShippingRates: {
      ...DEFAULT_SETTINGS.governorateShippingRates,
      ...(raw.governorateShippingRates || {}),
    },
    customPages: Array.isArray(raw.customPages) ? raw.customPages : DEFAULT_CUSTOM_PAGES,
    heroSlides: Array.isArray(raw.heroSlides) ? raw.heroSlides : (raw.heroSlides || []),
  };
}

export const StoreProvider: React.FC<{ children: ReactNode; initialStore?: InitialStoreSnapshot | null }> = ({ children, initialStore }) => {
  // Cloud-Truth: when the server rendered a live snapshot we start from it (no flash of old data).
  // Otherwise products start empty so clients NEVER show old static/hardcoded products.
  const [products, setProducts] = useState<Product[]>(() =>
    initialStore && Array.isArray(initialStore.products) ? initialStore.products.filter((p) => p && p.id) : []
  );
  const [isProductsLoaded, setIsProductsLoaded] = useState<boolean>(Boolean(initialStore));

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    // Live server snapshot wins over any browser-stored copy (browser copies can be stale).
    if (initialStore && initialStore.settings && typeof initialStore.settings === "object") {
      return buildSettingsFromServer(initialStore.settings);
    }
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem("athar_store_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          categories:
            Array.isArray(parsed.categories)
              ? parsed.categories
              : DEFAULT_CATEGORIES,
          collectionPages: {
            ...DEFAULT_COLLECTION_PAGES,
            ...(parsed.collectionPages || {}),
          },
          governorateShippingRates: {
            ...DEFAULT_SETTINGS.governorateShippingRates,
            ...(parsed.governorateShippingRates || {}),
          },
          customPages:
            Array.isArray(parsed.customPages)
              ? parsed.customPages
              : DEFAULT_CUSTOM_PAGES,
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("athar_orders");
      if (saved) {
        const cleaned = sanitizeOrders(JSON.parse(saved));
        localStorage.setItem("athar_orders", JSON.stringify(cleaned));
        return cleaned;
      }
    } catch {}
    return [];
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("athar_cart");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("athar_wishlist");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state tracking to prevent duplicate re-renders and unnecessary network traffic
  const lastServerUpdatedRef = useRef<string>(initialStore?.version || "");
  const isSyncingRef = useRef<boolean>(false);
  const lastSyncTimestampRef = useRef<number>(0);
  const lastLocalOrderMutationRef = useRef<number>(0);
  const ordersRef = useRef<Order[]>(orders);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Background Central Server Sync (Optimized & non-blocking)
  const syncWithServer = useCallback((force = false) => {
    const now = Date.now();
    // Allow checks every 15 seconds or immediately if forced
    if (!force && now - lastSyncTimestampRef.current < 15000) return;
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    lastSyncTimestampRef.current = now;

    const authHeaders = getAdminAuthHeaders();

    fetch(force ? `/api/data?t=${now}&v=${BUILD_ID}` : `/api/data?v=${BUILD_ID}`, {
      cache: "no-store",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        ...authHeaders,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        // Auto Version Detection & Cache Buster:
        // Detect if the running server has a newer build than the client browser cache
        if (typeof window !== "undefined" && data.buildId) {
          try {
            const storedBuildId = localStorage.getItem("athar_client_build_id");
            if (!storedBuildId) {
              localStorage.setItem("athar_client_build_id", data.buildId);
            } else if (storedBuildId !== data.buildId) {
              console.log(`[Cache Buster] New deployment detected: Server (${data.buildId}) != Client (${storedBuildId}). Refreshing cached assets...`);
              localStorage.setItem("athar_client_build_id", data.buildId);
              
              // Clear stale product & settings cache in localStorage without wiping session tokens or user cart
              localStorage.removeItem("athar_custom_products");
              localStorage.removeItem("athar_store_settings");

              // If browser supports caches API, evict stale responses
              if ("caches" in window) {
                caches.keys().then((names) => {
                  names.forEach((name) => {
                    caches.delete(name);
                  });
                }).catch(() => {});
              }

              // Trigger an immediate non-destructive cache bypass reload
              setTimeout(() => {
                window.location.reload();
              }, 400);
              return;
            }
          } catch {}
        }

        // If the server data hasn't changed since our last check, avoid unnecessary re-rendering
        if (data.updatedAt && data.updatedAt === lastServerUpdatedRef.current && !force) {
          return;
        }
        lastServerUpdatedRef.current = data.updatedAt || "";

        // Cloud-Truth Only: Server product catalog is the single source of truth
        if (Array.isArray(data.products)) {
          const deletedProdIds = getDeletedProductIds();
          const serverProds = data.products.filter((p: Product) => p && p.id && !deletedProdIds.has(p.id));
          setProducts(serverProds);
          setIsProductsLoaded(true);
          try {
            // Evict stale custom products keys to prevent phone caching old products
            localStorage.removeItem("athar_custom_products");
          } catch {}
        }

        // Cloud-Truth Only: Server settings is the single source of truth
        if (data.settings && typeof data.settings === "object") {
          // Full replace on top of clean defaults, without blending stale local state
          const serverSettings: StoreSettings = buildSettingsFromServer(data.settings);
          setStoreSettings(serverSettings);
          try {
            localStorage.setItem("athar_store_settings", JSON.stringify(serverSettings));
          } catch {}
        }

        if (typeof data.lastOrderSeq === "number") {
          recordLastOrderSeq(data.lastOrderSeq);
        }

        if (Array.isArray(data.deletedOrderIds)) {
          data.deletedOrderIds.forEach((id: string) => recordDeletedOrderId(id));
        }

        // Only update orders if server returned them (i.e. logged-in admin)
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          const serverOrders = sanitizeOrders(data.orders);
          setOrders((prev) => {
            const orderMap = new Map<string, Order>();
            // Server orders are the single source of truth
            for (const o of serverOrders) {
              if (o && o.id) orderMap.set(o.id, o);
            }
            // Retain any pending local orders not yet reflected on server
            for (const o of prev) {
              if (o && o.id && !orderMap.has(o.id)) {
                orderMap.set(o.id, o);
              }
            }
            const merged = Array.from(orderMap.values()).sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            ordersRef.current = merged;
            try {
              localStorage.setItem("athar_orders", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn("Could not sync with /api/data:", err);
      })
      .finally(() => {
        isSyncingRef.current = false;
      });
  }, []);

  // Explicitly fetch and sync orders directly from /api/orders (Strictly for authenticated admin)
  const refreshOrders = useCallback(async () => {
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders["Authorization"] && !authHeaders["x-orma-admin-token"] && !authHeaders["x-athar-admin-token"]) {
      return;
    }
    try {
      const res = await fetch(`/api/orders?t=${Date.now()}&v=${BUILD_ID}`, {
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          ...authHeaders,
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const serverOrders = sanitizeOrders(data.orders);
        setOrders((prev) => {
          const orderMap = new Map<string, Order>();
          for (const o of serverOrders) {
            if (o && o.id) orderMap.set(o.id, o);
          }
          for (const o of prev) {
            if (o && o.id && !orderMap.has(o.id)) {
              orderMap.set(o.id, o);
            }
          }
          const merged = Array.from(orderMap.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          ordersRef.current = merged;
          try {
            localStorage.setItem("athar_orders", JSON.stringify(merged));
          } catch {}
          return merged;
        });

        if (typeof data.lastOrderSeq === "number") {
          recordLastOrderSeq(data.lastOrderSeq);
        }
        if (Array.isArray(data.deletedOrderIds)) {
          data.deletedOrderIds.forEach((id: string) => recordDeletedOrderId(id));
        }
      }
    } catch (err) {
      console.warn("Could not fetch orders from /api/orders:", err);
    }
  }, []);

  // Synchronize with server: on mount, when returning to the tab / app, when a page is restored
  // from the back-forward cache (iOS Safari, in-app browsers), when the network comes back, and
  // via a tiny version probe every 60s for long-lived tabs.
  useEffect(() => {
    const hasAdminSession = () => {
      const h = getAdminAuthHeaders();
      return Boolean(h["Authorization"] || h["x-orma-admin-token"] || h["x-athar-admin-token"]);
    };

    // Cheap probe: only download the full catalog when the server says something changed.
    const checkCatalogVersion = () => {
      fetch(`/api/version?t=${Date.now()}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
        .then((res) => res.json())
        .then((v) => {
          if (v && v.catalogVersion && v.catalogVersion !== lastServerUpdatedRef.current) {
            syncWithServer(true);
          }
        })
        .catch(() => {});
    };

    // 1. Initial sync. With a live server snapshot the page is already fresh, so for visitors we
    //    only probe the version; admins (orders, private settings) always do the full fetch.
    if (initialStore && !hasAdminSession()) {
      checkCatalogVersion();
    } else {
      syncWithServer(true);
    }

    // 2. Re-check whenever the visitor comes back to the page
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (hasAdminSession()) syncWithServer(false);
        else checkCatalogVersion();
      }
    };
    const onWindowFocus = () => {
      if (hasAdminSession()) syncWithServer(false);
      else checkCatalogVersion();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      // persisted === true: restored from bfcache with whatever data it had when it was frozen
      if (e.persisted) syncWithServer(true);
    };
    const onOnline = () => syncWithServer(true);

    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !hasAdminSession()) checkCatalogVersion();
    }, 60000);

    return () => {
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(interval);
    };
  }, [syncWithServer, initialStore]);

  // Instant cross-tab sync on same device (0ms latency between admin tab & storefront tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "athar_orders" && e.newValue) {
        try {
          setOrders(sanitizeOrders(JSON.parse(e.newValue)));
        } catch {}
      } else if (e.key === "athar_custom_products" && e.newValue) {
        try {
          const prods = JSON.parse(e.newValue);
          if (Array.isArray(prods) && prods.length > 0) setProducts(prods);
        } catch {}
      } else if (e.key === "athar_store_settings" && e.newValue) {
        try {
          const stngs = JSON.parse(e.newValue);
          if (stngs && typeof stngs === "object") setStoreSettings((prev) => ({ ...prev, ...stngs }));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Live cross-frame preview synchronization (Shopify Model: instant 0ms preview updates)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        (e.data?.type === "ORMA_SETTINGS_UPDATE" || e.data?.type === "ATHAR_SETTINGS_UPDATE") &&
        e.data.settings &&
        typeof e.data.settings === "object"
      ) {
        setStoreSettings((prev) => ({
          ...prev,
          ...e.data.settings,
        }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Do not store products in localStorage to avoid stale phone cache; server is sole source of truth
  useEffect(() => {
    try {
      localStorage.removeItem("athar_custom_products");
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("athar_store_settings", JSON.stringify(storeSettings));
    } catch {
      // Ignore
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem("athar_orders", JSON.stringify(orders));
    } catch {
      // Ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem("athar_cart", JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem("athar_wishlist", JSON.stringify(wishlist));
    } catch {
      // Ignore
    }
  }, [wishlist]);

  // Toast notification (ultra-sleek, compact, capped at 2, quick 2.2s auto-dismiss)
  const addToast = (
    title: string,
    message: string,
    type: "cart" | "wishlist" | "promo" | "info" = "info"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => {
      const trimmed = prev.slice(-1);
      return [...trimmed, newToast];
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // A failed save used to be swallowed silently: the admin's own device kept the edit in local
  // state/localStorage and looked fine, while the database (and therefore every customer) never
  // received it. Make that impossible to miss.
  const reportSaveFailure = (what: string, status: number, serverMessage?: string) => {
    const reason =
      status === 401
        ? "انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى من صفحة الأدمن ثم أعد التعديل."
        : status === 0
        ? "تعذّر الاتصال بالسيرفر. تأكد من الإنترنت ثم أعد المحاولة."
        : serverMessage || `خطأ من السيرفر (${status}).`;
    console.error(`Save failed (${what}):`, status, serverMessage);
    if (typeof window !== "undefined") {
      window.alert(`⚠️ لم يتم حفظ تعديلات ${what} على الموقع!\n\nالتعديل ظاهر عندك فقط ولن يراه العملاء.\n${reason}`);
    }
  };

  // Helper to sync products to server
  const syncProductsToServer = (prods: Product[]) => {
    fetch("/api/products", {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ products: prods }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          reportSaveFailure("المنتجات", res.status, data?.error);
          return;
        }
        if (data.updatedAt) lastServerUpdatedRef.current = data.updatedAt;
      })
      .catch((err) => {
        console.warn("Could not sync products to server:", err);
        reportSaveFailure("المنتجات", 0);
      });
  };

  // High-performance concurrency engine for orders:
  // 1. Instant optimistic state mutation (0ms)
  // 2. Instant local persistence & BroadcastChannel cross-tab notification
  // 3. Debounced atomic cloud sync to coalesce multi-actions without race conditions
  const orderSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOrderSyncingRef = useRef<boolean>(false);
  const hasPendingOrderSyncRef = useRef<boolean>(false);
  const orderBroadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // BroadcastChannel for instant cross-tab order synchronization
  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("orma_orders_sync_channel");
        orderBroadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          if (event.data?.type === "ORDERS_UPDATE" && Array.isArray(event.data.orders)) {
            const incoming = sanitizeOrders(event.data.orders);
            ordersRef.current = incoming;
            setOrders(incoming);
          }
        };

        return () => {
          channel.close();
        };
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }
  }, []);

  const flushOrdersSync = useCallback(() => {
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders["Authorization"] && !authHeaders["x-orma-admin-token"] && !authHeaders["x-athar-admin-token"]) {
      isOrderSyncingRef.current = false;
      hasPendingOrderSyncRef.current = false;
      return;
    }

    if (isOrderSyncingRef.current) {
      hasPendingOrderSyncRef.current = true;
      return;
    }

    isOrderSyncingRef.current = true;
    hasPendingOrderSyncRef.current = false;

    const currentSnapshot = ordersRef.current;
    const currentSeq = getLastOrderSeq();
    const deletedArr = Array.from(getDeletedOrderIds());

    fetch("/api/orders", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        orders: currentSnapshot,
        lastOrderSeq: currentSeq,
        deletedOrderIds: deletedArr,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.updatedAt) lastServerUpdatedRef.current = data.updatedAt;
        if (data.lastOrderSeq) recordLastOrderSeq(data.lastOrderSeq);
      })
      .catch((err) => console.warn("Could not sync orders to server:", err))
      .finally(() => {
        isOrderSyncingRef.current = false;
        if (hasPendingOrderSyncRef.current) {
          flushOrdersSync();
        }
      });
  }, []);

  const scheduleOrdersSync = useCallback(
    (immediate = false) => {
      if (orderSyncTimeoutRef.current) {
        clearTimeout(orderSyncTimeoutRef.current);
        orderSyncTimeoutRef.current = null;
      }

      if (immediate) {
        flushOrdersSync();
      } else {
        // 180ms debounce coalesces concurrent status updates into a single atomic PUT
        orderSyncTimeoutRef.current = setTimeout(() => {
          flushOrdersSync();
        }, 180);
      }
    },
    [flushOrdersSync]
  );

  // Optimistic order updater: updates React state & localStorage instantaneously (0ms),
  // broadcasts across all tabs, and schedules atomic server sync
  const applyOrdersMutation = useCallback(
    (
      mutationFn: (prev: Order[]) => Order[],
      immediateSync = false,
      skipPutSync = false
    ) => {
      lastLocalOrderMutationRef.current = Date.now();
      setOrders((prev) => {
        const next = mutationFn(prev);
        ordersRef.current = next;

        try {
          localStorage.setItem("athar_orders", JSON.stringify(next));
        } catch {}

        try {
          orderBroadcastChannelRef.current?.postMessage({
            type: "ORDERS_UPDATE",
            orders: next,
          });
        } catch {}

        return next;
      });

      if (!skipPutSync) {
        scheduleOrdersSync(immediateSync);
      }
    },
    [scheduleOrdersSync]
  );


  // Helper to sync settings to server
  const syncSettingsToServer = (stngs: Partial<StoreSettings>) => {
    fetch("/api/admin/settings", {
      method: "POST",
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ settings: stngs }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          reportSaveFailure("الإعدادات", res.status, data?.error);
          return;
        }
        if (data.updatedAt) lastServerUpdatedRef.current = data.updatedAt;
      })
      .catch((err) => {
        console.warn("Could not sync settings to server:", err);
        reportSaveFailure("الإعدادات", 0);
      });
  };

  // Products CRUD
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      try {
        localStorage.setItem("athar_custom_products", JSON.stringify(updated));
      } catch {}
      syncProductsToServer(updated);
      return updated;
    });
    addToast("إدارة المنتجات", `تمت إضافة القطعة "${newProduct.arabicName}" بنجاح`, "info");
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      try {
        localStorage.setItem("athar_custom_products", JSON.stringify(updatedList));
      } catch {}
      syncProductsToServer(updatedList);
      return updatedList;
    });
    addToast("إدارة المنتجات", "تم تحديث بيانات القطعة بنجاح", "info");
  };

  const deleteProduct = (id: string) => {
    recordDeletedProductId(id);
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem("athar_custom_products", JSON.stringify(updated));
      } catch {}
      syncProductsToServer(updated);
      return updated;
    });
    addToast("إدارة المنتجات", "تم حذف القطعة من المتجر", "info");
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    localStorage.removeItem("athar_custom_products");
    syncProductsToServer(PRODUCTS);
    addToast("إدارة المنتجات", "تمت استعادة كتالوج المنتجات الافتراضي", "info");
  };

  // Store Settings
  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem("athar_store_settings", JSON.stringify(merged));
      } catch {}
      syncSettingsToServer(merged);
      return merged;
    });
    addToast("إعدادات المتجر", "تم حفظ إعدادات المتجر في السحابة بنجاح", "info");
  };

  // Orders Management (High-Performance Zero-Lag Concurrency)
  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "status">, skipApiPost: boolean = false) => {
    // Generate sequential 4-digit order number starting at ATH-1000 (#ATH-1000, #ATH-1001, ...)
    const deletedArr = Array.from(getDeletedOrderIds());
    const storedLastSeq = getLastOrderSeq();
    const newId = getNextSequentialOrderId(ordersRef.current, storedLastSeq, deletedArr);

    // Immediately record this sequence number so it is permanently consumed
    const seq = extractOrderSequence(newId);
    if (seq !== null) {
      recordLastOrderSeq(seq);
    }

    const newOrder: Order = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    applyOrdersMutation((prev) => [newOrder, ...prev], false, true);

    // Optimistically update stock in products state
    setProducts((prev) =>
      prev.map((p) => {
        const item = orderData.items.find((it) => it.productId === p.id);
        if (!item) return p;
        const curStock = p.stockQuantity !== undefined ? p.stockQuantity : (p.inStock ? 10 : 0);
        const newStock = Math.max(0, curStock - (Number(item.quantity) || 1));
        return {
          ...p,
          stockQuantity: newStock,
          inStock: newStock > 0,
        };
      })
    );

    // Dispatch order via POST /api/orders ONLY if not explicitly handled by caller
    if (!skipApiPost) {
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.order) {
            applyOrdersMutation(
              (prev) => [data.order, ...prev.filter((o) => o.id !== data.order.id)],
              false,
              true
            );
          }
        })
        .catch((err) => console.error("Error dispatching order to /api/orders:", err));
    }

    return newId;
  };

  const submitOrder = async (
    orderData: Omit<Order, "id" | "createdAt" | "status"> & { promoCode?: string; honeypot?: string }
  ): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: orderData }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "تعذر إتمام الطلب، يرجى مراجعة البيانات والمحاولة مجدداً.",
        };
      }

      const verifiedOrder = data.order as Order;
      if (verifiedOrder) {
        applyOrdersMutation((prev) => [verifiedOrder, ...prev.filter((o) => o.id !== verifiedOrder.id)], false, true);
      }

      return {
        success: true,
        orderId: data.orderId || verifiedOrder?.id,
      };
    } catch (err) {
      console.error("Order submission network error:", err);
      return {
        success: false,
        error: "تعذر الاتصال بالخادم لتسجيل الطلب. يرجى التأكد من اتصال الإنترنت والمحاولة مجدداً.",
      };
    }
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    applyOrdersMutation((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
    addToast("تحديث الطلب", `تم تحديث بيانات الطلب #${orderId}`, "info");
  };

  const bulkUpdateOrderStatus = (orderIds: string[], status: Order["status"]) => {
    if (!orderIds || orderIds.length === 0) return;
    const idsSet = new Set(orderIds);
    applyOrdersMutation((prev) =>
      prev.map((o) => (idsSet.has(o.id) ? { ...o, status } : o))
    );
    addToast("تحديث جماعي", `تم تحديث حالة ${orderIds.length} طلبات بنجاح`, "info");
  };

  const updateOrderStatus = (orderId: string, status: Order["status"], cancellationReason?: string) => {
    applyOrdersMutation((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              cancellationReason: status === "cancelled" ? (cancellationReason || o.cancellationReason) : undefined,
              cancelledAt: status === "cancelled" ? (o.cancelledAt || new Date().toISOString()) : undefined,
            }
          : o
      )
    );
    addToast("الطلبات", `تم تحديث حالة الطلب #${orderId}`, "info");
  };

  const cancelOrder = (orderId: string, reason: string, adminNotes?: string) => {
    applyOrdersMutation((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled" as Order["status"],
              cancellationReason: reason,
              cancelledAt: new Date().toISOString(),
              adminNotes: adminNotes !== undefined ? adminNotes : o.adminNotes,
            }
          : o
      )
    );
    addToast("إلغاء الطلب", `تم تسجيل إلغاء الطلب #${orderId} وحفظ السبب`, "info");
  };

  const restoreOrder = (orderId: string) => {
    applyOrdersMutation((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "pending" as Order["status"],
              cancellationReason: undefined,
              cancelledAt: undefined,
            }
          : o
      )
    );
    addToast("استعادة الطلب", `تمت استعادة الطلب #${orderId} إلى قيد التأكيد`, "info");
  };

  const updateOrderAdminNotes = (orderId: string, adminNotes: string) => {
    applyOrdersMutation((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, adminNotes } : o))
    );
    addToast("ملاحظات الطلب", `تم حفظ الملاحظة للطلب #${orderId}`, "info");
  };

  const confirmOrderViaPhone = (orderId: string, phoneNotes?: string) => {
    const nowIso = new Date().toISOString();
    applyOrdersMutation((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "confirmed_phone",
              phoneConfirmed: true,
              phoneConfirmedAt: nowIso,
              phoneConfirmationNotes: phoneNotes,
              adminNotes: o.adminNotes
                ? `${o.adminNotes} | [تأكيد هاتفياً]: ${phoneNotes || "تم التواصل مع العميل هاتفياً وتأكيد رغبة الاستلام وميعاد الشحن"}`
                : `[تأكيد هاتفياً]: ${phoneNotes || "تم التواصل مع العميل هاتفياً وتأكيد رغبة الاستلام وميعاد الشحن"}`,
            }
          : o
      )
    );
    addToast("تأكيد هاتفي", `تم تأكيد الطلب #${orderId} هاتفياً بنجاح`, "info");
  };

  const confirmOrderViaWhatsApp = (orderId: string) => {
    const nowIso = new Date().toISOString();
    applyOrdersMutation((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "confirmed_whatsapp",
              whatsappConfirmed: true,
              whatsappConfirmedAt: nowIso,
              adminNotes: o.adminNotes
                ? `${o.adminNotes} | [تأكيد واتساب]: تم تأكيد رغبة الاستلام عبر واتساب`
                : "[تأكيد واتساب]: تم تأكيد رغبة الاستلام عبر واتساب",
            }
          : o
      )
    );
    addToast("تأكيد واتساب", `تم تأكيد رغبة استلام الطلب #${orderId} عبر واتساب`, "info");
  };

  const cancelOrderViaWhatsApp = (orderId: string, reason: string) => {
    const nowIso = new Date().toISOString();
    applyOrdersMutation((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              whatsappCancellation: true,
              cancellationReason: `إلغاء من العميل عبر واتساب: ${reason}`,
              cancelledAt: nowIso,
              adminNotes: o.adminNotes
                ? `${o.adminNotes} | [إلغاء واتساب]: ${reason}`
                : `[إلغاء واتساب]: قام العميل بإلغاء الطلب من خلال رابط الواتساب - السبب: ${reason}`,
            }
          : o
      )
    );
    addToast("إلغاء الطلب", `تم إلغاء الطلب #${orderId} بناءً على رغبة العميل عبر واتساب`, "info");
  };

  const deleteOrder = (orderId: string) => {
    recordDeletedOrderId(orderId);
    // Crucial: preserve sequence number of deleted order so it can NEVER be reused
    const seq = extractOrderSequence(orderId);
    if (seq !== null) {
      recordLastOrderSeq(seq);
    }
    applyOrdersMutation((prev) => prev.filter((o) => o.id !== orderId), true);
    fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: "DELETE",
    }).catch((err) => console.warn("Error deleting order from server:", err));
    addToast("الطلبات", `تم حذف الطلب #${orderId} نهائياً وحفظ تسلسله لعدم التكرار`, "info");
  };

  // Cart operations
  const addToCart = (product: Product, size?: string, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedSize: size }];
    });
    addToast(
      "ORMA في سلتك",
      `تمت إضافة "${product.arabicName}" بنجاح`,
      "cart"
    );
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Wishlist
  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      addToast("المفضلة", `تمت إزالة "${product.arabicName}" من المفضلة`, "wishlist");
    } else {
      setWishlist((prev) => [...prev, product]);
      addToast("المفضلة", `تمت إضافة "${product.arabicName}" إلى المفضلة`, "wishlist");
    }
  };

  const isWishlisted = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  // Totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (appliedPromo === storeSettings.promoCode) {
      return Math.round((subtotal * storeSettings.promoDiscountPercent) / 100);
    }
    if (appliedPromo === "ORMA20" || appliedPromo === "ATHAR20") return Math.round(subtotal * 0.2);
    return 0;
  }, [appliedPromo, subtotal, storeSettings]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        products,
        isProductsLoaded,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,
        storeSettings,
        updateStoreSettings,
        orders,
        refreshOrders,
        addOrder,
        submitOrder,
        updateOrder,
        bulkUpdateOrderStatus,
        updateOrderStatus,
        confirmOrderViaPhone,
        confirmOrderViaWhatsApp,
        cancelOrderViaWhatsApp,
        cancelOrder,
        restoreOrder,
        updateOrderAdminNotes,
        deleteOrder,
        cartItems,
        wishlist,
        isCartOpen,
        isWishlistOpen,
        isCheckoutOpen,
        isSizeGuideOpen,
        quickViewProduct,
        appliedPromo,
        toasts,
        cartCount,
        wishlistCount,
        subtotal,
        discountAmount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isWishlisted,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsCheckoutOpen,
        setIsSizeGuideOpen,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        setQuickViewProduct,
        setAppliedPromo,
        addToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

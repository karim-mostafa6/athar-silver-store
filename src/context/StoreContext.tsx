"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback, ReactNode } from "react";
import { Product, CartItem, PRODUCTS, StoreCategory, DEFAULT_CATEGORIES, CustomPage, DEFAULT_CUSTOM_PAGES } from "@/data/products";
import { ToastMessage } from "@/components/Toast";

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

export interface StoreSettings {
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
  splitMenTag?: string;
  splitMenEnglishTitle?: string;
  splitMenButtonText?: string;

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
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;

  // Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;

  // Orders
  orders: Order[];
  addOrder: (orderData: Omit<Order, "id" | "createdAt" | "status">) => string;
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
  setQuickViewProduct: (product: Product | null) => void;
  setAppliedPromo: (promo: string) => void;
  addToast: (title: string, message: string, type?: "cart" | "wishlist" | "promo" | "info") => void;
  removeToast: (id: string) => void;
}

export const DEFAULT_COLLECTION_PAGES: Record<string, CollectionPageSetting> = {
  women: {
    title: "التشكيلة النسائية",
    englishTitle: "WOMEN'S COLLECTION",
    subtitle: "مجوهرات رقيقة صُممت لتبرز أنوثتك وتترك أثراً استثنائياً في كل إطلالة",
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
    title: "كافة روائع أَثَـر",
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
  promoCode: "ATHAR10",
  promoDiscountPercent: 10,
  shippingCairoGiza: 45,
  shippingAlex: 55,
  shippingDeltaCanal: 65,
  shippingUpperEgypt: 80,
  heroTitle: "الأَثَر لا يُهدى\nبل يُترك",
  heroSubtitle: "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.",
  heroBadge: "تشكيلة 2026 الحصرية • فضة إيطالية 925 معتمدة",
  heroTagline: "الأثر لا يُهدى بل يُترك",
  heroButtonText: "تسوق المجموعة",
  heroButtonLink: "#products",
  heroButtonShow: true,
  heroSecondaryButtonText: "اكتشف أثر",
  heroSecondaryButtonAction: "link",
  heroSecondaryButtonLink: "#story",
  heroSecondaryButtonShow: true,
  heroOverlayDarkness: "medium",
  heroHeight: "normal",
  heroContentAlign: "center",
  heroKenBurns: true,
  heroImageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=85",

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
  splitWomenSubtitle: "مجوهرات رقيقة تبرز أنوثتك وتترك أثراً استثنائياً",
  splitWomenImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=85",
  splitMenTitle: "التشكيلة الرجالية",
  splitMenSubtitle: "صياغة ثقيلة وتصاميم عصرية تعكس الهيبة والأصالة",
  splitMenImage: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1200&q=85",
  contactEmail: "theathar.eg@gmail.com",
  senderEmail: "theathar.eg@gmail.com",
  senderEmailName: "أَثَـر للفضة 925",
  gmailAppPassword: "ycdnslfhhbuvghnf",
  contactPhone: "+20 114 383 7730",
  contactAddress: "القاهرة، جمهورية مصر العربية (شحن لجميع المحافظات)",
  instagramUrl: "https://instagram.com",
  facebookUrl: "https://facebook.com",
  tiktokUrl: "https://tiktok.com",
  // Logo Defaults
  logoType: "text",
  logoImageUrl: "",
  brandNameArabic: "أَثَـر",
  brandNameEnglish: "ATHAR",
  brandSubtitle: "فضة إسترليني عيار 925",
  logoHeight: 34,
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
    { id: "story", label: "عن أَثَر", href: "/#story", visible: true },
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

  // Policies & Guarantee Defaults
  returnPolicyDays: 14,
  returnPolicyInspectionAllowed: false,
  returnPolicyFreeExchange: true,
  returnPolicyTitle: "سياسة الاستبدال والاسترجاع والضمان الملكي",
  returnPolicyText: "شحنات مغلفة بأمان وشرائط حماية لضمان وصول القطعة بحالتها الأصلية. استبدال واسترجاع سلس خلال 14 يوماً في حالة وجود أي عيب مصنعي أو رغبة في استبدال المقاس، بشرط الحفاظ على القطعة والعلبة الأصلية وكارت الضمان.",
  warrantyPolicyText: "ضمان رسمي مدى الحياة على أصالة وجودة الفضة الإسترليني عيار 925 الإيطالية والسويسرية، مع خدمة تلميع وتنظيف احترافي مجانية لجميع عملاء أَثَر.",
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
  productsSectionBadge: "SIGNATURE PIECES • روائع أَثَـر",
  productsSectionTitle: "المجموعة الملكية المختارة",
  productsSectionSubtitle: "صيغت بعناية من الفضة الإسترليني عيار 925 لتترك أثراً استثنائياً في كل حضور",

  // Gender Split Showcase Copy
  splitTopButtonText: "VIEW ALL • كافة القطع",
  splitTopButtonShow: true,
  splitWomenTag: "COLLECTION FOR HER",
  splitWomenEnglishTitle: "Women's",
  splitWomenButtonText: "EXPLORE NOW",
  splitMenTag: "COLLECTION FOR HIM",
  splitMenEnglishTitle: "Men's",
  splitMenButtonText: "EXPLORE NOW",

  // Brand Story Section Copy
  storySectionShow: true,
  storyBadge: "ABOUT ATHAR • عن أَثَر",
  storyTitle: "أثر: ما يبقى طويلاً\nبعد أن تمضي اللحظة",
  storySubtitle: "نصنع كل قطعة في أثر من الفضة الإسترليني عيار 925 لتكون أكثر من مجرد زينة، بل بصمة وذكرى تتناقلها الأيام وتخلد أدق تفاصيلك.",
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
  careTip1Title: "العطور والمواد الكيميائية",
  careTip1Desc: "ارتدِ قطعتك بعد رش العطر لحماية الفضة من التفاعل.",
  careTip1Show: true,
  careTip2Title: "الحفظ في العلبة",
  careTip2Desc: "احفظها في علبة أثر المبطنة بمكان جاف عند عدم ارتدائها.",
  careTip2Show: true,
  careTip3Title: "المسح بعد الاستخدام",
  careTip3Desc: "امسحها بقطعة قماش ناعمة وجافة بعد كل استخدام.",
  careTip3Show: true,
  careTip4Title: "الارتداء المستمر",
  careTip4Desc: "الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها.",
  careTip4Show: true,

  // Footer Defaults
  footerBrandTitle: "أَثَـر",
  footerBrandBio: "براند مصري راقٍ متخصص في الفضة الإسترليني عيار 925 الإيطالية والتركية، نصوغ قطعاً خالدة تجمع بين أصالة المعدن النفيس والأناقة العصرية لتترك أثراً استثنائياً في كل مكان.",
  footerEnglishTag: "ATHAR SILVER JEWELRY 925",
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
  footerCopyrightText: "© 2026 أَثَر (ATHAR) لفضة 925. جميع الحقوق محفوظة.",
  footerPassionTagline: "صُنع بحرفية وشغف ليترك أثراً لا يُمحى",

  // Custom Promotional Banner Defaults
  promoBannerShow: true,
  promoBannerTitle: "تألقي ببريق الفضة الإيطالية عيار 925",
  promoBannerSubtitle: "احصل على خصم 10% فوري عند استخدام كود ATHAR10 مع شحن مجاني للطلبات المؤكدة اليوم.",
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

const DEMO_ORDER_IDS = new Set(["ATH-819230", "ATH-928174", "ATH-583920", "ATH-741952"]);
const DEMO_NAMES = new Set(["مريم خالد", "سارة أحمد", "محمود إبراهيم", "كريم يوسف"]);

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
  const m = id.match(/(?:#?ATH-?)(\d+)/i);
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

// Helper to generate sequential 4-digit order numbers starting from ATH-1000 (#ATH-1000, #ATH-1001, etc.)
// Strictly monotonic: even if orders are deleted, this sequence never goes backward
export function getNextSequentialOrderId(
  ordersList: Order[] = [],
  storedLastSeq?: number,
  deletedIds: string[] = []
): string {
  const highest = calculateHighestOrderSeq(ordersList, storedLastSeq, deletedIds);
  return `ATH-${highest + 1}`;
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
      !DEMO_NAMES.has(o.customerName) &&
      !deletedIds.has(o.id)
  );
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Ultra-fast synchronous lazy initialization from localStorage cache (Zero-lag first paint)
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === "undefined") return PRODUCTS;
    try {
      const saved = localStorage.getItem("athar_custom_products");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PRODUCTS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
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
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state tracking to prevent duplicate re-renders and unnecessary network traffic
  const lastServerUpdatedRef = useRef<string>("");
  const isSyncingRef = useRef<boolean>(false);
  const lastSyncTimestampRef = useRef<number>(0);

  // Background Central Server Sync (High-speed & non-blocking)
  const syncWithServer = useCallback((force = false) => {
    const now = Date.now();
    // Allow checks every 3.5 seconds or immediately if forced
    if (!force && now - lastSyncTimestampRef.current < 3500) return;
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    lastSyncTimestampRef.current = now;

    // Cache-busting query parameter (?t=...) prevents Mobile Safari and Android browsers from serving stale cache
    fetch(`/api/data?t=${now}`, {
      cache: "no-store",
      headers: {
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        // If the server data hasn't changed since our last check, avoid unnecessary re-rendering
        if (data.updatedAt && data.updatedAt === lastServerUpdatedRef.current && !force) {
          return;
        }
        lastServerUpdatedRef.current = data.updatedAt || "";

        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          try {
            localStorage.setItem("athar_custom_products", JSON.stringify(data.products));
          } catch {}
        }

        if (data.settings && typeof data.settings === "object") {
          setStoreSettings((prev) => {
            const merged = {
              ...prev,
              ...data.settings,
              categories:
                Array.isArray(data.settings.categories)
                  ? data.settings.categories
                  : prev.categories,
              collectionPages: {
                ...prev.collectionPages,
                ...DEFAULT_COLLECTION_PAGES,
                ...(data.settings.collectionPages || {}),
              },
              governorateShippingRates: {
                ...prev.governorateShippingRates,
                ...(data.settings.governorateShippingRates || {}),
              },
              customPages:
                Array.isArray(data.settings.customPages)
                  ? data.settings.customPages
                  : (prev.customPages || DEFAULT_CUSTOM_PAGES),
              heroSlides:
                Array.isArray(data.settings.heroSlides)
                  ? data.settings.heroSlides
                  : (prev.heroSlides || []),
            };
            try {
              localStorage.setItem("athar_store_settings", JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }

        if (typeof data.lastOrderSeq === "number") {
          recordLastOrderSeq(data.lastOrderSeq);
        }

        if (Array.isArray(data.deletedOrderIds)) {
          data.deletedOrderIds.forEach((id: string) => recordDeletedOrderId(id));
        }

        if (Array.isArray(data.orders)) {
          const cleanedOrders = sanitizeOrders(data.orders);
          setOrders(cleanedOrders);
          try {
            localStorage.setItem("athar_orders", JSON.stringify(cleanedOrders));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("Could not sync with /api/data:", err);
      })
      .finally(() => {
        isSyncingRef.current = false;
      });
  }, []);

  // Real-time synchronization heartbeat across all devices
  useEffect(() => {
    // 1. Initial sync immediately on mount
    syncWithServer(true);

    // 2. High-speed heartbeat: checks for live changes every 5 seconds when tab is open
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        syncWithServer(false);
      }
    }, 5000);

    // 3. Instant sync on focus / app switch
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncWithServer(true);
      }
    };
    const onWindowFocus = () => syncWithServer(true);

    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onWindowFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [syncWithServer]);

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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("athar_custom_products", JSON.stringify(products));
    } catch {
      // Ignore
    }
  }, [products]);

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

  // Toast notification
  const addToast = (
    title: string,
    message: string,
    type: "cart" | "wishlist" | "promo" | "info" = "info"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to sync products to server
  const syncProductsToServer = (prods: Product[]) => {
    fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: prods }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.updatedAt) lastServerUpdatedRef.current = data.updatedAt;
      })
      .catch((err) => console.warn("Could not sync products to server:", err));
  };

  // Helper to sync orders to server
  const syncOrdersToServer = (ords: Order[]) => {
    fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orders: ords,
        lastOrderSeq: getLastOrderSeq(),
        deletedOrderIds: Array.from(getDeletedOrderIds()),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.updatedAt) lastServerUpdatedRef.current = data.updatedAt;
        if (data.lastOrderSeq) recordLastOrderSeq(data.lastOrderSeq);
      })
      .catch((err) => console.warn("Could not sync orders to server:", err));
  };

  // Helper to sync settings to server
  const syncSettingsToServer = (stngs: Partial<StoreSettings>) => {
    fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: stngs }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.updatedAt) lastServerUpdatedRef.current = data.updatedAt;
      })
      .catch((err) => console.warn("Could not sync settings to server:", err));
  };

  // Products CRUD
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      syncProductsToServer(updated);
      return updated;
    });
    addToast("إدارة المنتجات", `تمت إضافة القطعة "${newProduct.arabicName}" بنجاح`, "info");
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) => {
      const updatedList = prev.map((p) => (p.id === id ? { ...p, ...updated } : p));
      syncProductsToServer(updatedList);
      return updatedList;
    });
    addToast("إدارة المنتجات", "تم تحديث بيانات القطعة بنجاح", "info");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
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

  // Orders Management
  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "status">) => {
    // Generate sequential 4-digit order number starting at ATH-1000 (#ATH-1000, #ATH-1001, ...)
    const deletedArr = Array.from(getDeletedOrderIds());
    const storedLastSeq = getLastOrderSeq();
    const newId = getNextSequentialOrderId(orders, storedLastSeq, deletedArr);

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
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: newOrder,
          lastOrderSeq: seq || storedLastSeq,
          deletedOrderIds: deletedArr,
        }),
      }).catch((err) => console.warn("Could not sync order to server:", err));
      return updated;
    });
    return newId;
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
      syncOrdersToServer(updated);
      try {
        localStorage.setItem("athar_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast("تحديث الطلب", `تم تحديث بيانات الطلب #${orderId} بنجاح`, "info");
  };

  const bulkUpdateOrderStatus = (orderIds: string[], status: Order["status"]) => {
    if (!orderIds || orderIds.length === 0) return;
    const idsSet = new Set(orderIds);
    setOrders((prev) => {
      const updated = prev.map((o) => (idsSet.has(o.id) ? { ...o, status } : o));
      syncOrdersToServer(updated);
      try {
        localStorage.setItem("athar_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast("تحديث جماعي", `تم تحديث حالة ${orderIds.length} طلبات بنجاح`, "info");
  };

  const updateOrderStatus = (orderId: string, status: Order["status"], cancellationReason?: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              cancellationReason: status === "cancelled" ? (cancellationReason || o.cancellationReason) : undefined,
              cancelledAt: status === "cancelled" ? (o.cancelledAt || new Date().toISOString()) : undefined,
            }
          : o
      );
      syncOrdersToServer(updated);
      return updated;
    });
    addToast("الطلبات", `تم تحديث حالة الطلب #${orderId}`, "info");
  };

  const cancelOrder = (orderId: string, reason: string, adminNotes?: string) => {
    setOrders((prev) => {
      const updated: Order[] = prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled" as Order["status"],
              cancellationReason: reason,
              cancelledAt: new Date().toISOString(),
              adminNotes: adminNotes !== undefined ? adminNotes : o.adminNotes,
            }
          : o
      );
      syncOrdersToServer(updated);
      return updated;
    });
    addToast("إلغاء الطلب", `تم تسجيل إلغاء الطلب #${orderId} وحفظ السبب`, "info");
  };

  const restoreOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated: Order[] = prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "pending" as Order["status"],
              cancellationReason: undefined,
              cancelledAt: undefined,
            }
          : o
      );
      syncOrdersToServer(updated);
      return updated;
    });
    addToast("استعادة الطلب", `تمت استعادة الطلب #${orderId} إلى قيد التأكيد`, "info");
  };

  const updateOrderAdminNotes = (orderId: string, adminNotes: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, adminNotes } : o));
      syncOrdersToServer(updated);
      return updated;
    });
    addToast("ملاحظات الطلب", `تم حفظ الملاحظة للطلب #${orderId}`, "info");
  };

  const confirmOrderViaPhone = (orderId: string, phoneNotes?: string) => {
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
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
    setOrders((prev) =>
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
    setOrders((prev) =>
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
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      syncOrdersToServer(updated);
      fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      }).catch((err) => console.warn("Error deleting order from server:", err));
      try {
        localStorage.setItem("athar_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
      "أَثَر في سلتك",
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
    if (appliedPromo === "ATHAR20") return Math.round(subtotal * 0.2);
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
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,
        storeSettings,
        updateStoreSettings,
        orders,
        addOrder,
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

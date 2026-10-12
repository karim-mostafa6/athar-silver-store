"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Product, CartItem, PRODUCTS } from "@/data/products";
import { ToastMessage } from "@/components/Toast";

export interface NavLinkItem {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  isSpecial?: boolean;
  badge?: string;
  badgeColor?: "amber" | "rose" | "emerald" | "blue" | "purple";
  targetBlank?: boolean;
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

const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: "01143837730",
  announcementText: "شحن مجاني لكافة محافظات مصر على الطلبات فوق 2,500 ج.م",
  freeShippingThreshold: 2500,
  promoCode: "ATHAR10",
  promoDiscountPercent: 10,
  shippingCairoGiza: 45,
  shippingAlex: 55,
  shippingDeltaCanal: 65,
  shippingUpperEgypt: 80,
  heroTitle: "فضة إسترليني عيار 925 بصياغة خالدة",
  heroSubtitle: "قطع استثنائية صُممت لتعكس أصالة الذوق الرفيع وتترك أثراً لا يُمحى في كل مناسبة",
  heroBadge: "تشكيلة 2026 الحصرية • فضة إيطالية 925 معتمدة",
  heroTagline: "بصمةٌ تُميّز حضورك • 925 STERLING SILVER",
  heroButtonText: "اكتشف التشكيلة الكاملة",
  heroButtonLink: "#products",
  heroButtonShow: true,
  heroSecondaryButtonText: "دليل المقاسات",
  heroSecondaryButtonAction: "sizeguide",
  heroSecondaryButtonLink: "",
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
  trustItem2: "معاينة ومطابقة عند الاستلام قبل الدفع",
  trustItem2Icon: "eye",
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
    { id: "all", label: "كافة القطع", href: "/collection/all", visible: true },
    { id: "women", label: "تشكيلة نسائية", href: "/collection/women", visible: true, badge: "جديد ✦", badgeColor: "rose" },
    { id: "men", label: "تشكيلة رجالية", href: "/collection/men", visible: true },
    { id: "rings", label: "خواتم وسوليتير", href: "/collection/rings", visible: true, badge: "الأكثر طلباً", badgeColor: "amber" },
    { id: "chains", label: "سلاسل إيطالي", href: "/collection/chains", visible: true },
    { id: "bracelets", label: "أساور وتنس", href: "/collection/bracelets", visible: true },
    { id: "sets", label: "أطقم ملكية", href: "/collection/sets", visible: true, badge: "VIP", badgeColor: "purple" },
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

};

const SAMPLE_ORDERS: Order[] = [
  {
    id: "ATH-819230",
    customerName: "مريم خالد",
    phone: "01122334455",
    whatsapp: "01122334455",
    governorate: "الجيزة",
    address: "الدقي، شارع مصدق، عمارة 8، الدور الثاني",
    items: [
      {
        productId: "ath-04",
        name: "Vintage Royal Byzantine Silver Chain",
        arabicName: "سلسلة بيزنطية ملكية فنتج مبرومة فضة 925 إيطالي",
        quantity: 1,
        price: 2100,
        selectedSize: "55 سم",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      },
    ],
    subtotal: 2100,
    shippingFee: 45,
    discount: 0,
    total: 2145,
    paymentMethod: "cod",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "confirmed_whatsapp",
    whatsappConfirmed: true,
    whatsappConfirmedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    adminNotes: "أكدت العميل رغبتها في الاستلام عبر واتساب - تم تحديد الاتصال غداً للتنسيق مع المندوب",
  },
  {
    id: "ATH-928174",
    customerName: "سارة أحمد",
    phone: "01012345678",
    whatsapp: "01012345678",
    governorate: "القاهرة",
    address: "المعادي، شارع النصر، عمارة 14، الدور الثالث",
    items: [
      {
        productId: "ath-02",
        name: "Emerald Cut Royal Solitaire Ring",
        arabicName: "خاتم سوليتير ملكي حجر إيميرالد زركون سويسري 925",
        quantity: 1,
        price: 1450,
        selectedSize: "مقاس 16",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80",
      },
    ],
    subtotal: 1450,
    shippingFee: 45,
    discount: 0,
    total: 1495,
    paymentMethod: "cod",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: "processing",
    notes: "يرجى الاتصال قبل الوصول",
  },
  {
    id: "ATH-583920",
    customerName: "محمود إبراهيم",
    phone: "01287654321",
    governorate: "الإسكندرية",
    address: "سموحة، بجوار نادي سموحة، برج الصفوة",
    items: [
      {
        productId: "ath-01",
        name: "Classic Cuban Curb Silver Chain",
        arabicName: "سلسلة كبح كوبية فضة إيطالي ثقيلة 925",
        quantity: 1,
        price: 1850,
        selectedSize: "55 سم",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      },
      {
        productId: "ath-04",
        name: "Italian Curb Silver Bracelet",
        arabicName: "إسورة كبح إيطالية عريضة 925",
        quantity: 1,
        price: 1250,
        selectedSize: "20 سم",
        image: "https://images.unsplash.com/photo-1611591475102-4a008c3d82a1?auto=format&fit=crop&w=800&q=80",
      },
    ],
    subtotal: 3100,
    shippingFee: 0, // Free shipping
    discount: 310,
    total: 2790,
    paymentMethod: "wallet",
    senderWalletNumber: "01143837730",
    paymentReceiptImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "shipped",
    isGift: true,
    giftMessage: "ألف مبروك التخرج يا غالي",
  },
  {
    id: "ATH-741952",
    customerName: "كريم يوسف",
    phone: "01099887766",
    governorate: "الجيزة",
    address: "الدقي، شارع مصدق، عمارة 8، الدور الثاني",
    items: [
      {
        productId: "ath-01",
        name: "Classic Cuban Curb Silver Chain",
        arabicName: "سلسلة كبح كوبية فضة إيطالي ثقيلة 925",
        quantity: 1,
        price: 1850,
        selectedSize: "50 سم",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
      },
    ],
    subtotal: 1850,
    shippingFee: 45,
    discount: 0,
    total: 1895,
    paymentMethod: "cod",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: "cancelled",
    cancellationReason: "العميل طلب الإلغاء أثناء مكالمة التأكيد (تأجيل الشراء)",
    cancelledAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    adminNotes: "تم الاتصال بالعميل لتأكيد الشحن وأفاد بأنه يرغب بالتأجيل لأول الشهر القادم",
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedPromo, setAppliedPromo] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("athar_custom_products");
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }

      const savedSettings = localStorage.getItem("athar_store_settings");
      if (savedSettings) {
        setStoreSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }

      const savedOrders = localStorage.getItem("athar_orders");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }

      const savedCart = localStorage.getItem("athar_cart");
      if (savedCart) setCartItems(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem("athar_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch {
      // Ignore
    }
  }, []);

  // Listen for storage changes across tabs (e.g. customer confirms in /confirm-order, admin tab updates instantly)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "athar_orders" && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch {
          // Ignore
        }
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

  // Products CRUD
  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    addToast("إدارة المنتجات", `تمت إضافة القطعة "${newProduct.arabicName}" بنجاح`, "info");
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    addToast("إدارة المنتجات", "تم تحديث بيانات القطعة بنجاح", "info");
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast("إدارة المنتجات", "تم حذف القطعة من المتجر", "info");
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    localStorage.removeItem("athar_custom_products");
    addToast("إدارة المنتجات", "تمت استعادة كتالوج المنتجات الافتراضي", "info");
  };

  // Store Settings
  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    addToast("إعدادات المتجر", "تم حفظ إعدادات المتجر بنجاح", "info");
  };

  // Orders Management
  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "status">) => {
    const newId = `ATH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newId;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"], cancellationReason?: string) => {
    setOrders((prev) =>
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
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
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
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "pending",
              cancellationReason: undefined,
              cancelledAt: undefined,
            }
          : o
      )
    );
    addToast("استعادة الطلب", `تمت استعادة الطلب #${orderId} إلى قيد التأكيد`, "info");
  };

  const updateOrderAdminNotes = (orderId: string, adminNotes: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, adminNotes } : o))
    );
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
    addToast("تأكيد هاتفي 📞", `تم تأكيد الطلب #${orderId} هاتفياً بنجاح`, "info");
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
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addToast("الطلبات", `تم حذف الطلب #${orderId}`, "info");
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

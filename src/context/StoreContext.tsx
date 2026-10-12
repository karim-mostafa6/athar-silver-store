"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Product, CartItem, PRODUCTS } from "@/data/products";
import { ToastMessage } from "@/components/Toast";

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
  createdAt: string;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
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
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
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
  whatsappNumber: "201099887766",
  announcementText: "شحن مجاني لكافة محافظات مصر على الطلبات فوق 2,500 ج.م",
  freeShippingThreshold: 2500,
  promoCode: "ATHAR10",
  promoDiscountPercent: 10,
  shippingCairoGiza: 45,
  shippingAlex: 55,
  shippingDeltaCanal: 65,
  shippingUpperEgypt: 80,
};

const SAMPLE_ORDERS: Order[] = [
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
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "shipped",
    isGift: true,
    giftMessage: "ألف مبروك التخرج يا غالي",
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

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    addToast("الطلبات", `تم تحديث حالة الطلب #${orderId}`, "info");
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

"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { useStore, StoreSettings, Order, StoreCategory, CustomPage, DEFAULT_CATEGORIES, DEFAULT_CUSTOM_PAGES, AdminUser, AdminRole } from "@/context/StoreContext";
import { Product } from "@/data/products";
import { playRoyalOrderChime } from "@/lib/sound";
import { OrmaLogo } from "@/components/OrmaLogo";
import { getAdminAuthHeaders } from "@/lib/clientAdmin";
import { compressImageFile } from "@/lib/adminImages";
import { printOrderInvoice, printOrdersInvoices } from "@/lib/printInvoices";
import { EGYPT_GOVERNORATES } from "./constants";
import AnalyticsTab from "./tabs/AnalyticsTab";
import CollectionsTab from "./tabs/CollectionsTab";
import PagesTab from "./tabs/PagesTab";
import UsersTab from "./tabs/UsersTab";
import MarqueeTab from "./tabs/MarqueeTab";
import NavTab from "./tabs/NavTab";
import LogoTab from "./tabs/LogoTab";
import StoryTab from "./tabs/StoryTab";
import BannersTab from "./tabs/BannersTab";
import HeroTab from "./tabs/HeroTab";
import PromosTab from "./tabs/PromosTab";
import ContactTab from "./tabs/ContactTab";
import EmailTab from "./tabs/EmailTab";
import PoliciesTab from "./tabs/PoliciesTab";
import ShippingTab from "./tabs/ShippingTab";
import CheckoutTab from "./tabs/CheckoutTab";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { AdminMobileNav, groupNavItems, type NavItem } from "./AdminNav";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  User, Eye, EyeOff, LogOut, Plus, Trash2, Edit, Save, Search, Package, ShoppingBag, MessageCircle, ExternalLink, Upload, Sparkles, Phone, Truck, Check, Tag, ShieldCheck, Settings, Globe, Megaphone, CreditCard, Mail, FileText, LayoutDashboard, Star, Layers, Image as ImageIcon, RotateCw, X, Smartphone, Monitor, BookOpen, Printer, Lock, Unlock, PhoneCall, Calendar, UserPlus, Ban, Download, Crown, Shield, Users, BarChart3, MapPin, Scale
} from "lucide-react";

type ActiveTab =
  | "orders"
  | "customers"
  | "analytics"
  | "products"
  | "collections"
  | "pages"
  | "banners"
  | "checkout"
  | "hero"
  | "marquee"
  | "nav"
  | "story"
  | "footer"
  | "payment"
  | "shipping"
  | "promos"
  | "contact"
  | "logo"
  | "email"
  | "policies"
  | "users";


export default function AdminPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    storeSettings,
    updateStoreSettings,
    orders,
    refreshOrders,
    addOrder,
    updateOrder,
    bulkUpdateOrderStatus,
    updateOrderStatus,
    cancelOrder,
    restoreOrder,
    addToast,
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState<boolean>(false);

  // Current Authenticated User with Role-Based Access Control
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    name: string;
    role: AdminRole;
  } | null>(null);

  // User Management Modal State (Super Admin Only)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUsername, setNewUsername] = useState<string>("");
  const [newUserPassword, setNewUserPassword] = useState<string>("");
  const [newUserRole, setNewUserRole] = useState<"orders_customers" | "store_editor" | "all">("orders_customers");
  const [newUserError, setNewUserError] = useState<string>("");

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");

  // Settings Security Lock State (verified on the server)
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState<boolean>(false);
  const [isSettingsPasswordModalOpen, setIsSettingsPasswordModalOpen] = useState<boolean>(false);
  const [settingsPasswordInput, setSettingsPasswordInput] = useState<string>("");
  const [showSettingsPassword, setShowSettingsPassword] = useState<boolean>(false);
  const [settingsPasswordError, setSettingsPasswordError] = useState<string>("");
  const [pendingTabAfterUnlock, setPendingTabAfterUnlock] = useState<ActiveTab | null>(null);

  // Selected Order for Full Details Modal (Inside View)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Edit Customer Info in Order Modal
  const [isEditingCustomerInfo, setIsEditingCustomerInfo] = useState<boolean>(false);
  const [editCustomerName, setEditCustomerName] = useState<string>("");
  const [editCustomerPhone, setEditCustomerPhone] = useState<string>("");
  const [editCustomerGovernorate, setEditCustomerGovernorate] = useState<string>("القاهرة");
  const [editCustomerAddress, setEditCustomerAddress] = useState<string>("");
  const [editCustomerNotes, setEditCustomerNotes] = useState<string>("");

  // Customers Directory State
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>("");
  const [customerSortBy, setCustomerSortBy] = useState<"recent" | "orders" | "spent">("recent");

  // Keep customer edit form synced with currently selected order
  useEffect(() => {
    if (selectedOrderForDetails) {
      setEditCustomerName(selectedOrderForDetails.customerName || "");
      setEditCustomerPhone(selectedOrderForDetails.phone || "");
      setEditCustomerGovernorate(selectedOrderForDetails.governorate || "القاهرة");
      setEditCustomerAddress(selectedOrderForDetails.address || "");
      setEditCustomerNotes(selectedOrderForDetails.notes || "");
      setIsEditingCustomerInfo(false);
    }
  }, [selectedOrderForDetails]);

  // Shopify-style Live Split Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Filters & Search
  const [productSearch, setProductSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Date Filter State
  const [orderDatePreset, setOrderDatePreset] = useState<"all" | "today" | "yesterday" | "last7" | "last30" | "custom">("all");
  const [orderCustomDate, setOrderCustomDate] = useState<string>("");

  // Select All & Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkStatusToApply, setBulkStatusToApply] = useState<Order["status"]>("confirmed_phone");

  // Shopify-Style Create Manual Order Modal
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState<boolean>(false);
  const [manualOrderForm, setManualOrderForm] = useState<{
    customerName: string;
    phone: string;
    email: string;
    governorate: string;
    address: string;
    notes: string;
    paymentMethod: "cod" | "wallet" | "card";
    discount: number;
    customShippingFee: number | null;
    items: {
      productId: string;
      name: string;
      arabicName: string;
      quantity: number;
      price: number;
      selectedSize?: string;
      image: string;
    }[];
  }>({
    customerName: "",
    phone: "",
    email: "",
    governorate: "القاهرة",
    address: "",
    notes: "",
    paymentMethod: "cod",
    discount: 0,
    customShippingFee: null,
    items: [],
  });
  const [manualOrderProductSearch, setManualOrderProductSearch] = useState<string>("");

  // Add Item to Existing Order (Inside Details Modal)
  const [isAddingItemToExistingOrder, setIsAddingItemToExistingOrder] = useState<boolean>(false);
  const [existingOrderProductSearch, setExistingOrderProductSearch] = useState<string>("");

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialProductForm: Omit<Product, "id"> = {
    arabicName: "",
    name: "",
    category: "rings",
    gender: "unisex",
    price: 1250,
    originalPrice: 1550,
    purity: "فضة إسترليني عيار 925 معتمدة",
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"],
    description: "صُنع بحرفية فائقة من الفضة الإسترليني عيار 925 الأصلية.",
    features: ["فضة إسترليني أصلية مختومة عيار 925", "علبة مخملية فاخرة وشهادة ضمان"],
    sizes: ["مقاس 16", "مقاس 17", "مقاس 18"],
    defaultSize: "مقاس 17",
    stockQuantity: 10,
    inStock: true,
    isBestSeller: false,
    isNew: true,
    rating: 5.0,
    reviewsCount: 1,
    weightGrams: 5.2,
    tags: ["فضة 925"],
    collections: ["rings"],
  };

  const [productForm, setProductForm] = useState<Omit<Product, "id">>(initialProductForm);
  const [productFeaturesText, setProductFeaturesText] = useState<string>("");
  const [productSizesText, setProductSizesText] = useState<string>("");
  const [productTagsText, setProductTagsText] = useState<string>("");
  const [newImageUrlInput, setNewImageUrlInput] = useState<string>("");

  // Collections Modal & Form State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState<boolean>(false);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [collectionForm, setCollectionForm] = useState<{
    id: string;
    label: string;
    slug: string;
    englishTitle: string;
    description: string;
    icon: string;
    bannerImage: string;
  }>({
    id: "",
    label: "",
    slug: "",
    englishTitle: "",
    description: "",
    icon: "",
    bannerImage: "",
  });
  const collectionFileInputRef = useRef<HTMLInputElement>(null);

  // Custom Pages Modal & Form State
  const [isPageModalOpen, setIsPageModalOpen] = useState<boolean>(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageForm, setPageForm] = useState<{
    id: string;
    slug: string;
    title: string;
    englishTitle: string;
    subtitle: string;
    bannerImage: string;
    content: string;
    isPublished: boolean;
    showInFooter: boolean;
    footerLabel: string;
  }>({
    id: "",
    slug: "",
    title: "",
    englishTitle: "",
    subtitle: "",
    bannerImage: "",
    content: "",
    isPublished: true,
    showInFooter: true,
    footerLabel: "",
  });
  const pageFileInputRef = useRef<HTMLInputElement>(null);

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Marquee Extra Messages helper

  // Live Preview Iframe Reference for Shopify Auto-Scroll
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sound Alert for incoming orders
  const prevOrdersCountRef = useRef<number | null>(null);

  // Check login on mount
  useEffect(() => {
    const session = localStorage.getItem("athar_admin_auth");
    const storedUser = localStorage.getItem("athar_admin_user");
    if (session === "true") {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
          if (parsed.role === "store_editor") {
            setActiveTab("products");
          }
        } catch {
          setCurrentUser({ username: "karim mostafa", name: "كريم مصطفى", role: "super_admin" });
        }
      } else {
        setCurrentUser({ username: "karim mostafa", name: "كريم مصطفى", role: "super_admin" });
      }
    }
    const unlocked = sessionStorage.getItem("athar_settings_unlocked");
    if (unlocked === "true") {
      setIsSettingsUnlocked(true);
    }
  }, []);

  const isSettingsInitializedRef = useRef(false);

  // Initialize settingsForm only on initial mount to protect unsaved user edits from background sync
  useEffect(() => {
    if (!isSettingsInitializedRef.current && storeSettings) {
      setSettingsForm(storeSettings);
      isSettingsInitializedRef.current = true;
    }
  }, [storeSettings]);

  // Live Preview Realtime Broadcast (Shopify Model: instant 0ms preview updates inside iframe)
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "ORMA_SETTINGS_UPDATE", settings: settingsForm },
        "*"
      );
    }
  }, [settingsForm]);

  // Audio alert on new incoming order
  useEffect(() => {
    if (prevOrdersCountRef.current !== null && orders.length > prevOrdersCountRef.current) {
      playRoyalOrderChime();
      addToast("طلب جديد!", "ورد طلب شراء جديد إلى المتجر", "cart");
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, addToast]);

  // Concurrency guard to prevent overlapping refresh requests
  const isFetchingOrdersRef = useRef<boolean>(false);
  const triggerRefresh = useCallback(async () => {
    if (isFetchingOrdersRef.current) return;
    isFetchingOrdersRef.current = true;
    try {
      await refreshOrders();
    } finally {
      isFetchingOrdersRef.current = false;
    }
  }, [refreshOrders]);

  // Full Real-time Synchronization Engine (Supabase Realtime Channel + Adaptive Heartbeat)
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Initial immediate sync on mount / login
    triggerRefresh();

    // 2. Supabase Realtime WebSocket Subscription (0ms latency for table 'orders')
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (isSupabaseConfigured()) {
      try {
        channel = supabase
          .channel("admin-orders-realtime-channel")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "orders",
            },
            (payload) => {
              console.log("[Supabase Realtime] Order event received:", payload.eventType);
              triggerRefresh();
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              triggerRefresh();
            }
          });
      } catch (err) {
        console.warn("[Supabase Realtime] Failed to subscribe to orders channel:", err);
      }
    }

    // 3. Fast Adaptive Polling Heartbeat (Every 3 seconds when viewing orders, 10s on other tabs)
    const intervalTime = activeTab === "orders" ? 3000 : 10000;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    }, intervalTime);

    // 4. Instant sync on window focus or returning to tab
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };
    const onFocus = () => triggerRefresh();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [isAuthenticated, activeTab, triggerRefresh]);

  const handleManualRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    try {
      await refreshOrders();
      addToast("تم التحديث ⚡", "تمت مزامنة كافة الطلبات من السحابة بنجاح", "info");
    } catch {
      addToast("خطأ", "تعذر تحديث الطلبات من السيرفر", "info");
    } finally {
      setTimeout(() => setIsRefreshingOrders(false), 500);
    }
  };

  // Secure Login Handler with Server-Side Cryptographic Token & Brute-Force Rate Limiting
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    const trimmedUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Strictly block generic 'admin' usernames
    if (!trimmedUser || !cleanPass || trimmedUser === "admin") {
      setAuthError("اسم المستخدم أو كلمة المرور غير صحيحة.");
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUser, password: cleanPass }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        setIsSettingsUnlocked(true);
        if (rememberMe) {
          localStorage.setItem("athar_admin_auth", "true");
          localStorage.setItem("athar_admin_user", JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem("orma_admin_token", data.token);
          localStorage.setItem("athar_admin_token", data.token);
          sessionStorage.setItem("orma_admin_token", data.token);
          sessionStorage.setItem("athar_admin_token", data.token);
        }
        if (data.user.role === "store_editor") {
          setActiveTab("products");
        } else {
          setActiveTab("orders");
        }
        refreshOrders();
        addToast("مرحباً بك", `تم تسجيل الدخول بنجاح (${data.user.name})`, "info");
      } else {
        setAuthError(data.error || "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.");
      }
    } catch {
      setAuthError("حدث خطأ أثناء الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsSettingsUnlocked(false);
    sessionStorage.removeItem("athar_settings_unlocked");
    localStorage.removeItem("athar_admin_auth");
    localStorage.removeItem("athar_admin_user");
    localStorage.removeItem("orma_admin_token");
    localStorage.removeItem("athar_admin_token");
    sessionStorage.removeItem("orma_admin_token");
    sessionStorage.removeItem("athar_admin_token");
    setUsernameInput("");
    setPasswordInput("");
  };

  // Role & Permissions Checks
  const canViewOrders = !currentUser || currentUser.role === "super_admin" || currentUser.role === "orders_customers" || currentUser.role === "all";
  const canViewSettings = !currentUser || currentUser.role === "super_admin" || currentUser.role === "store_editor" || currentUser.role === "all";
  const canManageUsers = currentUser?.role === "super_admin" || currentUser?.username === "karim mostafa";

  const isOrderRelatedTab = (tabId: ActiveTab) =>
    tabId === "orders" || tabId === "customers" || tabId === "analytics";

  // Tab click with Settings Security Gate and Role Checking
  const handleTabClick = (tabId: ActiveTab) => {
    if (isOrderRelatedTab(tabId) && !canViewOrders) return;
    if (!isOrderRelatedTab(tabId) && tabId !== "users" && !canViewSettings) return;
    if (tabId === "users" && !canManageUsers) return;

    if (isOrderRelatedTab(tabId)) {
      setActiveTab(tabId);
      return;
    }
    if (isSettingsUnlocked || currentUser?.role === "super_admin" || currentUser?.role === "store_editor" || currentUser?.role === "all") {
      setIsSettingsUnlocked(true);
      setActiveTab(tabId);
    } else {
      setPendingTabAfterUnlock(tabId);
      setSettingsPasswordError("");
      setSettingsPasswordInput("");
      setIsSettingsPasswordModalOpen(true);
    }
  };

  // Unlock Settings with Password (Verified securely on Server)
  const handleUnlockSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const entered = settingsPasswordInput.trim();
    if (!entered) return;

    try {
      const res = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: entered }),
      });
      const data = await res.json();

      if (data.success && data.valid) {
        if (data.token) {
          localStorage.setItem("orma_admin_token", data.token);
          localStorage.setItem("athar_admin_token", data.token);
          sessionStorage.setItem("orma_admin_token", data.token);
          sessionStorage.setItem("athar_admin_token", data.token);
        }
        setIsSettingsUnlocked(true);
        sessionStorage.setItem("athar_settings_unlocked", "true");
        setIsSettingsPasswordModalOpen(false);
        setSettingsPasswordError("");
        const targetTab = pendingTabAfterUnlock || (canViewSettings ? "products" : "orders");
        setActiveTab(targetTab);
        addToast("تم فتح الإعدادات", "تم تأكيد كلمة المرور بنجاح، يمكنك الآن تعديل كافة إعدادات المتجر", "info");
      } else {
        setSettingsPasswordError("كلمة المرور غير صحيحة، يرجى إدخال كلمة المرور الصحيحة للوصول للإعدادات.");
      }
    } catch {
      setSettingsPasswordError("حدث خطأ أثناء التحقق من كلمة المرور.");
    }
  };

  // Lock Settings
  const handleLockSettings = () => {
    setIsSettingsUnlocked(false);
    sessionStorage.removeItem("athar_settings_unlocked");
    setActiveTab(canViewOrders ? "orders" : "products");
    addToast("تم قفل الإعدادات", "تم قفل إعدادات المتجر بنجاح لحماية البيانات", "info");
  };

  // Add User Handler (Super Admin Only)
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError("");
    const cleanUser = newUsername.trim().toLowerCase();
    const cleanPass = newUserPassword.trim();
    const cleanName = newUserName.trim();

    if (!cleanUser || !cleanPass || !cleanName) {
      setNewUserError("يرجى ملء كافة الحقول المطلوبة.");
      return;
    }

    if (cleanUser === "admin") {
      setNewUserError("غير مسموح باستخدام اسم المستخدم admin لأسباب أمنية.");
      return;
    }

    if (cleanUser === "karim mostafa") {
      setNewUserError("اسم المستخدم هذا محجوز لحساب المالك والمدير العام.");
      return;
    }

    const currentUsers = settingsForm.adminUsers || [];
    if (currentUsers.some((u) => u.username.toLowerCase() === cleanUser)) {
      setNewUserError("اسم المستخدم هذا مسجل بالفعل لمستخدم آخر.");
      return;
    }

    const newUser: AdminUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      role: newUserRole,
      createdAt: new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" }),
      isActive: true,
    };

    const updatedUsers = [...currentUsers, newUser];
    const updatedSettings = { ...settingsForm, adminUsers: updatedUsers };
    setSettingsForm(updatedSettings);
    updateStoreSettings(updatedSettings);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: updatedSettings }),
      });
    } catch {}

    addToast("تمت إضافة المستخدم بنجاح ⚡", `تم إنشاء حساب ${cleanName} بنجاح ومزامنته في السحابة`, "info");
    setIsAddUserModalOpen(false);
    setNewUserName("");
    setNewUsername("");
    setNewUserPassword("");
    setNewUserRole("orders_customers");
  };

  // Toggle User Active Status
  const handleToggleUserActive = async (userId: string) => {
    const currentUsers = settingsForm.adminUsers || [];
    const updatedUsers = currentUsers.map((u) =>
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    const updatedSettings = { ...settingsForm, adminUsers: updatedUsers };
    setSettingsForm(updatedSettings);
    updateStoreSettings(updatedSettings);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: updatedSettings }),
      });
    } catch {}

    addToast("تم تحديث الحالة", "تم تعديل حالة نشاط الحساب بنجاح", "info");
  };

  // Delete Sub-User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب "${userName}" نهائياً؟`)) return;

    const currentUsers = settingsForm.adminUsers || [];
    const updatedUsers = currentUsers.filter((u) => u.id !== userId);
    const updatedSettings = { ...settingsForm, adminUsers: updatedUsers };
    setSettingsForm(updatedSettings);
    updateStoreSettings(updatedSettings);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: updatedSettings }),
      });
    } catch {}

    addToast("تم حذف الحساب", `تم إلغاء حساب ${userName} نهائياً`, "info");
  };

  // Helper to retrieve product thumbnail for order items
  const getItemImage = (item: { productId: string; arabicName: string; image?: string }) => {
    if (item.image && item.image.trim().length > 0) return item.image;
    const prod = products.find((p) => p.id === item.productId || p.arabicName === item.arabicName);
    if (prod && prod.images && prod.images.length > 0) return prod.images[0];
    return "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80";
  };

  // Professional Order Invoice Printing (see src/lib/printInvoices.ts)
  const handlePrintOrder = (order: Order) => printOrderInvoice(order);

  const getWhatsAppInvoiceUrl = (order: Order) => {
    const itemsText = order.items
      .map((item) => `• ${item.arabicName} ${item.selectedSize ? `(مقاس: ${item.selectedSize})` : ""} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString("en-US")} ج.م`)
      .join("%0A");
    const msg = `مرحباً بك في دار أورما للفضة 925%0Aيسعدنا إبلاغك بتأكيد طلبك رقم: %23${order.id}%0A%0Aالعميل: ${encodeURIComponent(order.customerName)}%0Aالعنوان: ${encodeURIComponent(order.governorate)} - ${encodeURIComponent(order.address)}%0A%0Aالمنتجات المطلوبة:%0A${itemsText}%0A%0Aرسوم الشحن: ${order.shippingFee} ج.م%0Aإجمالي المبلغ المطلوب عند الاستلام: ${order.total.toLocaleString("en-US")} ج.م%0A%0Aشكراً لاختيارك دار أورما.`;
    let phone = order.phone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "2" + phone;
    return `https://wa.me/${phone}?text=${msg}`;
  };

  const exportOrdersToCSV = (ordersToExport: Order[]) => {
    if (!ordersToExport || ordersToExport.length === 0) {
      addToast("تنبيه", "لا توجد طلبات لتصديرها", "info");
      return;
    }
    const headers = [
      "رقم الطلب",
      "اسم العميل",
      "رقم الهاتف",
      "البريد الإلكتروني",
      "المحافظة",
      "العنوان",
      "الحالة",
      "طريقة الدفع",
      "إجمالي المنتجات",
      "الشحن",
      "الخصم",
      "الإجمالي النهائي",
      "تاريخ الطلب",
      "تفاصيل المنتجات",
    ];
    const rows = ordersToExport.map((o) => [
      o.id,
      `"${(o.customerName || "").replace(/"/g, '""')}"`,
      `"${o.phone || ""}"`,
      `"${o.email || ""}"`,
      `"${o.governorate || ""}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      o.status,
      o.paymentMethod || "cod",
      o.subtotal || 0,
      o.shippingFee || 0,
      o.discount || 0,
      o.total || 0,
      `"${new Date(o.createdAt).toLocaleString("ar-EG")}"`,
      `"${o.items.map((i) => `${i.arabicName} (${i.selectedSize || "افتراضي"} × ${i.quantity})`).join(" + ").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orma-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("تصدير الطلبات", `تم تصدير ${ordersToExport.length} طلبات بنجاح إلى ملف Excel / CSV`, "info");
  };

  const handlePrintMultipleOrders = (ordersToPrint: Order[]) => printOrdersInvoices(ordersToPrint);

  // On phones the live preview is a full-screen overlay: lock the page behind it.
  const [isSmallViewport, setIsSmallViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsSmallViewport(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useBodyScrollLock(isPreviewOpen && isSmallViewport);

  // Auto-scroll the live preview iframe whenever activeTab changes (Shopify Customizer behavior)
  useEffect(() => {
    if (isPreviewOpen && iframeRef.current?.contentWindow) {
      const timer = setTimeout(() => {
        try {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "ORMA_SCROLL_TO", tab: activeTab },
            "*"
          );
        } catch {}
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isPreviewOpen]);

  // Multiple Product Images Upload Handler
  const handleMultipleFilesUpload = async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageFile(file);
        if (dataUrl) newImages.push(dataUrl);
      }
      if (newImages.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images.filter((img) => img.trim().length > 0), ...newImages],
        }));
        addToast("تمت إضافة الصور", `تم رفع ${newImages.length} صور إلى المعرض بنجاح`, "info");
      }
    } catch (err) {
      console.error("Multiple upload error:", err);
      addToast("خطأ", "فشل معالجة بعض الصور", "info");
    } finally {
      setIsUploading(false);
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      arabicName: prod.arabicName,
      name: prod.name || "",
      category: prod.category,
      collections: prod.collections && prod.collections.length > 0 ? prod.collections : [prod.category],
      gender: prod.gender,
      price: prod.price,
      originalPrice: prod.originalPrice,
      purity: prod.purity,
      images: prod.images && prod.images.length > 0 ? prod.images : [""],
      description: prod.description || "",
      features: prod.features || [],
      sizes: prod.sizes || [],
      defaultSize: prod.defaultSize || "",
      stockQuantity: prod.stockQuantity !== undefined ? prod.stockQuantity : (prod.inStock ? 10 : 0),
      inStock: prod.inStock,
      isBestSeller: prod.isBestSeller || false,
      isNew: prod.isNew || false,
      rating: prod.rating || 5.0,
      reviewsCount: prod.reviewsCount || 1,
      weightGrams: prod.weightGrams || 5,
      tags: prod.tags || [],
    });
    setProductFeaturesText((prod.features || []).join("\n"));
    setProductSizesText((prod.sizes || []).join(", "));
    setProductTagsText((prod.tags || []).join(", "));
    setIsProductModalOpen(true);
  };

  // Open New Product Modal
  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setProductForm({
      ...initialProductForm,
      collections: ["rings"],
    });
    setProductFeaturesText(initialProductForm.features.join("\n"));
    setProductSizesText((initialProductForm.sizes || []).join(", "));
    setProductTagsText(initialProductForm.tags.join(", "));
    setIsProductModalOpen(true);
  };

  // Save Product Modal Submit
  const handleSaveProductModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.arabicName.trim()) {
      addToast("تنبيه", "يرجى كتابة اسم المنتج بالعربية", "info");
      return;
    }

    const parsedFeatures = productFeaturesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedSizes = productSizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedTags = productTagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const rawStock = Number(productForm.stockQuantity);
    const stockQty = !isNaN(rawStock) && rawStock >= 0 ? rawStock : 10;
    const finalInStock = stockQty > 0 && productForm.inStock !== false;

    // Check if category is ring-based or explicitly has sizes
    const isRing =
      productForm.category === "rings" ||
      productForm.category?.toLowerCase().includes("ring") ||
      productForm.arabicName?.includes("خاتم") ||
      productForm.arabicName?.includes("دبل") ||
      (productForm.collections || []).some(
        (c) => c === "rings" || c.toLowerCase().includes("ring") || c.includes("خواتم")
      );

    const updatedData: Omit<Product, "id"> = {
      ...productForm,
      stockQuantity: stockQty,
      inStock: finalInStock,
      collections:
        productForm.collections && productForm.collections.length > 0
          ? productForm.collections
          : [productForm.category],
      features: parsedFeatures.length > 0 ? parsedFeatures : ["فضة إسترليني 925 معتمدة"],
      sizes: isRing && parsedSizes.length > 0 ? parsedSizes : (isRing ? ["مقاس 16", "مقاس 17", "مقاس 18"] : undefined),
      defaultSize: isRing ? (productForm.defaultSize || parsedSizes[0] || "مقاس 17") : undefined,
      tags: parsedTags.length > 0 ? parsedTags : ["فضة 925"],
    };

    if (editingProductId) {
      updateProduct(editingProductId, updatedData);
      addToast("تم التعديل", `تم تحديث بيانات "${productForm.arabicName}" بنجاح`, "info");
    } else {
      addProduct({
        ...updatedData,
        id: `orm-${Date.now()}`,
      });
      addToast("تمت الإضافة", `تمت إضافة "${productForm.arabicName}" إلى المتجر`, "info");
    }

    setIsProductModalOpen(false);
    setEditingProductId(null);
  };

  // ----------------------------------------------------
  // Collections Handlers
  // ----------------------------------------------------
  const handleOpenAddCollection = () => {
    setEditingCollectionId(null);
    setCollectionForm({
      id: "",
      label: "",
      slug: "",
      englishTitle: "",
      description: "",
      icon: "",
      bannerImage: "",
    });
    setIsCollectionModalOpen(true);
  };

  const handleOpenEditCollection = (col: StoreCategory) => {
    setEditingCollectionId(col.id);
    setCollectionForm({
      id: col.id,
      label: col.label,
      slug: col.slug || col.id,
      englishTitle: col.englishTitle || "",
      description: col.description || "",
      icon: col.icon || "",
      bannerImage: col.bannerImage || "",
    });
    setIsCollectionModalOpen(true);
  };

  const handleCollectionBannerUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const clientDataUrl = await compressImageFile(file);
      if (clientDataUrl) {
        setCollectionForm((prev) => ({ ...prev, bannerImage: clientDataUrl }));
        addToast("تم اختيار الصورة", "تم تعيين صورة غلاف الكولكشن بنجاح", "info");
      }
    } catch {
      addToast("خطأ", "فشل معالجة الصورة", "info");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectionForm.label.trim()) {
      addToast("تنبيه", "يرجى كتابة اسم الكولكشن بالعربية", "info");
      return;
    }

    const cleanSlug = (collectionForm.slug.trim() || collectionForm.label.trim())
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || `col-${Date.now()}`;

    const newColId = editingCollectionId || cleanSlug;
    const updatedCol: StoreCategory = {
      id: newColId,
      label: collectionForm.label.trim(),
      slug: cleanSlug,
      englishTitle: collectionForm.englishTitle.trim() || undefined,
      description: collectionForm.description.trim() || undefined,
      bannerImage: collectionForm.bannerImage || undefined,
    };

    const currentCats =
      settingsForm.categories && settingsForm.categories.length > 0
        ? settingsForm.categories
        : DEFAULT_CATEGORIES;

    let nextCats: StoreCategory[];
    if (editingCollectionId) {
      nextCats = currentCats.map((c) => (c.id === editingCollectionId ? updatedCol : c));
    } else {
      nextCats = [...currentCats, updatedCol];
    }

    const nextCollectionPages = {
      ...(settingsForm.collectionPages || {}),
      [updatedCol.id]: {
        title: updatedCol.label,
        englishTitle: updatedCol.englishTitle || "",
        subtitle: updatedCol.description || "",
        bannerImage: updatedCol.bannerImage || "",
        showBanner: true,
      },
    };

    const newSettings: StoreSettings = {
      ...settingsForm,
      categories: nextCats,
      collectionPages: nextCollectionPages,
    };

    setSettingsForm(newSettings);
    updateStoreSettings(newSettings);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (e) {
      console.error("Direct sync error:", e);
    }

    setIsCollectionModalOpen(false);
    setEditingCollectionId(null);
    addToast("تم حفظ الكولكشن", `تم حفظ مجموعة "${updatedCol.label}" وتحديثها في السحابة بنجاح`, "info");
  };

  const handleDeleteCollection = async (id: string, label: string) => {
    if (confirm(`هل أنت متأكد من حذف كولكشن "${label}" نهائياً من المتجر وقاعدة البيانات السحابية؟`)) {
      const currentCats =
        settingsForm.categories && settingsForm.categories.length > 0
          ? settingsForm.categories
          : DEFAULT_CATEGORIES;
      const nextCats = currentCats.filter((c) => c.id !== id);
      const nextCollectionPages = { ...(settingsForm.collectionPages || {}) };
      delete nextCollectionPages[id];

      const newSettings: StoreSettings = {
        ...settingsForm,
        categories: nextCats,
        collectionPages: nextCollectionPages,
      };

      setSettingsForm(newSettings);
      updateStoreSettings(newSettings);

      try {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: getAdminAuthHeaders(),
          body: JSON.stringify({ settings: newSettings }),
        });
        addToast("تم الحذف بنجاح", `تم حذف كولكشن "${label}" نهائياً من السحابة والمتجر`, "info");
      } catch (e) {
        console.error("Direct sync error:", e);
        addToast("خطأ", "تعذر تأكيد الحذف بالسيرفر", "info");
      }
    }
  };

  // ----------------------------------------------------
  // Custom Pages Handlers
  // ----------------------------------------------------
  const handleOpenAddPage = () => {
    setEditingPageId(null);
    setPageForm({
      id: "",
      slug: "",
      title: "",
      englishTitle: "",
      subtitle: "",
      bannerImage: "",
      content: "",
      isPublished: true,
      showInFooter: true,
      footerLabel: "",
    });
    setIsPageModalOpen(true);
  };

  const handleOpenEditPage = (page: CustomPage) => {
    setEditingPageId(page.id);
    setPageForm({
      id: page.id,
      slug: page.slug,
      title: page.title,
      englishTitle: page.englishTitle || "",
      subtitle: page.subtitle || "",
      bannerImage: page.bannerImage || "",
      content: page.content || "",
      isPublished: page.isPublished !== false,
      showInFooter: page.showInFooter !== false,
      footerLabel: page.footerLabel || page.title,
    });
    setIsPageModalOpen(true);
  };

  const handlePageBannerUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const clientDataUrl = await compressImageFile(file);
      if (clientDataUrl) {
        setPageForm((prev) => ({ ...prev, bannerImage: clientDataUrl }));
        addToast("تم اختيار الصورة", "تم تعيين صورة غلاف الصفحة", "info");
      }
    } catch {
      addToast("خطأ", "فشل معالجة الصورة", "info");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.title.trim()) {
      addToast("تنبيه", "يرجى كتابة عنوان الصفحة", "info");
      return;
    }

    const cleanSlug = (pageForm.slug.trim() || pageForm.title.trim())
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") || `page-${Date.now()}`;

    const newPageId = editingPageId || `page-${Date.now()}`;
    const updatedPage: CustomPage = {
      id: newPageId,
      slug: cleanSlug,
      title: pageForm.title.trim(),
      englishTitle: pageForm.englishTitle.trim() || undefined,
      subtitle: pageForm.subtitle.trim() || undefined,
      bannerImage: pageForm.bannerImage || undefined,
      content: pageForm.content.trim(),
      isPublished: pageForm.isPublished,
      showInFooter: pageForm.showInFooter,
      footerLabel: pageForm.footerLabel.trim() || pageForm.title.trim(),
      updatedAt: new Date().toISOString(),
    };

    const currentPages =
      settingsForm.customPages && settingsForm.customPages.length > 0
        ? settingsForm.customPages
        : DEFAULT_CUSTOM_PAGES;

    let nextPages: CustomPage[];
    if (editingPageId) {
      nextPages = currentPages.map((p) => (p.id === editingPageId ? updatedPage : p));
    } else {
      nextPages = [...currentPages, updatedPage];
    }

    const newSettings: StoreSettings = {
      ...settingsForm,
      customPages: nextPages,
    };

    setSettingsForm(newSettings);
    updateStoreSettings(newSettings);

    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (e) {
      console.error("Direct sync error:", e);
    }

    setIsPageModalOpen(false);
    setEditingPageId(null);
    addToast("تم حفظ الصفحة", `تم حفظ صفحة "${updatedPage.title}" بنجاح ومزامنتها سحابياً`, "info");
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (confirm(`هل أنت متأكد من حذف صفحة "${title}" نهائياً من المتجر؟`)) {
      const currentPages =
        settingsForm.customPages && settingsForm.customPages.length > 0
          ? settingsForm.customPages
          : DEFAULT_CUSTOM_PAGES;
      const nextPages = currentPages.filter((p) => p.id !== id);

      const newSettings: StoreSettings = {
        ...settingsForm,
        customPages: nextPages,
      };

      setSettingsForm(newSettings);
      updateStoreSettings(newSettings);

      try {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: getAdminAuthHeaders(),
          body: JSON.stringify({ settings: newSettings }),
        });
        addToast("تم الحذف بنجاح", `تم حذف صفحة "${title}" نهائياً من السحابة والمتجر`, "info");
      } catch (e) {
        console.error("Direct sync error:", e);
        addToast("خطأ", "تعذر تأكيد الحذف بالسيرفر", "info");
      }
    }
  };

  // Save Settings to Cloud
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      updateStoreSettings(settingsForm);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ settings: settingsForm }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        addToast("تم الحفظ في السحابة ⚡", "تم مزامنة كافة التعديلات فورياً في Supabase وعلى جميع الأجهزة", "info");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else if (res.status === 401) {
        setIsSettingsUnlocked(false);
        setSettingsPasswordInput("");
        setIsSettingsPasswordModalOpen(true);
        setPendingTabAfterUnlock(activeTab);
        addToast("تأكيد الصلاحية", "يرجى إدخال كلمة المرور لتأكيد حفظ الإعدادات في السحابة", "info");
      } else {
        const errData = await res.json().catch(() => ({}));
        addToast("خطأ", errData.error || "فشل الحفظ في السحابة، يرجى المحاولة مجدداً", "info");
      }
    } catch {
      addToast("خطأ", "حدث خطأ أثناء حفظ الإعدادات", "info");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Order Metrics
  const orderMetrics = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const confirmed = orders.filter((o) => o.status.startsWith("confirmed") || o.status === "processing").length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, pending, confirmed, revenue };
  }, [orders]);

  // Aggregated Customers Directory from Orders
  const customersList = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        governorate: string;
        address: string;
        totalOrders: number;
        totalSpent: number;
        lastOrderDate: string;
        lastOrderStatus: Order["status"];
        orders: Order[];
      }
    >();

    for (const order of orders) {
      if (!order) continue;
      const cleanPhone = (order.phone || "").replace(/\D/g, "");
      const key = cleanPhone || (order.customerName || "").trim().toLowerCase() || order.id;
      if (!key) continue;

      const existing = map.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += Number(order.total) || 0;
        existing.orders.push(order);
        if (new Date(order.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.name = order.customerName || existing.name;
          existing.governorate = order.governorate || existing.governorate;
          existing.address = order.address || existing.address;
          existing.lastOrderDate = order.createdAt;
          existing.lastOrderStatus = order.status;
        }
      } else {
        map.set(key, {
          name: order.customerName || "عميل غير معروف",
          phone: order.phone || "",
          governorate: order.governorate || "غير محدد",
          address: order.address || "",
          totalOrders: 1,
          totalSpent: Number(order.total) || 0,
          lastOrderDate: order.createdAt,
          lastOrderStatus: order.status,
          orders: [order],
        });
      }
    }

    return Array.from(map.values());
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    let result = [...customersList];
    const q = customerSearchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.governorate.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }
    if (customerSortBy === "orders") {
      result.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (customerSortBy === "spent") {
      result.sort((a, b) => b.totalSpent - a.totalSpent);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime()
      );
    }
    return result;
  }, [customersList, customerSearchQuery, customerSortBy]);

  // Helper to format date YYYY-MM-DD
  const formatOrderDateYMD = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const todayYMD = formatOrderDateYMD(new Date().toISOString());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayYMD = formatOrderDateYMD(yesterdayDate.toISOString());

    const nowTime = Date.now();
    const sevenDaysAgo = nowTime - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = nowTime - 30 * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) {
        return false;
      }

      // Day / Date Filtering
      if (orderDatePreset === "today") {
        if (formatOrderDateYMD(o.createdAt) !== todayYMD) return false;
      } else if (orderDatePreset === "yesterday") {
        if (formatOrderDateYMD(o.createdAt) !== yesterdayYMD) return false;
      } else if (orderDatePreset === "last7") {
        const t = new Date(o.createdAt).getTime();
        if (t < sevenDaysAgo) return false;
      } else if (orderDatePreset === "last30") {
        const t = new Date(o.createdAt).getTime();
        if (t < thirtyDaysAgo) return false;
      } else if (orderDatePreset === "custom" && orderCustomDate) {
        if (formatOrderDateYMD(o.createdAt) !== orderCustomDate) return false;
      }

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.phone.includes(q);
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesGov = o.governorate.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesId || matchesGov;
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderDatePreset, orderCustomDate, orderSearchQuery]);

  // Filtered Products
  const filteredProductsList = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all") {
        const inCategory = p.category === categoryFilter;
        const inCollections = Array.isArray(p.collections) && p.collections.includes(categoryFilter);
        if (!inCategory && !inCollections) return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return p.arabicName.toLowerCase().includes(q) || (p.tags && p.tags.some((t) => t.includes(q)));
      }
      return true;
    });
  }, [products, categoryFilter, productSearch]);

  // Settings Tabs Configuration based on role permissions
  const baseSettingsTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "products", label: "إدارة المنتجات", icon: <Package className="w-4 h-4" /> },
    { id: "collections", label: "الكولكشن والمجموعات", icon: <Layers className="w-4 h-4" /> },
    { id: "pages", label: "الصفحات المستقلة", icon: <BookOpen className="w-4 h-4" /> },
    { id: "banners", label: "البانرات الإعلانية ومواقعها", icon: <Sparkles className="w-4 h-4" /> },
    { id: "checkout", label: "صفحة الدفع (Checkout)", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "hero", label: "البانر الرئيسي", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "marquee", label: "شريط الإعلانات", icon: <Megaphone className="w-4 h-4" /> },
    { id: "nav", label: "قائمة التنقل", icon: <Layers className="w-4 h-4" /> },
    { id: "story", label: "القصة والعناية", icon: <Star className="w-4 h-4" /> },
    { id: "footer", label: "الفوتر", icon: <FileText className="w-4 h-4" /> },
    { id: "payment", label: "طرق الدفع", icon: <CreditCard className="w-4 h-4" /> },
    { id: "shipping", label: "الشحن والمحافظات", icon: <Truck className="w-4 h-4" /> },
    { id: "promos", label: "الكوبونات والعروض", icon: <Tag className="w-4 h-4" /> },
    { id: "contact", label: "التواصل والسوشيال", icon: <Phone className="w-4 h-4" /> },
    { id: "logo", label: "الشعار والهوية", icon: <Globe className="w-4 h-4" /> },
    { id: "email", label: "إعدادات الإيميل", icon: <Mail className="w-4 h-4" /> },
    { id: "policies", label: "سياسات المتجر", icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const settingsTabs = useMemo(() => {
    if (!canViewSettings) return [];
    if (canManageUsers) {
      return [
        ...baseSettingsTabs,
        { id: "users" as ActiveTab, label: "المستخدمين والصلاحيات", icon: <UserPlus className="w-4 h-4" />, badge: settingsForm.adminUsers?.length },
      ];
    }
    return baseSettingsTabs;
  }, [canViewSettings, canManageUsers, settingsForm.adminUsers]);

  // Grouped navigation for the mobile sheet (sales / catalog / storefront / payment & shipping / settings)
  const mobileNavGroups = useMemo(() => {
    const items: NavItem[] = [];
    if (canViewOrders) {
      items.push(
        { id: "orders", label: "الطلبات", icon: <ShoppingBag className="w-4 h-4" />, badge: orderMetrics.pending },
        { id: "customers", label: "العملاء", icon: <Users className="w-4 h-4" />, badge: customersList.length },
        { id: "analytics", label: "التقارير والإحصائيات", icon: <BarChart3 className="w-4 h-4" /> }
      );
    }
    for (const t of settingsTabs) items.push({ id: t.id, label: t.label, icon: t.icon, badge: t.badge });
    return groupNavItems(items);
  }, [canViewOrders, settingsTabs, orderMetrics.pending, customersList.length]);

  // ========================================================
  // LOGIN SCREEN
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f7f4ee] flex items-center justify-center p-4 selection:bg-[#dfd2bf] font-cairo">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e8ded0] p-8 sm:p-10 text-center">
          <div className="mb-6 flex justify-center">
            <OrmaLogo variant="light" size="lg" customImageUrl={settingsForm.logoImageUrl} customHeight={settingsForm.logoHeight} customType={settingsForm.logoType} />
          </div>

          <h1 className="font-amiri text-2xl font-bold text-[#161412] mb-1">
            لوحة الإدارة السحابية
          </h1>
          <p className="text-xs text-[#756555] mb-8 font-light">
            سجل دخولك بحسابك المصرح له للوصول إلى لوحة التحكم
          </p>

          {authError && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-right">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-medium text-[#161412] mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="اسم المستخدم"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] focus:bg-white"
                />
                <User className="w-4 h-4 text-[#8c7865] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#161412] mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="off"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="كلمة المرور"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7865] hover:text-[#161412]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-[#756555]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#ded2c0] text-[#161412] focus:ring-0"
                />
                <span>تذكرني على هذا الجهاز</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-colors shadow-md mt-4 disabled:opacity-50"
            >
              {isLoggingIn ? "جارٍ التحقق والدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ========================================================
  // MAIN DASHBOARD INTERFACE
  // ========================================================
  return (
    <div dir="rtl" className="admin-root min-h-screen bg-[#f7f4ee] text-[#161412] flex flex-col font-cairo selection:bg-[#dfd2bf]">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#f7f4ee]/95 backdrop-blur-md border-b border-[#e4dcce] px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Cloud Status */}
          <div className="flex items-center gap-4">
            <OrmaLogo variant="light" size="sm" customImageUrl={settingsForm.logoImageUrl} customHeight={settingsForm.logoHeight} customType={settingsForm.logoType} />
            <div className="border-r border-[#d8c8b4] pr-4 hidden sm:block">
              <span className="text-xs font-bold text-[#161412] flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-[#c5a880]" />
                لوحة التحكم الإدارية
              </span>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متصل بالسحابة (Upstash Redis) - المزامنة فورية
              </span>
            </div>
          </div>

          {/* Action Buttons & Current User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f7f4ee] border border-[#ded2c0] text-xs shadow-xs">
                {currentUser.role === "super_admin" ? (
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                ) : currentUser.role === "orders_customers" ? (
                  <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                ) : currentUser.role === "store_editor" ? (
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="font-bold text-[#161412]">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-[#ded2c0] text-[#756555] font-bold">
                  {currentUser.role === "super_admin"
                    ? "المالك (Super Admin)"
                    : currentUser.role === "orders_customers"
                    ? "الطلبات والعملاء"
                    : currentUser.role === "store_editor"
                    ? "تعديل المتجر"
                    : "صلاحية كاملة"}
                </span>
              </div>
            )}

            {/* Store Settings Gear Button (Only for users with store editor access) */}
            {canViewSettings && (
              <button
                type="button"
                onClick={() => {
                  if (isSettingsUnlocked) {
                    if (activeTab === "orders") setActiveTab("products");
                    else setActiveTab(canViewOrders ? "orders" : "products");
                  } else {
                    setPendingTabAfterUnlock("products");
                    setIsSettingsPasswordModalOpen(true);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  activeTab !== "orders"
                    ? "bg-[#161412] text-[#c5a880] border-[#161412]"
                    : "bg-white border-[#ded2c0] text-[#161412] hover:bg-[#ede3d3]"
                }`}
                title="إعدادات وتخصيصات المتجر (محمية بكلمة مرور)"
              >
                <Settings className={`w-3.5 h-3.5 ${activeTab !== "orders" ? "rotate-45 text-[#c5a880]" : "text-[#8c7865]"} transition-transform`} />
                <span className="hidden sm:inline">إعدادات المتجر</span>
                {isSettingsUnlocked ? (
                  <Unlock className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Lock className="w-3 h-3 text-amber-500" />
                )}
              </button>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className={`px-4 sm:px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
                saveSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925]"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم الحفظ بالسحابة!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>{isSavingSettings ? "جاري الحفظ..." : "حفظ التعديلات بالسحابة"}</span>
                </>
              )}
            </button>

            {/* Shopify Live Split Screen Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 active:scale-95 shadow-sm ${
                isPreviewOpen
                  ? "bg-[#161412] text-[#f7f4ee] border-[#161412]"
                  : "bg-white border-[#ded2c0] text-[#161412] hover:bg-[#ede3d3]"
              }`}
              title="معاينة المتجر المباشرة جنباً إلى جنب (مثل شوبيفاي)"
            >
              <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
              <span className="hidden sm:inline">
                {isPreviewOpen ? "إغلاق المعاينة الحية" : "معاينة حية للمتجر"}
              </span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="p-2 rounded-lg bg-white border border-[#ded2c0] text-[#5c4f42] hover:text-[#161412] text-xs transition-colors flex items-center gap-1"
              title="معاينة المتجر"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">عرض المتجر</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white border border-[#ded2c0] text-rose-600 hover:bg-rose-50 text-xs transition-colors flex items-center gap-1"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION (< md): current section + grouped sheet */}
        <AdminMobileNav
          groups={mobileNavGroups}
          activeId={activeTab}
          onSelect={(id) => handleTabClick(id as ActiveTab)}
          locked={!isSettingsUnlocked}
        />
      </header>

      {/* DASHBOARD BODY: FIXED-WIDTH SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* DESKTOP SIDEBAR (w-64, sticky, scrolls independently) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto border-l border-[#e8ded0] bg-[#f7f4ee]/80 p-3 space-y-3">
          {/* Section 1: Orders, Customers & Analytics */}
          {canViewOrders && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-[#8c7865] px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>المبيعات والعملاء</span>
              </div>

              {/* Tab: Orders */}
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-right ${
                  activeTab === "orders"
                    ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                    : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeTab === "orders" ? "text-[#c5a880]" : "text-[#8c7865]"}>
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <span>إدارة الطلبات</span>
                </div>

                {orderMetrics.pending > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#161412]">
                    {orderMetrics.pending}
                  </span>
                )}
              </button>

              {/* Tab: Customers */}
              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-right ${
                  activeTab === "customers"
                    ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                    : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeTab === "customers" ? "text-[#c5a880]" : "text-[#8c7865]"}>
                    <Users className="w-4 h-4" />
                  </span>
                  <span>قاعدة العملاء</span>
                </div>

                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8ded0] text-[#161412]">
                  {customersList.length}
                </span>
              </button>

              {/* Tab: Analytics & Reports */}
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-right ${
                  activeTab === "analytics"
                    ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                    : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={activeTab === "analytics" ? "text-[#c5a880]" : "text-[#8c7865]"}>
                    <BarChart3 className="w-4 h-4" />
                  </span>
                  <span>التقارير والإحصائيات</span>
                </div>
              </button>
            </div>
          )}

          {/* Section 2: Store Settings with Gear Icon & Security Lock */}
          {canViewSettings && (
            <div className={`space-y-1 ${canViewOrders ? "pt-2 border-t border-[#e8ded0]" : ""}`}>
              <div className="px-3 py-2 bg-white/90 rounded-xl border border-[#ded2c0] flex items-center justify-between shadow-xs">
              <button
                type="button"
                onClick={() => {
                  if (isSettingsUnlocked) {
                    if (activeTab === "orders") setActiveTab("products");
                  } else {
                    setPendingTabAfterUnlock("products");
                    setIsSettingsPasswordModalOpen(true);
                  }
                }}
                className="flex items-center gap-2 text-xs font-bold text-[#161412] hover:text-[#8c6b3e] transition-colors"
              >
                <div className="p-1 rounded-lg bg-[#f7f4ee] text-[#161412] border border-[#e4dcce]">
                  <Settings className={`w-3.5 h-3.5 ${isSettingsUnlocked ? "text-[#c5a880]" : "text-[#8c7865]"}`} />
                </div>
                <span>إعدادات المتجر</span>
              </button>

              {isSettingsUnlocked ? (
                <button
                  type="button"
                  onClick={handleLockSettings}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 transition-colors text-[10px] flex items-center gap-1 font-bold"
                  title="انقر لقفل الإعدادات"
                >
                  <Unlock className="w-3 h-3 text-emerald-600" />
                  <span>مفتوحة</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPendingTabAfterUnlock("products");
                    setIsSettingsPasswordModalOpen(true);
                  }}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors text-[10px] flex items-center gap-1 font-bold"
                  title="محمية بكلمة مرور، انقر للفتح"
                >
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>محمية</span>
                </button>
              )}
            </div>

            {/* Settings Tabs List */}
            <div className="space-y-0.5 pt-1">
              {groupNavItems(settingsTabs.map((t) => ({ id: t.id, label: t.label, icon: t.icon, badge: t.badge }))).map((group) => (
              <div key={group.title} className="space-y-0.5">
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold tracking-wide text-[#a08c75]">{group.title}</div>
              {group.items.map((item) => {
                const tab = { ...item, id: item.id as ActiveTab };
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-right ${
                      isActive
                        ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                        : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
                    } ${!isSettingsUnlocked ? "opacity-75" : ""}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-[#c5a880]" : "text-[#8c7865]"}>
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </div>

                    {!isSettingsUnlocked && (
                      <Lock className="w-3 h-3 text-[#baa996]" />
                    )}
                  </button>
                );
              })}
              </div>
              ))}
            </div>
          </div>
        )}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className={`p-4 sm:p-6 min-w-0 transition-all ${isPreviewOpen ? "w-full lg:w-[48%] xl:w-[45%] lg:border-l lg:border-[#ded2c0] lg:overflow-y-auto lg:h-[calc(100vh-65px)]" : "flex-1 lg:p-8"}`}>
          {/* ========================================================
              TAB 1: ORDERS
              ======================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Filter and Search Bar with Day/Date Filter & Manual Order Creation */}
              <div className="bg-white rounded-xl p-4 border border-[#e8ded0] space-y-3 shadow-sm text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 min-w-[220px]">
                    <input
                      type="text"
                      placeholder="ابحث باسم العميل، رقم الهاتف، أو رقم الطلب..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg pr-9 pl-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                    <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#756555] font-medium">الحالة:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-2 text-xs text-[#161412] focus:outline-none"
                    >
                      <option value="all">كافة الحالات ({orders.length})</option>
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                      <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                      <option value="processing">جاري التجهيز</option>
                      <option value="shipped">جاري الشحن</option>
                      <option value="completed">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>

                  {/* Day / Date Filter Preset */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#8c7865]" />
                    <span className="text-[#756555] font-medium">الفترة:</span>
                    <select
                      value={orderDatePreset}
                      onChange={(e) => setOrderDatePreset(e.target.value as "all" | "today" | "yesterday" | "last7" | "last30" | "custom")}
                      className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-2 text-xs text-[#161412] font-semibold focus:outline-none"
                    >
                      <option value="all">كافة الأوقات (الكل)</option>
                      <option value="today">اليوم ({orders.filter(o => formatOrderDateYMD(o.createdAt) === formatOrderDateYMD(new Date().toISOString())).length})</option>
                      <option value="yesterday">الأمس</option>
                      <option value="last7">آخر 7 أيام</option>
                      <option value="last30">آخر 30 يوم</option>
                      <option value="custom">اختيار يوم محدد...</option>
                    </select>
                  </div>

                  {/* Custom Date Input */}
                  {orderDatePreset === "custom" && (
                    <div className="flex items-center gap-1">
                      <input
                        type="date"
                        value={orderCustomDate}
                        onChange={(e) => setOrderCustomDate(e.target.value)}
                        className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2 py-1.5 text-xs text-[#161412] focus:outline-none font-mono"
                      />
                    </div>
                  )}

                  {/* Realtime Live Pulse Indicator */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium shadow-2xs select-none shrink-0"
                    title="المزامنة الفورية نشطة (Real-time Streaming) - تتحدث الطلبات تلقائياً فور تعديلها من تيليجرام أو السيرفر"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold tracking-tight">مزامنة فورية ⚡</span>
                  </div>

                  {/* Realtime Manual Refresh Orders Button */}
                  <button
                    type="button"
                    onClick={handleManualRefreshOrders}
                    disabled={isRefreshingOrders}
                    className="px-3 py-2 rounded-lg bg-[#f7f4ee] hover:bg-[#ede5d8] text-[#161412] border border-[#ded2c0] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 disabled:opacity-50"
                    title="تحديث ومزامنة كافة الطلبات من السحابة والسيرفر فورياً"
                  >
                    <RotateCw className={`w-3.5 h-3.5 text-[#8c7865] ${isRefreshingOrders ? "animate-spin text-[#c5a880]" : ""}`} />
                    <span>{isRefreshingOrders ? "جاري التحديث..." : "تحديث الطلبات"}</span>
                  </button>

                  {/* Shopify-style Create Manual Order Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setManualOrderForm({
                        customerName: "",
                        phone: "",
                        email: "",
                        governorate: "القاهرة",
                        address: "",
                        notes: "",
                        paymentMethod: "cod",
                        discount: 0,
                        customShippingFee: null,
                        items: [],
                      });
                      setIsCreateOrderModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] border border-[#c5a880]/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
                    title="إنشاء طلب يدوي لعميل وإضافته للسيستم"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ طلب / عميل جديد</span>
                  </button>
                </div>

                {/* Date Filter Active Information Banner */}
                {orderDatePreset !== "all" && (
                  <div className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-[#161412]">
                      <Calendar className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>
                        فلترة اليوم: <strong>{orderDatePreset === "today" ? "اليوم" : orderDatePreset === "yesterday" ? "الأمس" : orderDatePreset === "custom" ? (orderCustomDate || "تاريخ محدد") : orderDatePreset === "last7" ? "آخر 7 أيام" : "آخر 30 يوم"}</strong>
                      </span>
                      <span className="bg-white border border-[#ded2c0] px-2 py-0.5 rounded text-[11px] font-bold text-[#161412]">
                        {filteredOrders.length} طلب
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#756555]">
                        إجمالي مبيعات اليوم: <strong className="text-[#161412] font-mono">{filteredOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0).toLocaleString("en-US")} ج.م</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderDatePreset("all");
                          setOrderCustomDate("");
                        }}
                        className="text-xs text-rose-700 hover:text-rose-900 underline font-medium"
                      >
                        عرض الكل
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Select All & Bulk Actions Toolbar */}
              <div className="bg-white rounded-xl p-3 px-4 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
                <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#161412] select-none">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={() => {
                      if (selectedOrderIds.length === filteredOrders.length) {
                        setSelectedOrderIds([]);
                      } else {
                        setSelectedOrderIds(filteredOrders.map((o) => o.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-[#ded2c0] text-[#161412] cursor-pointer accent-[#161412]"
                  />
                  <span>تحديد الكل ({filteredOrders.length} طلب)</span>
                </label>

                {selectedOrderIds.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#161412] text-[#f7f4ee] px-2.5 py-1 rounded-md text-[11px] font-bold">
                      تم تحديد: {selectedOrderIds.length}
                    </span>

                    {/* Bulk Status Select */}
                    <div className="flex items-center gap-1">
                      <select
                        value={bulkStatusToApply}
                        onChange={(e) => setBulkStatusToApply(e.target.value as Order["status"])}
                        className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-1 text-xs text-[#161412] font-medium focus:outline-none"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                        <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                        <option value="processing">جاري التجهيز</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="completed">تم التوصيل بنجاح</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من تغيير حالة ${selectedOrderIds.length} طلبات إلى "${bulkStatusToApply}"؟`)) {
                            bulkUpdateOrderStatus(selectedOrderIds, bulkStatusToApply);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] text-xs font-bold transition-all shadow-sm"
                      >
                        تطبيق
                      </button>
                    </div>

                    {/* Print Selected Invoices */}
                    <button
                      type="button"
                      onClick={() => {
                        const toPrint = orders.filter((o) => selectedOrderIds.includes(o.id));
                        handlePrintMultipleOrders(toPrint);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#f7f4ee] hover:bg-[#e8ded0] border border-[#ded2c0] text-[#161412] text-xs font-medium flex items-center gap-1 transition-all"
                      title="طباعة بوالص الشحن للطلبات المحددة"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>طباعة البوالص ({selectedOrderIds.length})</span>
                    </button>

                    {/* Export Selected to CSV */}
                    <button
                      type="button"
                      onClick={() => {
                        const toExport = orders.filter((o) => selectedOrderIds.includes(o.id));
                        exportOrdersToCSV(toExport);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#f7f4ee] hover:bg-[#e8ded0] border border-[#ded2c0] text-[#161412] text-xs font-medium flex items-center gap-1 transition-all"
                      title="تصدير الطلبات المحددة كملف Excel / CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>تصدير CSV</span>
                    </button>

                    {/* Deselect Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderIds([])}
                      className="px-2 py-1 text-xs text-[#756555] hover:text-[#161412] underline"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8c7865]">
                    يمكنك تحديد عدة طلبات لتغيير حالتها دفعة واحدة أو طباعة البوالص وتصديرها
                  </span>
                )}
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#e8ded0]">
                  <ShoppingBag className="w-12 h-12 text-[#baa996] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-[#161412] mb-1">لا توجد طلبات تطابق هذا البحث</h3>
                  <p className="text-xs text-[#756555]">ستظهر جميع الطلبات الجديدة هنا فور ورودها تلقائياً.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const whatsappLink = `https://wa.me/20${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `أهلاً بحضرتك يا ${order.customerName}، بنكلمك من متجر ORMA للفضة 925 بخصوص طلبك رقم (${order.id}) بقيمة ${order.total} ج.م.`
                    )}`;
                    const totalItemsCount = order.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
                    const isSelected = selectedOrderIds.includes(order.id);

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForDetails(order)}
                        className={`rounded-xl py-2.5 px-3.5 sm:px-4 border transition-all cursor-pointer group shadow-2xs hover:shadow-md ${
                          isSelected
                            ? "bg-[#fdfbf7] border-[#c5a880] ring-1 ring-[#c5a880]"
                            : "bg-white border-[#e8ded0] hover:border-[#c5a880]"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
                          {/* Order Overview Right */}
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            {/* Checkbox for Select All / Bulk */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 flex items-center justify-center"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedOrderIds((prev) =>
                                    prev.includes(order.id) ? prev.filter((id) => id !== order.id) : [...prev, order.id]
                                  );
                                }}
                                className="w-4 h-4 rounded border-[#ded2c0] text-[#161412] cursor-pointer accent-[#161412]"
                              />
                            </div>

                            {/* Luxury Order ID Badge */}
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#161412] text-[#f7f4ee] font-mono font-bold text-xs border border-[#3e3832] shadow-xs tracking-wider shrink-0">
                              <span className="text-[#c5a880] text-[10px]">#</span>
                              <span>{order.id.replace(/^#/, "")}</span>
                            </div>

                            {/* Date & Payment Badges */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[11px] text-[#8c7865] whitespace-nowrap">
                                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {order.paymentMethod && (
                                <span className="hidden sm:inline-block text-[10px] font-semibold bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e8ded0] text-[#756555] whitespace-nowrap">
                                  {order.paymentMethod === "cod" ? "عند الاستلام" : order.paymentMethod === "wallet" ? "محفظة" : "فيزا"}
                                </span>
                              )}
                            </div>

                            {/* Customer & Item Details */}
                            <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-bold text-[#161412] truncate group-hover:text-[#8c6b3e] transition-colors">
                                {order.customerName}
                              </h4>
                              <span className="text-xs text-[#756555] font-medium whitespace-nowrap">• {order.governorate}</span>
                              <span className="dir-ltr text-xs font-mono text-[#8c7865] whitespace-nowrap">• {order.phone}</span>
                              <span className="text-[10px] font-bold bg-[#f7f4ee] text-[#161412] px-1.5 py-0.5 rounded border border-[#ded2c0] whitespace-nowrap">
                                {totalItemsCount} {totalItemsCount === 1 ? "قطعة" : "قطع"}
                              </span>
                            </div>
                          </div>

                          {/* Order Financials & Quick Actions Left */}
                          <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#f0e8dc] shrink-0">
                            {/* Price */}
                            <div className="text-right lg:text-left pl-1">
                              <span className="text-sm sm:text-base font-bold text-[#161412] font-mono">
                                {order.total.toLocaleString("en-US")} <span className="text-[10px] font-normal text-[#8c7865]">ج.م</span>
                              </span>
                            </div>

                            {/* Status Dropdown */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                                  order.status === "pending"
                                    ? "bg-amber-50 text-amber-900 border-amber-300"
                                    : order.status.startsWith("confirmed")
                                    ? "bg-blue-50 text-blue-900 border-blue-300"
                                    : order.status === "shipped"
                                    ? "bg-purple-50 text-purple-900 border-purple-300"
                                    : order.status === "completed"
                                    ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                    : "bg-gray-100 text-gray-700 border-gray-300"
                                }`}
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                                <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                                <option value="processing">جاري التجهيز</option>
                                <option value="shipped">تم الشحن</option>
                                <option value="completed">تم التوصيل بنجاح</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                            </div>

                            {/* Open Details Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderForDetails(order);
                              }}
                              className="px-3 py-1 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all flex items-center gap-1 shadow-xs shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
                              <span>التفاصيل</span>
                            </button>

                            {/* WhatsApp Link */}
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shrink-0"
                              title="محادثة واتساب سريعة"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: CUSTOMERS DIRECTORY (قاعدة العملاء)
              ======================================================== */}
          {activeTab === "customers" && canViewOrders && (
            <div className="space-y-6">
              {/* Header Box */}
              <div className="bg-white rounded-2xl border border-[#e8ded0] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#f7f4ee] border border-[#ded2c0] flex items-center justify-center text-[#161412]">
                      <Users className="w-4 h-4 text-[#c5a880]" />
                    </div>
                    <h3 className="font-amiri text-xl font-bold text-[#161412]">
                      قاعدة العملاء والمشترين
                    </h3>
                  </div>
                  <p className="text-xs text-[#756555] mt-1">
                    سجل شامل ومحدث تلقائياً ببيانات كافة العملاء، مع إمكانية التواصل الفوري وإصدار طلبات جديدة.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualOrderForm({
                        customerName: "",
                        phone: "",
                        email: "",
                        governorate: "القاهرة",
                        address: "",
                        notes: "",
                        paymentMethod: "cod",
                        discount: 0,
                        customShippingFee: null,
                        items: [],
                      });
                      setIsCreateOrderModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-[#c5a880]" />
                    <span>+ إضافة طلب / عميل جديد</span>
                  </button>
                </div>
              </div>

              {/* Customer Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-[#e8ded0] shadow-sm">
                  <span className="text-xs text-[#756555] block mb-1">إجمالي العملاء المسجلين</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#161412] font-mono">
                    {customersList.length}
                    <span className="text-xs font-normal text-[#8c7865] mr-1">عميل</span>
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#e8ded0] shadow-sm">
                  <span className="text-xs text-[#756555] block mb-1">عملاء متكررين الشراء</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
                    {customersList.filter((c) => c.totalOrders > 1).length}
                    <span className="text-xs font-normal text-[#8c7865] mr-1">عميل</span>
                  </span>
                </div>

                <div className="bg-white rounded-xl p-4 border border-[#e8ded0] shadow-sm">
                  <span className="text-xs text-[#756555] block mb-1">متوسط إنفاق العميل</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#161412] font-mono">
                    {customersList.length > 0
                      ? Math.round(
                          customersList.reduce((acc, c) => acc + c.totalSpent, 0) /
                            customersList.length
                        ).toLocaleString("en-US")
                      : 0}
                    <span className="text-xs font-normal text-[#8c7865] mr-1">ج.م</span>
                  </span>
                </div>
              </div>

              {/* Customer Filters and Search */}
              <div className="bg-white rounded-xl p-4 border border-[#e8ded0] space-y-3 shadow-sm text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <input
                      type="text"
                      placeholder="ابحث باسم العميل، رقم الهاتف، أو المحافظة..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg pr-9 pl-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                    <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[#756555] font-medium">الترتيب حسب:</span>
                    <select
                      value={customerSortBy}
                      onChange={(e) => setCustomerSortBy(e.target.value as "recent" | "orders" | "spent")}
                      className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-2 text-xs text-[#161412] font-semibold focus:outline-none"
                    >
                      <option value="recent">الأحدث نشاطاً وطلباً</option>
                      <option value="orders">الأكثر طلباً (عدد الطلبات)</option>
                      <option value="spent">الأعلى إنفاقاً (إجمالي الشراء)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Customers Grid */}
              {filteredCustomers.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#e8ded0]">
                  <Users className="w-12 h-12 text-[#baa996] mx-auto mb-3 opacity-60" />
                  <h3 className="text-base font-bold text-[#161412] mb-1">لا يوجد عملاء مطابقين للبحث</h3>
                  <p className="text-xs text-[#756555]">سيتم تسجيل أي عميل يقوم بالطلب تلقائياً هنا في قاعدة العملاء.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCustomers.map((cust) => {
                    const cleanPhone = cust.phone.replace(/\D/g, "");
                    const waLink = `https://wa.me/20${cleanPhone}?text=${encodeURIComponent(
                      `أهلاً بحضرتك يا ${cust.name}، بنكلمك من متجر ORMA للفضة الإسترليني 925.`
                    )}`;

                    return (
                      <div
                        key={cust.phone || cust.name}
                        className="bg-white rounded-2xl border border-[#e8ded0] p-4 sm:p-5 shadow-xs hover:border-[#c5a880] hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-3">
                          {/* Top: Avatar & Name */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-full bg-[#161412] text-[#c5a880] font-bold text-sm flex items-center justify-center border border-[#c5a880]/30 shrink-0 shadow-xs">
                                {cust.name.slice(0, 1)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-[#161412] truncate">
                                  {cust.name}
                                </h4>
                                <span className="font-mono text-xs text-[#8c7865] dir-ltr block">
                                  {cust.phone}
                                </span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f7f4ee] text-[#161412] border border-[#ded2c0] shrink-0">
                              {cust.totalOrders} {cust.totalOrders === 1 ? "طلب" : "طلبات"}
                            </span>
                          </div>

                          {/* Address Info */}
                          <div className="bg-[#faf8f5] p-2.5 rounded-xl border border-[#ede5d8] text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-[#161412] font-semibold">
                              <MapPin className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                              <span>{cust.governorate}</span>
                            </div>
                            {cust.address && (
                              <p className="text-[11px] text-[#756555] truncate" title={cust.address}>
                                {cust.address}
                              </p>
                            )}
                          </div>

                          {/* Financials & Last Order */}
                          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f0e8dc]">
                            <div>
                              <span className="block text-[10px] text-[#8c7865]">إجمالي المشتريات:</span>
                              <span className="font-bold text-[#161412] font-mono text-sm">
                                {cust.totalSpent.toLocaleString("en-US")} ج.م
                              </span>
                            </div>
                            <div className="text-left">
                              <span className="block text-[10px] text-[#8c7865]">آخر نشاط:</span>
                              <span className="text-[11px] text-[#5c4f42] font-medium">
                                {new Date(cust.lastOrderDate).toLocaleDateString("ar-EG", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Actions Row */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-[#f0e8dc]">
                          <button
                            type="button"
                            onClick={() => {
                              setOrderSearchQuery(cust.phone || cust.name);
                              setActiveTab("orders");
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#f7f4ee] hover:bg-[#ede3d3] border border-[#ded2c0] text-[11px] font-bold text-[#161412] transition-colors text-center"
                          >
                            عرض الطلبات
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setManualOrderForm({
                                customerName: cust.name,
                                phone: cust.phone,
                                email: "",
                                governorate: cust.governorate || "القاهرة",
                                address: cust.address || "",
                                notes: "",
                                paymentMethod: "cod",
                                discount: 0,
                                customShippingFee: null,
                                items: [],
                              });
                              setIsCreateOrderModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-[#161412] hover:bg-[#2e2925] text-[11px] font-bold text-[#c5a880] transition-colors"
                            title="إنشاء طلب جديد لهذا العميل"
                          >
                            + طلب
                          </button>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors"
                            title="محادثة واتساب"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <a
                            href={`tel:${cust.phone}`}
                            className="p-1.5 rounded-lg bg-[#f7f4ee] hover:bg-[#ede3d3] border border-[#ded2c0] text-[#161412] transition-colors"
                            title="اتصال هاتفي"
                          >
                            <PhoneCall className="w-4 h-4 text-[#c5a880]" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: ANALYTICS & REPORTS (التقارير والإحصائيات)
              ======================================================== */}
          {activeTab === "analytics" && canViewOrders && <AnalyticsTab orders={orders} orderMetrics={orderMetrics} />}

          {/* ========================================================
              TAB 2: PRODUCTS
              ======================================================== */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Top Controls */}
              <div className="bg-white rounded-xl p-4 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <button
                  onClick={handleOpenNewProduct}
                  className="px-5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-colors shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#c5a880]" />
                  <span>إضافة قطعة جديدة</span>
                </button>

                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="ابحث في المنتجات..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  >
                    <option value="all">كافة الكولكشن والأقسام</option>
                    {(settingsForm.categories && settingsForm.categories.length > 0
                      ? settingsForm.categories
                      : DEFAULT_CATEGORIES
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProductsList.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-[#e8ded0] p-4 flex flex-col justify-between shadow-sm hover:border-[#b8a892] transition-colors"
                  >
                    <div>
                      {/* Photo */}
                      <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#faf8f5] mb-3 border border-[#ded2c0]">
                        <img
                          src={product.images[0]}
                          alt={product.arabicName}
                          className="w-full h-full object-cover"
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                            نفذت الكمية
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {product.isBestSeller && (
                            <span className="bg-[#161412] text-[#c5a880] text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              الأكثر مبيعاً
                            </span>
                          )}
                          {product.isNew && (
                            <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              جديد
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-[#161412] line-clamp-1 mb-1">
                        {product.arabicName}
                      </h4>
                      {product.name && (
                        <p className="text-[11px] text-[#8c7865] line-clamp-1 mb-2 font-mono">
                          {product.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-[#161412]">
                          {product.price.toLocaleString("en-US")} ج.م
                        </span>
                        {product.originalPrice && (
                          <span className="text-[11px] text-[#8c7865] line-through">
                            {product.originalPrice.toLocaleString("en-US")} ج.م
                          </span>
                        )}
                      </div>

                      {/* Product Collections Badges */}
                      <div className="flex flex-wrap items-center gap-1 mb-3">
                        {(product.collections && product.collections.length > 0
                          ? product.collections
                          : [product.category]
                        ).map((colId) => {
                          const matchedCol = (settingsForm.categories || DEFAULT_CATEGORIES).find(
                            (c) => c.id === colId || c.slug === colId
                          );
                          return (
                            <span
                              key={colId}
                              className="text-[9px] bg-[#f0e7db] text-[#5c4f42] px-1.5 py-0.5 rounded font-medium"
                            >
                              {matchedCol?.label || colId}
                            </span>
                          );
                        })}
                      </div>
                      {/* Inventory Stock Indicator with quick adjustment */}
                      <div className="bg-[#f7f4ee] rounded-lg p-2 mb-3 border border-[#ded2c0] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              !product.inStock || (product.stockQuantity ?? 10) <= 0
                                ? "bg-rose-500"
                                : (product.stockQuantity ?? 10) <= 5
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="font-medium text-[#161412]">
                            المخزون:{" "}
                            <strong className="font-bold">
                              {product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 10 : 0)}
                            </strong>{" "}
                            قطعة
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 10 : 0);
                              const next = Math.max(0, cur - 1);
                              updateProduct(product.id, {
                                stockQuantity: next,
                                inStock: next > 0,
                              });
                            }}
                            className="w-9 h-9 md:w-5 md:h-5 rounded bg-white border border-[#ded2c0] flex items-center justify-center text-sm md:text-xs font-bold hover:bg-gray-100"
                            title="خصم 1 من المخزون"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const cur = product.stockQuantity !== undefined ? product.stockQuantity : (product.inStock ? 10 : 0);
                              const next = cur + 1;
                              updateProduct(product.id, {
                                stockQuantity: next,
                                inStock: true,
                              });
                            }}
                            className="w-9 h-9 md:w-5 md:h-5 rounded bg-white border border-[#ded2c0] flex items-center justify-center text-sm md:text-xs font-bold hover:bg-gray-100"
                            title="إضافة 1 للمخزون"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Stock Toggle */}
                    <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          const nextInStock = !product.inStock;
                          const nextStock = nextInStock ? (product.stockQuantity && product.stockQuantity > 0 ? product.stockQuantity : 10) : 0;
                          updateProduct(product.id, {
                            inStock: nextInStock,
                            stockQuantity: nextStock,
                          });
                          addToast("تم التحديث", `تم تعديل حالة توفر "${product.arabicName}"`, "info");
                        }}
                        className={`text-[11px] font-bold px-3 py-2 md:px-2.5 md:py-1 rounded transition-colors ${
                          product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0)
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {product.inStock && (product.stockQuantity === undefined || product.stockQuantity > 0) ? "متوفر للطلب" : "غير متوفر (SOLD OUT)"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="p-1.5 rounded text-[#5c4f42] hover:text-[#161412] hover:bg-[#f7f4ee]"
                          title="تعديل القطعة"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف "${product.arabicName}"؟`)) {
                              deleteProduct(product.id);
                              addToast("تم الحذف", `تم حذف "${product.arabicName}"`, "info");
                            }
                          }}
                          className="p-1.5 rounded text-[#baa894] hover:text-rose-600 hover:bg-rose-50"
                          title="حذف القطعة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: COLLECTIONS & CATEGORIES MANAGER
              ======================================================== */}
          {activeTab === "collections" && (
            <CollectionsTab settingsForm={settingsForm} handleSaveSettings={handleSaveSettings} products={products} isSavingSettings={isSavingSettings} handleOpenAddCollection={handleOpenAddCollection} handleOpenEditCollection={handleOpenEditCollection} handleDeleteCollection={handleDeleteCollection} />
          )}

          {/* ========================================================
              TAB: CUSTOM PAGES & BRAND STORY MANAGER
              ======================================================== */}
          {activeTab === "pages" && (
            <PagesTab settingsForm={settingsForm} handleSaveSettings={handleSaveSettings} isSavingSettings={isSavingSettings} handleOpenAddPage={handleOpenAddPage} handleOpenEditPage={handleOpenEditPage} handleDeletePage={handleDeletePage} />
          )}

          {/* ========================================================
              TAB: CUSTOM PROMOTIONAL BANNERS & PLACEMENT
              ======================================================== */}
          {activeTab === "banners" && (
            <BannersTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} addToast={addToast} isSavingSettings={isSavingSettings} />
          )}

          {/* ========================================================
              TAB 3: HERO BANNER & MULTI-IMAGE CAROUSEL SLIDER
              ======================================================== */}
          {activeTab === "hero" && (
            <HeroTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} addToast={addToast} isSavingSettings={isSavingSettings} />
          )}

          {/* ========================================================
              TAB 4: MARQUEE
              ======================================================== */}
          {activeTab === "marquee" && (
            <MarqueeTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 5: NAV & SEARCH
              ======================================================== */}
          {activeTab === "nav" && (
            <NavTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 6: STORY & CARE (القصة والعناية)
              ======================================================== */}
          {activeTab === "story" && (
            <StoryTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} addToast={addToast} />
          )}

          {/* ========================================================
              TAB 7: FOOTER
              ======================================================== */}
          {activeTab === "footer" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                  <FileText className="w-4 h-4 text-[#c5a880]" />
                  <span>الفوتر (أسفل الصفحة)</span>
                </div>
                <p className="text-xs leading-relaxed text-[#756555]">
                  الفوتر في تصميم ORMA ثابت (الشعار والشعار اللفظي وحقوق النشر)، وبياخد محتواه من الأقسام التالية، فاضغط على القسم اللي عايز تعدله:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "contact", title: "التواصل والسوشيال", desc: "رقم الهاتف، الإيميل، روابط إنستجرام وفيسبوك وتيك توك اللي بتظهر كأيقونات في الفوتر." },
                    { id: "pages", title: "الصفحات المستقلة", desc: "روابط (تواصل معنا، العناية بالفضة، عن ORMA، الاستبدال، الضمان) وأي صفحة جديدة تفعّل لها «إظهار في الفوتر»." },
                  ].map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => handleTabClick(x.id as ActiveTab)}
                      className="w-full text-right min-h-[56px] px-4 py-3 rounded-xl border border-[#e8ded0] bg-[#fbf9f5] hover:bg-[#f3ece0] transition-colors"
                    >
                      <span className="block text-sm font-bold text-[#161412]">{x.title}</span>
                      <span className="block text-[11px] text-[#756555] mt-0.5">{x.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: CHECKOUT (صفحة الدفع والشراء المستقلة)
              ======================================================== */}
          {activeTab === "checkout" && (
            <CheckoutTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} isSavingSettings={isSavingSettings} />
          )}

          {/* ========================================================
              TAB 8: PAYMENT
              ======================================================== */}
          {activeTab === "payment" && (
            <div className="space-y-6 max-w-4xl">
              {/* Electronic Wallets */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <CreditCard className="w-4 h-4 text-[#c5a880]" />
                  <span>المحافظ الإلكترونية وإنستاباي (InstaPay & Vodafone Cash)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      رقم هاتف إنستاباي
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instaPayNumber || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instaPayNumber: e.target.value })}
                      placeholder="01143837730"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      اسم الحساب على إنستاباي
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instaPayAccountName || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instaPayAccountName: e.target.value })}
                      placeholder="ORMA Silver Store"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      عنوان الدفع (IPA / Username)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instaPayUsername || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instaPayUsername: e.target.value })}
                      placeholder="theorma@instapay"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f0e8dc]">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      رقم محفظة فودافون كاش
                    </label>
                    <input
                      type="text"
                      value={settingsForm.vodafoneCashNumber || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, vodafoneCashNumber: e.target.value })}
                      placeholder="01143837730"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.requireReceiptUpload !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, requireReceiptUpload: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>إلزام العميل برفع صورة إيصال التحويل عند الطلب</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    تعليمات التحويل للعميل (Wallet Instructions)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.walletInstructions || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, walletInstructions: e.target.value })}
                    placeholder="يرجى تحويل المبلغ الإجمالي ثم إرفاق لقطة شاشة للإيصال لتأكيد الطلب فوراً..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>

              {/* Paymob Gateway */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#c5a880]" />
                    <span>بوابة الدفع الإلكتروني بالبطاقات (Paymob)</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#161412]">
                    <input
                      type="checkbox"
                      checked={settingsForm.paymobEnabled || false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymobEnabled: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <span>تفعيل الدفع بالفيزا / ماستركارد</span>
                  </label>
                </div>

                <p className="text-[11px] leading-relaxed text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  تنبيه: ربط بوابة الدفع الإلكتروني لسه مش مفعّل في المتجر، البيانات هنا بتتحفظ فقط لحين تفعيل الدفع بالبطاقات لاحقاً.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      مفتاح الواجهة (Paymob API Key)
                    </label>
                    <input
                      type="password"
                      value={settingsForm.paymobApiKey || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymobApiKey: e.target.value })}
                      placeholder="ZXlKaGJHY2lPaUpJVXpJMU5p..."
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      وضع التشغيل (Mode)
                    </label>
                    <select
                      value={settingsForm.paymobMode || "test"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymobMode: e.target.value as "test" | "live" })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    >
                      <option value="test">بيئة تجريبية (Test Sandbox)</option>
                      <option value="live">بيئة حية للإنتاج (Live Production)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      معرف الربط (Integration ID)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paymobIntegrationId || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymobIntegrationId: e.target.value })}
                      placeholder="123456"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      معرف الإطار (Iframe ID)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.paymobIframeId || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, paymobIframeId: e.target.value })}
                      placeholder="789012"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ إعدادات بوابات الدفع</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 9: SHIPPING
              ======================================================== */}
          {activeTab === "shipping" && (
            <ShippingTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 10: PROMOS
              ======================================================== */}
          {activeTab === "promos" && (
            <PromosTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 11: CONTACT
              ======================================================== */}
          {activeTab === "contact" && (
            <ContactTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 12: LOGO & IDENTITY
              ======================================================== */}
          {activeTab === "logo" && (
            <LogoTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} addToast={addToast} />
          )}

          {/* ========================================================
              TAB 13: EMAIL
              ======================================================== */}
          {activeTab === "email" && (
            <EmailTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 14: POLICIES
              ======================================================== */}
          {activeTab === "policies" && (
            <PoliciesTab settingsForm={settingsForm} setSettingsForm={setSettingsForm} handleSaveSettings={handleSaveSettings} />
          )}

          {/* ========================================================
              TAB 15: USERS & PERMISSIONS (Super Admin Only)
              ======================================================== */}
          {activeTab === "users" && canManageUsers && (
            <UsersTab settingsForm={settingsForm} onOpenAddUser={() => { setNewUserError(""); setNewUserName(""); setNewUsername(""); setNewUserPassword(""); setNewUserRole("orders_customers"); setIsAddUserModalOpen(true); }} handleToggleUserActive={handleToggleUserActive} handleDeleteUser={handleDeleteUser} />
          )}
        </main>

        {/* SHOPIFY-STYLE LIVE PREVIEW PANEL (Split Screen) */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[70] h-[100dvh] bg-[#f1e9dc] lg:bg-[#ede4d5]/40 flex flex-col lg:static lg:flex-1 lg:z-20 lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)] overflow-hidden lg:border-t-0 border-[#ded2c0]">
            {/* Preview Toolbar */}
            <div className="bg-white/95 backdrop-blur-md border-b border-[#ded2c0] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#161412] flex items-center gap-1.5 font-amiri text-sm">
                  <Eye className="w-4 h-4 text-[#c5a880]" />
                  المعاينة الحية للمتجر
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  مباشر (Shopify Mode)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Device Switcher */}
                <div className="flex items-center bg-[#f7f4ee] rounded-lg p-0.5 border border-[#ded2c0]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                      previewDevice === "desktop"
                        ? "bg-white shadow-sm font-bold text-[#161412]"
                        : "text-[#756555] hover:text-[#161412]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">كمبيوتر</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all ${
                      previewDevice === "mobile"
                        ? "bg-white shadow-sm font-bold text-[#161412]"
                        : "text-[#756555] hover:text-[#161412]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">موبايل</span>
                  </button>
                </div>

                {/* Refresh Preview */}
                <button
                  type="button"
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="p-1.5 rounded-lg border border-[#ded2c0] bg-white text-[#5c4f42] hover:text-[#161412] hover:bg-[#f7f4ee] transition-colors"
                  title="تحديث نافذة المعاينة"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Open in new tab */}
                <Link
                  href="/"
                  target="_blank"
                  className="p-1.5 rounded-lg border border-[#ded2c0] bg-white text-[#5c4f42] hover:text-[#161412] hover:bg-[#f7f4ee] transition-colors"
                  title="فتح في تبويب جديد"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {/* Close Preview */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg border border-[#ded2c0] bg-white text-[#756555] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="إغلاق المعاينة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Iframe Viewport Container */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-3 bg-[#e8ded0]/30">
              <div
                className={`h-full transition-all duration-300 rounded-xl overflow-hidden shadow-xl border border-[#ded2c0] bg-white ${
                  previewDevice === "mobile"
                    ? "w-[390px] max-w-full my-auto ring-8 ring-[#161412] rounded-[36px]"
                    : "w-full"
                }`}
              >
                <iframe
                  ref={iframeRef}
                  key={previewKey}
                  src="/"
                  title="معاينة المتجر المباشرة"
                  className="w-full h-full border-0"
                  onLoad={() => {
                    setTimeout(() => {
                      iframeRef.current?.contentWindow?.postMessage(
                        { type: "ORMA_SETTINGS_UPDATE", settings: settingsForm },
                        "*"
                      );
                      iframeRef.current?.contentWindow?.postMessage(
                        { type: "ORMA_SCROLL_TO", tab: activeTab },
                        "*"
                      );
                    }, 250);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          FULL-FEATURED PRODUCT ADD / EDIT MODAL
          ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-[#e8ded0] shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-5">
              <h3 className="font-amiri text-xl font-bold text-[#161412]">
                {editingProductId ? "تعديل بيانات قطعة الفضة" : "إضافة قطعة فضة جديدة إلى المتجر"}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#8c7865] hover:text-[#161412] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">اسم القطعة بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={productForm.arabicName}
                    onChange={(e) => setProductForm({ ...productForm, arabicName: e.target.value })}
                    placeholder="خاتم ORMA الملكي فضة 925"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={productForm.name || ""}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Royal Orma Signet Ring"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">السعر الحالي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ""}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) || undefined })}
                    placeholder="1550"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">الوزن بالجرام التقريبي *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={productForm.weightGrams || 5}
                    onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1 flex items-center justify-between">
                    <span>الكمية بالمخزون *</span>
                    <span className="text-[10px] text-[#8c7865] font-mono">Stock Qty</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stockQuantity !== undefined ? productForm.stockQuantity : 10}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProductForm({
                        ...productForm,
                        stockQuantity: val,
                        inStock: val > 0,
                      });
                    }}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none transition-colors ${
                      (productForm.stockQuantity ?? 10) <= 0
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-[#f7f4ee] border-[#ded2c0] text-[#161412]"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">القسم الرئيسي</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  >
                    {(settingsForm.categories && settingsForm.categories.length > 0
                      ? settingsForm.categories
                      : DEFAULT_CATEGORIES
                    ).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">التصنيف حسب الجنس</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value as "men" | "women" | "unisex" })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  >
                    <option value="women">نسائي (Women)</option>
                    <option value="men">رجالي (Men)</option>
                    <option value="unisex">للجنسين (Unisex)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">العيار والنقاء</label>
                  <input
                    type="text"
                    value={productForm.purity}
                    onChange={(e) => setProductForm({ ...productForm, purity: e.target.value })}
                    placeholder="فضة إسترليني عيار 925 معتمدة"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>

              {/* Collection Assignment Section (Multi-select) */}
              <div className="p-3.5 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-xs text-[#161412] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>الكولكشن والمجموعات التابعة لها القطعة (تحديد متعدد)</span>
                  </label>
                  <span className="text-[10px] text-[#756555]">
                    اختر المجموعات التي ترغب بظهور المنتج بداخلها
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {(settingsForm.categories && settingsForm.categories.length > 0
                    ? settingsForm.categories
                    : DEFAULT_CATEGORIES
                  ).map((col) => {
                    const isChecked = (productForm.collections || [productForm.category]).includes(col.id) || (productForm.collections || []).includes(col.slug || "");
                    return (
                      <label
                        key={col.id}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-white border-[#161412] text-[#161412] font-bold shadow-xs"
                            : "bg-white/60 border-[#ded2c0] text-[#756555] hover:border-[#b8a490]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const cur = new Set(productForm.collections || [productForm.category]);
                            if (e.target.checked) {
                              cur.add(col.id);
                              if (col.slug) cur.add(col.slug);
                            } else {
                              cur.delete(col.id);
                              if (col.slug) cur.delete(col.slug);
                            }
                            setProductForm((prev) => ({
                              ...prev,
                              collections: Array.from(cur),
                            }));
                          }}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span className="truncate">{col.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Image Gallery Manager */}
              <div className="space-y-3 p-3.5 bg-[#f7f4ee] rounded-xl border border-[#ded2c0]">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#161412] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>معرض صور القطعة (يمكنك إضافة صور متعددة)</span>
                    <span className="text-[10px] bg-[#161412] text-[#f7f4ee] px-2 py-0.5 rounded-full font-sans">
                      {productForm.images.filter(img => img && img.trim()).length} صور
                    </span>
                  </label>
                  <span className="text-[10px] text-[#756555]">
                    الصورة الأولى هي الصورة الرئيسية للمنتج
                  </span>
                </div>

                {/* Grid of uploaded images */}
                {productForm.images.filter(img => img && img.trim()).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {productForm.images.filter(img => img && img.trim()).map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border bg-white aspect-square group shadow-sm ${
                          idx === 0 ? "ring-2 ring-[#c5a880] border-[#c5a880]" : "border-[#ded2c0]"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />

                        {/* Primary Badge */}
                        {idx === 0 && (
                          <div className="absolute top-1 right-1 bg-[#161412] text-[#c5a880] text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-10">
                            ⭐ رئيسية
                          </div>
                        )}

                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 text-[10px] text-white z-20">
                          {idx !== 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...productForm.images.filter(img => img && img.trim())];
                                const [selected] = current.splice(idx, 1);
                                setProductForm((prev) => ({
                                  ...prev,
                                  images: [selected, ...current],
                                }));
                              }}
                              className="px-2 py-1 rounded bg-[#c5a880] text-[#161412] font-bold hover:bg-[#d8c09a]"
                            >
                              تعيين كرئيسية
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = productForm.images.filter((_, i) => i !== idx);
                              setProductForm((prev) => ({
                                ...prev,
                                images: filtered.length > 0 ? filtered : [""],
                              }));
                            }}
                            className="px-2 py-1 rounded bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-[#ded2c0] text-center text-[#756555] text-xs">
                    لم تقم بإضافة أي صور للمنتج بعد. ارفع صورة أو أكثر من جهازك دفعة واحدة أو الصق الرابط أدناه.
                  </div>
                )}

                {/* Upload & Link Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e8ded0]">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleMultipleFilesUpload(e.target.files)}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>{isUploading ? "جاري الرفع..." : "رفع صور من جهازك (اختيار متعدد)"}</span>
                  </button>

                  <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      placeholder="أو الصق رابط صورة https://..."
                      className="flex-1 bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newImageUrlInput.trim()) {
                          setProductForm((prev) => ({
                            ...prev,
                            images: [...prev.images.filter(img => img && img.trim()), newImageUrlInput.trim()],
                          }));
                          setNewImageUrlInput("");
                          addToast("تمت الإضافة", "تمت إضافة رابط الصورة إلى المعرض", "info");
                        }
                      }}
                      className="px-3 py-2 rounded-lg bg-white border border-[#ded2c0] text-[#161412] hover:bg-[#ede5d8] text-xs font-bold whitespace-nowrap"
                    >
                      إضافة رابط
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">الوصف التفصيلي للقطعة</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="صُنع بحرفية فائقة من الفضة الإسترليني عيار 925 الأصلية..."
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  المميزات والمواصفات (اكتب كل ميزة في سطر منفصل)
                </label>
                <textarea
                  rows={2}
                  value={productFeaturesText}
                  onChange={(e) => setProductFeaturesText(e.target.value)}
                  placeholder="فضة إسترليني أصلية مختومة عيار 925&#10;علبة مخملية فاخرة وشهادة ضمان"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                />
              </div>

              {/* Smart Product Attributes: Ring Sizes Builder vs Weight-based Piece */}
              {(() => {
                const isRingType =
                  productForm.category === "rings" ||
                  productForm.category?.toLowerCase().includes("ring") ||
                  productForm.arabicName?.includes("خاتم") ||
                  productForm.arabicName?.includes("دبل") ||
                  (productForm.collections || []).some(
                    (c) => c === "rings" || c.toLowerCase().includes("ring") || c.includes("خواتم")
                  );

                const standardRingSizes = ["مقاس 14", "مقاس 15", "مقاس 16", "مقاس 17", "مقاس 18", "مقاس 19", "مقاس 20", "مقاس 21", "مقاس 22"];
                const activeSizesList = productSizesText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);

                return isRingType ? (
                  <div className="p-4 bg-[#faf6f0] rounded-xl border border-[#ded2c0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💍</span>
                        <div>
                          <h5 className="font-bold text-xs text-[#161412]">
                            نظام مقاسات الخواتم والدبل الذكي
                          </h5>
                          <p className="text-[10px] text-[#756555]">
                            اضغط على أي مقاس لإضافته أو إلغائه فورياً من الخيارات المتاحة للعميل
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-[#161412] text-[#c5a880] px-2.5 py-0.5 rounded-full font-bold">
                        {activeSizesList.length} مقاسات نشطة
                      </span>
                    </div>

                    {/* Quick Toggle Preset Sizes */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {standardRingSizes.map((preset) => {
                        const isSelected = activeSizesList.includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              let next: string[];
                              if (isSelected) {
                                next = activeSizesList.filter((s) => s !== preset);
                              } else {
                                next = [...activeSizesList, preset];
                              }
                              setProductSizesText(next.join(", "));
                              if (!productForm.defaultSize || !next.includes(productForm.defaultSize)) {
                                setProductForm((p) => ({ ...p, defaultSize: next[0] || "" }));
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all active:scale-95 ${
                              isSelected
                                ? "bg-[#161412] text-[#f7f4ee] border-[#161412] shadow-sm font-bold"
                                : "bg-white text-[#756555] border-[#ded2c0] hover:border-[#b8a490]"
                            }`}
                          >
                            {isSelected ? `✓ ${preset}` : `+ ${preset}`}
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#ded2c0]">
                      <div>
                        <label className="block font-medium text-[#756555] mb-1">
                          كافة المقاسات المفعلة (مفصولة بفاصلة ,)
                        </label>
                        <input
                          type="text"
                          value={productSizesText}
                          onChange={(e) => setProductSizesText(e.target.value)}
                          placeholder="مقاس 16, مقاس 17, مقاس 18"
                          className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-[#756555] mb-1">المقاس الافتراضي المختار</label>
                        <input
                          type="text"
                          value={productForm.defaultSize || ""}
                          onChange={(e) => setProductForm({ ...productForm, defaultSize: e.target.value })}
                          placeholder="مقاس 17"
                          className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#faf6f0] border border-[#ded2c0] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#161412] text-[#c5a880] flex items-center justify-center font-bold shrink-0">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#161412] flex items-center gap-2">
                          <span>الخصائص الذكية: سلاسل / أساور / أنسيالات (تعتمد على الوزن فقط)</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                            تفعيل تلقائي
                          </span>
                        </h5>
                        <p className="text-[11px] text-[#756555] mt-0.5">
                          وفقاً لنوع الكولكشن المختار، تم إخفاء حقل المقاسات للزوار، وسيتم اعتماد الوزن الصافي ({productForm.weightGrams || 5} جرام) وعيار الفضة تلقائياً.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  الكلمات المفتاحية والوسوم (مفصولة بفاصلة ,)
                </label>
                <input
                  type="text"
                  value={productTagsText}
                  onChange={(e) => setProductTagsText(e.target.value)}
                  placeholder="فضة 925, إيطالي, كلاسيك, فاخر"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                />
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f0e8dc]">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#161412]">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setProductForm({
                        ...productForm,
                        inStock: next,
                        stockQuantity: next ? (productForm.stockQuantity && productForm.stockQuantity > 0 ? productForm.stockQuantity : 10) : 0,
                      });
                    }}
                    className="rounded border-[#ded2c0] text-[#161412]"
                  />
                  <span>متوفر بالمخزن للطلب</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#161412]">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller || false}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded border-[#ded2c0] text-[#161412]"
                  />
                  <span>تمييز كـ &quot;الأكثر مبيعاً&quot;</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#161412]">
                  <input
                    type="checkbox"
                    checked={productForm.isNew || false}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="rounded border-[#ded2c0] text-[#161412]"
                  />
                  <span>تمييز كـ &quot;قطعة جديدة&quot;</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0e8dc]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2 rounded-lg bg-gray-100 text-[#5c4f42] hover:bg-gray-200 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold shadow-md"
                >
                  {editingProductId ? "حفظ التعديلات" : "إضافة القطعة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          COLLECTION ADD/EDIT MODAL
          ======================================================== */}
      {isCollectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#e8ded0] shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <h3 className="font-bold text-sm text-[#161412] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c5a880]" />
                <span>{editingCollectionId ? "تعديل الكولكشن" : "إضافة كولكشن جديد للمتجر"}</span>
              </h3>
              <button
                onClick={() => setIsCollectionModalOpen(false)}
                className="p-1 rounded-lg text-[#756555] hover:bg-[#f7f4ee]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  اسم الكولكشن بالعربية * (يظهر في القوائم والتصنيفات)
                </label>
                <input
                  type="text"
                  required
                  value={collectionForm.label}
                  onChange={(e) => setCollectionForm({ ...collectionForm, label: e.target.value })}
                  placeholder="مثال: روائع الشتاء أو هدايا الزفاف"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">
                    الرابط الإنجليزي (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={collectionForm.slug}
                    onChange={(e) => setCollectionForm({ ...collectionForm, slug: e.target.value })}
                    placeholder="winter-collection"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr font-mono"
                  />
                  <span className="text-[10px] text-[#8c7865] mt-0.5 block">
                    سيكون الرابط: /collection/{collectionForm.slug || "slug"}
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">
                    العنوان بالإنجليزية (English Title)
                  </label>
                  <input
                    type="text"
                    value={collectionForm.englishTitle}
                    onChange={(e) => setCollectionForm({ ...collectionForm, englishTitle: e.target.value })}
                    placeholder="WINTER SILVER COLLECTION"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  وصف الكولكشن (يظهر أعلى صفحة المجموعة)
                </label>
                <textarea
                  rows={2}
                  value={collectionForm.description}
                  onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                  placeholder="تشكيلة مختارة من أرقى قطع الفضة الإسترليني عيار 925..."
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                />
              </div>

              {/* Banner Image Uploader */}
              <div className="p-3 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] space-y-2">
                <label className="block font-bold text-xs text-[#161412]">
                  صورة غلاف / بانر الكولكشن (Banner Image)
                </label>

                {collectionForm.bannerImage && (
                  <div className="relative h-24 w-full rounded-lg overflow-hidden border border-[#ded2c0] bg-black">
                    <img
                      src={collectionForm.bannerImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCollectionForm({ ...collectionForm, bannerImage: "" })}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={collectionFileInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleCollectionBannerUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => collectionFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>{isUploading ? "جاري المعالجة..." : "رفع بانر من الكمبيوتر"}</span>
                  </button>
                  <input
                    type="text"
                    value={collectionForm.bannerImage}
                    onChange={(e) => setCollectionForm({ ...collectionForm, bannerImage: e.target.value })}
                    placeholder="أو ضع رابط مباشر https://..."
                    className="flex-1 bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                  />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0e8dc]">
                <button
                  type="button"
                  onClick={() => setIsCollectionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-[#5c4f42] hover:bg-gray-200 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold shadow-md"
                >
                  {editingCollectionId ? "تحديث الكولكشن" : "إضافة الكولكشن"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          CUSTOM PAGE ADD/EDIT MODAL
          ======================================================== */}
      {isPageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#e8ded0] shadow-2xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
              <h3 className="font-bold text-sm text-[#161412] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#c5a880]" />
                <span>{editingPageId ? "تعديل محتوى الصفحة" : "إنشاء صفحة جديدة مستقلة"}</span>
              </h3>
              <button
                onClick={() => setIsPageModalOpen(false)}
                className="p-1 rounded-lg text-[#756555] hover:bg-[#f7f4ee]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  عنوان الصفحة بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={pageForm.title}
                  onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                  placeholder="مثال: قصة براند ORMA أو دليل اختيار المقاسات"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">
                    رابط الصفحة (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
                    placeholder="our-story"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr font-mono"
                  />
                  <span className="text-[10px] text-[#8c7865] mt-0.5 block">
                    سيكون الرابط: /page/{pageForm.slug || "slug"}
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">
                    العنوان بالإنجليزية (English Title)
                  </label>
                  <input
                    type="text"
                    value={pageForm.englishTitle}
                    onChange={(e) => setPageForm({ ...pageForm, englishTitle: e.target.value })}
                    placeholder="THE ORMA STORY"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  الوصف الترويجي القصير (Subtitle)
                </label>
                <input
                  type="text"
                  value={pageForm.subtitle}
                  onChange={(e) => setPageForm({ ...pageForm, subtitle: e.target.value })}
                  placeholder="مش بتتهدي.. بتتساب • Not Given, But Left"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                />
              </div>

              {/* Cover Banner Uploader */}
              <div className="p-3 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] space-y-2">
                <label className="block font-bold text-xs text-[#161412]">
                  صورة الغلاف / البانر العلوي للصفحة
                </label>

                {pageForm.bannerImage && (
                  <div className="relative h-24 w-full rounded-lg overflow-hidden border border-[#ded2c0] bg-black">
                    <img
                      src={pageForm.bannerImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPageForm({ ...pageForm, bannerImage: "" })}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={pageFileInputRef}
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handlePageBannerUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => pageFileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-3 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] flex items-center gap-1.5 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>{isUploading ? "جاري المعالجة..." : "رفع غلاف من الكمبيوتر"}</span>
                  </button>
                  <input
                    type="text"
                    value={pageForm.bannerImage}
                    onChange={(e) => setPageForm({ ...pageForm, bannerImage: e.target.value })}
                    placeholder="أو ضع رابط مباشر https://..."
                    className="flex-1 bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">
                  محتوى الصفحة بالتفصيل * (افصل بين الفقرات بسطر فارغ)
                </label>
                <textarea
                  rows={6}
                  required
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="اكتب هنا محتوى صفحتك بالتفصيل...&#10;&#10;يمكنك كتابة مقدمة وعناوين فرعية ونقاط توضيحية لتظهر بشكل ملكي وأنيق للزوار."
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Page Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#f0e8dc]">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#161412]">
                  <input
                    type="checkbox"
                    checked={pageForm.isPublished}
                    onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                    className="rounded border-[#ded2c0] text-[#161412]"
                  />
                  <span>نشر الصفحة وجعلها متاحة للزوار الآن</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#161412]">
                  <input
                    type="checkbox"
                    checked={pageForm.showInFooter}
                    onChange={(e) => setPageForm({ ...pageForm, showInFooter: e.target.checked })}
                    className="rounded border-[#ded2c0] text-[#161412]"
                  />
                  <span>إظهار رابط الصفحة في قائمة الفوتر</span>
                </label>
              </div>

              {/* Submit / Cancel */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f0e8dc]">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-[#5c4f42] hover:bg-gray-200 text-xs font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold shadow-md"
                >
                  {editingPageId ? "تحديث الصفحة" : "حفظ ونشر الصفحة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          SETTINGS SECURITY PASSWORD MODAL
          ======================================================== */}
      {isSettingsPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl border border-[#ded2c0] shadow-2xl p-6 sm:p-8 text-right font-cairo"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-amiri text-xl font-bold text-[#161412] text-center mb-1">
              إعدادات المتجر محمية
            </h3>
            <p className="text-xs text-[#756555] text-center mb-6">
              يرجى إدخال رمز الأمان للوصول إلى كافة إعدادات وتخصيصات المتجر.
            </p>

            {settingsPasswordError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {settingsPasswordError}
              </div>
            )}

            <form onSubmit={handleUnlockSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#161412] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showSettingsPassword ? "text" : "password"}
                    autoFocus
                    required
                    value={settingsPasswordInput}
                    onChange={(e) => setSettingsPasswordInput(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSettingsPassword(!showSettingsPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7865] hover:text-[#161412]"
                  >
                    {showSettingsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md"
                >
                  تأكيد وفتح الإعدادات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsPasswordModalOpen(false);
                    setSettingsPasswordError("");
                    setSettingsPasswordInput("");
                  }}
                  className="px-4 py-2.5 rounded-lg bg-[#f7f4ee] hover:bg-[#ede3d3] text-xs font-semibold text-[#5c4f42] border border-[#ded2c0]"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          FULL ORDER DETAILS MODAL (Inside View with Product Images)
          ======================================================== */}
      {selectedOrderForDetails && (() => {
        const order = orders.find((o) => o.id === selectedOrderForDetails.id) || selectedOrderForDetails;
        const whatsappLink = `https://wa.me/20${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
          `أهلاً بحضرتك يا ${order.customerName}، بنكلمك من متجر أورما للفضة 925 بخصوص طلبك رقم (${order.id}) بقيمة ${order.total} ج.م.`
        )}`;

        return (
          <div
            onClick={() => setSelectedOrderForDetails(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#faf8f5] rounded-3xl max-w-3xl w-full border border-[#d8c8b4] shadow-2xl p-5 sm:p-7 space-y-6 my-6 max-h-[92vh] overflow-y-auto text-right font-cairo custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#e8ded0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#161412] bg-white px-2.5 py-0.5 rounded-lg border border-[#ded2c0]">
                      #{order.id}
                    </span>
                    <span className="text-xs text-[#8c7865]">
                      {new Date(order.createdAt).toLocaleString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="font-amiri text-xl font-bold text-[#161412] mt-1.5 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#c5a880]" />
                    <span>تفاصيل الطلب الكاملة</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                      order.status === "pending"
                        ? "bg-amber-50 text-amber-900 border-amber-300"
                        : order.status.startsWith("confirmed")
                        ? "bg-blue-50 text-blue-900 border-blue-300"
                        : order.status === "shipped"
                        ? "bg-purple-50 text-purple-900 border-purple-300"
                        : order.status === "completed"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                    <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                    <option value="processing">جاري التجهيز</option>
                    <option value="shipped">تم الشحن</option>
                    <option value="completed">تم التوصيل بنجاح</option>
                    <option value="cancelled">ملغي</option>
                  </select>

                  <button
                    onClick={() => setSelectedOrderForDetails(null)}
                    className="p-1.5 rounded-xl bg-white border border-[#ded2c0] text-[#756555] hover:text-[#161412] hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer & Delivery Information Card with Inline Edit Mode */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded0] space-y-3">
                <div className="text-xs font-bold text-[#161412] flex items-center justify-between pb-2 border-b border-[#f0e8dc]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>بيانات العميل والشحن والتوصيل</span>
                  </div>

                  {!isEditingCustomerInfo ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingCustomerInfo(true)}
                      className="px-2.5 py-1 rounded-lg bg-[#f7f4ee] hover:bg-[#ede3d3] border border-[#ded2c0] text-[#161412] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      title="تعديل بيانات العميل لو كتب الاسم أو الهاتف أو العنوان بالخطأ"
                    >
                      <Edit className="w-3 h-3 text-[#c5a880]" />
                      <span>تعديل بيانات العميل</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateOrder(order.id, {
                            customerName: editCustomerName.trim(),
                            phone: editCustomerPhone.trim(),
                            governorate: editCustomerGovernorate,
                            address: editCustomerAddress.trim(),
                            notes: editCustomerNotes.trim(),
                          });
                          setIsEditingCustomerInfo(false);
                          addToast("بيانات العميل", "تم حفظ وتحديث بيانات العميل بنجاح", "info");
                        }}
                        className="px-3 py-1 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Save className="w-3 h-3 text-[#c5a880]" />
                        <span>حفظ التعديلات</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditCustomerName(order.customerName || "");
                          setEditCustomerPhone(order.phone || "");
                          setEditCustomerGovernorate(order.governorate || "القاهرة");
                          setEditCustomerAddress(order.address || "");
                          setEditCustomerNotes(order.notes || "");
                          setIsEditingCustomerInfo(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#5c4f42] hover:bg-gray-200 font-bold text-xs transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingCustomerInfo ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="block text-[11px] text-[#8c7865] mb-0.5">اسم العميل:</span>
                      <span className="font-bold text-[#161412] text-sm">{order.customerName}</span>
                    </div>

                    <div>
                      <span className="block text-[11px] text-[#8c7865] mb-0.5">رقم الهاتف والتواصل:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-bold text-[#161412] font-mono dir-ltr">{order.phone}</span>
                        <a
                          href={`tel:${order.phone}`}
                          className="px-2 py-0.5 rounded-md bg-[#f7f4ee] hover:bg-[#ede3d3] border border-[#ded2c0] text-[10px] font-bold text-[#161412] flex items-center gap-1"
                          title="اتصال هاتفي"
                        >
                          <PhoneCall className="w-2.5 h-2.5 text-[#c5a880]" />
                          <span>اتصال</span>
                        </a>
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-bold text-emerald-800 flex items-center gap-1"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="w-2.5 h-2.5 text-emerald-600" />
                          <span>واتساب</span>
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[11px] text-[#8c7865] mb-0.5">المحافظة:</span>
                      <span className="font-semibold text-[#161412]">{order.governorate}</span>
                    </div>

                    <div>
                      <span className="block text-[11px] text-[#8c7865] mb-0.5">العنوان التفصيلي:</span>
                      <span className="font-medium text-[#161412]">{order.address}</span>
                    </div>

                    {order.notes && (
                      <div className="sm:col-span-2 bg-[#f7f4ee] p-2.5 rounded-xl border border-[#ded2c0]">
                        <span className="block text-[11px] font-bold text-[#756555] mb-0.5">ملاحظات العميل:</span>
                        <p className="text-xs text-[#161412]">{order.notes}</p>
                      </div>
                    )}

                    {order.isGift && (
                      <div className="sm:col-span-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                        <span className="block text-[11px] font-bold text-amber-900 mb-0.5">طلب هدية وتغليف مخصص:</span>
                        <p className="text-xs text-amber-800">{order.giftMessage || "تغليف كهدية فاخرة بدون طباعة السعر"}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#fdfbf7] p-3 rounded-xl border border-[#c5a880]/30">
                    <div>
                      <label className="block text-[11px] font-bold text-[#161412] mb-1">اسم العميل:</label>
                      <input
                        type="text"
                        value={editCustomerName}
                        onChange={(e) => setEditCustomerName(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-1.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                        placeholder="اسم العميل الكامل"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#161412] mb-1">رقم الهاتف:</label>
                      <input
                        type="tel"
                        value={editCustomerPhone}
                        onChange={(e) => setEditCustomerPhone(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-1.5 text-xs text-[#161412] font-mono dir-ltr focus:outline-none focus:border-[#161412]"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#161412] mb-1">المحافظة:</label>
                      <select
                        value={editCustomerGovernorate}
                        onChange={(e) => setEditCustomerGovernorate(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-1.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      >
                        {EGYPT_GOVERNORATES.map((gov) => (
                          <option key={gov.name} value={gov.name}>
                            {gov.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#161412] mb-1">العنوان التفصيلي:</label>
                      <input
                        type="text"
                        value={editCustomerAddress}
                        onChange={(e) => setEditCustomerAddress(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-1.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                        placeholder="المنطقة، الشارع، رقم العمارة والشقة..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#161412] mb-1">ملاحظات الطلب أو التوصيل:</label>
                      <textarea
                        rows={2}
                        value={editCustomerNotes}
                        onChange={(e) => setEditCustomerNotes(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-1.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                        placeholder="أي ملاحظات خاصة بالتوصيل أو تعديل العميل..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded0] space-y-3">
                <div className="text-xs font-bold text-[#161412] flex items-center gap-2 pb-2 border-b border-[#f0e8dc]">
                  <CreditCard className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>طريقة الدفع والتحويل</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[11px] text-[#8c7865] mb-0.5">طريقة الدفع المختارة:</span>
                    <span className="font-bold text-[#161412]">
                      {order.paymentMethod === "cod"
                        ? "الدفع عند الاستلام (COD)"
                        : order.paymentMethod === "wallet"
                        ? "محفظة إلكترونية (إنستاباي / فودافون كاش)"
                        : "بطاقة دفع إلكتروني (فيزا / ماستركارد)"}
                    </span>
                  </div>

                  {order.senderWalletNumber && (
                    <div>
                      <span className="block text-[11px] text-[#8c7865] mb-0.5">رقم محفظة المحول:</span>
                      <span className="font-mono font-bold text-[#161412] dir-ltr">{order.senderWalletNumber}</span>
                    </div>
                  )}

                  {order.paymentReceiptImage && (
                    <div className="sm:col-span-2 space-y-1.5 pt-1">
                      <span className="block text-[11px] font-bold text-[#756555]">إيصال التحويل المرفق من العميل:</span>
                      <div className="relative inline-block border border-[#ded2c0] rounded-xl overflow-hidden bg-black max-w-xs shadow-sm">
                        <img
                          src={order.paymentReceiptImage}
                          alt="إيصال التحويل"
                          className="max-h-56 object-contain cursor-pointer hover:opacity-95"
                          onClick={() => window.open(order.paymentReceiptImage, "_blank")}
                        />
                      </div>
                      <span className="block text-[10px] text-[#8c7865]">انقر على الصورة لفتح الإيصال بالحجم الكامل</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Products with Images & Shopify-style Edit/Add */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded0] space-y-4">
                <div className="text-xs font-bold text-[#161412] flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#f0e8dc]">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>القطع والمنتجات المطلوبة ({order.items.length})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8c7865]">
                      إجمالي القطع: {order.items.reduce((s, i) => s + (i.quantity || 1), 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingItemToExistingOrder(!isAddingItemToExistingOrder)}
                      className="px-2.5 py-1 rounded-lg bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingItemToExistingOrder ? "إغلاق قائمة الإضافة" : "+ إضافة قطعة للطلب"}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Product Adder from Inventory */}
                {isAddingItemToExistingOrder && (
                  <div className="bg-[#f7f4ee] rounded-xl p-3.5 border border-[#ded2c0] space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-[#161412]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>اختر قطعة من المخزون لإضافتها للطلب الحالي:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddingItemToExistingOrder(false)}
                        className="text-[11px] text-[#8c7865] hover:text-[#161412]"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث عن قطعة بالاسم أو الصنف..."
                        value={existingOrderProductSearch}
                        onChange={(e) => setExistingOrderProductSearch(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg pr-8 pl-3 py-1.5 text-xs text-[#161412] focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-[#8c7865] absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {products
                        .filter((p) => {
                          if (!existingOrderProductSearch.trim()) return true;
                          const q = existingOrderProductSearch.toLowerCase();
                          return p.arabicName.toLowerCase().includes(q) || (p.category && p.category.includes(q));
                        })
                        .slice(0, 10)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e8ded0] text-xs hover:border-[#c5a880] transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.images[0] || ""}
                                alt={p.arabicName}
                                className="w-9 h-9 rounded object-cover border border-[#ded2c0] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-[#161412] block truncate text-xs">
                                  {p.arabicName}
                                </span>
                                <span className="text-[10px] text-[#8c7865]">
                                  {p.price.toLocaleString("en-US")} ج.م {p.inStock ? "• متوفر" : "• غير متوفر"}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const defaultSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : undefined;
                                const updatedItems = [...order.items];
                                const existingIndex = updatedItems.findIndex(
                                  (i) => i.productId === p.id && i.selectedSize === defaultSize
                                );
                                if (existingIndex > -1) {
                                  updatedItems[existingIndex].quantity += 1;
                                } else {
                                  updatedItems.push({
                                    productId: p.id,
                                    name: p.name,
                                    arabicName: p.arabicName,
                                    quantity: 1,
                                    price: p.price,
                                    selectedSize: defaultSize,
                                    image: p.images[0] || "",
                                  });
                                }
                                const newSubtotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                const newTotal = Math.max(0, newSubtotal + (order.shippingFee || 0) - (order.discount || 0));
                                updateOrder(order.id, {
                                  items: updatedItems,
                                  subtotal: newSubtotal,
                                  total: newTotal,
                                });
                                setSelectedOrderForDetails({
                                  ...order,
                                  items: updatedItems,
                                  subtotal: newSubtotal,
                                  total: newTotal,
                                });
                                setIsAddingItemToExistingOrder(false);
                                addToast("إضافة منتج", `تمت إضافة "${p.arabicName}" إلى طلب العميل #${order.id}`, "info");
                              }}
                              className="px-2.5 py-1 rounded bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] text-[11px] font-bold shrink-0 transition-colors"
                            >
                              + إضافة للطلب
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Ordered Items List */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => {
                    const itemImg = getItemImage(item);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 bg-[#faf8f5] rounded-xl border border-[#e8ded0] text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Product Image */}
                          <div className="w-14 h-14 rounded-lg bg-black/5 overflow-hidden border border-[#ded2c0] shrink-0">
                            <img
                              src={itemImg}
                              alt={item.arabicName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <h5 className="font-bold text-[#161412] truncate text-xs sm:text-sm">
                              {item.arabicName}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {item.selectedSize && (
                                <span className="bg-white border border-[#ded2c0] text-[#756555] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                  مقاس: {item.selectedSize}
                                </span>
                              )}
                              <span className="text-[#8c7865] text-[11px]">
                                سعر القطعة: <b className="text-[#161412]">{item.price.toLocaleString("en-US")} ج.م</b>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls & Remove */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center border border-[#ded2c0] rounded-lg bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedItems = [...order.items];
                                if (updatedItems[idx].quantity > 1) {
                                  updatedItems[idx].quantity -= 1;
                                  const newSubtotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                  const newTotal = Math.max(0, newSubtotal + (order.shippingFee || 0) - (order.discount || 0));
                                  updateOrder(order.id, {
                                    items: updatedItems,
                                    subtotal: newSubtotal,
                                    total: newTotal,
                                  });
                                  setSelectedOrderForDetails({
                                    ...order,
                                    items: updatedItems,
                                    subtotal: newSubtotal,
                                    total: newTotal,
                                  });
                                } else {
                                  if (order.items.length <= 1) {
                                    alert("لا يمكن حذف آخر قطعة من الطلب. إذا أردت إلغاء الطلب بالكامل، يرجى استخدام زر إلغاء الطلب.");
                                    return;
                                  }
                                  if (confirm(`هل أنت متأكد من إزالة "${item.arabicName}" من هذا الطلب؟`)) {
                                    updatedItems.splice(idx, 1);
                                    const newSubtotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                    const newTotal = Math.max(0, newSubtotal + (order.shippingFee || 0) - (order.discount || 0));
                                    updateOrder(order.id, {
                                      items: updatedItems,
                                      subtotal: newSubtotal,
                                      total: newTotal,
                                    });
                                    setSelectedOrderForDetails({
                                      ...order,
                                      items: updatedItems,
                                      subtotal: newSubtotal,
                                      total: newTotal,
                                    });
                                  }
                                }
                              }}
                              className="px-2 py-1 text-[#161412] hover:bg-[#f7f4ee] text-xs font-bold rounded-r-lg"
                              title="تقليل الكمية"
                            >
                              -
                            </button>
                            <span className="px-2.5 font-bold font-mono text-xs text-[#161412]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedItems = [...order.items];
                                updatedItems[idx].quantity += 1;
                                const newSubtotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                const newTotal = Math.max(0, newSubtotal + (order.shippingFee || 0) - (order.discount || 0));
                                updateOrder(order.id, {
                                  items: updatedItems,
                                  subtotal: newSubtotal,
                                  total: newTotal,
                                });
                                setSelectedOrderForDetails({
                                  ...order,
                                  items: updatedItems,
                                  subtotal: newSubtotal,
                                  total: newTotal,
                                });
                              }}
                              className="px-2 py-1 text-[#161412] hover:bg-[#f7f4ee] text-xs font-bold rounded-l-lg"
                              title="زيادة الكمية"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-left font-bold text-sm text-[#161412] font-mono min-w-[70px]">
                            {(item.price * item.quantity).toLocaleString("en-US")} <span className="text-xs font-normal">ج.م</span>
                          </div>

                          {order.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من إزالة "${item.arabicName}" من هذا الطلب؟`)) {
                                  const updatedItems = order.items.filter((_, i) => i !== idx);
                                  const newSubtotal = updatedItems.reduce((s, i) => s + i.price * i.quantity, 0);
                                  const newTotal = Math.max(0, newSubtotal + (order.shippingFee || 0) - (order.discount || 0));
                                  updateOrder(order.id, {
                                    items: updatedItems,
                                    subtotal: newSubtotal,
                                    total: newTotal,
                                  });
                                  setSelectedOrderForDetails({
                                    ...order,
                                    items: updatedItems,
                                    subtotal: newSubtotal,
                                    total: newTotal,
                                  });
                                }
                              }}
                              className="p-1.5 text-[#baa894] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="إزالة هذه القطعة"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded0] space-y-2 text-xs">
                <div className="text-xs font-bold text-[#161412] pb-2 border-b border-[#f0e8dc] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>الفاتورة المالية والملخص</span>
                </div>

                <div className="flex justify-between items-center text-[#756555] py-1">
                  <span>مجموع المنتجات (المجموع الفرعي):</span>
                  <span className="font-bold font-mono text-[#161412]">
                    {(order.subtotal || order.items.reduce((s, i) => s + (i.price * i.quantity), 0)).toLocaleString("en-US")} ج.م
                  </span>
                </div>

                <div className="flex justify-between items-center text-[#756555] py-1">
                  <span>مصاريف الشحن ({order.governorate}):</span>
                  <span className="font-bold font-mono text-[#161412]">
                    {order.shippingFee === 0 ? "شحن مجاني" : `${order.shippingFee.toLocaleString("en-US")} ج.م`}
                  </span>
                </div>

                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 py-1 font-semibold">
                    <span>قيمة الخصم والكوبون:</span>
                    <span className="font-mono">-{order.discount.toLocaleString("en-US")} ج.م</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#ded2c0] flex justify-between items-center text-sm font-bold text-[#161412]">
                  <span className="font-amiri text-base">الإجمالي النهائي المستحق:</span>
                  <span className="text-lg text-[#161412] font-mono bg-[#f7f4ee] px-3 py-1 rounded-xl border border-[#ded2c0]">
                    {order.total.toLocaleString("en-US")} ج.م
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ded2c0]">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={getWhatsAppInvoiceUrl(order)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال الفاتورة عبر واتساب</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handlePrintOrder(order)}
                    className="px-4 py-2 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Printer className="w-4 h-4 text-[#c5a880]" />
                    <span>طباعة الفاتورة والبوليصة</span>
                  </button>

                  {/* NOTE: Hard deletion was removed as requested to safeguard customer data. We provide soft cancellation/restoration instead */}
                  {order.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt("يرجى كتابة سبب إلغاء الطلب (اختياري):", "");
                        if (reason !== null) {
                          cancelOrder(order.id, reason || "إلغاء يدوي من لوحة الإدارة");
                          setSelectedOrderForDetails((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  status: "cancelled",
                                  cancellationReason: reason || "إلغاء يدوي من لوحة الإدارة",
                                }
                              : null
                          );
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="إلغاء الطلب مع الحفاظ على بيانات العميل كاملة في النظام"
                    >
                      <Ban className="w-4 h-4 text-amber-700" />
                      <span>إلغاء الطلب (حفظ بيانات العميل)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        restoreOrder(order.id);
                        setSelectedOrderForDetails((prev) =>
                          prev ? { ...prev, status: "pending", cancellationReason: undefined } : null
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="استعادة هذا الطلب إلى قيد الانتظار"
                    >
                      <RotateCw className="w-4 h-4 text-emerald-700" />
                      <span>استعادة الطلب (نشط)</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForDetails(null);
                    setIsAddingItemToExistingOrder(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#e8ded0] hover:bg-[#ded2c0] text-[#161412] text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================
          SHOPIFY-STYLE CREATE MANUAL ORDER MODAL
          ======================================================== */}
      {isCreateOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white rounded-2xl border border-[#ded2c0] shadow-2xl p-5 sm:p-7 text-right font-cairo max-h-[92vh] flex flex-col my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#ded2c0]">
              <div>
                <h3 className="font-amiri text-lg sm:text-xl font-bold text-[#161412] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#c5a880]" />
                  <span>إنشاء طلب جديد وإضافة عميل (Shopify Manual Order)</span>
                </h3>
                <p className="text-xs text-[#756555] mt-0.5">
                  أدخل بيانات العميل واختر القطع المطلوبة من المخزون مع حساب الشحن والإجمالي تلقائياً
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOrderModalOpen(false)}
                className="p-1.5 rounded-lg text-[#756555] hover:text-[#161412] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scrollable */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualOrderForm.customerName.trim()) {
                  alert("يرجى إدخال اسم العميل");
                  return;
                }
                if (!manualOrderForm.phone.trim()) {
                  alert("يرجى إدخال رقم هاتف العميل");
                  return;
                }
                if (manualOrderForm.items.length === 0) {
                  alert("يرجى اختيار منتج واحد على الأقل للطلب من قائمة المنتجات والمخزون");
                  return;
                }

                const subtotal = manualOrderForm.items.reduce((s, i) => s + i.price * i.quantity, 0);
                const govRate = storeSettings.governorateShippingRates?.[manualOrderForm.governorate] ?? 50;
                const freeThreshold = storeSettings.freeShippingThreshold || 1500;
                const shippingFee =
                  manualOrderForm.customShippingFee !== null
                    ? manualOrderForm.customShippingFee
                    : subtotal >= freeThreshold
                    ? 0
                    : govRate;
                const discount = Math.max(0, Number(manualOrderForm.discount) || 0);
                const total = Math.max(0, subtotal + shippingFee - discount);

                const newOrderId = addOrder({
                  customerName: manualOrderForm.customerName.trim(),
                  phone: manualOrderForm.phone.trim(),
                  email: manualOrderForm.email.trim() || undefined,
                  governorate: manualOrderForm.governorate,
                  address: manualOrderForm.address.trim() || "العنوان بالاتفاق هاتفياً",
                  notes: manualOrderForm.notes.trim() || "[طلب يدوي تم إنشاؤه من الإدارة]",
                  items: manualOrderForm.items,
                  subtotal,
                  shippingFee,
                  discount,
                  total,
                  paymentMethod: manualOrderForm.paymentMethod,
                });

                try {
                  playRoyalOrderChime();
                } catch {}

                addToast("طلب جديد ⚡", `تم إنشاء الطلب #${newOrderId} للعميل ${manualOrderForm.customerName} بنجاح`, "info");
                setIsCreateOrderModalOpen(false);
              }}
              className="overflow-y-auto py-4 space-y-6 flex-1 pr-1 pl-1"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Details Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#161412] border-b border-[#f0e8dc] pb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c5a880]" />
                    <span>بيانات العميل والشحن</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-[#161412] mb-1">
                      اسم العميل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: كريم مصطفى"
                      value={manualOrderForm.customerName}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, customerName: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3.5 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#161412] mb-1">
                        رقم الهاتف / واتساب <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010XXXXXXXX"
                        value={manualOrderForm.phone}
                        onChange={(e) => setManualOrderForm({ ...manualOrderForm, phone: e.target.value })}
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3.5 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412] dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#161412] mb-1">
                        البريد الإلكتروني (اختياري)
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={manualOrderForm.email}
                        onChange={(e) => setManualOrderForm({ ...manualOrderForm, email: e.target.value })}
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3.5 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412] dir-ltr text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#161412] mb-1">
                        المحافظة <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={manualOrderForm.governorate}
                        onChange={(e) => setManualOrderForm({ ...manualOrderForm, governorate: e.target.value })}
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      >
                        {EGYPT_GOVERNORATES.map((g) => {
                          const rate = storeSettings.governorateShippingRates?.[g.name] ?? g.defaultRate;
                          return (
                            <option key={g.name} value={g.name}>
                              {g.name} ({rate} ج.م شحن)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#161412] mb-1">
                        طريقة الدفع
                      </label>
                      <select
                        value={manualOrderForm.paymentMethod}
                        onChange={(e) => setManualOrderForm({ ...manualOrderForm, paymentMethod: e.target.value as "cod" | "wallet" | "card" })}
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      >
                        <option value="cod">الدفع عند الاستلام (COD)</option>
                        <option value="wallet">محفظة إلكترونية (فودافون كاش / إنستاباي)</option>
                        <option value="card">بطاقة دفع إلكتروني (Visa / Mastercard)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#161412] mb-1">
                      العنوان بالتفصيل
                    </label>
                    <textarea
                      rows={2}
                      placeholder="المنطقة، الشارع، رقم العمارة والشقة، علامة مميزة..."
                      value={manualOrderForm.address}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, address: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3.5 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#161412] mb-1">
                      ملاحظات الطلب (للمندوب أو للتجهيز)
                    </label>
                    <input
                      type="text"
                      placeholder="أي تفاصيل خاصة بتسليم الشحنة أو الميعاد..."
                      value={manualOrderForm.notes}
                      onChange={(e) => setManualOrderForm({ ...manualOrderForm, notes: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3.5 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>
                </div>

                {/* Products Selector Column */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#161412] border-b border-[#f0e8dc] pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#c5a880]" />
                      <span>المنتجات والمخزون</span>
                    </span>
                    <span className="text-[11px] text-[#8c7865]">
                      المحدد: {manualOrderForm.items.reduce((s, i) => s + i.quantity, 0)} قطعة
                    </span>
                  </h4>

                  {/* Product Search & Inventory Quick Picker */}
                  <div className="bg-[#f7f4ee] rounded-xl p-3 border border-[#ded2c0] space-y-2">
                    <span className="text-[11px] font-bold text-[#161412] block">
                      اختر قطعة من المخزون لإضافتها للطلب:
                    </span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث في المنتجات بالاسم أو الصنف..."
                        value={manualOrderProductSearch}
                        onChange={(e) => setManualOrderProductSearch(e.target.value)}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg pr-8 pl-3 py-1.5 text-xs text-[#161412] focus:outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-[#8c7865] absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Products Mini List */}
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {products
                        .filter((p) => {
                          if (!manualOrderProductSearch.trim()) return true;
                          const q = manualOrderProductSearch.toLowerCase();
                          return p.arabicName.toLowerCase().includes(q) || (p.category && p.category.includes(q));
                        })
                        .slice(0, 8)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#e8ded0] text-xs hover:border-[#c5a880] transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={p.images[0] || ""}
                                alt={p.arabicName}
                                className="w-8 h-8 rounded object-cover border border-[#ded2c0] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-[#161412] block truncate text-xs">
                                  {p.arabicName}
                                </span>
                                <span className="text-[10px] text-[#8c7865]">
                                  {p.price.toLocaleString("en-US")} ج.م {p.inStock ? "• متوفر" : "• غير متوفر"}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const defaultSize = p.sizes && p.sizes.length > 0 ? p.sizes[0] : undefined;
                                setManualOrderForm((prev) => {
                                  const existingIndex = prev.items.findIndex(
                                    (i) => i.productId === p.id && i.selectedSize === defaultSize
                                  );
                                  if (existingIndex > -1) {
                                    const updated = [...prev.items];
                                    updated[existingIndex].quantity += 1;
                                    return { ...prev, items: updated };
                                  }
                                  return {
                                    ...prev,
                                    items: [
                                      ...prev.items,
                                      {
                                        productId: p.id,
                                        name: p.name,
                                        arabicName: p.arabicName,
                                        quantity: 1,
                                        price: p.price,
                                        selectedSize: defaultSize,
                                        image: p.images[0] || "",
                                      },
                                    ],
                                  };
                                });
                              }}
                              className="px-2.5 py-1 rounded bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] text-[11px] font-bold shrink-0 transition-colors"
                            >
                              + إضافة
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Items in Manual Order */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#756555] block">
                      القطع المضافة للطلب:
                    </span>
                    {manualOrderForm.items.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-[#ded2c0] text-center text-xs text-[#8c7865]">
                        لم يتم اختيار أي قطع بعد. استخدم مربع البحث أعلاه لاختيار المنتجات.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {manualOrderForm.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-[#ded2c0] text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image}
                                alt={item.arabicName}
                                className="w-10 h-10 rounded-lg object-cover border border-[#ded2c0] shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="font-bold text-[#161412] block truncate">
                                  {item.arabicName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  {(() => {
                                    const prod = products.find((p) => p.id === item.productId);
                                    if (prod?.sizes && prod.sizes.length > 0) {
                                      return (
                                        <select
                                          value={item.selectedSize || prod.sizes[0]}
                                          onChange={(e) => {
                                            const updated = [...manualOrderForm.items];
                                            updated[idx].selectedSize = e.target.value;
                                            setManualOrderForm({ ...manualOrderForm, items: updated });
                                          }}
                                          className="bg-[#f7f4ee] border border-[#ded2c0] rounded px-1.5 py-0.5 text-[10px] text-[#161412] font-semibold"
                                        >
                                          {prod.sizes.map((s) => (
                                            <option key={s} value={s}>
                                              مقاس {s}
                                            </option>
                                          ))}
                                        </select>
                                      );
                                    }
                                    return null;
                                  })()}
                                  <span className="text-[10px] text-[#8c7865]">
                                    {item.price.toLocaleString("en-US")} ج.م للقطعة
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Qty & Remove */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center border border-[#ded2c0] rounded-lg bg-[#f7f4ee]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...manualOrderForm.items];
                                    if (updated[idx].quantity > 1) {
                                      updated[idx].quantity -= 1;
                                      setManualOrderForm({ ...manualOrderForm, items: updated });
                                    } else {
                                      updated.splice(idx, 1);
                                      setManualOrderForm({ ...manualOrderForm, items: updated });
                                    }
                                  }}
                                  className="px-2 py-0.5 text-[#161412] hover:bg-[#e8ded0] text-xs font-bold rounded-r-lg"
                                >
                                  -
                                </button>
                                <span className="px-2 font-bold font-mono text-xs text-[#161412]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...manualOrderForm.items];
                                    updated[idx].quantity += 1;
                                    setManualOrderForm({ ...manualOrderForm, items: updated });
                                  }}
                                  className="px-2 py-0.5 text-[#161412] hover:bg-[#e8ded0] text-xs font-bold rounded-l-lg"
                                >
                                  +
                                </button>
                              </div>

                              <span className="font-bold text-xs text-[#161412] font-mono min-w-[50px] text-left">
                                {(item.price * item.quantity).toLocaleString("en-US")} ج.م
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = manualOrderForm.items.filter((_, i) => i !== idx);
                                  setManualOrderForm({ ...manualOrderForm, items: updated });
                                }}
                                className="p-1 text-[#8c7865] hover:text-rose-600 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Calculation Box */}
                  {(() => {
                    const subtotal = manualOrderForm.items.reduce((s, i) => s + i.price * i.quantity, 0);
                    const govRate = storeSettings.governorateShippingRates?.[manualOrderForm.governorate] ?? 50;
                    const freeThreshold = storeSettings.freeShippingThreshold || 1500;
                    const shippingFee =
                      manualOrderForm.customShippingFee !== null
                        ? manualOrderForm.customShippingFee
                        : subtotal >= freeThreshold
                        ? 0
                        : govRate;
                    const discount = Math.max(0, Number(manualOrderForm.discount) || 0);
                    const grandTotal = Math.max(0, subtotal + shippingFee - discount);

                    return (
                      <div className="bg-[#f7f4ee] rounded-xl p-3.5 border border-[#ded2c0] space-y-2 text-xs">
                        <div className="flex justify-between items-center text-[#756555]">
                          <span>مجموع المنتجات:</span>
                          <span className="font-bold font-mono text-[#161412]">{subtotal.toLocaleString("en-US")} ج.م</span>
                        </div>

                        <div className="flex justify-between items-center text-[#756555]">
                          <span className="flex items-center gap-1.5">
                            <span>مصاريف الشحن ({manualOrderForm.governorate}):</span>
                            <button
                              type="button"
                              onClick={() => {
                                setManualOrderForm({
                                  ...manualOrderForm,
                                  customShippingFee: manualOrderForm.customShippingFee === 0 ? null : 0,
                                });
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                                manualOrderForm.customShippingFee === 0
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
                                  : "bg-white text-[#756555] border-[#ded2c0]"
                              }`}
                            >
                              {manualOrderForm.customShippingFee === 0 ? "شحن مجاني مفعل" : "تطبيق شحن مجاني"}
                            </button>
                          </span>
                          <span className="font-bold font-mono text-[#161412]">
                            {shippingFee === 0 ? "شحن مجاني" : `${shippingFee} ج.م`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[#756555]">
                          <span>خصم خاص / كود خصم (ج.م):</span>
                          <input
                            type="number"
                            min="0"
                            value={manualOrderForm.discount || ""}
                            onChange={(e) => setManualOrderForm({ ...manualOrderForm, discount: Math.max(0, Number(e.target.value)) })}
                            placeholder="0"
                            className="w-20 bg-white border border-[#ded2c0] rounded px-2 py-0.5 text-xs text-left font-mono font-bold"
                          />
                        </div>

                        <div className="pt-2 border-t border-[#ded2c0] flex justify-between items-center font-bold text-sm text-[#161412]">
                          <span className="font-amiri text-base">الإجمالي المطلوب من العميل:</span>
                          <span className="text-base text-[#161412] font-mono bg-white px-3 py-1 rounded-lg border border-[#ded2c0]">
                            {grandTotal.toLocaleString("en-US")} ج.م
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ded2c0]">
                <button
                  type="button"
                  onClick={() => setIsCreateOrderModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#f7f4ee] hover:bg-[#e8ded0] text-[#161412] text-xs font-medium transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] hover:text-[#f7f4ee] text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وإنشاء الطلب بالسحابة ⚡</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD NEW USER MODAL (Super Admin Only)
          ======================================================== */}
      {isAddUserModalOpen && (
        <div
          dir="rtl"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-cairo"
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#ded2c0] overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#161412] text-[#f7f4ee] px-6 py-4 flex items-center justify-between border-b border-[#2e2925]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 text-[#c5a880]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-amiri text-white">إضافة مستخدم جديد وتحديد الصلاحيات</h3>
                  <p className="text-[11px] text-[#baa996]">أنشئ حساباً لأحد أفراد الفريق وحدد ما يحق له رؤيته</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#baa996] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {newUserError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {newUserError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#161412] mb-1">
                  الاسم الكامل / المسمى الوظيفي *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد سمير - مسؤول المبيعات"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-xl px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#161412] mb-1">
                    اسم المستخدم (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="مثال: ahmed"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-xl px-4 py-2.5 text-xs font-mono text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#161412] mb-1">
                    كلمة المرور (Password) *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="كلمة مرور قوية"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-xl px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-[#161412] mb-2">
                  تحديد نوع الصلاحية الممنوحة *
                </label>
                <div className="space-y-2">
                  {/* Option 1: Orders and Customers Only */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newUserRole === "orders_customers"
                        ? "bg-[#faf6ee] border-[#161412] shadow-xs"
                        : "bg-white border-[#e8ded0] hover:bg-[#fbf9f5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value="orders_customers"
                      checked={newUserRole === "orders_customers"}
                      onChange={() => setNewUserRole("orders_customers")}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#161412]">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                        <span>📦 صفحة العملاء والطلبات فقط</span>
                      </div>
                      <p className="text-[11px] text-[#756555] mt-0.5">
                        يرى فقط الطلبات الواردة، تفاصيل العملاء، تحديث الشحن، وإضافة طلب لعميل. يتم إخفاء إعدادات المتجر والمنتجات والأسعار تماماً.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Store Editor Only */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newUserRole === "store_editor"
                        ? "bg-[#faf6ee] border-[#161412] shadow-xs"
                        : "bg-white border-[#e8ded0] hover:bg-[#fbf9f5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value="store_editor"
                      checked={newUserRole === "store_editor"}
                      onChange={() => setNewUserRole("store_editor")}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#161412]">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>🎨 صفحة تعديل الموقع وتخصيص المتجر فقط</span>
                      </div>
                      <p className="text-[11px] text-[#756555] mt-0.5">
                        يرى فقط تعديل المنتجات، البانر الرئيسي، شريط الإعلانات، الفوتر، الصفحات، والشحن. يتم إخفاء الطلبات وبيانات العملاء لحماية الخصوصية.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: All Permissions */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      newUserRole === "all"
                        ? "bg-[#faf6ee] border-[#161412] shadow-xs"
                        : "bg-white border-[#e8ded0] hover:bg-[#fbf9f5]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value="all"
                      checked={newUserRole === "all"}
                      onChange={() => setNewUserRole("all")}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#161412]">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        <span>⚡ كلا القسمين (الطلبات + تعديل المتجر)</span>
                      </div>
                      <p className="text-[11px] text-[#756555] mt-0.5">
                        يمتلك صلاحية الوصول للطلبات وتعديل كافة صفحات المتجر، باستثناء إدارة المستخدمين التي تظل حصرية للمالك كريم مصطفى.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ded2c0]">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#f7f4ee] hover:bg-[#e8ded0] text-[#161412] text-xs font-medium transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] hover:text-[#f7f4ee] text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>إنشاء الحساب ومزامنته في السحابة ⚡</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


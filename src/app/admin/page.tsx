"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useStore, StoreSettings, Order } from "@/context/StoreContext";
import { Product } from "@/data/products";
import { playRoyalOrderChime } from "@/lib/sound";
import { AtharLogo } from "@/components/AtharLogo";
import {
  User,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  Package,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  Upload,
  Sparkles,
  Phone,
  Truck,
  Check,
  Tag,
  ShieldCheck,
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    storeSettings,
    updateStoreSettings,
    orders,
    updateOrderStatus,
    deleteOrder,
    addToast,
  } = useStore();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Active Main Tabs: orders | products | identity | shipping
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "identity" | "shipping">("orders");

  // Filter & Search
  const [productSearch, setProductSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

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
    inStock: true,
    isBestSeller: false,
    isNew: true,
    rating: 5.0,
    reviewsCount: 1,
    weightGrams: 5.2,
    tags: ["فضة 925"],
  };

  const [productForm, setProductForm] = useState<Omit<Product, "id">>(initialProductForm);

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sound Alert for new orders
  const prevOrdersCountRef = useRef<number | null>(null);

  // Check login on mount
  useEffect(() => {
    const session = localStorage.getItem("athar_admin_auth");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Sync settings when storeSettings updates
  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  // Audio alert on new incoming order
  useEffect(() => {
    if (prevOrdersCountRef.current !== null && orders.length > prevOrdersCountRef.current) {
      playRoyalOrderChime();
      addToast("طلب جديد!", "ورد طلب شراء جديد إلى المتجر 🔔", "cart");
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, addToast]);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const trimmedUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (
      (trimmedUser === "karim mostafa" && cleanPass === "Kk5019Kk@#$&") ||
      (trimmedUser === "admin" && cleanPass === "athar2026") ||
      (trimmedUser === "admin" && cleanPass === "admin")
    ) {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem("athar_admin_auth", "true");
      }
      addToast("مرحباً بك", "تم تسجيل الدخول إلى لوحة إدارة متجر أَثَر بنجاح", "info");
    } else {
      setAuthError("اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.");
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("athar_admin_auth");
    setUsernameInput("");
    setPasswordInput("");
  };

  // Image Upload Handler
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setProductForm((prev) => ({
            ...prev,
            images: [data.url, ...prev.images.slice(1)],
          }));
          addToast("تم الرفع", "تم رفع صورة المنتج بنجاح", "info");
        }
      }
    } catch (err) {
      console.error("Upload error:", err);
      addToast("خطأ", "فشل رفع الصورة", "info");
    } finally {
      setIsUploading(false);
    }
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      arabicName: prod.arabicName,
      name: prod.name,
      category: prod.category,
      gender: prod.gender,
      price: prod.price,
      originalPrice: prod.originalPrice,
      purity: prod.purity,
      images: prod.images,
      description: prod.description,
      features: prod.features,
      sizes: prod.sizes,
      defaultSize: prod.defaultSize,
      inStock: prod.inStock,
      isBestSeller: prod.isBestSeller,
      isNew: prod.isNew,
      rating: prod.rating,
      reviewsCount: prod.reviewsCount,
      weightGrams: prod.weightGrams,
      tags: prod.tags,
    });
    setIsProductModalOpen(true);
  };

  // Save Product Modal Submit
  const handleSaveProductModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.arabicName.trim()) {
      addToast("تنبيه", "يرجى كتابة اسم المنتج", "info");
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
      addToast("تم التعديل", `تم تحديث بيانات "${productForm.arabicName}" بنجاح`, "info");
    } else {
      addProduct({
        ...productForm,
        id: `ath-${Date.now()}`,
      });
      addToast("تمت الإضافة", `تمت إضافة "${productForm.arabicName}" إلى المتجر`, "info");
    }

    setIsProductModalOpen(false);
    setEditingProductId(null);
  };

  // Save Settings to Cloud and LocalStorage
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      updateStoreSettings(settingsForm);
      setSaveSuccess(true);
      addToast("تم الحفظ في السحابة ⚡", "تم مزامنة كافة التعديلات فورياً على جميع الهواتف والمتصفحات", "info");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      addToast("خطأ", "حدث خطأ أثناء حفظ الإعدادات", "info");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) {
        return false;
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
  }, [orders, orderStatusFilter, orderSearchQuery]);

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

  // Filtered Products
  const filteredProductsList = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return p.arabicName.toLowerCase().includes(q) || (p.tags && p.tags.some((t) => t.includes(q)));
      }
      return true;
    });
  }, [products, categoryFilter, productSearch]);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f7f4ee] flex items-center justify-center p-4 selection:bg-[#dfd2bf]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e8ded0] p-8 sm:p-10 text-center">
          <div className="mb-6 flex justify-center">
            <AtharLogo variant="light" size="lg" />
          </div>

          <h1 className="font-amiri text-2xl font-bold text-[#161412] mb-1">
            لوحة الإدارة السحابية
          </h1>
          <p className="text-xs text-[#756555] mb-8 font-light">
            سجل دخولك لإدارة الطلبات والمنتجات وتعديل نصوص المتجر
          </p>

          {authError && (
            <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
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
              className="w-full py-3 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-colors shadow-md mt-4"
            >
              تسجيل الدخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD INTERFACE
  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#161412] flex flex-col font-cairo selection:bg-[#dfd2bf]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#f7f4ee]/95 backdrop-blur-md border-b border-[#e4dcce] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo & Cloud Status */}
          <div className="flex items-center gap-4">
            <AtharLogo variant="light" size="sm" />
            <div className="border-r border-[#d8c8b4] pr-4 hidden sm:block">
              <span className="text-xs font-bold text-[#161412] block">
                لوحة التحكم السريعة
              </span>
              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                متصل بالسحابة (Upstash Redis) - المزامنة فورية
              </span>
            </div>
          </div>

          {/* Action Buttons: Live Save + Visit Store + Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
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

        {/* Clean Navigation Tabs */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4 mt-3 pt-2 border-t border-[#e8ded0] text-xs sm:text-sm font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-4 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات والمبيعات</span>
            {orderMetrics.pending > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-[#161412] text-[10px] font-black">
                {orderMetrics.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`py-2 px-4 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "products"
                ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والمخزون</span>
            <span className="text-[11px] opacity-70">({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("identity")}
            className={`py-2 px-4 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "identity"
                ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>هوية وواجهة المتجر</span>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`py-2 px-4 rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "shipping"
                ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                : "text-[#5c4f42] hover:text-[#161412] hover:bg-white/60"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>الشحن والسياسات</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {/* ========================================================
            TAB 1: ORDERS COMMAND CENTER
            ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
                <span className="text-xs text-[#756555] block mb-1">إجمالي المبيعات</span>
                <span className="text-xl sm:text-2xl font-bold text-[#161412]">
                  {orderMetrics.revenue.toLocaleString("en-US")}
                  <span className="text-xs font-normal text-[#8c7865] mr-1">ج.م</span>
                </span>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
                <span className="text-xs text-[#756555] block mb-1">إجمالي الطلبات</span>
                <span className="text-xl sm:text-2xl font-bold text-[#161412]">
                  {orderMetrics.total}
                </span>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
                <span className="text-xs text-amber-700 block mb-1">قيد الانتظار (جديدة)</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-600">
                  {orderMetrics.pending}
                </span>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
                <span className="text-xs text-emerald-700 block mb-1">مؤكدة وجاهزة للشحن</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {orderMetrics.confirmed}
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-xl p-4 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="text"
                  placeholder="ابحث باسم العميل، رقم الهاتف، أو رقم الطلب..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg pr-9 pl-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                />
                <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#756555]">الحالة:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                >
                  <option value="all">كافة الطلبات</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                  <option value="processing">جاري التجهيز</option>
                  <option value="shipped">جاري الشحن</option>
                  <option value="completed">تم التوصيل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>

            {/* Orders Cards List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#e8ded0]">
                <ShoppingBag className="w-12 h-12 text-[#baa996] mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-[#161412] mb-1">لا توجد طلبات تطابق هذا البحث</h3>
                <p className="text-xs text-[#756555]">ستظهر جميع الطلبات الجديدة هنا فور ورودها تلقائياً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const whatsappLink = `https://wa.me/20${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `أهلاً بحضرتك يا ${order.customerName}، بنكلمك من متجر أَثَـر للفضة 925 بخصوص تأكيد طلبك رقم (${order.id}) بقيمة ${order.total} ج.م. هل العنوان مناسب للشحن؟`
                  )}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm hover:border-[#b8a892] transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#f0e8dc]">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#161412] bg-[#f7f4ee] px-2 py-0.5 rounded border border-[#ded2c0]">
                              {order.id}
                            </span>
                            <span className="text-xs text-[#8c7865]">
                              {new Date(order.createdAt).toLocaleString("ar-EG")}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-[#161412] mt-1.5">
                            {order.customerName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#756555] mt-1">
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="dir-ltr">{order.phone}</span>
                              <MessageCircle className="w-3 h-3" />
                            </a>
                            <span>{order.governorate} - {order.address}</span>
                          </div>
                        </div>

                        {/* Status Switcher */}
                        <div className="flex items-center gap-3">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none ${
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
                            <option value="confirmed_phone">تم التأكيد هاتفياً ✓</option>
                            <option value="confirmed_whatsapp">تم التأكيد واتساب ✓</option>
                            <option value="processing">جاري التجهيز</option>
                            <option value="shipped">تم الشحن 🚚</option>
                            <option value="completed">تم التوصيل بنجاح ✦</option>
                            <option value="cancelled">ملغي ✕</option>
                          </select>

                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف الطلب ${order.id}؟`)) {
                                deleteOrder(order.id);
                                addToast("تم الحذف", "تم حذف الطلب بنجاح", "info");
                              }
                            }}
                            className="p-1.5 text-[#baa894] hover:text-rose-600 transition-colors"
                            title="حذف الطلب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Ordered Items Preview */}
                      <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-[#f7f4ee] px-3 py-1.5 rounded-lg border border-[#e4dcce] text-xs"
                            >
                              <span className="font-bold text-[#161412]">{item.arabicName}</span>
                              {item.selectedSize && (
                                <span className="text-[10px] text-[#8c7865] bg-white px-1.5 py-0.5 rounded border border-[#ded2c0]">
                                  {item.selectedSize}
                                </span>
                              )}
                              <span className="text-[#8c7865]">× {item.quantity}</span>
                              <span className="font-medium text-[#161412]">
                                {(item.price * item.quantity).toLocaleString("en-US")} ج.م
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-[#756555] ml-2">الإجمالي مع الشحن:</span>
                          <span className="text-base font-bold text-[#161412]">
                            {order.total.toLocaleString("en-US")} ج.م
                          </span>
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
            TAB 2: PRODUCTS CATALOG
            ======================================================== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Top Bar with Add Button */}
            <div className="bg-white rounded-xl p-4 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm(initialProductForm);
                  setIsProductModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-colors shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#c5a880]" />
                <span>إضافة قطعة فضة جديدة</span>
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
                  <option value="all">كافة الأقسام</option>
                  <option value="rings">خواتم</option>
                  <option value="chains">سلاسل</option>
                  <option value="bracelets">أساور</option>
                  <option value="sets">أطقم</option>
                  <option value="earrings">أقراط</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProductsList.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-[#e8ded0] p-4 flex flex-col justify-between shadow-sm hover:border-[#b8a892] transition-colors"
                >
                  <div>
                    {/* Product Photo */}
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[#e4dcce] mb-3 border border-[#d8c8b4]">
                      <img
                        src={product.images[0]}
                        alt={product.arabicName}
                        className="w-full h-full object-cover mix-blend-multiply"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                          نفذت الكمية
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#161412] line-clamp-1 mb-1">
                      {product.arabicName}
                    </h4>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-bold text-[#161412]">
                        {product.price.toLocaleString("en-US")} ج.م
                      </span>
                      {product.originalPrice && (
                        <span className="text-[11px] text-[#8c7865] line-through">
                          {product.originalPrice.toLocaleString("en-US")} ج.م
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & InStock Toggle */}
                  <div className="pt-3 border-t border-[#f0e8dc] flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        updateProduct(product.id, {
                          inStock: !product.inStock,
                        });
                        addToast("تم التحديث", `تم تعديل حالة توفر "${product.arabicName}"`, "info");
                      }}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded transition-colors ${
                        product.inStock
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                      }`}
                    >
                      {product.inStock ? "متوفر بالمخزن ✓" : "غير متوفر ✕"}
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
            TAB 3: VISUAL IDENTITY & STOREFRONT TEXTS
            ======================================================== */}
        {activeTab === "identity" && (
          <div className="space-y-8 max-w-4xl">
            {/* Top Announcement Bar */}
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <Sparkles className="w-4 h-4 text-[#c5a880]" />
                <span>شريط الإعلان العلوي (أعلى الموقع)</span>
              </h3>
              <div>
                <label className="block text-xs font-medium text-[#756555] mb-1.5">
                  نص شريط الإعلان
                </label>
                <input
                  type="text"
                  value={settingsForm.announcementText || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="شحن مجاني لكافة محافظات مصر على الطلبات المؤكدة اليوم..."
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                />
              </div>
            </div>

            {/* Hero Section Banner */}
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <Tag className="w-4 h-4 text-[#c5a880]" />
                <span>البانر الرئيسي (Hero Section)</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    العنوان الرئيسي (استخدم سطر جديد للفصل بين السطرين)
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroTitle || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    placeholder="الأَثَر لا يُهدى&#10;بل يُترك"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    النص التعريفي القصير تحت العنوان
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroSubtitle || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    placeholder="مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      نص الزر الأساسي
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroButtonText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonText: e.target.value })}
                      placeholder="تسوق المجموعة"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      نص الرابط الثانوي
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroSecondaryButtonText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonText: e.target.value })}
                      placeholder="اكتشف أثر"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Story Section */}
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                <span>قسم عن أَثَر (Brand Story)</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    عنوان القصة
                  </label>
                  <input
                    type="text"
                    value={settingsForm.storyTitle || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storyTitle: e.target.value })}
                    placeholder="أثر: ما يبقى طويلاً بعد أن تمضي اللحظة"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    فقرة قصة البراند
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.storySubtitle || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storySubtitle: e.target.value })}
                    placeholder="نصنع كل قطعة في أثر من الفضة الإسترليني عيار 925..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>
              </div>
            </div>

            {/* Silver Care Guide (The 4 Cards) */}
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <Sparkles className="w-4 h-4 text-[#c5a880]" />
                <span>نصائح العناية بقطعتك (البطاقات الـ 4 البيضاء)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tip 1 */}
                <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                  <label className="block text-xs font-bold text-[#161412]">البطاقة الأولى</label>
                  <input
                    type="text"
                    value={settingsForm.careTip4Title || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip4Title: e.target.value })}
                    placeholder="الارتداء المستمر"
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={settingsForm.careTip4Desc || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip4Desc: e.target.value })}
                    placeholder="الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها."
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                  />
                </div>

                {/* Tip 2 */}
                <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                  <label className="block text-xs font-bold text-[#161412]">البطاقة الثانية</label>
                  <input
                    type="text"
                    value={settingsForm.careTip3Title || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip3Title: e.target.value })}
                    placeholder="المسح بعد الاستخدام"
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={settingsForm.careTip3Desc || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip3Desc: e.target.value })}
                    placeholder="امسحها بقطعة قماش ناعمة وجافة بعد كل استخدام."
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                  />
                </div>

                {/* Tip 3 */}
                <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                  <label className="block text-xs font-bold text-[#161412]">البطاقة الثالثة</label>
                  <input
                    type="text"
                    value={settingsForm.careTip2Title || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip2Title: e.target.value })}
                    placeholder="الحفظ في العلبة"
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={settingsForm.careTip2Desc || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip2Desc: e.target.value })}
                    placeholder="احفظها في علبة أثر المبطنة بمكان جاف عند عدم ارتدائها."
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                  />
                </div>

                {/* Tip 4 */}
                <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                  <label className="block text-xs font-bold text-[#161412]">البطاقة الرابعة</label>
                  <input
                    type="text"
                    value={settingsForm.careTip1Title || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip1Title: e.target.value })}
                    placeholder="العطور والمواد الكيميائية"
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    value={settingsForm.careTip1Desc || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careTip1Desc: e.target.value })}
                    placeholder="ارتدِ قطعتك بعد رش العطر لحماية الفضة من التفاعل."
                    className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Social & Contact */}
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <Phone className="w-4 h-4 text-[#c5a880]" />
                <span>بيانات التواصل والسوشيال ميديا</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    رقم الواتساب الرسمي
                  </label>
                  <input
                    type="text"
                    value={settingsForm.whatsappNumber || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="01143837730"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    رابط إنستجرام
                  </label>
                  <input
                    type="text"
                    value={settingsForm.instagramUrl || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/theathar.eg"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    placeholder="theathar.eg@gmail.com"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Trigger */}
            <div className="pt-2">
              <button
                onClick={handleSaveSettings}
                className="w-full py-3.5 rounded-xl bg-[#161412] text-[#f7f4ee] text-sm font-bold hover:bg-[#2e2925] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ كافة نصوص الهوية بالسحابة فورياً</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: SHIPPING & RATES
            ======================================================== */}
        {activeTab === "shipping" && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <Truck className="w-4 h-4 text-[#c5a880]" />
                <span>مصاريف الشحن وحد الشحن المجاني</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    حد الشحن المجاني (ج.م)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeShippingThreshold || 1500}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    شحن القاهرة والجيزة (ج.م)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shippingCairoGiza || 45}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingCairoGiza: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    شحن الإسكندرية (ج.م)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shippingAlex || 55}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingAlex: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    شحن الدلتا والقناة (ج.م)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.shippingDeltaCanal || 65}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingDeltaCanal: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white rounded-xl p-6 border border-[#e8ded0] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
                <Tag className="w-4 h-4 text-[#c5a880]" />
                <span>كوبون الخصم الترويجي</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    كود الكوبون
                  </label>
                  <input
                    type="text"
                    value={settingsForm.promoCode || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value.toUpperCase() })}
                    placeholder="ATHAR10"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    نسبة الخصم (%)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.promoDiscountPercent || 10}
                    onChange={(e) => setSettingsForm({ ...settingsForm, promoDiscountPercent: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3.5 rounded-xl bg-[#161412] text-[#f7f4ee] text-sm font-bold hover:bg-[#2e2925] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#c5a880]" />
              <span>حفظ أسعار الشحن والكوبونات في السحابة</span>
            </button>
          </div>
        )}
      </main>

      {/* ========================================================
          PRODUCT ADD/EDIT MODAL
          ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-[#e8ded0] shadow-2xl text-right">
            <h3 className="font-amiri text-xl font-bold text-[#161412] mb-5 border-b border-[#f0e8dc] pb-3">
              {editingProductId ? "تعديل بيانات القطعة" : "إضافة قطعة فضة جديدة"}
            </h3>

            <form onSubmit={handleSaveProductModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#756555] mb-1">اسم القطعة بالعربية *</label>
                <input
                  type="text"
                  required
                  value={productForm.arabicName}
                  onChange={(e) => setProductForm({ ...productForm, arabicName: e.target.value })}
                  placeholder="مثال: خاتم الأثر الملكي فضة 925"
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">السعر الحالي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#756555] mb-1">السعر الأصلي قبل الخصم</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ""}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) || undefined })}
                    placeholder="اختياري"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">القسم</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                >
                  <option value="rings">خواتم وسوليتير</option>
                  <option value="chains">سلاسل إيطالي</option>
                  <option value="bracelets">أساور وتنس</option>
                  <option value="sets">أطقم ملكية</option>
                  <option value="earrings">أقراط وحلقان</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#756555] mb-1">صورة القطعة (رابط أو رفع)</label>
                <input
                  type="text"
                  value={productForm.images[0] || ""}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  placeholder="رابط الصورة https://..."
                  className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr mb-2"
                />

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-lg bg-white border border-[#ded2c0] text-[#5c4f42] hover:text-[#161412] text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "جاري الرفع..." : "رفع صورة من الجهاز"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#161412]"
                />
                <label htmlFor="inStockCheck" className="text-xs font-medium text-[#161412] cursor-pointer">
                  متوفر للطلب في المخزن حالياً
                </label>
              </div>

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
                  {editingProductId ? "حفظ التعديل" : "إضافة القطعة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

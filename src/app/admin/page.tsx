"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore, StoreSettings, Order } from "@/context/StoreContext";
import { Product } from "@/data/products";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Save,
  RotateCcw,
  Download,
  Search,
  CheckCircle2,
  Package,
  ShoppingBag,
  MessageCircle,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
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

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<"products" | "settings" | "orders">("products");

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Add/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form State for Product Add/Edit
  const initialProductForm: Omit<Product, "id"> = {
    arabicName: "",
    name: "",
    category: "rings",
    gender: "women",
    price: 1200,
    originalPrice: 1500,
    purity: "فضة إسترليني عيار 925 معتمدة",
    weightGrams: 5.5,
    rating: 5.0,
    reviewsCount: 1,
    images: [""],
    description: "",
    features: [
      "فضة إسترليني عيار 925 أصلية مختومة رسمياً",
      "مطلية بطبقة روديوم نقي للحماية ولمعان دائم",
      "تأتي في علبة مخملية فاخرة وشهادة ضمان معتمدة",
    ],
    sizes: ["مقاس 16", "مقاس 17", "مقاس 18"],
    defaultSize: "مقاس 16",
    isBestSeller: false,
    isNew: true,
    inStock: true,
    tags: ["فضة 925"],
  };

  const [productForm, setProductForm] = useState<Omit<Product, "id">>(initialProductForm);
  const [newSizeTag, setNewSizeTag] = useState<string>("");

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(storeSettings);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Check login on mount
  useEffect(() => {
    const session = localStorage.getItem("athar_admin_auth");
    if (session === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Sync settings when context loads
  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const trimmedUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Required Credentials
    if (trimmedUser === "karim mostafa" && cleanPass === "Kk5019Kk@#$&") {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem("athar_admin_auth", "true");
      }
      addToast("مرحباً بك يا كريم", "تم تسجيل الدخول إلى لوحة إدارة متجر أَثَر بنجاح", "info");
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
    addToast("تسجيل الخروج", "تم تسجيل الخروج بنجاح", "info");
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.trim().toLowerCase();
        const matchName = p.arabicName.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [products, categoryFilter, productSearch]);

  // Open Modal for New Product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setProductForm(initialProductForm);
    setIsModalOpen(true);
  };

  // Open Modal for Editing Product
  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      arabicName: product.arabicName,
      name: product.name,
      category: product.category,
      gender: product.gender,
      price: product.price,
      originalPrice: product.originalPrice,
      purity: product.purity,
      weightGrams: product.weightGrams,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      images: product.images.length > 0 ? product.images : [""],
      description: product.description,
      features: product.features,
      sizes: product.sizes || [],
      defaultSize: product.defaultSize,
      isBestSeller: !!product.isBestSeller,
      isNew: !!product.isNew,
      inStock: product.inStock,
      tags: product.tags,
    });
    setIsModalOpen(true);
  };

  // Save Product (Add or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.arabicName.trim()) {
      alert("يرجى كتابة اسم القطعة بالعربية");
      return;
    }

    const cleanImages = productForm.images.filter((img) => img.trim().length > 0);
    const finalImages =
      cleanImages.length > 0
        ? cleanImages
        : ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"];

    if (editingProductId) {
      // Update existing
      updateProduct(editingProductId, {
        ...productForm,
        images: finalImages,
      });
    } else {
      // Add new
      const newId = `ath-${Date.now().toString().slice(-4)}`;
      const newProduct: Product = {
        id: newId,
        ...productForm,
        images: finalImages,
      };
      addProduct(newProduct);
    }

    setIsModalOpen(false);
  };

  // Delete Product Confirmation
  const handleDeleteProduct = (p: Product) => {
    if (confirm(`هل أنت متأكد من حذف القطعة "${p.arabicName}" نهائياً من المتجر؟`)) {
      deleteProduct(p.id);
    }
  };

  // Toggle Stock Status
  const handleToggleStock = (p: Product) => {
    updateProduct(p.id, { inStock: !p.inStock });
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Export Database
  const handleExportData = () => {
    const dataToExport = {
      products,
      storeSettings,
      orders,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `athar-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("النسخ الاحتياطي", "تم تنزيل ملف بيانات المتجر بنجاح", "info");
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#14110e] text-[#faf8f5] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ded1be]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#1e1914] border border-[#3b3229] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-right">
          {/* Logo */}
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono tracking-[0.3em] text-[#bda992] uppercase block">
              ATHAR JEWELRY 925
            </span>
            <h1 className="text-3xl font-black font-alexandria text-white flex items-center justify-center gap-2">
              <span>أَثَـر</span>
              <span className="text-amber-500 font-light text-2xl">|</span>
              <span className="text-sm font-normal text-[#c7b59e]">بوابة الإدارة</span>
            </h1>
            <p className="text-xs text-[#9c8974]">لوحة التحكم الحصرية لمالك المتجر</p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#e5d8c8] block">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="karim mostafa"
                  className="w-full pr-11 pl-4 py-3 rounded-xl bg-[#2a231d] border border-[#483d32] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-right"
                />
                <User className="w-5 h-5 text-[#8c7865] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#e5d8c8] block">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pr-11 pl-11 py-3 rounded-xl bg-[#2a231d] border border-[#483d32] text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-right"
                />
                <Lock className="w-5 h-5 text-[#8c7865] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c7865] hover:text-white transition-colors"
                  aria-label="إظهار كلمة المرور"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-[#a89582] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#483d32] text-amber-500 focus:ring-0 bg-[#2a231d]"
                />
                <span>تذكر تسجيل الدخول على هذا الجهاز</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#14110e] font-bold text-sm tracking-wide shadow-lg shadow-amber-600/20 active:scale-[0.99] transition-all"
            >
              تسجيل الدخول إلى لوحة التحكم
            </button>
          </form>

          {/* Back to store */}
          <div className="mt-8 pt-6 border-t border-[#332b23] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs text-[#bda992] hover:text-white transition-colors"
            >
              <span>العودة لمتجر أَثَـر الرئيسي</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGGED-IN ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1815] pb-24 text-right">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-[#1c1815] text-[#faf8f5] border-b border-[#3b3229] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Welcome */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black font-alexandria text-white">أَثَـر</span>
              <span className="text-amber-500 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                لوحة التحكم
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-xs text-[#c7b59e] border-r border-[#3b3229] pr-4 mr-2">
              <span>مرحباً كريم مصطفى</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a241e] hover:bg-[#382f27] border border-[#483d32] text-xs text-[#e8ded3] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة المتجر لايف</span>
            </Link>

            <button
              onClick={handleExportData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a241e] hover:bg-[#382f27] border border-[#483d32] text-xs text-[#e8ded3] transition-colors"
              title="تصدير نسخة احتياطية من البيانات"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">تصدير نسخة (JSON)</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-xs text-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Header Tabs */}
      <div className="bg-white border-b border-[#ebdcca] shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "products"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#f6efe4] hover:text-[#1c1815]"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>إدارة المنتجات ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "orders"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#f6efe4] hover:text-[#1c1815]"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>سجل الطلبات ({orders.length})</span>
                {orders.some((o) => o.status === "pending") && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "settings"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#f6efe4] hover:text-[#1c1815]"
                }`}
              >
                <Save className="w-4 h-4" />
                <span>إعدادات ونصوص المتجر</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ======================================================== */}
        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Top Bar with Metrics and Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#ebdcca] shadow-sm">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-xs text-[#8c7865] block">إجمالي القطع</span>
                  <span className="text-2xl font-black font-alexandria text-[#1c1815]">{products.length}</span>
                </div>
                <div className="h-8 w-px bg-[#ebdcca] hidden sm:block" />
                <div>
                  <span className="text-xs text-[#8c7865] block">المتوفر بالمخزون</span>
                  <span className="text-2xl font-black font-alexandria text-emerald-600">
                    {products.filter((p) => p.inStock).length}
                  </span>
                </div>
                <div className="h-8 w-px bg-[#ebdcca] hidden sm:block" />
                <div>
                  <span className="text-xs text-[#8c7865] block">نفد المخزون</span>
                  <span className="text-2xl font-black font-alexandria text-rose-600">
                    {products.filter((p) => !p.inStock).length}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetProductsToDefault}
                  className="px-3.5 py-2.5 rounded-xl border border-[#d8c8b4] hover:bg-[#f6efe4] text-xs text-[#705e4d] transition-colors flex items-center gap-1.5"
                  title="استعادة كتالوج المنتجات الأصلي"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الافتراضي</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة قطعة جديدة</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#ebdcca]">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الكود..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs sm:text-sm text-[#1c1815] focus:outline-none focus:border-amber-600"
                />
                <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1">
                {[
                  { id: "all", label: "الكل" },
                  { id: "rings", label: "خواتم" },
                  { id: "chains", label: "سلاسل" },
                  { id: "bracelets", label: "أساور" },
                  { id: "sets", label: "أطقم" },
                  { id: "earrings", label: "أقراط" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                      categoryFilter === cat.id
                        ? "bg-[#1c1815] text-white"
                        : "bg-[#f5efe6] text-[#705e4d] hover:bg-[#ece2d3]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-[#ebdcca] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead className="bg-[#f5efe6] text-[#6d5b4a] border-b border-[#ebdcca] font-bold">
                    <tr>
                      <th className="p-4">القطعة</th>
                      <th className="p-4">القسم / الفئة</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">المخزون</th>
                      <th className="p-4 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2e9dc]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-[#8c7865]">
                          لا توجد منتجات تطابق البحث الحالي
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-[#faf6f0] transition-colors">
                          {/* Image & Name */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images[0]}
                                alt={p.arabicName}
                                className="w-12 h-12 rounded-xl object-cover border border-[#ebdcca] shrink-0 bg-[#f5efe6]"
                              />
                              <div>
                                <span className="font-bold text-[#1c1815] block line-clamp-1">{p.arabicName}</span>
                                <span className="text-[11px] text-[#8c7865] font-mono">#{p.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category & Gender */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-[#1c1815]">
                                {p.category === "rings"
                                  ? "خواتم"
                                  : p.category === "chains"
                                  ? "سلاسل"
                                  : p.category === "bracelets"
                                  ? "أساور"
                                  : p.category === "sets"
                                  ? "أطقم"
                                  : "أقراط"}
                              </span>
                              <span className="text-[11px] text-[#8c7865]">
                                {p.gender === "women" ? "حريمي" : p.gender === "men" ? "رجالي" : "للجنسين"}
                              </span>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="p-4">
                            <div className="font-bold text-[#1c1815] font-alexandria">
                              {p.price.toLocaleString("ar-EG")} ج.م
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="block text-[11px] text-[#8c7865] line-through font-normal">
                                  {p.originalPrice.toLocaleString("ar-EG")} ج.م
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Stock Toggle */}
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                                p.inStock
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : "bg-rose-100 text-rose-800 border border-rose-300"
                              }`}
                            >
                              {p.inStock ? "متوفر بالمخزون" : "نفد المخزون"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-left">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/product/${p.id}`}
                                target="_blank"
                                className="p-2 rounded-lg border border-[#ebdcca] hover:bg-[#f6efe4] text-[#705e4d] hover:text-[#1c1815] transition-colors"
                                title="عرض في المتجر"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 transition-colors"
                                title="تعديل القطعة"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-700 transition-colors"
                                title="حذف القطعة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STORE SETTINGS & CMS */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebdcca] shadow-sm">
              <div className="border-b border-[#ebdcca] pb-4 mb-6">
                <h2 className="text-xl font-bold font-alexandria text-[#1c1815]">إعدادات ونصوص متجر «أَثَـر»</h2>
                <p className="text-xs text-[#8c7865] mt-1">
                  يمكنك تعديل أي معلومة تظهر للزوار مثل رقم الواتساب، عروض الشريط المتحرك، وأسعار الشحن
                </p>
              </div>

              {settingsSaved && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ جميع التعديلات بنجاح وستظهر فوراً في كامل صفحات المتجر!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* WhatsApp Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1c1815] block">
                    رقم الواتساب الرسمي لاستقبال الطلبات الفورية:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      placeholder="201099887766"
                      className="w-full px-4 py-3 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-sm text-[#1c1815] focus:outline-none focus:border-amber-600 font-mono text-left"
                    />
                    <a
                      href={`https://wa.me/${settingsForm.whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>اختبار المحادثة</span>
                    </a>
                  </div>
                  <span className="text-[11px] text-[#8c7865] block">
                    * اكتب الرقم بكود الدولة بدون علامة + (مثال: 201012345678)
                  </span>
                </div>

                {/* Announcement Bar Text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1c1815] block">
                    نص الشريط الإعلاني المتحرك (العرض الخاص):
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.announcementText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-sm text-[#1c1815] focus:outline-none focus:border-amber-600"
                  />
                </div>

                {/* Free Shipping & Promo Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">
                      الحد الأدنى للشحن المجاني (ج.م):
                    </label>
                    <input
                      type="number"
                      required
                      value={settingsForm.freeShippingThreshold}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-sm text-[#1c1815] focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">كود الخصم الفعّال (Promo Code):</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.promoCode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-sm text-[#1c1815] font-mono uppercase focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">نسبة الخصم المئوية (%):</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={90}
                      value={settingsForm.promoDiscountPercent}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoDiscountPercent: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-sm text-[#1c1815] focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Shipping Fees per Region */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-[#1c1815] block">أسعار الشحن للمحافظات (ج.م):</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#ebdcca] space-y-1">
                      <span className="text-[11px] text-[#8c7865] block">القاهرة والجيزة</span>
                      <input
                        type="number"
                        value={settingsForm.shippingCairoGiza}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, shippingCairoGiza: Number(e.target.value) })
                        }
                        className="w-full font-bold text-sm bg-transparent border-b border-[#d8c8b4] py-1 focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#ebdcca] space-y-1">
                      <span className="text-[11px] text-[#8c7865] block">الإسكندرية</span>
                      <input
                        type="number"
                        value={settingsForm.shippingAlex}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, shippingAlex: Number(e.target.value) })
                        }
                        className="w-full font-bold text-sm bg-transparent border-b border-[#d8c8b4] py-1 focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#ebdcca] space-y-1">
                      <span className="text-[11px] text-[#8c7865] block">الدلتا والقناة</span>
                      <input
                        type="number"
                        value={settingsForm.shippingDeltaCanal}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, shippingDeltaCanal: Number(e.target.value) })
                        }
                        className="w-full font-bold text-sm bg-transparent border-b border-[#d8c8b4] py-1 focus:outline-none"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#ebdcca] space-y-1">
                      <span className="text-[11px] text-[#8c7865] block">محافظات الصعيد</span>
                      <input
                        type="number"
                        value={settingsForm.shippingUpperEgypt}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, shippingUpperEgypt: Number(e.target.value) })
                        }
                        className="w-full font-bold text-sm bg-transparent border-b border-[#d8c8b4] py-1 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-[#ebdcca]">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1c1815] hover:bg-[#342c25] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>حفظ كافة الإعدادات الآن</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ORDERS LOG */}
        {/* ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#ebdcca] shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-[#8c7865] block">إجمالي الطلبات</span>
                  <span className="text-2xl font-black font-alexandria text-[#1c1815]">{orders.length}</span>
                </div>
                <div className="h-8 w-px bg-[#ebdcca]" />
                <div>
                  <span className="text-xs text-[#8c7865] block">إجمالي المبيعات</span>
                  <span className="text-2xl font-black font-alexandria text-emerald-600">
                    {orders.reduce((acc, o) => acc + o.total, 0).toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#ebdcca]">
                <Package className="w-12 h-12 text-[#bfaea0] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#1c1815]">لا توجد طلبات بعد</h3>
                <p className="text-xs text-[#8c7865] mt-1">ستظهر هنا أي طلبات يقوم العملاء بإتمامها من المتجر</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white p-5 sm:p-6 rounded-3xl border border-[#ebdcca] shadow-sm hover:border-[#d8c8b4] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ebdcca] pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#1c1815]">#{o.id}</span>
                        <span className="text-xs text-[#8c7865]">
                          {new Date(o.createdAt).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8c7865]">الحالة:</span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as Order["status"])}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border transition-colors ${
                            o.status === "completed"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : o.status === "shipped"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : o.status === "processing"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : o.status === "cancelled"
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-amber-100 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="pending">قيد الانتظار 🟡</option>
                          <option value="processing">جاري التجهيز 🔵</option>
                          <option value="shipped">تم الشحن 🟣</option>
                          <option value="completed">تم التوصيل بنجاح 🟢</option>
                          <option value="cancelled">ملغي 🔴</option>
                        </select>

                        <button
                          onClick={() => {
                            if (confirm(`حذف الطلب #${o.id} نهائياً؟`)) deleteOrder(o.id);
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Customer & Items Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Customer Info */}
                      <div className="lg:col-span-5 space-y-2 text-xs">
                        <div>
                          <span className="text-[#8c7865] block">العميل:</span>
                          <span className="font-bold text-sm text-[#1c1815]">{o.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#8c7865]">الهاتف:</span>
                          <span className="font-mono font-bold text-[#1c1815] dir-ltr">{o.phone}</span>
                          <a
                            href={`https://wa.me/20${o.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                              `مرحباً أستاذ ${o.customerName}، نتواصل معك من براند أَثَر للفضة 925 بخصوص طلبك رقم #${o.id}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="تواصل واتساب مع العميل"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                        <div>
                          <span className="text-[#8c7865]">المحافظة والعنوان:</span>
                          <span className="text-[#1c1815] block font-medium">
                            {o.governorate} - {o.address}
                          </span>
                        </div>
                        {o.isGift && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                            <span className="font-bold block">🎁 طلب تغليف كهدية:</span>
                            <span>{o.giftMessage || "بدون كارت إهداء"}</span>
                          </div>
                        )}
                      </div>

                      {/* Items Ordered */}
                      <div className="lg:col-span-4 space-y-2">
                        <span className="text-xs text-[#8c7865] block">المنتجات المطلوبة:</span>
                        <div className="space-y-1.5">
                          {o.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs bg-[#faf8f5] p-2 rounded-xl border border-[#ebdcca]"
                            >
                              <div className="flex items-center gap-2">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.arabicName}
                                    className="w-8 h-8 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <span className="font-bold text-[#1c1815] block">{item.arabicName}</span>
                                  {item.selectedSize && (
                                    <span className="text-[10px] text-[#8c7865]">مقاس: {item.selectedSize}</span>
                                  )}
                                </div>
                              </div>
                              <span className="font-bold text-[#1c1815]">
                                {item.quantity} × {item.price} ج.م
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment & Totals */}
                      <div className="lg:col-span-3 bg-[#f5efe6] p-4 rounded-2xl border border-[#ebdcca] flex flex-col justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[#8c7865]">طريقة الدفع:</span>
                            <span className="font-bold text-[#1c1815]">
                              {o.paymentMethod === "cod"
                                ? "دفع عند الاستلام"
                                : o.paymentMethod === "wallet"
                                ? "فودافون كاش / إنستاباي"
                                : "فيزا / ماستر"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8c7865]">الشحن:</span>
                            <span className="text-[#1c1815]">
                              {o.shippingFee === 0 ? "مجاني" : `${o.shippingFee} ج.م`}
                            </span>
                          </div>
                          {o.discount > 0 && (
                            <div className="flex justify-between text-emerald-700">
                              <span>الخصم:</span>
                              <span>-{o.discount} ج.م</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#ebdcca] mt-2 flex justify-between items-center">
                          <span className="font-bold text-sm text-[#1c1815]">الإجمالي:</span>
                          <span className="font-black text-base text-[#1c1815] font-alexandria">
                            {o.total.toLocaleString("ar-EG")} ج.م
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-[#faf8f5] border border-[#d8c8b4] rounded-3xl p-6 sm:p-8 text-[#1c1815] shadow-2xl text-right my-8 max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 p-2 rounded-full bg-white border border-[#ded1be] text-[#736150] hover:text-[#1c1815] transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-[#ebdcca] pb-4 mb-6">
              <h3 className="text-xl font-bold font-alexandria text-[#1c1815]">
                {editingProductId ? "تعديل بيانات القطعة الفضية" : "إضافة قطعة جديدة للمتجر"}
              </h3>
              <p className="text-xs text-[#8c7865] mt-1">
                تأكد من كتابة الاسم والأسعار وروابط الصور بدقة
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">اسم القطعة بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={productForm.arabicName}
                    onChange={(e) => setProductForm({ ...productForm, arabicName: e.target.value })}
                    placeholder="خاتم سوليتير ملكي عيار 925"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">الاسم بالإنجليزية (English Name)</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Royal Solitaire Silver Ring"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
              </div>

              {/* Category & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">القسم</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value as Product["category"] })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600 font-bold"
                  >
                    <option value="rings">خواتم وسوليتير</option>
                    <option value="chains">سلاسل إيطالي</option>
                    <option value="bracelets">أساور وتنس</option>
                    <option value="sets">أطقم ملكية</option>
                    <option value="earrings">أقراط وحلقان</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">الفئة الموجهة</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) =>
                      setProductForm({ ...productForm, gender: e.target.value as Product["gender"] })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600 font-bold"
                  >
                    <option value="women">حريمي (نسائي)</option>
                    <option value="men">رجالي</option>
                    <option value="unisex">للجنسين</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">الوزن بالجرام (تقريبي)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={productForm.weightGrams}
                    onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">السعر الحالي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm font-bold text-emerald-700 focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1c1815] block">السعر قبل الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice || ""}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder="1800"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm line-through text-[#8c7865] focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Image URLs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1c1815] block">
                  روابط صور القطعة (ضع رابط الصورة المباشر):
                </label>
                {productForm.images.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => {
                        const newImgs = [...productForm.images];
                        newImgs[idx] = e.target.value;
                        setProductForm({ ...productForm, images: newImgs });
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d8c8b4] text-xs font-mono focus:outline-none focus:border-amber-600 text-left"
                    />
                    {img && (
                      <img
                        src={img}
                        alt="معاينة"
                        className="w-9 h-9 rounded-lg object-cover border border-[#d8c8b4] shrink-0 bg-[#f5efe6]"
                      />
                    )}
                    {productForm.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newImgs = productForm.images.filter((_, i) => i !== idx);
                          setProductForm({ ...productForm, images: newImgs });
                        }}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setProductForm({ ...productForm, images: [...productForm.images, ""] })}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة رابط صورة إضافية</span>
                </button>
              </div>

              {/* Sizes Available */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1c1815] block">
                  المقاسات المتوفرة (أمثلة: 50 سم، 55 سم، مقاس 16، مقاس 18):
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {productForm.sizes?.map((sz, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#d8c8b4] text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>{sz}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm({
                            ...productForm,
                            sizes: productForm.sizes?.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSizeTag}
                    onChange={(e) => setNewSizeTag(e.target.value)}
                    placeholder="اكتب المقاس واضغط إضافة..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d8c8b4] text-xs focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSizeTag.trim()) {
                        setProductForm({
                          ...productForm,
                          sizes: [...(productForm.sizes || []), newSizeTag.trim()],
                        });
                        setNewSizeTag("");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1c1815] text-white text-xs font-bold shrink-0"
                  >
                    إضافة مقاس
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c1815] block">وصف وتفاصيل القطعة</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="وصف فاخر يوضح صياغة الفضة الإسترليني 925 وتفاصيل الحجر..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2 border-t border-[#ebdcca] text-xs font-bold">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="rounded border-[#d8c8b4] text-emerald-600 focus:ring-0"
                  />
                  <span>متوفر في المخزون (In Stock)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={productForm.isBestSeller}
                    onChange={(e) => setProductForm({ ...productForm, isBestSeller: e.target.checked })}
                    className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0"
                  />
                  <span>الأكثر مبيعاً (Best Seller)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="rounded border-[#d8c8b4] text-blue-600 focus:ring-0"
                  />
                  <span>وصل حديثاً (New Arrival)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#ebdcca] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#d8c8b4] hover:bg-[#f6efe4] text-xs font-bold text-[#705e4d] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#342c25] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{editingProductId ? "حفظ التعديلات" : "إضافة القطعة للمتجر"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

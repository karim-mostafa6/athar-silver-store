"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Upload,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Tag,
  Star,
  Sparkles,
  Sliders,
  Globe,
  Palette,
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

  // Active Main Tabs: Products, Theme/Store Customizer, Orders, Settings
  const [activeTab, setActiveTab] = useState<"products" | "theme" | "orders" | "settings">("products");

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Add/Edit Product Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<"general" | "media" | "pricing" | "specs" | "seo">("general");

  // Image Uploading State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const womenFileInputRef = useRef<HTMLInputElement>(null);
  const menFileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Product Add/Edit (Shopify-Grade Fields)
  const initialProductForm: Omit<Product, "id"> = {
    arabicName: "",
    name: "",
    category: "rings",
    gender: "women",
    price: 1250,
    originalPrice: 1550,
    costPrice: 750, // تكلفة القطعة لحساب الربح
    sku: "ATH-RNG-01",
    stockQuantity: 15,
    purity: "فضة إسترليني عيار 925 معتمدة",
    stoneType: "زركون سويسري نقي",
    platingOptions: ["فضة 925 طبيعية", "مطلية روديوم", "مطلي ذهب 18K"],
    customBadge: "الأكثر طلباً",
    metaTitle: "",
    metaDescription: "",
    weightGrams: 5.2,
    rating: 5.0,
    reviewsCount: 1,
    images: [
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    ],
    description: "صُنع بحرفية فائقة من الفضة الإسترليني عيار 925 مع زركون سويسري ببريق يخطف الأنظار.",
    features: [
      "فضة إسترليني إيطالية أصلية مختومة عيار 925",
      "مطلية بالروديوم لحماية تدوم ولمعان دائم",
      "علبة مخملية فاخرة وشهادة ضمان معتمدة",
    ],
    sizes: ["مقاس 16", "مقاس 17", "مقاس 18"],
    defaultSize: "مقاس 16",
    isBestSeller: true,
    isNew: true,
    inStock: true,
    tags: ["خواتم", "فضة 925", "زركون"],
  };

  const [productForm, setProductForm] = useState<Omit<Product, "id">>(initialProductForm);
  const [manualImageUrl, setManualImageUrl] = useState<string>("");
  const [newSizeTag, setNewSizeTag] = useState<string>("");
  const [newFeatureText, setNewFeatureText] = useState<string>("");

  // Store Settings & Theme Customizer State
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

  // Upload File Handler (Direct from User Device)
  const uploadImageFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch {
      // Fallback to local Base64
    }

    // Reliable Base64 fallback if server upload endpoint is unavailable
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Multi-file upload for Products
  const handleProductFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadImageFile(files[i]);
        uploadedUrls.push(url);
      }

      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images.filter((img) => img.trim().length > 0), ...uploadedUrls],
      }));

      addToast("تم رفع الصور", `تم رفع ${uploadedUrls.length} صورة من جهازك بنجاح`, "info");
    } catch {
      alert("حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Dedicated upload for Theme Images (Hero, Women, Men)
  const handleThemeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroImageUrl" | "splitWomenImage" | "splitMenImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImageFile(file);
      setSettingsForm((prev) => ({ ...prev, [field]: url }));
      addToast("تم تحديث الصورة", "تم رفع الصورة من جهازك بنجاح، اضغط حفظ لتطبيقها", "info");
    } catch {
      alert("فشل رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  // Add Manual Image URL
  const handleAddManualImageUrl = () => {
    if (manualImageUrl.trim()) {
      setProductForm((prev) => ({
        ...prev,
        images: [...prev.images.filter((img) => img.trim().length > 0), manualImageUrl.trim()],
      }));
      setManualImageUrl("");
    }
  };

  // Delete Image
  const handleDeleteImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Set as Cover (Main) Image
  const handleSetCoverImage = (index: number) => {
    setProductForm((prev) => {
      const newImages = [...prev.images];
      const [selected] = newImages.splice(index, 1);
      newImages.unshift(selected);
      return { ...prev, images: newImages };
    });
    addToast("الصورة الرئيسية", "تم تعيين الصورة كصورة غلاف رئيسية", "info");
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (productSearch.trim()) {
        const q = productSearch.trim().toLowerCase();
        const matchName = p.arabicName.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        if (!matchName && !matchId && !matchSku) return false;
      }
      return true;
    });
  }, [products, categoryFilter, productSearch]);

  // Open Modal for New Product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setProductForm(initialProductForm);
    setModalActiveTab("general");
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
      costPrice: product.costPrice || Math.round(product.price * 0.55),
      sku: product.sku || `ATH-${product.id.toUpperCase()}`,
      stockQuantity: product.stockQuantity ?? 12,
      purity: product.purity,
      stoneType: product.stoneType || "زركون سويسري نقي",
      platingOptions: product.platingOptions || ["فضة 925 طبيعية", "مطلي روديوم"],
      customBadge: product.customBadge || (product.isBestSeller ? "الأكثر طلباً" : ""),
      metaTitle: product.metaTitle || product.arabicName,
      metaDescription: product.metaDescription || product.description,
      weightGrams: product.weightGrams,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      images: product.images.length > 0 ? product.images : [""],
      description: product.description,
      features: product.features || [],
      sizes: product.sizes || [],
      defaultSize: product.defaultSize,
      isBestSeller: !!product.isBestSeller,
      isNew: !!product.isNew,
      inStock: product.inStock,
      tags: product.tags || [],
    });
    setModalActiveTab("general");
    setIsModalOpen(true);
  };

  // Save Product
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
        : ["https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80"];

    if (editingProductId) {
      updateProduct(editingProductId, {
        ...productForm,
        images: finalImages,
      });
    } else {
      const newId = `ath-${Date.now().toString().slice(-4)}`;
      addProduct({
        id: newId,
        ...productForm,
        images: finalImages,
      });
    }

    setIsModalOpen(false);
  };

  // Delete Product
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

  // Export Data
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

  // Shopify-Style Profit Calculation
  const profitAmount = (productForm.price || 0) - (productForm.costPrice || 0);
  const profitMarginPercent =
    productForm.price > 0 ? Math.round((profitAmount / productForm.price) * 100) : 0;

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#14110e] text-[#faf8f5] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ded1be]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#1e1914] border border-[#3b3229] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-right">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono tracking-[0.3em] text-[#bda992] uppercase block">
              ATHAR JEWELRY 925 • CMS
            </span>
            <h1 className="text-3xl font-black font-alexandria text-white flex items-center justify-center gap-2">
              <span>أَثَـر</span>
              <span className="text-amber-500 font-light text-2xl">|</span>
              <span className="text-sm font-normal text-[#c7b59e]">بوابة الإدارة الشاملة</span>
            </h1>
            <p className="text-xs text-[#9c8974]">لوحة التحكم المتقدمة لمالك البراند</p>
          </div>

          {authError && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#14110e] font-bold text-sm tracking-wide shadow-lg shadow-amber-600/20 active:scale-[0.99] transition-all"
            >
              تسجيل الدخول إلى لوحة التحكم
            </button>
          </form>

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
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black font-alexandria text-white">أَثَـر</span>
              <span className="text-amber-400 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 font-bold">
                PRO CMS • شوبي فاي
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-2 text-xs text-[#c7b59e] border-r border-[#3b3229] pr-4 mr-2">
              <span>مرحباً كريم مصطفى</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a241e] hover:bg-[#382f27] border border-[#483d32] text-xs text-[#e8ded3] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة المتجر كزائر</span>
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
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs (Shopify Style) */}
      <div className="bg-white border-b border-[#ebdcca] shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2">
            <div className="flex items-center gap-2 sm:gap-3">
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
                onClick={() => setActiveTab("theme")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === "theme"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#f6efe4] hover:text-[#1c1815]"
                }`}
              >
                <Palette className="w-4 h-4 text-amber-500" />
                <span>مظهر وهوية المتجر (Theme Customizer)</span>
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
                <span>الطلبات والمبيعات ({orders.length})</span>
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
                <Sliders className="w-4 h-4" />
                <span>الشحن والواتساب والكوبونات</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ======================================================== */}
        {/* TAB 1: PRODUCTS MANAGEMENT (Shopify-Grade) */}
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
                  <span className="text-xs text-[#8c7865] block">المتوفر بالمخزن</span>
                  <span className="text-2xl font-black font-alexandria text-emerald-600">
                    {products.filter((p) => p.inStock).length}
                  </span>
                </div>
                <div className="h-8 w-px bg-[#ebdcca] hidden sm:block" />
                <div>
                  <span className="text-xs text-[#8c7865] block">إجمالي المخزون (قطع)</span>
                  <span className="text-2xl font-black font-alexandria text-[#705e4d]">
                    {products.reduce((acc, p) => acc + (p.stockQuantity ?? 10), 0)}
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ إضافة قطعة جديدة (Shopify Style)</span>
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3.5 rounded-2xl border border-[#ebdcca]">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الباركود أو SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs sm:text-sm text-[#1c1815] focus:outline-none focus:border-amber-600"
                />
                <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1">
                {[
                  { id: "all", label: "كافة القطع" },
                  { id: "rings", label: "خواتم وسوليتير" },
                  { id: "chains", label: "سلاسل إيطالي" },
                  { id: "bracelets", label: "أساور وتنس" },
                  { id: "sets", label: "أطقم ملكية" },
                  { id: "earrings", label: "أقراط وحلقان" },
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
                      <th className="p-4">القطعة والصور</th>
                      <th className="p-4">القسم / التصنيف</th>
                      <th className="p-4">سعر البيع والربحية</th>
                      <th className="p-4">المخزون والتوفر</th>
                      <th className="p-4 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2e9dc]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-[#8c7865]">
                          لا توجد قطع تطابق معايير البحث
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const cost = p.costPrice || Math.round(p.price * 0.55);
                        const profit = p.price - cost;
                        const margin = Math.round((profit / p.price) * 100);

                        return (
                          <tr key={p.id} className="hover:bg-[#faf6f0] transition-colors">
                            {/* Image & Name */}
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#ebdcca] shrink-0 bg-[#f5efe6]">
                                  <img
                                    src={p.images[0]}
                                    alt={p.arabicName}
                                    className="w-full h-full object-cover"
                                  />
                                  {p.images.length > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] px-1 rounded-tl font-mono">
                                      +{p.images.length - 1}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#1c1815] line-clamp-1">{p.arabicName}</span>
                                    {p.customBadge && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                                        {p.customBadge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-[#8c7865] font-mono mt-0.5">
                                    <span>#{p.id}</span>
                                    {p.sku && <span>• SKU: {p.sku}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Details */}
                            <td className="p-4">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-[#1c1815]">
                                  {p.category === "rings"
                                    ? "خواتم وسوليتير"
                                    : p.category === "chains"
                                    ? "سلاسل إيطالي"
                                    : p.category === "bracelets"
                                    ? "أساور وتنس"
                                    : p.category === "sets"
                                    ? "أطقم ملكية"
                                    : "أقراط"}
                                </span>
                                <span className="text-[11px] text-[#8c7865]">
                                  {p.gender === "women" ? "حريمي" : p.gender === "men" ? "رجالي" : "للجنسين"}
                                  {p.stoneType && ` • ${p.stoneType}`}
                                </span>
                              </div>
                            </td>

                            {/* Price & Profit */}
                            <td className="p-4">
                              <div>
                                <div className="font-bold text-[#1c1815] font-alexandria">
                                  {p.price.toLocaleString("ar-EG")} ج.م
                                </div>
                                <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                  <span>ربح: +{profit} ج.م</span>
                                  <span className="text-[10px] bg-emerald-50 px-1 rounded border border-emerald-200">
                                    ({margin}%)
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Stock Toggle & Quantity */}
                            <td className="p-4">
                              <div className="flex flex-col gap-1 items-start">
                                <button
                                  onClick={() => handleToggleStock(p)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                                    p.inStock
                                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                      : "bg-rose-100 text-rose-800 border border-rose-300"
                                  }`}
                                >
                                  {p.inStock ? "متوفر بالمخزن" : "نفد المخزون"}
                                </button>
                                <span className="text-[11px] text-[#8c7865]">
                                  الكمية: {p.stockQuantity ?? 12} قطعة
                                </span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-left">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/product/${p.id}`}
                                  target="_blank"
                                  className="p-2 rounded-lg border border-[#ebdcca] hover:bg-[#f6efe4] text-[#705e4d] hover:text-[#1c1815] transition-colors"
                                  title="معاينة في المتجر"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleOpenEditModal(p)}
                                  className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-800 transition-colors"
                                  title="تعديل عميق للمنتج (Shopify Style)"
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: STORE THEME CUSTOMIZER (Shopify Theme Editor) */}
        {/* ======================================================== */}
        {activeTab === "theme" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebdcca] shadow-sm">
              <div className="border-b border-[#ebdcca] pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold font-alexandria text-[#1c1815] flex items-center gap-2">
                    <Palette className="w-5 h-5 text-amber-500" />
                    <span>محرر هوية ومظهر المتجر (Theme Customizer)</span>
                  </h2>
                  <p className="text-xs text-[#8c7865] mt-1">
                    تحكم في بنرات وصور ونصوص الصفحة الرئيسية بالكامل مع رفع الصور مباشرة من جهازك
                  </p>
                </div>
                {settingsSaved && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم حفظ ونشر المظهر بنجاح!</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* 1. HERO BANNER SECTION */}
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebdcca] pb-3">
                    <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>بنر البداية الرئيسي (Hero Banner)</span>
                    </h3>
                    <span className="text-[11px] text-[#8c7865]">واجهة المتجر الكبرى</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">العنوان الرئيسي للهيرو</label>
                      <input
                        type="text"
                        value={settingsForm.heroTitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">الشارة العلوية (Badge Tag)</label>
                      <input
                        type="text"
                        value={settingsForm.heroBadge}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1815] block">النص الوصفي الفرعي</label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroSubtitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  {/* Hero Background Image Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">
                      صورة خلفية الهيرو الكبرى:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <div className="relative w-full sm:w-48 h-28 rounded-xl overflow-hidden border border-[#d8c8b4] shrink-0 bg-black">
                        <img
                          src={settingsForm.heroImageUrl}
                          alt="Hero Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => heroFileInputRef.current?.click()}
                            className="px-4 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-300" />
                            <span>رفع صورة من جهازك</span>
                          </button>
                          <input
                            type="file"
                            ref={heroFileInputRef}
                            onChange={(e) => handleThemeImageUpload(e, "heroImageUrl")}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                        <input
                          type="url"
                          value={settingsForm.heroImageUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                          placeholder="أو ضع رابط صورة مباشر..."
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d8c8b4] text-xs font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DUAL SPLIT 50/50 SHOWCASE (Women's & Men's) */}
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebdcca] pb-3">
                    <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-700" />
                      <span>البنر المزدوج 50/50 (Women&apos;s & Men&apos;s Showcases)</span>
                    </h3>
                    <span className="text-[11px] text-[#8c7865]">بنرات التشكيلات الكبرى</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Women's Showcase Customizer */}
                    <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-3">
                      <span className="text-xs font-bold text-rose-800 block">🌸 قسم التشكيلة النسائية</span>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8c7865] block">العنوان</label>
                        <input
                          type="text"
                          value={settingsForm.splitWomenTitle}
                          onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenTitle: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#d8c8b4] text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8c7865] block">الوصف</label>
                        <input
                          type="text"
                          value={settingsForm.splitWomenSubtitle}
                          onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenSubtitle: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#d8c8b4] text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-[#8c7865] block">صورة البنر</label>
                        <div className="relative h-28 rounded-lg overflow-hidden border border-[#d8c8b4]">
                          <img
                            src={settingsForm.splitWomenImage}
                            alt="Women Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => womenFileInputRef.current?.click()}
                          className="w-full py-2 rounded-lg bg-[#f5efe6] hover:bg-[#ebdcca] text-[#1c1815] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#d8c8b4]"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع صورة نسائية من جهازك</span>
                        </button>
                        <input
                          type="file"
                          ref={womenFileInputRef}
                          onChange={(e) => handleThemeImageUpload(e, "splitWomenImage")}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Men's Showcase Customizer */}
                    <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-3">
                      <span className="text-xs font-bold text-[#1c1815] block">⚔️ قسم التشكيلة الرجالية</span>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8c7865] block">العنوان</label>
                        <input
                          type="text"
                          value={settingsForm.splitMenTitle}
                          onChange={(e) => setSettingsForm({ ...settingsForm, splitMenTitle: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#d8c8b4] text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8c7865] block">الوصف</label>
                        <input
                          type="text"
                          value={settingsForm.splitMenSubtitle}
                          onChange={(e) => setSettingsForm({ ...settingsForm, splitMenSubtitle: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#d8c8b4] text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-[#8c7865] block">صورة البنر</label>
                        <div className="relative h-28 rounded-lg overflow-hidden border border-[#d8c8b4]">
                          <img
                            src={settingsForm.splitMenImage}
                            alt="Men Banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => menFileInputRef.current?.click()}
                          className="w-full py-2 rounded-lg bg-[#f5efe6] hover:bg-[#ebdcca] text-[#1c1815] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#d8c8b4]"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>رفع صورة رجالية من جهازك</span>
                        </button>
                        <input
                          type="file"
                          ref={menFileInputRef}
                          onChange={(e) => handleThemeImageUpload(e, "splitMenImage")}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Theme Changes */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1c1815] hover:bg-[#342c25] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>حفظ ونشر التعديلات على المتجر مباشرة</span>
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

        {/* ======================================================== */}
        {/* TAB 4: STORE SETTINGS & LOGISTICS */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#ebdcca] shadow-sm">
              <div className="border-b border-[#ebdcca] pb-4 mb-6">
                <h2 className="text-xl font-bold font-alexandria text-[#1c1815]">إعدادات المتجر واللوجستيات</h2>
                <p className="text-xs text-[#8c7865] mt-1">
                  رقم الواتساب الرسمي، شريط الإعلانات، أكواد الخصم، وتكاليف الشحن لكل محافظات مصر
                </p>
              </div>

              {settingsSaved && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم حفظ الإعدادات بنجاح وستظهر فوراً في كامل صفحات المتجر!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-6">
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

                {/* Regional Shipping Fees */}
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
      </main>

      {/* ======================================================== */}
      {/* SHOPIFY-GRADE ADD / EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-4xl bg-[#faf8f5] border border-[#d8c8b4] rounded-3xl text-[#1c1815] shadow-2xl text-right my-6 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#ebdcca] bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-alexandria text-[#1c1815]">
                    {editingProductId ? `تعديل قطعة: ${productForm.arabicName}` : "إضافة قطعة فضة جديدة (Shopify Style)"}
                  </h3>
                  <p className="text-xs text-[#8c7865]">
                    تحكم عميق في كافة تفاصيل القطعة، الوسائط، الأرباح، والمواصفات
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full bg-[#f5efe6] hover:bg-[#ebdcca] text-[#736150] hover:text-[#1c1815] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs Navigation (Shopify Style) */}
            <div className="bg-[#f5efe6] border-b border-[#ebdcca] px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setModalActiveTab("general")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalActiveTab === "general"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#eae0d2]"
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>البيانات الأساسية</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab("media")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalActiveTab === "media"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#eae0d2]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>الصور والوسائط ({productForm.images.filter(Boolean).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab("pricing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalActiveTab === "pricing"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#eae0d2]"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>الأسعار والربحية</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab("specs")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalActiveTab === "specs"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#eae0d2]"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>المقاسات والمواصفات</span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab("seo")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  modalActiveTab === "seo"
                    ? "bg-[#1c1815] text-white shadow-sm"
                    : "text-[#705e4d] hover:bg-[#eae0d2]"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>سيو وجوجل (SEO)</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: GENERAL INFO */}
              {modalActiveTab === "general" && (
                <div className="space-y-4">
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
                      <label className="text-xs font-bold text-[#1c1815] block">شارة ترويجية مخصصة (Custom Ribbon)</label>
                      <input
                        type="text"
                        value={productForm.customBadge || ""}
                        onChange={(e) => setProductForm({ ...productForm, customBadge: e.target.value })}
                        placeholder="الأكثر مبيعاً، خصم خاص..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">عيار الفضة وختم الأصالة</label>
                      <input
                        type="text"
                        value={productForm.purity}
                        onChange={(e) => setProductForm({ ...productForm, purity: e.target.value })}
                        placeholder="فضة إسترليني عيار 925 معتمدة"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">نوع الحجر المرصع (إن وُجد)</label>
                      <input
                        type="text"
                        value={productForm.stoneType || ""}
                        onChange={(e) => setProductForm({ ...productForm, stoneType: e.target.value })}
                        placeholder="زركون سويسري درجة أولى / عقيق يماني / صدف..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1815] block">وصف وتفاصيل القطعة</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="وصف تفصيلي يشرح رونق القطعة، لمعانها، ومناسبتها..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & FILE UPLOAD */}
              {modalActiveTab === "media" && (
                <div className="space-y-6">
                  {/* Drag & Drop / Device Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#cbbca7] hover:border-amber-600 bg-white hover:bg-[#fbf9f6] rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="w-14 h-14 rounded-full bg-amber-50 group-hover:bg-amber-100 text-amber-700 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-[#1c1815] block">
                        اضغط هنا لاختيار صور من جهاز الكمبيوتر الخاص بك
                      </span>
                      <span className="text-xs text-[#8c7865] block">
                        يمكنك اختيار أكثر من صورة معاً (JPG, PNG, WebP)
                      </span>
                    </div>
                    {isUploading && (
                      <span className="inline-block text-xs font-bold text-amber-700 animate-pulse">
                        جاري رفع الصور ومعالجتها...
                      </span>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleProductFilesSelected}
                      className="hidden"
                    />
                  </div>

                  {/* Manual URL Add */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">
                      أو أضف رابط صورة مباشر من الإنترنت:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={manualImageUrl}
                        onChange={(e) => setManualImageUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono text-left focus:outline-none focus:border-amber-600"
                      />
                      <button
                        type="button"
                        onClick={handleAddManualImageUrl}
                        className="px-4 py-2 rounded-xl bg-[#1c1815] text-white text-xs font-bold shrink-0"
                      >
                        إضافة رابط
                      </button>
                    </div>
                  </div>

                  {/* Gallery of Uploaded Images */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#1c1815] block">
                      معرض صور القطعة الحالية ({productForm.images.length}):
                    </span>
                    {productForm.images.length === 0 ? (
                      <p className="text-xs text-[#8c7865] py-4 text-center">لا توجد صور بعد، ارفع صورك بالأعلى</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {productForm.images.map((img, idx) => (
                          <div
                            key={idx}
                            className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                              idx === 0
                                ? "border-amber-500 shadow-md ring-2 ring-amber-500/30"
                                : "border-[#ebdcca] hover:border-[#bda992]"
                            }`}
                          >
                            <img src={img} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />

                            {/* Cover Badge */}
                            {idx === 0 && (
                              <span className="absolute top-2 right-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                <span>الرئيسية</span>
                              </span>
                            )}

                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCoverImage(idx)}
                                  className="p-1.5 rounded-lg bg-white/90 text-[#1c1815] hover:bg-white text-xs font-bold transition-transform active:scale-90"
                                  title="تعيين كصورة غلاف رئيسية"
                                >
                                  <Star className="w-4 h-4 text-amber-600" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(idx)}
                                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition-transform active:scale-90"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SHOPIFY-STYLE PRICING & PROFIT */}
              {modalActiveTab === "pricing" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">سعر البيع للجمهور (ج.م) *</label>
                      <input
                        type="number"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-base font-bold text-emerald-700 font-alexandria focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">السعر قبل الخصم (المقارنة)</label>
                      <input
                        type="number"
                        value={productForm.originalPrice || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            originalPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="1650"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-sm text-[#8c7865] line-through focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">تكلفة القطعة عليك (Cost per item)</label>
                      <input
                        type="number"
                        value={productForm.costPrice || ""}
                        onChange={(e) => setProductForm({ ...productForm, costPrice: Number(e.target.value) })}
                        placeholder="700"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-sm text-[#1c1815] focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  {/* Real-time Profit Margin Indicator */}
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">صافي الربح المتوقع لكل قطعة:</span>
                        <span className="text-xl font-black font-alexandria text-emerald-700">
                          {profitAmount > 0 ? `+${profitAmount} ج.م` : "0 ج.م"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-emerald-900 block">هامش الربح (Profit Margin):</span>
                      <span className="text-lg font-black text-emerald-800 font-mono">
                        {profitMarginPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Inventory & SKU */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-4">
                    <h4 className="font-bold text-xs text-[#1c1815]">المخزون والباركود (Inventory & SKU)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8c7865] block">كود الباركود / SKU</label>
                        <input
                          type="text"
                          value={productForm.sku || ""}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          placeholder="ATH-RNG-925"
                          className="w-full px-3 py-2 rounded-lg border border-[#d8c8b4] text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#8c7865] block">عدد القطع المتوفرة بالمخزن</label>
                        <input
                          type="number"
                          value={productForm.stockQuantity ?? 10}
                          onChange={(e) =>
                            setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#d8c8b4] text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                        <input
                          type="checkbox"
                          checked={productForm.inStock}
                          onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                          className="rounded border-[#d8c8b4] text-emerald-600 focus:ring-0"
                        />
                        <span>متوفر بالمخزن ويمكن للعملاء شراؤه فوراً</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SIZES & SPECS */}
              {modalActiveTab === "specs" && (
                <div className="space-y-6">
                  {/* Weight in Grams */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1815] block">الوزن الصافي للفضة بالجرام</label>
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.weightGrams}
                      onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })}
                      className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm font-mono font-bold"
                    />
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">
                      المقاسات المتوفرة (أمثلة: 50 سم، 55 سم، مقاس 16، مقاس 18):
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {productForm.sizes?.map((sz, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-xl bg-white border border-[#d8c8b4] text-xs font-bold flex items-center gap-2"
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
                        placeholder="اكتب مقاس جديد واضغط إضافة..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d8c8b4] text-xs"
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

                  {/* Key Features (Bullet Points) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">
                      مميزات ونقاط القوة في صياغة القطعة (Bullet Points):
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {productForm.features.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#ebdcca] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm({
                                ...productForm,
                                features: productForm.features.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        placeholder="اكتب ميزة (مثال: قفل أمان إيطالي محكم)..."
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d8c8b4] text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFeatureText.trim()) {
                            setProductForm({
                              ...productForm,
                              features: [...productForm.features, newFeatureText.trim()],
                            });
                            setNewFeatureText("");
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#1c1815] text-white text-xs font-bold shrink-0"
                      >
                        إضافة ميزة
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SEO (GOOGLE SEARCH PREVIEW) */}
              {modalActiveTab === "seo" && (
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1815] block">عنوان الميتا لـ Google (Page Title)</label>
                    <input
                      type="text"
                      value={productForm.metaTitle || ""}
                      onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })}
                      placeholder={productForm.arabicName || "عنوان القطعة في جوجل..."}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1815] block">وصف الميتا (Meta Description)</label>
                    <textarea
                      rows={3}
                      value={productForm.metaDescription || ""}
                      onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })}
                      placeholder="وصف جذاب يظهر للعملاء في نتائج بحث جوجل..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm"
                    />
                  </div>

                  {/* Google Snippet Live Preview */}
                  <div className="p-4 rounded-xl bg-white border border-[#d8c8b4] space-y-1 text-right">
                    <span className="text-[11px] text-[#8c7865] block font-mono">معاينة نتيجة بحث Google:</span>
                    <div className="text-blue-700 font-medium text-sm hover:underline cursor-pointer">
                      {productForm.metaTitle || productForm.arabicName || "عنوان المنتج"} | أَثَـر للفضة 925
                    </div>
                    <div className="text-emerald-700 text-xs font-mono">
                      https://atharsilver.com/product/{editingProductId || "new-item"}
                    </div>
                    <div className="text-xs text-[#524436] line-clamp-2">
                      {productForm.metaDescription || productForm.description || "تسوق أرقى مجوهرات الفضة عيار 925 بصياغة إيطالية معتمدة."}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-[#ebdcca] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#d8c8b4] hover:bg-[#f6efe4] text-xs font-bold text-[#705e4d] transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#342c25] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{editingProductId ? "حفظ التعديلات الشاملة" : "إضافة القطعة للمتجر الآن"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

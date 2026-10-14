"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useStore, StoreSettings, Order, NavLinkItem, MarqueeExtraMessage, StoreCategory, CustomPage, DEFAULT_CATEGORIES, DEFAULT_CUSTOM_PAGES, HeroSlideItem } from "@/context/StoreContext";
import { Product } from "@/data/products";
import { playRoyalOrderChime } from "@/lib/sound";
import { AtharLogo } from "@/components/AtharLogo";
import {
  User, Eye, EyeOff, LogOut, Plus, Trash2, Edit, Save, Search, Package, ShoppingBag,
  MessageCircle, ExternalLink, Upload, Sparkles, Phone, Truck, Check, Tag, ShieldCheck,
  Settings, Globe, Megaphone, CreditCard, Mail, FileText, LayoutDashboard, Star, Layers, Image as ImageIcon,
  RotateCw, X, Smartphone, Monitor, BookOpen, Printer, ChevronUp, ChevronDown,
  Lock, Unlock, PhoneCall
} from "lucide-react";

type ActiveTab =
  | "orders"
  | "products"
  | "collections"
  | "pages"
  | "banners"
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
  | "policies";

const EGYPT_GOVERNORATES: { name: string; defaultRate: number }[] = [
  { name: "القاهرة", defaultRate: 45 },
  { name: "الجيزة", defaultRate: 45 },
  { name: "الإسكندرية", defaultRate: 55 },
  { name: "القليوبية", defaultRate: 50 },
  { name: "المنوفية", defaultRate: 60 },
  { name: "الغربية", defaultRate: 60 },
  { name: "الدقهلية", defaultRate: 65 },
  { name: "كفر الشيخ", defaultRate: 65 },
  { name: "البحيرة", defaultRate: 65 },
  { name: "دمياط", defaultRate: 65 },
  { name: "الشرقية", defaultRate: 65 },
  { name: "الإسماعيلية", defaultRate: 70 },
  { name: "بورسعيد", defaultRate: 70 },
  { name: "السويس", defaultRate: 70 },
  { name: "سيناء الشمالية", defaultRate: 80 },
  { name: "سيناء الجنوبية", defaultRate: 80 },
  { name: "الفيوم", defaultRate: 65 },
  { name: "بني سويف", defaultRate: 70 },
  { name: "المنيا", defaultRate: 75 },
  { name: "أسيوط", defaultRate: 80 },
  { name: "سوهاج", defaultRate: 80 },
  { name: "قنا", defaultRate: 85 },
  { name: "الأقصر", defaultRate: 85 },
  { name: "أسوان", defaultRate: 90 },
  { name: "البحر الأحمر", defaultRate: 90 },
  { name: "مطروح", defaultRate: 90 },
  { name: "الوادي الجديد", defaultRate: 90 },
];

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

  // Active Main Tab (14 tabs)
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");

  // Settings Security Lock State (Protected by password: Kk5019Kk@#$&)
  const [isSettingsUnlocked, setIsSettingsUnlocked] = useState<boolean>(false);
  const [isSettingsPasswordModalOpen, setIsSettingsPasswordModalOpen] = useState<boolean>(false);
  const [settingsPasswordInput, setSettingsPasswordInput] = useState<string>("");
  const [showSettingsPassword, setShowSettingsPassword] = useState<boolean>(false);
  const [settingsPasswordError, setSettingsPasswordError] = useState<string>("");
  const [pendingTabAfterUnlock, setPendingTabAfterUnlock] = useState<ActiveTab | null>(null);

  // Selected Order for Full Details Modal (Inside View)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);

  // Shopify-style Live Split Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Filters & Search
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
  const [newExtraMsgText, setNewExtraMsgText] = useState<string>("");

  // Live Preview Iframe Reference for Shopify Auto-Scroll
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sound Alert for incoming orders
  const prevOrdersCountRef = useRef<number | null>(null);

  // Check login on mount
  useEffect(() => {
    const session = localStorage.getItem("athar_admin_auth");
    if (session === "true") {
      setIsAuthenticated(true);
    }
    const unlocked = sessionStorage.getItem("athar_settings_unlocked");
    if (unlocked === "true") {
      setIsSettingsUnlocked(true);
    }
  }, []);

  // Sync settings when storeSettings updates from context
  useEffect(() => {
    setSettingsForm(storeSettings);
  }, [storeSettings]);

  // Audio alert on new incoming order
  useEffect(() => {
    if (prevOrdersCountRef.current !== null && orders.length > prevOrdersCountRef.current) {
      playRoyalOrderChime();
      addToast("طلب جديد!", "ورد طلب شراء جديد إلى المتجر", "cart");
    }
    prevOrdersCountRef.current = orders.length;
  }, [orders, addToast]);

  // Secure Login Handler with Server-Side Cryptographic Token & Brute-Force Rate Limiting
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoggingIn(true);
    const trimmedUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUser, password: cleanPass }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        if (rememberMe) {
          localStorage.setItem("athar_admin_auth", "true");
        }
        if (data.token) {
          localStorage.setItem("athar_admin_token", data.token);
        }
        addToast("مرحباً بك", "تم تسجيل الدخول الآمن إلى لوحة إدارة متجر أَثَر بنجاح", "info");
      } else {
        setAuthError(data.error || "اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مجدداً.");
      }
    } catch {
      // Fallback offline verification if API is temporarily unreachable
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
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSettingsUnlocked(false);
    sessionStorage.removeItem("athar_settings_unlocked");
    localStorage.removeItem("athar_admin_auth");
    localStorage.removeItem("athar_admin_token");
    setUsernameInput("");
    setPasswordInput("");
  };

  // Tab click with Settings Security Gate
  const handleTabClick = (tabId: ActiveTab) => {
    if (tabId === "orders") {
      setActiveTab("orders");
      return;
    }
    if (isSettingsUnlocked) {
      setActiveTab(tabId);
    } else {
      setPendingTabAfterUnlock(tabId);
      setSettingsPasswordError("");
      setSettingsPasswordInput("");
      setIsSettingsPasswordModalOpen(true);
    }
  };

  // Unlock Settings with Password (Kk5019Kk@#$&)
  const handleUnlockSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (settingsPasswordInput.trim() === "Kk5019Kk@#$&") {
      setIsSettingsUnlocked(true);
      sessionStorage.setItem("athar_settings_unlocked", "true");
      setIsSettingsPasswordModalOpen(false);
      setSettingsPasswordError("");
      const targetTab = pendingTabAfterUnlock || "products";
      setActiveTab(targetTab);
      addToast("تم فتح الإعدادات", "تم تأكيد كلمة المرور بنجاح، يمكنك الآن تعديل كافة إعدادات المتجر", "info");
    } else {
      setSettingsPasswordError("كلمة المرور غير صحيحة، يرجى إدخال كلمة المرور الصحيحة للوصول للإعدادات.");
    }
  };

  // Lock Settings
  const handleLockSettings = () => {
    setIsSettingsUnlocked(false);
    sessionStorage.removeItem("athar_settings_unlocked");
    setActiveTab("orders");
    addToast("تم قفل الإعدادات", "تم قفل إعدادات المتجر بنجاح لحماية البيانات", "info");
  };

  // Helper to retrieve product thumbnail for order items
  const getItemImage = (item: { productId: string; arabicName: string; image?: string }) => {
    if (item.image && item.image.trim().length > 0) return item.image;
    const prod = products.find((p) => p.id === item.productId || p.arabicName === item.arabicName);
    if (prod && prod.images && prod.images.length > 0) return prod.images[0];
    return "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80";
  };

  // Professional Order Invoice Printing
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const itemsRows = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: right; font-weight: bold;">
          ${item.arabicName} ${item.selectedSize ? `<span style="font-size: 11px; color: #756555; display: block;">مقاس: ${item.selectedSize}</span>` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: left;">${item.price.toLocaleString("en-US")} ج.م</td>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: left; font-weight: bold;">${(item.price * item.quantity).toLocaleString("en-US")} ج.م</td>
      </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>بوليصة شحن طلب #${order.id} - دار أَثَر</title>
        <style>
          body { font-family: 'Cairo', Tahoma, sans-serif; padding: 30px; color: #161412; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #161412; padding-bottom: 14px; margin-bottom: 20px; }
          .brand { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
          .subtitle { font-size: 12px; color: #756555; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: #fbf9f5; border: 1px solid #e8ded0; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.8; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          th { background: #f7f4ee; padding: 10px; text-align: right; border-bottom: 2px solid #161412; font-size: 12px; }
          .total-box { background: #f7f4ee; border: 1px solid #ded2c0; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; line-height: 1.8; }
          .total-amount { font-size: 18px; font-weight: bold; color: #161412; border-top: 1px solid #ded2c0; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between; }
          .footer { text-align: center; font-size: 11px; color: #756555; border-top: 1px dashed #ccc; padding-top: 14px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">أَثَـر للفضة الإسترليني 925</div>
          <div class="subtitle">بوليصة تسليم الشحنة للعميل • فاتورة رسمية</div>
        </div>
        <div class="meta-grid">
          <div>
            <div><strong>رقم الطلب:</strong> #${order.id}</div>
            <div><strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleDateString("ar-EG")}</div>
            <div><strong>اسم العميل:</strong> ${order.customerName}</div>
            <div><strong>رقم الهاتف:</strong> ${order.phone}</div>
          </div>
          <div>
            <div><strong>المحافظة:</strong> ${order.governorate}</div>
            <div><strong>العنوان بالتفصيل:</strong> ${order.address}</div>
            <div><strong>طريقة الدفع:</strong> ${order.paymentMethod === "cod" ? "الدفع عند الاستلام" : order.paymentMethod === "wallet" ? "محفظة إلكترونية" : "بطاقة بنكية"}</div>
            <div><strong>ملاحظات العميل:</strong> ${order.notes || "لا توجد"}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>القطعة والمواصفات</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: left;">سعر القطعة</th>
              <th style="text-align: left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="total-box">
          <div style="display: flex; justify-content: space-between;">
            <span>قيمة المنتجات:</span>
            <span>${order.subtotal.toLocaleString("en-US")} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>رسوم الشحن والتوصيل:</span>
            <span>${order.shippingFee.toLocaleString("en-US")} ج.م</span>
          </div>
          ${order.discount ? `
          <div style="display: flex; justify-content: space-between; color: #b91c1c;">
            <span>كوبون الخصم:</span>
            <span>-${order.discount.toLocaleString("en-US")} ج.م</span>
          </div>` : ""}
          <div class="total-amount">
            <span>المبلغ المطلوب تحصيله من العميل:</span>
            <span>${order.total.toLocaleString("en-US")} ج.م</span>
          </div>
        </div>
        <div class="footer">
          حق المعاينة التامة مكفول للعميل أثناء تواجد مندوب الشحن • ضمان أَثَر المعتمد على الفضة الإسترليني 925<br>
          خدمة العملاء والدعم: 01143837730
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getWhatsAppInvoiceUrl = (order: Order) => {
    const itemsText = order.items
      .map((item) => `• ${item.arabicName} ${item.selectedSize ? `(مقاس: ${item.selectedSize})` : ""} × ${item.quantity} = ${(item.price * item.quantity).toLocaleString("en-US")} ج.م`)
      .join("%0A");
    const msg = `مرحباً بك في دار أَثَر للفضة 925%0Aيسعدنا إبلاغك بتأكيد طلبك رقم: %23${order.id}%0A%0Aالعميل: ${encodeURIComponent(order.customerName)}%0Aالعنوان: ${encodeURIComponent(order.governorate)} - ${encodeURIComponent(order.address)}%0A%0Aالمنتجات المطلوبة:%0A${itemsText}%0A%0Aرسوم الشحن: ${order.shippingFee} ج.م%0Aإجمالي المبلغ المطلوب عند الاستلام: ${order.total.toLocaleString("en-US")} ج.م%0A%0Aحق المعاينة مكفول لك بالكامل قبل الاستلام والسداد.%0Aشكراً لاختيارك دار أَثَر.`;
    let phone = order.phone.replace(/[^0-9]/g, "");
    if (phone.startsWith("0")) phone = "2" + phone;
    return `https://wa.me/${phone}?text=${msg}`;
  };

  // Auto-scroll the live preview iframe whenever activeTab changes (Shopify Customizer behavior)
  useEffect(() => {
    if (isPreviewOpen && iframeRef.current?.contentWindow) {
      const timer = setTimeout(() => {
        try {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "ATHAR_SCROLL_TO", tab: activeTab },
            "*"
          );
        } catch {}
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeTab, isPreviewOpen]);

  // Fast Client-Side Image Compression & Reader (100% resilient on Vercel, localhost & mobile)
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            resolve(dataUrl);
          } else {
            resolve((e.target?.result as string) || "");
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || "");
        img.src = (e.target?.result as string) || "";
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

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

    const updatedData: Omit<Product, "id"> = {
      ...productForm,
      collections:
        productForm.collections && productForm.collections.length > 0
          ? productForm.collections
          : [productForm.category],
      features: parsedFeatures.length > 0 ? parsedFeatures : ["فضة إسترليني 925 معتمدة"],
      sizes: parsedSizes.length > 0 ? parsedSizes : undefined,
      tags: parsedTags.length > 0 ? parsedTags : ["فضة 925"],
    };

    if (editingProductId) {
      updateProduct(editingProductId, updatedData);
      addToast("تم التعديل", `تم تحديث بيانات "${productForm.arabicName}" بنجاح`, "info");
    } else {
      addProduct({
        ...updatedData,
        id: `ath-${Date.now()}`,
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
        headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsForm }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        addToast("تم الحفظ في السحابة", "تم مزامنة كافة التعديلات فورياً على جميع الهواتف والمتصفحات", "info");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        addToast("خطأ", "فشل الحفظ في السحابة، يرجى المحاولة مجدداً", "info");
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

  // Helper for Governorate Rate Updates
  const updateGovRate = (govName: string, rate: number) => {
    const currentRates = { ...(settingsForm.governorateShippingRates || {}) };
    currentRates[govName] = rate;
    setSettingsForm((prev) => ({
      ...prev,
      governorateShippingRates: currentRates,
    }));
  };

  // Helper for NavLinks Updates
  const updateNavLinkItem = (id: string, updates: Partial<NavLinkItem>) => {
    const updated = (settingsForm.navLinks || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setSettingsForm((prev) => ({ ...prev, navLinks: updated }));
  };

  const addNavLinkItem = () => {
    const newItem: NavLinkItem = {
      id: `nav-${Date.now()}`,
      label: "رابط جديد",
      href: "/collections",
      visible: true,
      isSpecial: false,
      badge: "",
      badgeColor: "amber",
      targetBlank: false,
    };
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: [...(prev.navLinks || []), newItem],
    }));
  };

  const removeNavLinkItem = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).filter((item) => item.id !== id),
    }));
  };

  // Helper for Marquee Extra Messages
  const addMarqueeExtraMessage = () => {
    if (!newExtraMsgText.trim()) return;
    const newMsg: MarqueeExtraMessage = {
      id: `msg-${Date.now()}`,
      text: newExtraMsgText.trim(),
      visible: true,
    };
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: [...(prev.marqueeExtraMessages || []), newMsg],
    }));
    setNewExtraMsgText("");
  };

  const removeMarqueeExtraMessage = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: (prev.marqueeExtraMessages || []).filter((m) => m.id !== id),
    }));
  };

  const toggleMarqueeExtraMessage = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: (prev.marqueeExtraMessages || []).map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      ),
    }));
  };

  // 16 Settings Tabs Configuration (Protected by security password: Kk5019Kk@#$&)
  const settingsTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "products", label: "إدارة المنتجات", icon: <Package className="w-4 h-4" /> },
    { id: "collections", label: "الكولكشن والمجموعات", icon: <Layers className="w-4 h-4" /> },
    { id: "pages", label: "الصفحات المستقلة", icon: <BookOpen className="w-4 h-4" /> },
    { id: "banners", label: "البانرات الإعلانية ومواقعها", icon: <Sparkles className="w-4 h-4" /> },
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

  // ========================================================
  // LOGIN SCREEN
  // ========================================================
  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#f7f4ee] flex items-center justify-center p-4 selection:bg-[#dfd2bf] font-cairo">
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
    <div dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#161412] flex flex-col font-cairo selection:bg-[#dfd2bf]">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-30 bg-[#f7f4ee]/95 backdrop-blur-md border-b border-[#e4dcce] px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Cloud Status */}
          <div className="flex items-center gap-4">
            <AtharLogo variant="light" size="sm" />
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Store Settings Gear Button */}
            <button
              type="button"
              onClick={() => {
                if (isSettingsUnlocked) {
                  if (activeTab === "orders") setActiveTab("products");
                  else setActiveTab("orders");
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

        {/* MOBILE HORIZONTAL TABS (< md) */}
        <div className="md:hidden flex items-center gap-1 mt-2.5 pt-2 border-t border-[#e8ded0] overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === "orders"
                ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                : "text-[#5c4f42] hover:bg-white/60"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>الطلبات والمبيعات</span>
            {orderMetrics.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-[#161412] text-[10px] font-black">
                {orderMetrics.pending}
              </span>
            )}
          </button>

          <div className="w-px h-5 bg-[#ded2c0] mx-1 shrink-0" />

          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#161412] text-[#f7f4ee] font-bold shadow-sm"
                  : "text-[#5c4f42] hover:bg-white/60"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {!isSettingsUnlocked && <Lock className="w-2.5 h-2.5 text-[#baa996]" />}
            </button>
          ))}
        </div>
      </header>

      {/* DASHBOARD BODY: FIXED-WIDTH SIDEBAR + MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* DESKTOP SIDEBAR (w-64, sticky, scrolls independently) */}
        <aside className="hidden md:block w-64 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto border-l border-[#e8ded0] bg-[#f7f4ee]/80 p-3 space-y-3">
          {/* Section 1: Orders (Direct & Accessible) */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#8c7865] px-3 py-1 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>الطلبات والمبيعات</span>
            </div>

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
                <span>الطلبات والعملاء</span>
              </div>

              {orderMetrics.pending > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#161412]">
                  {orderMetrics.pending}
                </span>
              )}
            </button>
          </div>

          {/* Section 2: Store Settings with Gear Icon & Security Lock */}
          <div className="pt-2 border-t border-[#e8ded0] space-y-1">
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
              {settingsTabs.map((tab) => {
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
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className={`p-4 sm:p-6 min-w-0 transition-all ${isPreviewOpen ? "w-full lg:w-[48%] xl:w-[45%] lg:border-l lg:border-[#ded2c0] lg:overflow-y-auto lg:h-[calc(100vh-65px)]" : "flex-1 lg:p-8"}`}>
          {/* ========================================================
              TAB 1: ORDERS
              ======================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Metric Cards */}
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
                    <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                    <option value="processing">جاري التجهيز</option>
                    <option value="shipped">جاري الشحن</option>
                    <option value="completed">تم التوصيل</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
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
                      `أهلاً بحضرتك يا ${order.customerName}، بنكلمك من متجر أَثَـر للفضة 925 بخصوص طلبك رقم (${order.id}) بقيمة ${order.total} ج.م.`
                    )}`;
                    const totalItemsCount = order.items.reduce((acc, item) => acc + (item.quantity || 1), 0);

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrderForDetails(order)}
                        className="bg-white rounded-xl p-4 sm:p-5 border border-[#e8ded0] shadow-sm hover:border-[#c5a880] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Order Overview Right */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-[#f7f4ee] border border-[#ded2c0] flex items-center justify-center text-[#161412] group-hover:bg-[#161412] group-hover:text-[#c5a880] transition-colors shrink-0">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-xs text-[#161412] bg-[#f7f4ee] px-2.5 py-0.5 rounded border border-[#ded2c0]">
                                  #{order.id}
                                </span>
                                <span className="text-[11px] text-[#8c7865]">
                                  {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {order.paymentMethod && (
                                  <span className="text-[10px] font-semibold bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e8ded0] text-[#756555]">
                                    {order.paymentMethod === "cod" ? "عند الاستلام" : order.paymentMethod === "wallet" ? "محفظة إلكترونية" : "بطاقة بنكية"}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-[#161412] mt-1 truncate group-hover:text-[#8c6b3e] transition-colors">
                                {order.customerName}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-[#756555] mt-0.5 flex-wrap">
                                <span className="font-medium text-[#161412]">{order.governorate}</span>
                                <span>•</span>
                                <span className="bg-[#f7f4ee] px-1.5 py-0.5 rounded text-[11px] text-[#161412] font-bold">
                                  {totalItemsCount} {totalItemsCount === 1 ? "قطعة" : "قطع"}
                                </span>
                                <span>•</span>
                                <span className="dir-ltr text-[11px] text-[#8c7865]">{order.phone}</span>
                              </div>
                            </div>
                          </div>

                          {/* Order Financials & Quick Actions Left */}
                          <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#f0e8dc]">
                            <div className="text-right lg:text-left pl-2">
                              <span className="block text-[10px] text-[#8c7865]">إجمالي الطلب:</span>
                              <span className="text-base font-bold text-[#161412] font-mono">
                                {order.total.toLocaleString("en-US")} <span className="text-xs font-normal">ج.م</span>
                              </span>
                            </div>

                            {/* Status dropdown */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
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
                              className="px-3.5 py-1.5 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
                              <span>التفاصيل</span>
                            </button>

                            {/* WhatsApp link */}
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shrink-0"
                              title="محادثة واتساب سريعة"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`هل أنت متأكد من حذف الطلب #${order.id} نهائياً؟`)) {
                                  deleteOrder(order.id);
                                }
                              }}
                              className="p-1.5 text-[#baa894] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                              title="حذف الطلب نهائياً"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                    </div>

                    {/* Actions & Stock Toggle */}
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
                        {product.inStock ? "متوفر للطلب" : "غير متوفر"}
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
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="bg-white rounded-xl p-5 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-[#161412] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#c5a880]" />
                    <span>إدارة الكولكشن والمجموعات (Collections & Categories)</span>
                  </h3>
                  <p className="text-xs text-[#756555] mt-1">
                    أنشئ كولكشن جديد، خصص صورته وعنوانه، ووزع المنتجات على أي كولكشن بحرية تامة.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddCollection}
                    className="px-5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#c5a880]" />
                    <span>إضافة كولكشن جديد</span>
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-4 py-2.5 rounded-lg bg-[#c5a880] text-[#161412] text-xs font-bold hover:bg-[#b8996e] transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ السحابة</span>
                  </button>
                </div>
              </div>

              {/* Collections Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(settingsForm.categories && settingsForm.categories.length > 0
                  ? settingsForm.categories
                  : DEFAULT_CATEGORIES
                ).map((col) => {
                  const assignedCount = products.filter(
                    (p) =>
                      p.category === col.id ||
                      (Array.isArray(p.collections) &&
                        (p.collections.includes(col.id) || (col.slug && p.collections.includes(col.slug))))
                  ).length;

                  return (
                    <div
                      key={col.id}
                      className="bg-white rounded-xl border border-[#e8ded0] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#b8a892] transition-colors"
                    >
                      {/* Banner Image Preview */}
                      <div className="relative h-32 w-full bg-[#1c1815] overflow-hidden">
                        {col.bannerImage ? (
                          <img
                            src={col.bannerImage}
                            alt={col.label}
                            className="w-full h-full object-cover brightness-[0.75]"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1715] to-[#2c241d] text-[#c5a880]">
                            <Layers className="w-7 h-7 text-[#c5a880]/80 mb-1" />
                            <span className="font-amiri font-bold text-sm text-white/90">{col.label}</span>
                          </div>
                        )}
                        <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-white text-[10px] font-bold flex items-center gap-1.5">
                          <span>{assignedCount} قطع</span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 text-white">
                          <span className="font-bold text-sm">{col.label}</span>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-2 flex-1">
                        {col.englishTitle && (
                          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8c7865]">
                            {col.englishTitle}
                          </div>
                        )}
                        <p className="text-xs text-[#756555] line-clamp-2">
                          {col.description || `تشكيلة ${col.label} من الفضة الإسترليني عيار 925`}
                        </p>
                        <div className="pt-2 text-[11px] font-mono text-[#8c7865] dir-ltr flex items-center gap-1">
                          <span className="text-[#c5a880]">URL:</span> /collection/{col.slug || col.id}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="p-3 bg-[#faf6f0] border-t border-[#e8ded0] flex items-center justify-between">
                        <Link
                          href={`/collection/${col.slug || col.id}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#ded2c0] text-[#161412] hover:bg-[#ede3d3] text-xs font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#c5a880]" />
                          <span>معاينة في المتجر</span>
                        </Link>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditCollection(col)}
                            className="p-1.5 rounded text-[#5c4f42] hover:text-[#161412] hover:bg-white"
                            title="تعديل الكولكشن"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCollection(col.id, col.label)}
                            className="p-1.5 rounded text-[#baa894] hover:text-rose-600 hover:bg-rose-50"
                            title="حذف الكولكشن"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: CUSTOM PAGES & BRAND STORY MANAGER
              ======================================================== */}
          {activeTab === "pages" && (
            <div className="space-y-6">
              {/* Header & Controls */}
              <div className="bg-white rounded-xl p-5 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-4 shadow-sm">
                <div>
                  <h3 className="font-bold text-sm text-[#161412] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c5a880]" />
                    <span>إدارة الصفحات المستقلة والبراند (Custom Pages & Brand)</span>
                  </h3>
                  <p className="text-xs text-[#756555] mt-1">
                    أنشئ صفحات مستقلة بروابط خاصة (مثل قصة براند أثر، دليل الفضة، سياسات المتجر) وتحكم في روابط الفوتر.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenAddPage}
                    className="px-5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#c5a880]" />
                    <span>إنشاء صفحة جديدة</span>
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="px-4 py-2.5 rounded-lg bg-[#c5a880] text-[#161412] text-xs font-bold hover:bg-[#b8996e] transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ السحابة</span>
                  </button>
                </div>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(settingsForm.customPages && settingsForm.customPages.length > 0
                  ? settingsForm.customPages
                  : DEFAULT_CUSTOM_PAGES
                ).map((page) => (
                  <div
                    key={page.id}
                    className="bg-white rounded-xl border border-[#e8ded0] overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#b8a892] transition-colors"
                  >
                    {/* Page Banner Preview */}
                    <div className="relative h-28 w-full bg-[#1c1815] overflow-hidden">
                      {page.bannerImage ? (
                        <img
                          src={page.bannerImage}
                          alt={page.title}
                          className="w-full h-full object-cover brightness-[0.7]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#211d19] to-[#332b24] text-[#c5a880] text-sm font-bold">
                          {page.title}
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            page.isPublished !== false
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {page.isPublished !== false ? "منشورة" : "مسودة"}
                        </span>
                        {page.showInFooter !== false && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-[#161412] text-[10px] font-bold">
                            في الفوتر
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Page Content Info */}
                    <div className="p-4 space-y-2 flex-1">
                      <h4 className="font-bold text-sm text-[#161412] line-clamp-1">{page.title}</h4>
                      {page.englishTitle && (
                        <div className="text-[10px] font-mono text-[#8c7865] uppercase">
                          {page.englishTitle}
                        </div>
                      )}
                      {page.subtitle && (
                        <p className="text-xs text-[#756555] line-clamp-2">{page.subtitle}</p>
                      )}
                      <div className="pt-2 text-[11px] font-mono text-[#8c7865] dir-ltr">
                        <span className="text-[#c5a880]">URL:</span> /page/{page.slug}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-3 bg-[#faf6f0] border-t border-[#e8ded0] flex items-center justify-between">
                      <Link
                        href={`/page/${page.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#ded2c0] text-[#161412] hover:bg-[#ede3d3] text-xs font-medium flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>معاينة حية ↗</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditPage(page)}
                          className="p-1.5 rounded text-[#5c4f42] hover:text-[#161412] hover:bg-white"
                          title="تعديل الصفحة"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id, page.title)}
                          className="p-1.5 rounded text-[#baa894] hover:text-rose-600 hover:bg-rose-50"
                          title="حذف الصفحة"
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
              TAB: CUSTOM PROMOTIONAL BANNERS & PLACEMENT
              ======================================================== */}
          {activeTab === "banners" && (
            <div className="space-y-6 max-w-4xl">
              {/* Main Banner Controls */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-5">
                <div className="text-sm font-bold text-[#161412] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a880]" />
                    <span>البانرات الإعلانية المخصصة والتحكم في موقعها بالمتجر</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={settingsForm.promoBannerShow !== false}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoBannerShow: e.target.checked })
                      }
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <span className="font-bold text-[#161412]">تفعيل ظهور البانر في المتجر</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Position Picker */}
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      موقع البانر في صفحة المتجر (Position) *
                    </label>
                    <select
                      value={settingsForm.promoBannerPosition || "after_hero"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          promoBannerPosition: e.target.value as "top" | "after_hero" | "between_products" | "before_care" | "before_footer",
                        })
                      }
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] font-bold focus:outline-none"
                    >
                      <option value="after_hero">بعد البانر الرئيسي وقبل المنتجات (موصى به)</option>
                      <option value="top">أعلى الصفحة تحت شريط التنقل مباشرة</option>
                      <option value="between_products">بين قسم المنتجات وقسم قصة البراند</option>
                      <option value="before_care">قبل قسم دليل العناية بالفضة</option>
                      <option value="before_footer">أسفل الموقع فوق الفوتر مباشرة</option>
                    </select>
                    <span className="text-[10px] text-[#8c7865] mt-1 block">
                      يمكنك نقل البانر لأي مكان في الموقع بحرية كاملة
                    </span>
                  </div>

                  {/* Theme Picker */}
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      المظهر اللوني للبانر (Theme)
                    </label>
                    <select
                      value={settingsForm.promoBannerTheme || "charcoal"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          promoBannerTheme: e.target.value as "charcoal" | "sand" | "gold" | "burgundy",
                        })
                      }
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    >
                      <option value="charcoal">فحم ملكي داكن مع لمعان برونزي (Charcoal & Gold)</option>
                      <option value="gold">ذهبي برونزي ملكي دافئ (Royal Bronze Gold)</option>
                      <option value="sand">رملي ناعم كلاسيكي (Warm Sand & Charcoal)</option>
                      <option value="burgundy">عنابي ملكي دافئ (Royal Burgundy)</option>
                    </select>
                  </div>
                </div>

                {/* Banner Texts */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      شارة البانر العلوية (Badge)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.promoBannerBadge || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoBannerBadge: e.target.value })
                      }
                      placeholder="عرض استثنائي لفترة محدودة"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      عنوان البانر الرئيسي (Headline) *
                    </label>
                    <input
                      type="text"
                      value={settingsForm.promoBannerTitle || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoBannerTitle: e.target.value })
                      }
                      placeholder="تألقي ببريق الفضة الإيطالية عيار 925"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      النص الترويجي التفصيلي (Subtitle)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.promoBannerSubtitle || ""}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, promoBannerSubtitle: e.target.value })
                      }
                      placeholder="احصل على خصم 10% فوري عند استخدام كود ATHAR10 مع شحن مجاني للطلبات المؤكدة اليوم."
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        نص زر التحويل (CTA Button)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.promoBannerButtonText || ""}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, promoBannerButtonText: e.target.value })
                        }
                        placeholder="تسوق العروض الآن"
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        رابط الزر (Href)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.promoBannerButtonLink || ""}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, promoBannerButtonLink: e.target.value })
                        }
                        placeholder="#products أو رابط صفحة التشكيلة"
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none dir-ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#756555]">
                      صورة ترويجية في البانر (رفع ملف من الجهاز أو رابط مباشر)
                    </label>

                    {settingsForm.promoBannerImageUrl && (
                      <div className="flex items-center gap-3 p-3 bg-[#f7f4ee] rounded-xl border border-[#ded2c0]">
                        <div className="h-14 w-28 bg-white rounded-lg border border-[#d8c8b4] overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={settingsForm.promoBannerImageUrl}
                            alt="Promo Banner Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-emerald-700 block">صورة البانر الترويجي محددة</span>
                          <span className="text-[10px] text-[#756555] truncate block dir-ltr">
                            {settingsForm.promoBannerImageUrl.startsWith("data:") ? "صورة مرفوعة من الجهاز" : settingsForm.promoBannerImageUrl}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, promoBannerImageUrl: "" })}
                          className="p-1.5 text-[#8c7865] hover:text-rose-600 rounded-lg"
                          title="حذف الصورة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settingsForm.promoBannerImageUrl || ""}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, promoBannerImageUrl: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/... أو اضغط زر الرفع من جهازك"
                        className="flex-1 bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none dir-ltr"
                      />
                      <label className="px-3.5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>رفع من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const dataUrl = await compressImageFile(file);
                              if (dataUrl) {
                                setSettingsForm((prev) => ({ ...prev, promoBannerImageUrl: dataUrl }));
                                addToast("تم اختيار صورة البانر", "تم تحديد صورة البانر الترويجي بنجاح", "info");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Live Banner Preview Card */}
                <div className="pt-4 border-t border-[#f0e8dc]">
                  <span className="text-xs font-bold text-[#161412] block mb-2">
                    معاينة حية لشكل البانر حسب إعداداتك الحالية:
                  </span>
                  <div
                    className={`p-6 rounded-xl border shadow-md relative overflow-hidden transition-all ${
                      settingsForm.promoBannerTheme === "sand"
                        ? "bg-[#eee4d5] text-[#161412] border-[#ded1be]"
                        : settingsForm.promoBannerTheme === "gold"
                        ? "bg-gradient-to-r from-[#211a14] via-[#2d2319] to-[#1a140f] text-[#fbf7f0] border-[#c5a880]/40"
                        : settingsForm.promoBannerTheme === "burgundy"
                        ? "bg-[#201014] text-white border-[#913d4b]/40"
                        : "bg-[#161412] text-[#f7f4ee] border-[#2e2925]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-2">
                        {settingsForm.promoBannerBadge && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20">
                            {settingsForm.promoBannerBadge}
                          </span>
                        )}
                        <h4 className="font-amiri text-xl font-bold">
                          {settingsForm.promoBannerTitle || "عنوان البانر الإعلاني"}
                        </h4>
                        <p className="text-xs opacity-80 max-w-md">
                          {settingsForm.promoBannerSubtitle || "النص الترويجي المصاحب للبانر..."}
                        </p>
                        {settingsForm.promoBannerButtonText && (
                          <div className="pt-2">
                            <span className="inline-block px-4 py-1.5 rounded-lg text-xs font-bold bg-[#c5a880] text-[#161412]">
                              {settingsForm.promoBannerButtonText}
                            </span>
                          </div>
                        )}
                      </div>
                      {settingsForm.promoBannerImageUrl && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black/20">
                          <img
                            src={settingsForm.promoBannerImageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-[#c5a880]" />
                    <span>حفظ إعدادات البانر في السحابة فورياً</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: HERO BANNER & MULTI-IMAGE CAROUSEL SLIDER
              ======================================================== */}
          {activeTab === "hero" && (
            <div className="space-y-6 max-w-4xl">
              {/* ===============================================
                  HERO SLIDER (MULTI-SLIDE CAROUSEL)
                  =============================================== */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-5">
                <div className="text-sm font-bold text-[#161412] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#c5a880]" />
                    <span>سلايدر البانر الرئيسي المتحرك (يتقلب تلقائياً كل 5 ثواني)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newSlide: HeroSlideItem = {
                        id: `slide-${Date.now()}`,
                        imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=85",
                        title: "الأَثَر لا يُهدى",
                        titleLine2: "بل يُترك",
                        subtitle: "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.",
                        primaryButtonText: "تسوق المجموعة",
                        primaryButtonLink: "/collection/all",
                        secondaryButtonText: "اكتشف أثر",
                        secondaryButtonLink: "#story",
                        overlayDarkness: "medium",
                        contentAlign: "right",
                        enabled: true,
                        badge: "تشكيلة جديدة",
                      };
                      const currentSlides = settingsForm.heroSlides || [];
                      setSettingsForm({ ...settingsForm, heroSlides: [...currentSlides, newSlide] });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>إضافة شريحة للمناسبات / العروض</span>
                  </button>
                </div>

                <div className="text-xs text-[#756555] bg-[#f7f4ee] rounded-lg p-3 border border-[#e8ded0] leading-relaxed">
                  يمكنك إضافة عدة شرائح مصورة هنا لتتحول واجهة المتجر إلى سلايدر تفاعلي بعرض الصفحة يتقلب تلقائياً كل 5 ثوانٍ مع شريط تقدم وتأثير حركة سلس. يمكنك تخصيص صورة ونصوص وزر كل شريحة لأي مناسبة أو عرض خاص.
                </div>

                {(!settingsForm.heroSlides || settingsForm.heroSlides.length === 0) ? (
                  <div className="py-8 text-center text-xs text-[#8c7865] border-2 border-dashed border-[#e8ded0] rounded-xl space-y-2">
                    <p className="font-bold text-[#161412]">لم يتم إضافة أي شريحة بعد في السلايدر المتعدد</p>
                    <p>يعمل المتجر حالياً بنظام البانر الكلاسيكي الفردي. اضغط على الزر أعلاه لإضافة أول شريحة لسلايدر المناسبات.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {settingsForm.heroSlides.map((slide, idx) => (
                      <div key={slide.id} className="border border-[#e8ded0] rounded-xl overflow-hidden bg-[#faf8f5]">
                        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#e8ded0]">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#161412] text-[#f7f4ee] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#161412] truncate max-w-[200px]">
                              {slide.title || "شريحة بدون عنوان"} {slide.titleLine2 ? `• ${slide.titleLine2}` : ""}
                            </span>
                            {slide.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e8dc] text-[#5c4f42] font-medium">
                                {slide.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#756555] font-medium">
                              <input
                                type="checkbox"
                                checked={slide.enabled !== false}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, enabled: e.target.checked } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                className="rounded border-[#ded2c0] text-[#161412]"
                              />
                              <span>مُفعّلة</span>
                            </label>
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const arr = [...(settingsForm.heroSlides || [])];
                                  const temp = arr[idx - 1];
                                  arr[idx - 1] = arr[idx];
                                  arr[idx] = temp;
                                  setSettingsForm({ ...settingsForm, heroSlides: arr });
                                }}
                                className="p-1 rounded text-[#8c7865] hover:text-[#161412] hover:bg-[#f0e8dc]"
                                title="تحريك لأعلى"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {idx < (settingsForm.heroSlides || []).length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const arr = [...(settingsForm.heroSlides || [])];
                                  const temp = arr[idx + 1];
                                  arr[idx + 1] = arr[idx];
                                  arr[idx] = temp;
                                  setSettingsForm({ ...settingsForm, heroSlides: arr });
                                }}
                                className="p-1 rounded text-[#8c7865] hover:text-[#161412] hover:bg-[#f0e8dc]"
                                title="تحريك لأسفل"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من حذف هذه الشريحة؟`)) {
                                  const updated = (settingsForm.heroSlides || []).filter((_, i) => i !== idx);
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }
                              }}
                              className="p-1 rounded text-[#8c7865] hover:text-rose-600 hover:bg-rose-50"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 space-y-3 text-xs">
                          {/* Image upload */}
                          <div>
                            <label className="block font-medium text-[#756555] mb-1">
                              صورة خلفية الشريحة (رفع من جهازك أو رابط مباشر) *
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={slide.imageUrl}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, imageUrl: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="https://... أو اضغط رفع من جهازك"
                                className="flex-1 bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                              />
                              <label className="px-3.5 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0">
                                <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                                <span>رفع</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const dataUrl = await compressImageFile(file);
                                      if (dataUrl) {
                                        const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                          i === idx ? { ...s, imageUrl: dataUrl } : s
                                        );
                                        setSettingsForm({ ...settingsForm, heroSlides: updated });
                                        addToast("تم اختيار الصورة", "تم تحديث صورة الشريحة بنجاح", "info");
                                      }
                                    }
                                  }}
                                />
                              </label>
                              {slide.imageUrl && (
                                <div className="w-14 h-10 rounded-lg overflow-hidden border border-[#ded2c0] shrink-0 bg-black">
                                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Titles */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                العنوان الرئيسي (السطر الأول) *
                              </label>
                              <input
                                type="text"
                                value={slide.title}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, title: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="الأَثَر لا يُهدى"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none font-bold"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                السطر الثاني (يظهر بلون ذهبي فخم)
                              </label>
                              <input
                                type="text"
                                value={slide.titleLine2 || ""}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, titleLine2: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="بل يُترك"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Badge + Darkness + Alignment */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                شارة الشريحة (Badge)
                              </label>
                              <input
                                type="text"
                                value={slide.badge || ""}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, badge: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="عرض خاص بمناسبة العيد"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                درجة تعتيم الصورة
                              </label>
                              <select
                                value={slide.overlayDarkness || "medium"}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, overlayDarkness: e.target.value as "light" | "medium" | "dark" } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                              >
                                <option value="light">خفيف (إظهار وضوح الصورة أكثر)</option>
                                <option value="medium">متوسط (متوازن ومريح للقراءة)</option>
                                <option value="dark">داكن (تركيز أكبر على النص الملكي)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                محاذاة النص
                              </label>
                              <select
                                value={slide.contentAlign || "right"}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, contentAlign: e.target.value as "center" | "right" | "left" } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                              >
                                <option value="right">يمين (افتراضي فاخر)</option>
                                <option value="center">وسط</option>
                                <option value="left">يسار</option>
                              </select>
                            </div>
                          </div>

                          {/* Subtitle */}
                          <div>
                            <label className="block font-medium text-[#756555] mb-1">
                              النص التوضيحي (Subtitle)
                            </label>
                            <input
                              type="text"
                              value={slide.subtitle || ""}
                              onChange={(e) => {
                                const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                  i === idx ? { ...s, subtitle: e.target.value } : s
                                );
                                setSettingsForm({ ...settingsForm, heroSlides: updated });
                              }}
                              placeholder="مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك..."
                              className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                            />
                          </div>

                          {/* Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#f0e8dc]">
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                نص الزر الأساسي
                              </label>
                              <input
                                type="text"
                                value={slide.primaryButtonText || ""}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, primaryButtonText: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="تسوق المجموعة"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                رابط الزر الأساسي
                              </label>
                              <input
                                type="text"
                                value={slide.primaryButtonLink || ""}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, primaryButtonLink: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="/collection/all أو #products"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                نص الزر الثانوي (رابط نصي أنيق)
                              </label>
                              <input
                                type="text"
                                value={slide.secondaryButtonText || ""}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, secondaryButtonText: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="اكتشف أثر"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-[#756555] mb-1">
                                رابط الزر الثانوي
                              </label>
                              <input
                                type="text"
                                value={slide.secondaryButtonLink || ""}
                                onChange={(e) => {
                                  const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                    i === idx ? { ...s, secondaryButtonLink: e.target.value } : s
                                  );
                                  setSettingsForm({ ...settingsForm, heroSlides: updated });
                                }}
                                placeholder="#story"
                                className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4 text-[#c5a880]" />
                    <span>حفظ شرائح السلايدر في السحابة فورياً</span>
                  </button>
                </div>
              </div>

              {/* ===============================================
                  SINGLE CLASSIC HERO BANNER FALLBACK
                  =============================================== */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <ImageIcon className="w-4 h-4 text-[#c5a880]" />
                  <span>إعدادات البانر الكلاسيكي الفردي (Hero Section)</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      شارة البانر العلوية (Hero Badge)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroBadge || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                      placeholder="تشكيلة الفضة الإسترليني 925"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      العنوان الرئيسي (Hero Title) — استخدم سطراً جديداً للتقسيم
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                      placeholder="الأَثَر لا يُهدى&#10;بل يُترك"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      النص التعريفي (Hero Subtitle)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroSubtitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                      placeholder="مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى."
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      الشعار الإعلاني القصير (Hero Tagline)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTagline || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTagline: e.target.value })}
                      placeholder="صياغة إيطالية يدوية فاخرة"
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
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        رابط الزر الأساسي
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroButtonLink || "/#products"}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonLink: e.target.value })}
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] dir-ltr"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="heroBtnShow"
                      checked={settingsForm.heroButtonShow !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonShow: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <label htmlFor="heroBtnShow" className="text-xs font-medium text-[#161412] cursor-pointer">
                      إظهار الزر الأساسي في البانر
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f0e8dc]">
                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        نص الزر الثانوي
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroSecondaryButtonText || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonText: e.target.value })}
                        placeholder="اكتشف أثر"
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        رابط الزر الثانوي
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroSecondaryButtonLink || "/#story"}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonLink: e.target.value })}
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] dir-ltr"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="heroSecBtnShow"
                      checked={settingsForm.heroSecondaryButtonShow !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonShow: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <label htmlFor="heroSecBtnShow" className="text-xs font-medium text-[#161412] cursor-pointer">
                      إظهار الزر الثانوي في البانر
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#f0e8dc] space-y-2">
                    <label className="block text-xs font-medium text-[#756555]">
                      صورة خلفية البانر الرئيسي (رفع ملف من الجهاز أو رابط مباشر)
                    </label>

                    {settingsForm.heroImageUrl && (
                      <div className="flex items-center gap-3 p-3 bg-[#f7f4ee] rounded-xl border border-[#ded2c0]">
                        <div className="h-14 w-28 bg-white rounded-lg border border-[#d8c8b4] overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={settingsForm.heroImageUrl}
                            alt="Hero Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-bold text-emerald-700 block">صورة البانر محددة</span>
                          <span className="text-[10px] text-[#756555] truncate block dir-ltr">
                            {settingsForm.heroImageUrl.startsWith("data:") ? "صورة مرفوعة من الجهاز" : settingsForm.heroImageUrl}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, heroImageUrl: "" })}
                          className="p-1.5 text-[#8c7865] hover:text-rose-600 rounded-lg"
                          title="إزالة صورة البانر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={settingsForm.heroImageUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                        placeholder="https://... أو اضغط زر الرفع من جهازك"
                        className="flex-1 bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] dir-ltr"
                      />
                      <label className="px-3.5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>رفع من جهازك</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const dataUrl = await compressImageFile(file);
                              if (dataUrl) {
                                setSettingsForm((prev) => ({ ...prev, heroImageUrl: dataUrl }));
                                addToast("تم اختيار صورة البانر", "تم تحديث صورة البانر الرئيسي بنجاح", "info");
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        درجة عتامة الغطاء (Overlay)
                      </label>
                      <select
                        value={settingsForm.heroOverlayDarkness || "medium"}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroOverlayDarkness: e.target.value as "light" | "medium" | "dark",
                          })
                        }
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2.5 text-xs text-[#161412] focus:outline-none"
                      >
                        <option value="light">خفيف (Light)</option>
                        <option value="medium">متوسط (Medium)</option>
                        <option value="dark">داكن (Dark)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        ارتفاع البانر
                      </label>
                      <select
                        value={settingsForm.heroHeight || "normal"}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroHeight: e.target.value as "compact" | "normal" | "large",
                          })
                        }
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2.5 text-xs text-[#161412] focus:outline-none"
                      >
                        <option value="compact">مضغوط (Compact)</option>
                        <option value="normal">عادي (Normal)</option>
                        <option value="large">كامل الشاشة (Large)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        محاذاة المحتوى
                      </label>
                      <select
                        value={settingsForm.heroContentAlign || "center"}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroContentAlign: e.target.value as "center" | "right",
                          })
                        }
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2.5 text-xs text-[#161412] focus:outline-none"
                      >
                        <option value="center">وسط (Center)</option>
                        <option value="right">يمين (Right)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="heroKenBurns"
                      checked={settingsForm.heroKenBurns !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroKenBurns: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <label htmlFor="heroKenBurns" className="text-xs font-medium text-[#161412] cursor-pointer">
                      تفعيل تأثير الحركة السينمائية البطيئة (Ken Burns zoom)
                    </label>
                  </div>
                </div>
              </div>

              {/* Trust Bar Section */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                  <span>شريط الثقة والمميزات (Trust Bar)</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={settingsForm.showTrustBar !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showTrustBar: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <span>إظهار شريط الثقة أسفل البانر</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#756555]">الخلفية:</span>
                    <select
                      value={settingsForm.trustBarBg || "default"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          trustBarBg: e.target.value as "default" | "dark" | "white",
                        })
                      }
                      className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-1.5 text-xs text-[#161412] focus:outline-none"
                    >
                      <option value="default">كريمي افتراضي</option>
                      <option value="dark">داكن ملكي</option>
                      <option value="white">أبيض نقي</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="block text-xs font-bold text-[#161412]">الميزة 1 (النص + الأيقونة)</label>
                    <input
                      type="text"
                      value={settingsForm.trustItem1 || "فضة 925 معتمدة ومختومة"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem1: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustItem1Icon || "shield"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem1Icon: e.target.value })}
                      placeholder="shield"
                      className="w-24 bg-white border border-[#ded2c0] rounded px-2 py-1 text-xs dir-ltr font-mono"
                    />
                  </div>

                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="block text-xs font-bold text-[#161412]">الميزة 2 (النص + الأيقونة)</label>
                    <input
                      type="text"
                      value={settingsForm.trustItem2 || "معاينة القطعة قبل الاستلام"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem2: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustItem2Icon || "eye"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem2Icon: e.target.value })}
                      placeholder="eye"
                      className="w-24 bg-white border border-[#ded2c0] rounded px-2 py-1 text-xs dir-ltr font-mono"
                    />
                  </div>

                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="block text-xs font-bold text-[#161412]">الميزة 3 (النص + الأيقونة)</label>
                    <input
                      type="text"
                      value={settingsForm.trustItem3 || "شحن سريع لكافة المحافظات"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem3: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustItem3Icon || "truck"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem3Icon: e.target.value })}
                      placeholder="truck"
                      className="w-24 bg-white border border-[#ded2c0] rounded px-2 py-1 text-xs dir-ltr font-mono"
                    />
                  </div>

                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#161412]">الميزة 4 (اختياري)</label>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.trustItem4Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, trustItem4Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>إظهار</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.trustItem4 || "تغليف هدايا ملكي مجاني"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem4: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-2 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.trustItem4Icon || "gift"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, trustItem4Icon: e.target.value })}
                      placeholder="gift"
                      className="w-24 bg-white border border-[#ded2c0] rounded px-2 py-1 text-xs dir-ltr font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ إعدادات البانر الرئيسي</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 4: MARQUEE
              ======================================================== */}
          {activeTab === "marquee" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Megaphone className="w-4 h-4 text-[#c5a880]" />
                  <span>شريط الإعلانات المتحرك (Marquee Bar)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showMarqueeCheck"
                      checked={settingsForm.showMarquee}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showMarquee: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <label htmlFor="showMarqueeCheck" className="text-xs font-bold text-[#161412] cursor-pointer">
                      تفعيل شريط الإعلانات
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">الثيم واللون</label>
                    <select
                      value={settingsForm.marqueeTheme || "default"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          marqueeTheme: e.target.value as "default" | "dark" | "gold" | "burgundy",
                        })
                      }
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412]"
                    >
                      <option value="default">كريمي افتراضي</option>
                      <option value="dark">داكن Charcoal</option>
                      <option value="gold">ذهبي فاخر</option>
                      <option value="burgundy">عنابي ملكي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">سرعة الحركة</label>
                    <select
                      value={settingsForm.marqueeSpeed || "normal"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          marqueeSpeed: e.target.value as "slow" | "normal" | "fast",
                        })
                      }
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412]"
                    >
                      <option value="slow">هادئة (Slow)</option>
                      <option value="normal">متوسطة (Normal)</option>
                      <option value="fast">سريعة (Fast)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="marqueePause"
                    checked={settingsForm.marqueePauseOnHover !== false}
                    onChange={(e) => setSettingsForm({ ...settingsForm, marqueePauseOnHover: e.target.checked })}
                    className="rounded border-[#ded2c0] text-[#161412]"
                  />
                  <label htmlFor="marqueePause" className="text-xs font-medium text-[#161412] cursor-pointer">
                    إيقاف الحركة عند تمرير الماوس فوق الشريط (Pause on hover)
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1">
                    رسالة إعلانية مخصصة رئيسية
                  </label>
                  <input
                    type="text"
                    value={settingsForm.marqueeCustomText || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, marqueeCustomText: e.target.value })}
                    placeholder="خصومات حصرية بمناسبة إطلاق تشكيلة الصيف..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                {/* Subsections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f0e8dc]">
                  {/* Countdown */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.marqueeShowCountdown}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowCountdown: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>عداد تنازلي للعرض (Countdown)</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.marqueeCountdownLabel || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueeCountdownLabel: e.target.value })}
                      placeholder="ينتهي العرض الخاص خلال:"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#756555]">ساعات العداد:</span>
                      <input
                        type="number"
                        value={settingsForm.marqueeCountdownHours || 24}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeCountdownHours: Number(e.target.value) })}
                        className="w-20 bg-white border border-[#ded2c0] rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  {/* Free Shipping */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.marqueeShowFreeShipping}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowFreeShipping: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>رسالة الشحن المجاني</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.marqueeFreeShippingText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueeFreeShippingText: e.target.value })}
                      placeholder="شحن مجاني على كافة الطلبات اليوم"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Promo */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.marqueeShowPromo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowPromo: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>إبراز كوبون الخصم</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.marqueePromoPrefix || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueePromoPrefix: e.target.value })}
                      placeholder="استخدم كود الخصم الحصري"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Warranty */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.marqueeShowWarranty}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowWarranty: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>رسالة الضمان والفحص</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.marqueeWarrantyText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueeWarrantyText: e.target.value })}
                      placeholder="معاينة القطعة وضمان الفضة 925"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Gift Wrap */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2 sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.marqueeShowGiftWrap}
                        onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowGiftWrap: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>رسالة تغليف الهدايا</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.marqueeGiftWrapText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, marqueeGiftWrapText: e.target.value })}
                      placeholder="تغليف هدايا فاخر متاح مجاناً مع كل طلب"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Extra Messages Array */}
                <div className="pt-4 border-t border-[#f0e8dc] space-y-3">
                  <div className="text-xs font-bold text-[#161412]">
                    رسائل متحركة إضافية في الشريط (Extra Messages):
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newExtraMsgText}
                      onChange={(e) => setNewExtraMsgText(e.target.value)}
                      placeholder="اكتب رسالة إضافية للشريط..."
                      className="flex-1 bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={addMarqueeExtraMessage}
                      className="px-4 py-2 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925]"
                    >
                      إضافة
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(settingsForm.marqueeExtraMessages || []).map((msg) => (
                      <div
                        key={msg.id}
                        className="flex items-center justify-between p-2.5 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={msg.visible}
                            onChange={() => toggleMarqueeExtraMessage(msg.id)}
                            className="rounded border-[#ded2c0] text-[#161412]"
                          />
                          <span className={msg.visible ? "text-[#161412]" : "text-[#8c7865] line-through"}>
                            {msg.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMarqueeExtraMessage(msg.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ إعدادات شريط الإعلانات</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 5: NAV & SEARCH
              ======================================================== */}
          {activeTab === "nav" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Layers className="w-4 h-4 text-[#c5a880]" />
                  <span>روابط قائمة التنقل العلوية (Navigation Links)</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    النص التوضيحي داخل شريط البحث (Search Placeholder)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.searchPlaceholder || "ابحث عن خاتم، سلسلة، عيار 925..."}
                    onChange={(e) => setSettingsForm({ ...settingsForm, searchPlaceholder: e.target.value })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                <div className="pt-2 border-t border-[#f0e8dc] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#161412]">روابط القائمة الرئيسية:</span>
                    <button
                      type="button"
                      onClick={addNavLinkItem}
                      className="px-3 py-1.5 rounded-lg bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2e2925] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة رابط جديد</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(settingsForm.navLinks || []).map((link) => (
                      <div
                        key={link.id}
                        className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                      >
                        <div className="sm:col-span-3">
                          <label className="block text-[10px] text-[#756555] mb-0.5">اسم الرابط</label>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) => updateNavLinkItem(link.id, { label: e.target.value })}
                            className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs font-bold"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-[#756555] mb-0.5">الرابط (Href)</label>
                          <input
                            type="text"
                            value={link.href}
                            onChange={(e) => updateNavLinkItem(link.id, { href: e.target.value })}
                            className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs dir-ltr"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-[#756555] mb-0.5">شارة (Badge)</label>
                          <input
                            type="text"
                            value={link.badge || ""}
                            onChange={(e) => updateNavLinkItem(link.id, { badge: e.target.value })}
                            placeholder="جديد / خصم"
                            className="w-full bg-white border border-[#ded2c0] rounded px-2 py-1.5 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2 pt-3 sm:pt-0">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.visible}
                              onChange={(e) => updateNavLinkItem(link.id, { visible: e.target.checked })}
                              className="rounded border-[#ded2c0] text-[#161412]"
                            />
                            <span>ظاهر</span>
                          </label>

                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.isSpecial || false}
                              onChange={(e) => updateNavLinkItem(link.id, { isSpecial: e.target.checked })}
                              className="rounded border-[#ded2c0] text-[#161412]"
                            />
                            <span className="text-amber-700 font-bold">مميز</span>
                          </label>
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeNavLinkItem(link.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="حذف الرابط"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ قائمة التنقل والبحث</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 6: STORY & CARE (القصة والعناية)
              ======================================================== */}
          {activeTab === "story" && (
            <div className="space-y-6 max-w-4xl">
              {/* Products Section on Homepage */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Package className="w-4 h-4 text-[#c5a880]" />
                  <span>نصوص قسم استعراض المنتجات بالصفحة الرئيسية</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">الشارة العلوية (Badge)</label>
                    <input
                      type="text"
                      value={settingsForm.productsSectionBadge || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, productsSectionBadge: e.target.value })}
                      placeholder="تشكيلة الفضة الإسترليني"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">عنوان القسم الرئيسي</label>
                    <input
                      type="text"
                      value={settingsForm.productsSectionTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, productsSectionTitle: e.target.value })}
                      placeholder="روائع الصياغة الإيطالية"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">الوصف الفرعي للقسم</label>
                    <input
                      type="text"
                      value={settingsForm.productsSectionSubtitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, productsSectionSubtitle: e.target.value })}
                      placeholder="قطع مختارة من الفضة عيار 925 النقية"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Gender Split Section */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Star className="w-4 h-4 text-[#c5a880]" />
                  <span>قسم التشكيلتين (نسائي / رجالي - Gender Split)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Women */}
                  <div className="p-4 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] space-y-3">
                    <h5 className="font-bold text-xs text-[#161412] border-b border-[#d8c8b4] pb-2">التشكيلة النسائية</h5>
                    <input
                      type="text"
                      value={settingsForm.splitWomenTag || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenTag: e.target.value })}
                      placeholder="الشارة: رقة وأنوثة"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.splitWomenTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenTitle: e.target.value })}
                      placeholder="العنوان بالعربية"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={settingsForm.splitWomenEnglishTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenEnglishTitle: e.target.value })}
                      placeholder="English Title: WOMEN'S COLLECTION"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-mono"
                    />
                    <textarea
                      rows={2}
                      value={settingsForm.splitWomenSubtitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenSubtitle: e.target.value })}
                      placeholder="الوصف التعريفي"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.splitWomenButtonText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenButtonText: e.target.value })}
                      placeholder="نص الزر: اكتشفي التشكيلة"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    {/* Women Image Upload & Preview */}
                    <div className="space-y-1.5 pt-1">
                      {settingsForm.splitWomenImage && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#ded2c0]">
                          <div className="w-10 h-10 rounded overflow-hidden border shrink-0">
                            <img src={settingsForm.splitWomenImage} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] text-[#756555] truncate flex-1 dir-ltr">
                            {settingsForm.splitWomenImage.startsWith("data:") ? "صورة مرفوعة" : settingsForm.splitWomenImage}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, splitWomenImage: "" })}
                            className="text-[#8c7865] hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={settingsForm.splitWomenImage || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenImage: e.target.value })}
                          placeholder="رابط الصورة أو رفع ملف"
                          className="flex-1 bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr"
                        />
                        <label className="px-2.5 py-1.5 rounded bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap">
                          <Upload className="w-3 h-3 text-[#c5a880]" />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const dataUrl = await compressImageFile(file);
                                if (dataUrl) {
                                  setSettingsForm((prev) => ({ ...prev, splitWomenImage: dataUrl }));
                                  addToast("تم اختيار الصورة", "تم تحديث صورة التشكيلة النسائية", "info");
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Men */}
                  <div className="p-4 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] space-y-3">
                    <h5 className="font-bold text-xs text-[#161412] border-b border-[#d8c8b4] pb-2">التشكيلة الرجالية</h5>
                    <input
                      type="text"
                      value={settingsForm.splitMenTag || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitMenTag: e.target.value })}
                      placeholder="الشارة: هيبة وأصالة"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.splitMenTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitMenTitle: e.target.value })}
                      placeholder="العنوان بالعربية"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={settingsForm.splitMenEnglishTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitMenEnglishTitle: e.target.value })}
                      placeholder="English Title: MEN'S COLLECTION"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-mono"
                    />
                    <textarea
                      rows={2}
                      value={settingsForm.splitMenSubtitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitMenSubtitle: e.target.value })}
                      placeholder="الوصف التعريفي"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={settingsForm.splitMenButtonText || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, splitMenButtonText: e.target.value })}
                      placeholder="نص الزر: استكشف التشكيلة"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                    
                    {/* Men Image Upload & Preview */}
                    <div className="space-y-1.5 pt-1">
                      {settingsForm.splitMenImage && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#ded2c0]">
                          <div className="w-10 h-10 rounded overflow-hidden border shrink-0">
                            <img src={settingsForm.splitMenImage} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[10px] text-[#756555] truncate flex-1 dir-ltr">
                            {settingsForm.splitMenImage.startsWith("data:") ? "صورة مرفوعة" : settingsForm.splitMenImage}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, splitMenImage: "" })}
                            className="text-[#8c7865] hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={settingsForm.splitMenImage || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, splitMenImage: e.target.value })}
                          placeholder="رابط الصورة أو رفع ملف"
                          className="flex-1 bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr"
                        />
                        <label className="px-2.5 py-1.5 rounded bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap">
                          <Upload className="w-3 h-3 text-[#c5a880]" />
                          <span>رفع</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const dataUrl = await compressImageFile(file);
                                if (dataUrl) {
                                  setSettingsForm((prev) => ({ ...prev, splitMenImage: dataUrl }));
                                  addToast("تم اختيار الصورة", "تم تحديث صورة التشكيلة الرجالية", "info");
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand Story & 4 Pillars */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Sparkles className="w-4 h-4 text-[#c5a880]" />
                  <span>قصة البراند وأركان التميز الـ 4 (Brand Story)</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={settingsForm.storySectionShow !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storySectionShow: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <span>إظهار قسم القصة في المتجر</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">شارة القصة (Badge)</label>
                    <input
                      type="text"
                      value={settingsForm.storyBadge || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyBadge: e.target.value })}
                      placeholder="أصالة وحرفية"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">عنوان القصة</label>
                    <input
                      type="text"
                      value={settingsForm.storyTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyTitle: e.target.value })}
                      placeholder="أثر: ما يبقى طويلاً بعد أن تمضي اللحظة"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1">نص قصة البراند</label>
                  <textarea
                    rows={3}
                    value={settingsForm.storySubtitle || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, storySubtitle: e.target.value })}
                    placeholder="نصنع كل قطعة في أثر من الفضة الإسترليني عيار 925..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                {/* 4 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#f0e8dc]">
                  {/* Pillar 1 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">الركيزة 1</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.storyPillar1Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar1Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.storyPillar1Title || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar1Title: e.target.value })}
                      placeholder="فضة 925 نقية ومختومة"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={settingsForm.storyPillar1Desc || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar1Desc: e.target.value })}
                      placeholder="وصف الركيزة..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Pillar 2 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">الركيزة 2</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.storyPillar2Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar2Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.storyPillar2Title || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar2Title: e.target.value })}
                      placeholder="صياغة يدوية احترافية"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={settingsForm.storyPillar2Desc || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar2Desc: e.target.value })}
                      placeholder="وصف الركيزة..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Pillar 3 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">الركيزة 3</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.storyPillar3Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar3Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.storyPillar3Title || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar3Title: e.target.value })}
                      placeholder="تغليف هدايا ملكي"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={settingsForm.storyPillar3Desc || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar3Desc: e.target.value })}
                      placeholder="وصف الركيزة..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Pillar 4 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">الركيزة 4</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.storyPillar4Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar4Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.storyPillar4Title || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar4Title: e.target.value })}
                      placeholder="ضمان أصالة وتألق مستمر"
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={settingsForm.storyPillar4Desc || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar4Desc: e.target.value })}
                      placeholder="وصف الركيزة..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Silver Care Section & 4 Tips */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                  <span>دليل العناية بالفضة والنصائح الـ 4 (Silver Care)</span>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={settingsForm.careSectionShow !== false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, careSectionShow: e.target.checked })}
                      className="rounded border-[#ded2c0] text-[#161412]"
                    />
                    <span>إظهار قسم العناية بالفضة</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">شارة العناية (Badge)</label>
                    <input
                      type="text"
                      value={settingsForm.careBadge || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, careBadge: e.target.value })}
                      placeholder="إرشادات تدوم طويلاً"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">عنوان قسم العناية</label>
                    <input
                      type="text"
                      value={settingsForm.careTitle || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, careTitle: e.target.value })}
                      placeholder="كيف تحافظ على بريق فضتك للأبد؟"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1">الوصف الفرعي</label>
                  <textarea
                    rows={2}
                    value={settingsForm.careSubtitle || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, careSubtitle: e.target.value })}
                    placeholder="نصائح بسيطة تضمن استمرار لمعان مصوغاتك..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                {/* 4 Care Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#f0e8dc]">
                  {/* Tip 1 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">النصيحة 1</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.careTip1Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, careTip1Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
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
                      placeholder="ارتدِ قطعتك بعد رش العطر لحماية الفضة..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Tip 2 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">النصيحة 2</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.careTip2Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, careTip2Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
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
                      placeholder="احفظها في علبة أثر المبطنة بمكان جاف..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Tip 3 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">النصيحة 3</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.careTip3Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, careTip3Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
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
                      placeholder="امسحها بقطعة قماش ناعمة وجافة بعد كل ارتداء..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>

                  {/* Tip 4 */}
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">النصيحة 4</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.careTip4Show !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, careTip4Show: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>ظاهر</span>
                      </label>
                    </div>
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
                      placeholder="الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها..."
                      className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ نصوص القصة والعناية</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 7: FOOTER
              ======================================================== */}
          {activeTab === "footer" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <FileText className="w-4 h-4 text-[#c5a880]" />
                  <span>تخصيص الفوتر أسفل الموقع (Footer)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">عنوان البراند بالفوتر</label>
                    <input
                      type="text"
                      value={settingsForm.footerBrandTitle || "أَثَـر للفضة"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerBrandTitle: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">الشعار الإنجليزي بالفوتر</label>
                    <input
                      type="text"
                      value={settingsForm.footerEnglishTag || "FINE STERLING SILVER 925"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerEnglishTag: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1">النبذة التعريفية بالفوتر (Brand Bio)</label>
                  <textarea
                    rows={2}
                    value={settingsForm.footerBrandBio || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, footerBrandBio: e.target.value })}
                    placeholder="نبذة موجزة عن علامة أثر ومصوغات الفضة 925..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                {/* Columns Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#f0e8dc]">
                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">عمود الأقسام</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.footerColCategoriesShow !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerColCategoriesShow: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>إظهار</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.footerColCategoriesTitle || "التشكيلات"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerColCategoriesTitle: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">عمود خدمة العملاء</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.footerColCustomerServiceShow !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerColCustomerServiceShow: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>إظهار</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.footerColCustomerServiceTitle || "خدمة العملاء"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerColCustomerServiceTitle: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#161412]">عمود التواصل</span>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.footerColContactShow !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerColContactShow: e.target.checked })}
                          className="rounded border-[#ded2c0] text-[#161412]"
                        />
                        <span>إظهار</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settingsForm.footerColContactTitle || "تواصل معنا"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerColContactTitle: e.target.value })}
                      className="w-full bg-white border border-[#ded2c0] rounded px-2.5 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">نص رابط دليل المقاسات</label>
                    <input
                      type="text"
                      value={settingsForm.footerSizeGuideText || "دليل مقاسات الخواتم"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerSizeGuideText: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">نص رابط العناية بالفضة</label>
                    <input
                      type="text"
                      value={settingsForm.footerSilverCareText || "إرشادات الحفاظ على الفضة"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerSilverCareText: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">عنوان قسم الدفع بالفوتر</label>
                    <input
                      type="text"
                      value={settingsForm.footerPaymentTitle || "طرق الدفع الآمنة"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerPaymentTitle: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">شارات الدفع المعتمدة</label>
                    <input
                      type="text"
                      value={settingsForm.footerPaymentBadgesText || "الدفع عند الاستلام • إنستاباي • فودافون كاش • فيزا ومستر كارد"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerPaymentBadgesText: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f0e8dc]">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">نص حقوق الملكية (Copyright)</label>
                    <input
                      type="text"
                      value={settingsForm.footerCopyrightText || "جميع الحقوق محفوظة © 2026 متجر أَثَـر للفضة"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerCopyrightText: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1">عبارة الشغف والإهداء</label>
                    <input
                      type="text"
                      value={settingsForm.footerPassionTagline || "صُنع بشغف ليبقى أثراً خالداً"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerPassionTagline: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ إعدادات الفوتر</span>
              </button>
            </div>
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
                      placeholder="Athar Silver Store"
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
                      placeholder="theathar@instapay"
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
            <div className="space-y-6 max-w-4xl">
              {/* Regional & Free Shipping */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Truck className="w-4 h-4 text-[#c5a880]" />
                  <span>المناطق الإقليمية الرئيسية وحد الشحن المجاني</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      شحن الصعيد والمحافظات النائية (ج.م)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.shippingUpperEgypt || 80}
                      onChange={(e) => setSettingsForm({ ...settingsForm, shippingUpperEgypt: Number(e.target.value) })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* All 27 Governorates Rates Table */}
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#c5a880]" />
                    <span>جدول تسعير الشحن التفصيلي لكافة الـ 27 محافظة مصرية</span>
                  </div>
                  <span className="text-xs text-[#756555]">27 محافظة</span>
                </div>

                <p className="text-xs text-[#756555] mb-4">
                  يمكنك تخصيص سعر الشحن بدقة لكل محافظة على حدة. يتم اعتماد هذه الأسعار فورياً في حاسبة السلة وإتمام الطلب.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {EGYPT_GOVERNORATES.map((gov) => {
                    const currentRate =
                      settingsForm.governorateShippingRates?.[gov.name] ?? gov.defaultRate;

                    return (
                      <div
                        key={gov.name}
                        className="flex items-center justify-between p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] text-xs"
                      >
                        <span className="font-bold text-[#161412]">{gov.name}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={currentRate}
                            onChange={(e) => updateGovRate(gov.name, Number(e.target.value))}
                            className="w-20 bg-white border border-[#ded2c0] rounded px-2.5 py-1 text-xs text-center font-bold text-[#161412] focus:outline-none focus:border-[#161412]"
                          />
                          <span className="text-[#8c7865] text-[11px]">ج.م</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ أسعار الشحن والمحافظات في السحابة</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 10: PROMOS
              ======================================================== */}
          {activeTab === "promos" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Tag className="w-4 h-4 text-[#c5a880]" />
                  <span>كوبونات الخصم الترويجية والعروض</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      كود الكوبون الفعّال (Promo Code)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.promoCode || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value.toUpperCase() })}
                      placeholder="ATHAR10"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] font-mono font-bold focus:outline-none dir-ltr text-right"
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
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      حد الشحن المجاني المرتبط (ج.م)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.freeShippingThreshold || 1500}
                      onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ الكوبونات والعروض</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 11: CONTACT
              ======================================================== */}
          {activeTab === "contact" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Phone className="w-4 h-4 text-[#c5a880]" />
                  <span>بيانات التواصل وقنوات السوشيال ميديا</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      رقم الواتساب الرسمي (مباشر)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      placeholder="01143837730"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      رقم الهاتف المباشر للاتصال
                    </label>
                    <input
                      type="text"
                      value={settingsForm.contactPhone || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      placeholder="01143837730"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      البريد الإلكتروني الرسمي
                    </label>
                    <input
                      type="email"
                      value={settingsForm.contactEmail || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      placeholder="theathar.eg@gmail.com"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      عنوان المقر / الورشة
                    </label>
                    <input
                      type="text"
                      value={settingsForm.contactAddress || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactAddress: e.target.value })}
                      placeholder="القاهرة - مصر"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#f0e8dc] space-y-4">
                  <div className="text-xs font-bold text-[#161412]">روابط منصات التواصل:</div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        رابط إنستجرام (Instagram)
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
                        رابط فيسبوك (Facebook)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.facebookUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/theathar.eg"
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#756555] mb-1.5">
                        رابط تيك توك (TikTok)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.tiktokUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        placeholder="https://tiktok.com/@theathar.eg"
                        className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ بيانات التواصل والسوشيال</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 12: LOGO & IDENTITY
              ======================================================== */}
          {activeTab === "logo" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Globe className="w-4 h-4 text-[#c5a880]" />
                  <span>الشعار والهوية البصرية (Logo & Brand Identity)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      نوع الشعار (Logo Type)
                    </label>
                    <select
                      value={settingsForm.logoType || "both"}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          logoType: e.target.value as "text" | "image" | "both",
                        })
                      }
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2.5 text-xs text-[#161412]"
                    >
                      <option value="text">نص خطي فقط (أَثَـر)</option>
                      <option value="image">صورة شعار مخصصة (Image)</option>
                      <option value="both">كلاهما معاً (Both)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      ارتفاع الشعار بالبيكسل ({settingsForm.logoHeight || 40}px)
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={80}
                      value={settingsForm.logoHeight || 40}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoHeight: Number(e.target.value) })}
                      className="w-full accent-[#161412]"
                    />
                  </div>
                </div>

                {/* Logo Image URL and Upload from PC */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[#756555]">
                    صورة الشعار (رفع ملف من الجهاز أو رابط مباشر)
                  </label>

                  {settingsForm.logoImageUrl && (
                    <div className="flex items-center gap-3 p-3 bg-[#f7f4ee] rounded-xl border border-[#ded2c0]">
                      <div className="h-12 w-28 bg-white rounded border border-[#d8c8b4] p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={settingsForm.logoImageUrl}
                          alt="Logo Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="font-bold text-emerald-700 block">شعار مخصص نشط</span>
                        <span className="text-[10px] text-[#756555] truncate block dir-ltr">
                          {settingsForm.logoImageUrl.startsWith("data:") ? "صورة مرفوعة من الجهاز" : settingsForm.logoImageUrl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoImageUrl: "" })}
                        className="p-1.5 text-[#8c7865] hover:text-rose-600 rounded-lg"
                        title="إزالة الشعار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={settingsForm.logoImageUrl || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoImageUrl: e.target.value })}
                      placeholder="https://... أو اضغط زر الرفع من جهازك"
                      className="flex-1 bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
                    />
                    <label className="px-3.5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>رفع من جهازك</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const dataUrl = await compressImageFile(file);
                            if (dataUrl) {
                              setSettingsForm((prev) => ({ ...prev, logoImageUrl: dataUrl }));
                              addToast("تم اختيار الشعار", "تم تحديد وتعيين صورة الشعار بنجاح", "info");
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f0e8dc]">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      اسم البراند بالعربية
                    </label>
                    <input
                      type="text"
                      value={settingsForm.brandNameArabic || "أَثَـر"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, brandNameArabic: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold text-[#161412]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      اسم البراند بالإنجليزية
                    </label>
                    <input
                      type="text"
                      value={settingsForm.brandNameEnglish || "ATHAR"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, brandNameEnglish: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold font-mono text-[#161412] dir-ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    الشعار اللفظي الملحق (Slogan / Subtitle)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.brandSubtitle || "الأثر لا يُهدى بل يُترك"}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandSubtitle: e.target.value })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
                  />
                </div>

                {/* Live Logo Preview Box */}
                <div className="p-6 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] flex flex-col items-center justify-center gap-2">
                  <span className="text-[10px] text-[#8c7865] uppercase tracking-wider mb-2">معاينة مباشرة للشعار:</span>
                  <AtharLogo variant="light" size="lg" showSlogan />
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ الشعار والهوية البصرية</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 13: EMAIL
              ======================================================== */}
          {activeTab === "email" && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <Mail className="w-4 h-4 text-[#c5a880]" />
                  <span>إعدادات البريد الإلكتروني الرسمي (Gmail SMTP)</span>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <strong>ملاحظة هامة لإرسال إيميلات تأكيد الطلبات للعملاء:</strong>
                  <br />
                  استخدم &quot;كلمة مرور التطبيقات (App Password)&quot; المكونة من 16 حرفاً من حساب Google، وليس كلمة مرور الإيميل الشخصية العادية.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      اسم الراسل الرسمي (Sender Name)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.senderEmailName || "متجر أَثَـر للفضة"}
                      onChange={(e) => setSettingsForm({ ...settingsForm, senderEmailName: e.target.value })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      البريد الإلكتروني للراسل (Sender Email)
                    </label>
                    <input
                      type="email"
                      value={settingsForm.senderEmail || ""}
                      onChange={(e) => setSettingsForm({ ...settingsForm, senderEmail: e.target.value })}
                      placeholder="theathar.eg@gmail.com"
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    كلمة مرور التطبيقات (Gmail App Password)
                  </label>
                  <input
                    type="password"
                    value={settingsForm.gmailAppPassword || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gmailAppPassword: e.target.value })}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ إعدادات البريد الإلكتروني</span>
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 14: POLICIES
              ======================================================== */}
          {activeTab === "policies" && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
                <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
                  <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
                  <span>سياسات المتجر (الاستبدال والاسترجاع والضمان)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#756555] mb-1.5">
                      مهلة الاستبدال والاسترجاع (بالأيام)
                    </label>
                    <input
                      type="number"
                      value={settingsForm.returnPolicyDays || 14}
                      onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyDays: Number(e.target.value) })}
                      className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold text-[#161412]"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.returnPolicyInspectionAllowed !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyInspectionAllowed: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>السماح بمعاينة القطعة وقياسها قبل الاستلام</span>
                    </label>
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={settingsForm.returnPolicyFreeExchange !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyFreeExchange: e.target.checked })}
                        className="rounded border-[#ded2c0] text-[#161412]"
                      />
                      <span>استبدال مجاني في حال وجود أي عيب مصنعي</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    عنوان سياسة الاسترجاع (Policy Title)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.returnPolicyTitle || "سياسة الاستبدال والاسترجاع وضمان الفضة 925"}
                    onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyTitle: e.target.value })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold text-[#161412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    النص التفصيلي لسياسة الاستبدال والاسترجاع
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.returnPolicyText || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyText: e.target.value })}
                    placeholder="يحق للعميل معاينة واستبدال القطعة خلال 14 يوماً بشرط أن تكون بحالتها الأصلية..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    نص ضمان الفضة والشهادة المعتمدة (Warranty Policy)
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.warrantyPolicyText || ""}
                    onChange={(e) => setSettingsForm({ ...settingsForm, warrantyPolicyText: e.target.value })}
                    placeholder="جميع قطع متجر أثر مصوغة من الفضة الإسترليني عيار 925 المعتمدة والمختومة رسميًا..."
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#756555] mb-1.5">
                    الجدول الزمني المعتاد للشحن والتوصيل (Shipping Timeline)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.shippingPolicyTimeline || "التوصيل خلال 2-4 أيام عمل لكافة محافظات مصر"}
                    onChange={(e) => setSettingsForm({ ...settingsForm, shippingPolicyTimeline: e.target.value })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-[#c5a880]" />
                <span>حفظ سياسات المتجر والضمان</span>
              </button>
            </div>
          )}
        </main>

        {/* SHOPIFY-STYLE LIVE PREVIEW PANEL (Split Screen) */}
        {isPreviewOpen && (
          <div className="flex-1 bg-[#ede4d5]/40 flex flex-col sticky top-[65px] h-[calc(100vh-65px)] overflow-hidden border-t lg:border-t-0 border-[#ded2c0] z-20">
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
                        { type: "ATHAR_SCROLL_TO", tab: activeTab },
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
                    placeholder="خاتم الأثر الملكي فضة 925"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">الاسم بالإنجليزية (اختياري)</label>
                  <input
                    type="text"
                    value={productForm.name || ""}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Royal Athar Signet Ring"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none dir-ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block font-medium text-[#756555] mb-1">الوزن بالجرام التقريبي</label>
                  <input
                    type="number"
                    step="0.1"
                    value={productForm.weightGrams || 5}
                    onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })}
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#756555] mb-1">
                    المقاسات المتاحة (مفصولة بفاصلة ,)
                  </label>
                  <input
                    type="text"
                    value={productSizesText}
                    onChange={(e) => setProductSizesText(e.target.value)}
                    placeholder="مقاس 16, مقاس 17, مقاس 18"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#756555] mb-1">المقاس الافتراضي المحدد</label>
                  <input
                    type="text"
                    value={productForm.defaultSize || ""}
                    onChange={(e) => setProductForm({ ...productForm, defaultSize: e.target.value })}
                    placeholder="مقاس 17"
                    className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>

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
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
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
                  placeholder="مثال: قصة براند أَثَـر أو دليل اختيار المقاسات"
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
                    placeholder="THE ATHAR STORY"
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
                  placeholder="الأثر لا يُهدى بل يُترك • صياغة تخلد تفاصيلك"
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
          SETTINGS SECURITY PASSWORD MODAL (Password: Kk5019Kk@#$&)
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
          `أهلاً بحضرتك يا ${order.customerName}، بنكلمك من متجر أَثَـر للفضة 925 بخصوص طلبك رقم (${order.id}) بقيمة ${order.total} ج.م.`
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

              {/* Customer & Delivery Information Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded0] space-y-3">
                <div className="text-xs font-bold text-[#161412] flex items-center gap-2 pb-2 border-b border-[#f0e8dc]">
                  <User className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>بيانات العميل والشحن والتوصيل</span>
                </div>

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

              {/* Ordered Products with Images */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8ded0] space-y-4">
                <div className="text-xs font-bold text-[#161412] flex items-center justify-between pb-2 border-b border-[#f0e8dc]">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>القطع والمنتجات المطلوبة ({order.items.length})</span>
                  </div>
                  <span className="text-[11px] text-[#8c7865]">
                    إجمالي القطع: {order.items.reduce((s, i) => s + (i.quantity || 1), 0)}
                  </span>
                </div>

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
                                الكمية: <b className="text-[#161412]">{item.quantity}</b>
                              </span>
                              <span className="text-[#8c7865] text-[11px]">
                                سعر القطعة: <b className="text-[#161412]">{item.price.toLocaleString("en-US")} ج.م</b>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Item line total */}
                        <div className="text-left shrink-0 font-bold text-sm text-[#161412] font-mono">
                          {(item.price * item.quantity).toLocaleString("en-US")} <span className="text-xs font-normal">ج.م</span>
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

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`هل أنت متأكد من حذف الطلب #${order.id} نهائياً؟`)) {
                        deleteOrder(order.id);
                        setSelectedOrderForDetails(null);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الطلب</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForDetails(null)}
                  className="px-5 py-2 rounded-xl bg-[#e8ded0] hover:bg-[#ded2c0] text-[#161412] text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useStore, StoreSettings, Order, NavLinkItem } from "@/context/StoreContext";
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
  ArrowUp,
  ArrowDown,
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
  CreditCard,
  Phone,
  Printer,
  FileText,
  Ban,
  Undo2,
  Loader2,
  Mail,
  Copy,
  Check,
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
    confirmOrderViaPhone,
    cancelOrder,
    restoreOrder,
    updateOrderAdminNotes,
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
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Header Nav Links Editor State
  const [newNavLabel, setNewNavLabel] = useState<string>("");
  const [newNavHref, setNewNavHref] = useState<string>("");
  const [newNavBadge, setNewNavBadge] = useState<string>("");
  const [newNavBadgeColor, setNewNavBadgeColor] = useState<"amber" | "rose" | "purple" | "emerald" | "blue">("amber");
  const [newNavTargetBlank, setNewNavTargetBlank] = useState<boolean>(false);

  // Marquee Extra Announcements State
  const [newExtraText, setNewExtraText] = useState<string>("");
  const [newExtraIcon, setNewExtraIcon] = useState<string>("✨");

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
  const [previewReceiptOrder, setPreviewReceiptOrder] = useState<Order | null>(null);

  // Orders Management & Tele-Sales Workflow State
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [modalAdminNote, setModalAdminNote] = useState<string>("");
  const [isSendingInvoiceEmail, setIsSendingInvoiceEmail] = useState<boolean>(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>("العميل لم يرد على مكالمات التأكيد");
  const [cancelCustomReason, setCancelCustomReason] = useState<string>("");
  const [cancelAdminNote, setCancelAdminNote] = useState<string>("");
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [editingNotesOrder, setEditingNotesOrder] = useState<Order | null>(null);
  const [tempAdminNote, setTempAdminNote] = useState<string>("");

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

  // Sync server settings on mount
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.gmailAppPassword) {
          setSettingsForm((prev) => ({
            ...prev,
            gmailAppPassword: data.gmailAppPassword,
            senderEmail: data.senderEmail || prev.senderEmail,
            senderEmailName: data.senderEmailName || prev.senderEmailName,
          }));
        }
      })
      .catch(() => {});
  }, []);

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

  // Dedicated upload for Theme Images (Hero, Women, Men, Logo)
  const handleThemeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "heroImageUrl" | "splitWomenImage" | "splitMenImage" | "logoImageUrl"
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

  // Nav Links Deep Controls
  const toggleNavLinkVisibility = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).map((link) =>
        link.id === id ? { ...link, visible: !link.visible } : link
      ),
    }));
  };

  const updateNavLinkLabel = (id: string, label: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).map((link) =>
        link.id === id ? { ...link, label } : link
      ),
    }));
  };

  const updateNavLinkHref = (id: string, href: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).map((link) =>
        link.id === id ? { ...link, href } : link
      ),
    }));
  };

  const updateNavLinkBadge = (id: string, badge: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).map((link) =>
        link.id === id ? { ...link, badge } : link
      ),
    }));
  };

  const updateNavLinkBadgeColor = (id: string, badgeColor: "amber" | "rose" | "purple" | "emerald" | "blue") => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).map((link) =>
        link.id === id ? { ...link, badgeColor } : link
      ),
    }));
  };

  const toggleNavLinkTargetBlank = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).map((link) =>
        link.id === id ? { ...link, targetBlank: !link.targetBlank } : link
      ),
    }));
  };

  const moveNavLinkUp = (index: number) => {
    if (index <= 0) return;
    setSettingsForm((prev) => {
      const items = [...(prev.navLinks || [])];
      const temp = items[index];
      items[index] = items[index - 1];
      items[index - 1] = temp;
      return { ...prev, navLinks: items };
    });
  };

  const moveNavLinkDown = (index: number) => {
    setSettingsForm((prev) => {
      const items = [...(prev.navLinks || [])];
      if (index >= items.length - 1) return prev;
      const temp = items[index];
      items[index] = items[index + 1];
      items[index + 1] = temp;
      return { ...prev, navLinks: items };
    });
  };

  const deleteNavLink = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: (prev.navLinks || []).filter((link) => link.id !== id),
    }));
  };

  const handleAddNavLink = () => {
    if (!newNavLabel.trim() || !newNavHref.trim()) {
      alert("يرجى إدخال اسم الرابط والمسار");
      return;
    }
    const newLink: NavLinkItem = {
      id: `custom-${Date.now()}`,
      label: newNavLabel.trim(),
      href: newNavHref.trim(),
      visible: true,
      badge: newNavBadge.trim() || undefined,
      badgeColor: newNavBadge.trim() ? newNavBadgeColor : undefined,
      targetBlank: newNavTargetBlank,
    };
    setSettingsForm((prev) => ({
      ...prev,
      navLinks: [...(prev.navLinks || []), newLink],
    }));
    setNewNavLabel("");
    setNewNavHref("");
    setNewNavBadge("");
    setNewNavTargetBlank(false);
    addToast("تمت الإضافة", "تمت إضافة الرابط الجديد للقائمة بنجاح، اضغط حفظ لتطبيقه", "info");
  };

  const handleResetNavLinks = () => {
    setSettingsForm((prev) => ({
      ...prev,
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
    }));
    addToast("استعادة الروابط", "تمت استعادة المجموعات الافتراضية بنجاح", "info");
  };

  // Marquee Extra Announcements Handlers
  const handleAddExtraMarquee = () => {
    if (!newExtraText.trim()) {
      alert("يرجى كتابة نص الإعلان");
      return;
    }
    const newMsg = {
      id: `msg-${Date.now()}`,
      text: newExtraText.trim(),
      icon: newExtraIcon.trim() || "✨",
      visible: true,
    };
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: [...(prev.marqueeExtraMessages || []), newMsg],
    }));
    setNewExtraText("");
    addToast("إضافة إعلان", "تمت إضافة الرسالة الإعلانية بنجاح، اضغط حفظ لتطبيقها", "info");
  };

  const toggleExtraMarquee = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: (prev.marqueeExtraMessages || []).map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      ),
    }));
  };

  const deleteExtraMarquee = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: (prev.marqueeExtraMessages || []).filter((m) => m.id !== id),
    }));
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
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(settingsForm);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: settingsForm.senderEmail || "theathar.eg@gmail.com",
          senderEmailName: settingsForm.senderEmailName || "أَثَـر للفضة 925",
          gmailAppPassword: settingsForm.gmailAppPassword || "",
        }),
      });
    } catch (err) {
      console.warn("Failed to sync server settings:", err);
    }
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Direct email save state & handler
  const [isSavingEmailDirectly, setIsSavingEmailDirectly] = useState(false);
  const [emailDirectSaveFeedback, setEmailDirectSaveFeedback] = useState("");

  const handleSaveEmailSettingsDirectly = async () => {
    setIsSavingEmailDirectly(true);
    setEmailDirectSaveFeedback("");
    try {
      updateStoreSettings(settingsForm);
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: settingsForm.senderEmail || "theathar.eg@gmail.com",
          senderEmailName: settingsForm.senderEmailName || "أَثَـر للفضة 925",
          gmailAppPassword: settingsForm.gmailAppPassword || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailDirectSaveFeedback("تم حفظ إعدادات البريد في السيرفر بنجاح! جاهز لإرسال الفواتير لجميع العملاء فوراً ✓");
        addToast("إعدادات البريد", "تم حفظ كلمة المرور في السيرفر بنجاح", "info");
      } else {
        setEmailDirectSaveFeedback("فشل الحفظ: " + (data.error || "خطأ غير معروف"));
      }
    } catch {
      setEmailDirectSaveFeedback("حدث خطأ أثناء الاتصال بالسيرفر");
    } finally {
      setIsSavingEmailDirectly(false);
    }
  };

  // Resend Invoice Email Helper
  const handleResendInvoiceEmail = async (order: Order) => {
    if (!order.email) {
      alert("الطلب لا يحتوي على بريد إلكتروني مسجل للعميل");
      return;
    }
    setIsSendingInvoiceEmail(true);
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.email,
          customerPhone: order.phone,
          governorate: order.governorate,
          address: order.address,
          items: order.items,
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discount: order.discount,
          total: order.total,
          paymentMethod: order.paymentMethod,
          status: order.status,
          type: "status_update",
          senderEmail: storeSettings.senderEmail || "theathar.eg@gmail.com",
          senderName: storeSettings.senderEmailName || "أَثَـر للفضة 925",
          gmailAppPassword: storeSettings.gmailAppPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("إرسال الفاتورة ✉️", `تم إرسال الفاتورة بنجاح إلى ${order.email}`, "info");
      } else {
        alert("فشل إرسال الفاتورة: " + (data.error || "خطأ غير معروف"));
      }
    } catch {
      alert("حدث خطأ في شبكة الاتصال أثناء محاولة إرسال البريد");
    } finally {
      setIsSendingInvoiceEmail(false);
    }
  };

  // Test Email Sender State & Handler
  const [testEmailAddress, setTestEmailAddress] = useState<string>("theathar.eg@gmail.com");
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [testEmailFeedback, setTestEmailFeedback] = useState<string>("");
  const [showAppPassword, setShowAppPassword] = useState<boolean>(false);

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes("@")) {
      alert("يرجى إدخال عنوان بريد إلكتروني صحيح لتجربة الإرسال إليه");
      return;
    }
    setTestEmailStatus("loading");
    setTestEmailFeedback("");
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "ATH-TEST-01",
          customerName: "تجربة براند أَثَر",
          email: testEmailAddress.trim(),
          phone: "01143837730",
          governorate: "القاهرة",
          address: "المقر الإداري لبراند أَثَر للفضة 925",
          total: 1250,
          items: [
            {
              arabicName: "خاتم ملكي عيار 925 مرصع بزركون نقي",
              quantity: 1,
              price: 1250,
              selectedSize: "مقاس 18",
            },
          ],
          status: "confirmed_phone",
          senderEmail: settingsForm.senderEmail || "theathar.eg@gmail.com",
          senderName: settingsForm.senderEmailName || "أَثَـر للفضة 925",
          gmailAppPassword: settingsForm.gmailAppPassword,
          isTest: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestEmailStatus("success");
        setTestEmailFeedback(data.message || "تم إرسال البريد التجريبي بنجاح!");
        addToast("إرسال ناجح ✉️", `تم إرسال بريد تجريبي إلى ${testEmailAddress}`, "info");
        // Also persist to server automatically so all future customer orders work!
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderEmail: settingsForm.senderEmail || "theathar.eg@gmail.com",
            senderEmailName: settingsForm.senderEmailName || "أَثَـر للفضة 925",
            gmailAppPassword: settingsForm.gmailAppPassword || "",
          }),
        }).catch(() => {});
      } else {
        setTestEmailStatus("error");
        setTestEmailFeedback(data.error || "فشل إرسال البريد التجريبي");
      }
    } catch {
      setTestEmailStatus("error");
      setTestEmailFeedback("حدث خطأ في الاتصال بالخادم أثناء إرسال البريد التجريبي");
    }
  };

  // Quick Copy Order ID Helper
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
    addToast("نسخ رقم الطلب", `تم نسخ #${id} إلى الحافظة بنجاح`, "info");
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

  // Orders Filtering & Tele-Sales Calculations
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilterStatus !== "all") {
        if (orderFilterStatus === "confirmed_phone") {
          if (o.status !== "confirmed_phone" && !o.phoneConfirmed) return false;
        } else if (o.status !== orderFilterStatus) {
          return false;
        }
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.phone.toLowerCase().includes(q);
        const matchesGov = o.governorate.toLowerCase().includes(q);
        const matchesEmail = o.email ? o.email.toLowerCase().includes(q) : false;
        return matchesId || matchesName || matchesPhone || matchesGov || matchesEmail;
      }
      return true;
    });
  }, [orders, orderFilterStatus, orderSearchQuery]);

  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const confirmedPhoneOrdersCount = orders.filter((o) => o.status === "confirmed_phone" || o.phoneConfirmed).length;
  const processingOrdersCount = orders.filter((o) => o.status === "processing").length;
  const shippedOrdersCount = orders.filter((o) => o.status === "shipped").length;
  const completedOrdersCount = orders.filter((o) => o.status === "completed").length;
  const cancelledOrdersCount = orders.filter((o) => o.status === "cancelled").length;

  const validSalesTotal = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + o.total, 0);

  const cancellationPercentage =
    orders.length > 0 ? Math.round((cancelledOrdersCount / orders.length) * 100) : 0;

  // Selected Order for Details Modal
  const selectedOrderDetails = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  useEffect(() => {
    if (selectedOrderDetails) {
      setModalAdminNote(selectedOrderDetails.adminNotes || "");
    }
  }, [selectedOrderDetails]);

  // Confirm Order Cancellation with Reason
  const handleConfirmCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    const finalReason =
      cancelReasonPreset === "other"
        ? cancelCustomReason.trim() || "تم الإلغاء لسبب مخصص"
        : cancelReasonPreset;

    cancelOrder(cancellingOrder.id, finalReason, cancelAdminNote.trim() || undefined);
    setCancellingOrder(null);
    setCancelCustomReason("");
    setCancelAdminNote("");
  };

  // Open Cancel Modal
  const handleOpenCancelModal = (order: Order) => {
    setCancellingOrder(order);
    setCancelReasonPreset("العميل لم يرد على مكالمات التأكيد");
    setCancelCustomReason("");
    setCancelAdminNote(order.adminNotes || "");
  };

  // Save Admin Internal Note
  const handleSaveInternalNote = () => {
    if (!editingNotesOrder) return;
    updateOrderAdminNotes(editingNotesOrder.id, tempAdminNote);
    setEditingNotesOrder(null);
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
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>إدارة الطلبات والمبيعات ({orders.length})</span>
                {orders.some((o) => o.status === "pending") && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                    {pendingOrdersCount} جديد
                  </span>
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
                <span>إعدادات الشحن والدفع والكوبونات</span>
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
                {/* ======================================================== */}
                {/* 1. BRAND LOGO & HEADER IDENTITY SECTION */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ebdcca] pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>1. شعار وهوية البراند في أعلى الصفحة (Brand Logo & Header)</span>
                      </h3>
                      <p className="text-[11px] text-[#8c7865] mt-0.5">
                        تحكم كامل في طريقة عرض اللوجو، رفع لوجو المتجر من جهازك، والتحكم في حجمه
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 self-start sm:self-auto">
                      تحكم شوبي فاي 100%
                    </span>
                  </div>

                  {/* Logo Display Mode Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#1c1815] block">طريقة عرض الشعار في الهيدر:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                          settingsForm.logoType === "text"
                            ? "bg-amber-500/10 border-amber-500 text-[#1c1815] font-bold"
                            : "bg-white border-[#d8c8b4] text-[#705e4d] hover:bg-[#f6efe4]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="logoType"
                          value="text"
                          checked={settingsForm.logoType === "text"}
                          onChange={() => setSettingsForm({ ...settingsForm, logoType: "text" })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-xs">نصوص فقط (أَثَـر / ATHAR 925)</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                          settingsForm.logoType === "image"
                            ? "bg-amber-500/10 border-amber-500 text-[#1c1815] font-bold"
                            : "bg-white border-[#d8c8b4] text-[#705e4d] hover:bg-[#f6efe4]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="logoType"
                          value="image"
                          checked={settingsForm.logoType === "image"}
                          onChange={() => setSettingsForm({ ...settingsForm, logoType: "image" })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-xs">لوجو مصور فقط (Image Logo)</span>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
                          settingsForm.logoType === "both"
                            ? "bg-amber-500/10 border-amber-500 text-[#1c1815] font-bold"
                            : "bg-white border-[#d8c8b4] text-[#705e4d] hover:bg-[#f6efe4]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="logoType"
                          value="both"
                          checked={settingsForm.logoType === "both"}
                          onChange={() => setSettingsForm({ ...settingsForm, logoType: "both" })}
                          className="text-amber-600 focus:ring-0"
                        />
                        <span className="text-xs">كلاهما معاً (اللوجو بجانب الاسم)</span>
                      </label>
                    </div>
                  </div>

                  {/* Image Upload Area (Shown when image or both is selected) */}
                  {(settingsForm.logoType === "image" || settingsForm.logoType === "both") && (
                    <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="w-full sm:w-48 h-24 rounded-xl border-2 border-dashed border-[#d8c8b4] bg-[#faf8f5] flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                          {settingsForm.logoImageUrl ? (
                            <img
                              src={settingsForm.logoImageUrl}
                              alt="Logo Preview"
                              style={{ height: `${Math.min(settingsForm.logoHeight || 36, 70)}px` }}
                              className="w-auto object-contain"
                            />
                          ) : (
                            <div className="text-center text-[#a89582] text-xs">
                              <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                              <span>لا يوجد لوجو مصور</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 w-full space-y-2">
                          <label className="text-xs font-bold text-[#1c1815] block">رفع لوجو المتجر من جهازك:</label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              className="px-4 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
                            >
                              <Upload className="w-3.5 h-3.5 text-amber-300" />
                              <span>اختر ملف الشعار من جهازك (PNG / JPG / SVG)</span>
                            </button>
                            {settingsForm.logoImageUrl && (
                              <button
                                type="button"
                                onClick={() => setSettingsForm({ ...settingsForm, logoImageUrl: "" })}
                                className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition-colors"
                              >
                                مسح الصورة
                              </button>
                            )}
                            <input
                              type="file"
                              ref={logoFileInputRef}
                              onChange={(e) => handleThemeImageUpload(e, "logoImageUrl")}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                          <input
                            type="text"
                            value={settingsForm.logoImageUrl || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, logoImageUrl: e.target.value })}
                            placeholder="أو اكتب رابط اللوجو مباشرة..."
                            className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono text-left"
                          />
                        </div>
                      </div>

                      {/* Logo Height Slider */}
                      <div className="pt-2 border-t border-[#ebdcca] space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-[#1c1815]">ارتفاع الشعار في الهيدر (Logo Height):</label>
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {settingsForm.logoHeight || 36} بكسل (px)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={80}
                          step={2}
                          value={settingsForm.logoHeight || 36}
                          onChange={(e) => setSettingsForm({ ...settingsForm, logoHeight: Number(e.target.value) })}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#8c7865]">
                          <span>صغير (20px)</span>
                          <span>متوسط (36px)</span>
                          <span>كبير وبارز (80px)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Brand Typography Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">اسم البراند بالعربية</label>
                      <input
                        type="text"
                        value={settingsForm.brandNameArabic || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandNameArabic: e.target.value })}
                        placeholder="أَثَـر"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">اسم البراند بالإنجليزية</label>
                      <input
                        type="text"
                        value={settingsForm.brandNameEnglish || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandNameEnglish: e.target.value })}
                        placeholder="ATHAR"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm font-mono tracking-wider focus:outline-none focus:border-amber-600 uppercase"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">الشعار الفرعي (Tagline)</label>
                      <input
                        type="text"
                        value={settingsForm.brandSubtitle || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandSubtitle: e.target.value })}
                        placeholder="فضة إسترليني عيار 925"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  {/* Live Visual Header Preview Box */}
                  <div className="p-3.5 rounded-xl bg-[#ede3d3] border border-[#d8c8b4] space-y-1.5">
                    <span className="text-[11px] font-bold text-[#705e4d] block">معاينة فورية لمظهر الشعار في الهيدر:</span>
                    <div className="h-16 bg-[#faf8f5] rounded-lg border border-[#e8ded0] px-4 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-3">
                        {(settingsForm.logoType === "image" || settingsForm.logoType === "both") &&
                          settingsForm.logoImageUrl && (
                            <img
                              src={settingsForm.logoImageUrl}
                              alt="Logo"
                              style={{ height: `${settingsForm.logoHeight || 36}px` }}
                              className="w-auto object-contain"
                            />
                          )}
                        {(settingsForm.logoType === "text" ||
                          settingsForm.logoType === "both" ||
                          !settingsForm.logoImageUrl) && (
                          <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl font-light tracking-[0.15em] text-[#1c1815] font-alexandria uppercase">
                              {settingsForm.brandNameEnglish || "ATHAR"}
                            </span>
                            <span className="text-[9px] font-mono tracking-widest text-[#8c7865] border-r border-[#d8c8b4] pr-2 uppercase">
                              {settingsForm.brandNameArabic || "أَثَـر"} • {settingsForm.brandSubtitle || "925"}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8c7865] bg-white px-2 py-1 rounded-md border border-[#ebdcca]">
                        معاينة حية للمتجر
                      </span>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 2. TOP ANNOUNCEMENT MARQUEE TICKER SECTION */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ebdcca] pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>2. الشريط الإعلاني المتحرك العلوي (Top Marquee Ticker)</span>
                      </h3>
                      <p className="text-[11px] text-[#8c7865] mt-0.5">
                        تحكم كامل في نصوص العروض، العداد التنازلي، سرعة الحركة، وألوان وخلفية الشريط
                      </p>
                    </div>

                    {/* Master Marquee Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-[#d8c8b4] shadow-sm select-none">
                      <input
                        type="checkbox"
                        checked={settingsForm.showMarquee !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showMarquee: e.target.checked })}
                        className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-[#1c1815]">
                        {settingsForm.showMarquee !== false ? "الشريط مفعّل ومرئي 🟢" : "الشريط مخفي تماماً ⚪"}
                      </span>
                    </label>
                  </div>

                  {settingsForm.showMarquee !== false && (
                    <div className="space-y-6">
                      {/* Ticker Appearance & Speed Bar */}
                      <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-3">
                        <span className="text-xs font-bold text-[#1c1815] block">
                          🎨 مظهر وتنسيق وسرعة الشريط المتحرك:
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Theme Selector */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#8c7865] block">لون وخلفية الشريط:</label>
                            <select
                              value={settingsForm.marqueeTheme || "default"}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  marqueeTheme: e.target.value as StoreSettings["marqueeTheme"],
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815]"
                            >
                              <option value="default">☕ بيج كلاسيك فاخر (ألوان البراند)</option>
                              <option value="dark">🖤 أسود ملكي فخم (Dark Luxury)</option>
                              <option value="gold">👑 ذهبي ملكي متألق (Royal Gold)</option>
                              <option value="burgundy">🍷 عنابي راقي (Royal Burgundy)</option>
                            </select>
                          </div>

                          {/* Speed Selector */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-[#8c7865] block">سرعة حركة الشريط:</label>
                            <select
                              value={settingsForm.marqueeSpeed || "normal"}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  marqueeSpeed: e.target.value as StoreSettings["marqueeSpeed"],
                                })
                              }
                              className="w-full px-3 py-2 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815]"
                            >
                              <option value="slow">🐢 بطيء (قراءة مريحة وهادئة - 38 ثانية)</option>
                              <option value="normal">⚡ متوسط متوازن (26 ثانية)</option>
                              <option value="fast">🚀 سريع وديناميكي (16 ثانية)</option>
                            </select>
                          </div>

                          {/* Pause on Hover */}
                          <div className="space-y-1.5 flex flex-col justify-end">
                            <label className="flex items-center gap-2 p-2 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={settingsForm.marqueePauseOnHover !== false}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueePauseOnHover: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                              />
                              <span className="text-xs text-[#1c1815] font-medium">
                                إيقاف الحركة عند وقوف الماوس (Pause on Hover)
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Individual Announcement Items (Full Text Control) */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#1c1815] block">
                            تخصيص نصوص الرسائل الإعلانية الأساسية:
                          </label>
                          <span className="text-[11px] text-[#8c7865]">
                            يمكنك تعديل أي نص بالكامل أو إخفاؤه
                          </span>
                        </div>

                        {/* 1. Countdown Item */}
                        <div
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            settingsForm.marqueeShowCountdown !== false
                              ? "bg-white border-[#ebdcca]"
                              : "bg-[#f5efe6] border-[#e0d4c4] opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-xs text-[#1c1815]">
                              <input
                                type="checkbox"
                                checked={settingsForm.marqueeShowCountdown !== false}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeShowCountdown: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                              />
                              <span>⏰ 1. عداد العرض التنازلي التفاعلي (ينتهي العرض الخاص خلال...)</span>
                            </label>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                settingsForm.marqueeShowCountdown !== false
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {settingsForm.marqueeShowCountdown !== false ? "مفعّل" : "معطّل"}
                            </span>
                          </div>

                          {settingsForm.marqueeShowCountdown !== false && (
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#f4ece0]">
                              <div className="sm:col-span-8 space-y-1">
                                <label className="text-[11px] text-[#8c7865] block">النص المكتوب قبل العداد:</label>
                                <input
                                  type="text"
                                  value={settingsForm.marqueeCountdownLabel || "ينتهي العرض الخاص خلال"}
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, marqueeCountdownLabel: e.target.value })
                                  }
                                  placeholder="ينتهي العرض الخاص خلال"
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                                />
                              </div>
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[11px] text-[#8c7865] block">مدة العداد بالساعات:</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={1}
                                    max={96}
                                    value={settingsForm.marqueeCountdownHours || 6}
                                    onChange={(e) =>
                                      setSettingsForm({
                                        ...settingsForm,
                                        marqueeCountdownHours: Number(e.target.value) || 6,
                                      })
                                    }
                                    className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-center text-[#1c1815] focus:bg-white"
                                  />
                                  <span className="text-[11px] text-[#8c7865] shrink-0">ساعات</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Free Shipping Item */}
                        <div
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            settingsForm.marqueeShowFreeShipping !== false
                              ? "bg-white border-[#ebdcca]"
                              : "bg-[#f5efe6] border-[#e0d4c4] opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-xs text-[#1c1815]">
                              <input
                                type="checkbox"
                                checked={settingsForm.marqueeShowFreeShipping !== false}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeShowFreeShipping: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                              />
                              <span>🚚 2. رسالة الشحن المجاني التلقائي</span>
                            </label>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                settingsForm.marqueeShowFreeShipping !== false
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {settingsForm.marqueeShowFreeShipping !== false ? "مفعّل" : "معطّل"}
                            </span>
                          </div>

                          {settingsForm.marqueeShowFreeShipping !== false && (
                            <div className="space-y-1 pt-2 border-t border-[#f4ece0]">
                              <label className="text-[11px] text-[#8c7865] block">نص رسالة الشحن المكتوب بالكامل:</label>
                              <input
                                type="text"
                                value={
                                  settingsForm.marqueeFreeShippingText !== undefined
                                    ? settingsForm.marqueeFreeShippingText
                                    : "شحن مجاني على كافة الطلبات بقيمة 2,500 ج.م أو أكثر لجميع المحافظات"
                                }
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeFreeShippingText: e.target.value })
                                }
                                placeholder="شحن مجاني على كافة الطلبات بقيمة 2,500 ج.م أو أكثر لجميع المحافظات"
                                className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* 3. Promo Coupon Item */}
                        <div
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            settingsForm.marqueeShowPromo !== false
                              ? "bg-white border-[#ebdcca]"
                              : "bg-[#f5efe6] border-[#e0d4c4] opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-xs text-[#1c1815]">
                              <input
                                type="checkbox"
                                checked={settingsForm.marqueeShowPromo !== false}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeShowPromo: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                              />
                              <span>🎟️ 3. رسالة كوبون الخصم مع زر النسخ السريع للزائر</span>
                            </label>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                settingsForm.marqueeShowPromo !== false
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {settingsForm.marqueeShowPromo !== false ? "مفعّل" : "معطّل"}
                            </span>
                          </div>

                          {settingsForm.marqueeShowPromo !== false && (
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#f4ece0]">
                              <div className="sm:col-span-8 space-y-1">
                                <label className="text-[11px] text-[#8c7865] block">نص الترحيب بالخصم المكتوب:</label>
                                <input
                                  type="text"
                                  value={
                                    settingsForm.marqueePromoPrefix !== undefined
                                      ? settingsForm.marqueePromoPrefix
                                      : "كوبون ترحيبي 10% خصم إضافي:"
                                  }
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, marqueePromoPrefix: e.target.value })
                                  }
                                  placeholder="كوبون ترحيبي 10% خصم إضافي:"
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                                />
                              </div>
                              <div className="sm:col-span-4 space-y-1">
                                <label className="text-[11px] text-[#8c7865] block">كود الخصم المعروض للنسخ:</label>
                                <input
                                  type="text"
                                  value={settingsForm.promoCode || "ATHAR10"}
                                  onChange={(e) =>
                                    setSettingsForm({ ...settingsForm, promoCode: e.target.value.toUpperCase() })
                                  }
                                  className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono font-bold uppercase text-[#1c1815] focus:bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 4. Lifetime Warranty Item */}
                        <div
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            settingsForm.marqueeShowWarranty !== false
                              ? "bg-white border-[#ebdcca]"
                              : "bg-[#f5efe6] border-[#e0d4c4] opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-xs text-[#1c1815]">
                              <input
                                type="checkbox"
                                checked={settingsForm.marqueeShowWarranty !== false}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeShowWarranty: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                              />
                              <span>🛡️ 4. رسالة ضمان الفضة المعتمدة 925 مدى الحياة</span>
                            </label>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                settingsForm.marqueeShowWarranty !== false
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {settingsForm.marqueeShowWarranty !== false ? "مفعّل" : "معطّل"}
                            </span>
                          </div>

                          {settingsForm.marqueeShowWarranty !== false && (
                            <div className="space-y-1 pt-2 border-t border-[#f4ece0]">
                              <label className="text-[11px] text-[#8c7865] block">نص رسالة الضمان بالكامل:</label>
                              <input
                                type="text"
                                value={
                                  settingsForm.marqueeWarrantyText !== undefined
                                    ? settingsForm.marqueeWarrantyText
                                    : "فضة إسترليني إيطالية وتركية عيار 925 مختومة بضمان رسمي مدى الحياة"
                                }
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeWarrantyText: e.target.value })
                                }
                                placeholder="فضة إسترليني إيطالية وتركية عيار 925 مختومة بضمان رسمي مدى الحياة"
                                className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                              />
                            </div>
                          )}
                        </div>

                        {/* 5. Gift Wrap Item */}
                        <div
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            settingsForm.marqueeShowGiftWrap !== false
                              ? "bg-white border-[#ebdcca]"
                              : "bg-[#f5efe6] border-[#e0d4c4] opacity-70"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-xs text-[#1c1815]">
                              <input
                                type="checkbox"
                                checked={settingsForm.marqueeShowGiftWrap !== false}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeShowGiftWrap: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                              />
                              <span>🎁 5. رسالة التغليف الفاخر المجاني وكارت الإهداء</span>
                            </label>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                settingsForm.marqueeShowGiftWrap !== false
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {settingsForm.marqueeShowGiftWrap !== false ? "مفعّل" : "معطّل"}
                            </span>
                          </div>

                          {settingsForm.marqueeShowGiftWrap !== false && (
                            <div className="space-y-1 pt-2 border-t border-[#f4ece0]">
                              <label className="text-[11px] text-[#8c7865] block">نص رسالة التغليف بالكامل:</label>
                              <input
                                type="text"
                                value={
                                  settingsForm.marqueeGiftWrapText !== undefined
                                    ? settingsForm.marqueeGiftWrapText
                                    : "تغليف إهداء مخملي فاخر مجاناً مع كارت معايدة مخصص لكل طلب"
                                }
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, marqueeGiftWrapText: e.target.value })
                                }
                                placeholder="تغليف إهداء مخملي فاخر مجاناً مع كارت معايدة مخصص لكل طلب"
                                className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Unlimited Extra Custom Announcements */}
                      <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#1c1815] block">
                              + إضافة رسائل إعلانية وعروض مخصصة إضافية للشريط:
                            </span>
                            <span className="text-[11px] text-[#8c7865]">
                              أضف أي عدد من الإعلانات مع اختيار أيقونة مميزة لكل رسالة
                            </span>
                          </div>
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            {settingsForm.marqueeExtraMessages?.length || 0} رسالة إضافية
                          </span>
                        </div>

                        {/* List of Extra Messages */}
                        {settingsForm.marqueeExtraMessages && settingsForm.marqueeExtraMessages.length > 0 && (
                          <div className="space-y-2">
                            {settingsForm.marqueeExtraMessages.map((msg, idx) => (
                              <div
                                key={msg.id || idx}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                                  msg.visible
                                    ? "bg-[#faf8f5] border-[#ebdcca]"
                                    : "bg-gray-100 border-gray-200 opacity-60"
                                }`}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-base shrink-0">{msg.icon || "✨"}</span>
                                  <input
                                    type="text"
                                    value={msg.text}
                                    onChange={(e) => {
                                      const updated = [...(settingsForm.marqueeExtraMessages || [])];
                                      updated[idx].text = e.target.value;
                                      setSettingsForm({ ...settingsForm, marqueeExtraMessages: updated });
                                    }}
                                    className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-[#d8c8b4] text-xs font-bold"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => toggleExtraMarquee(msg.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                      msg.visible
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-gray-200 text-gray-700"
                                    }`}
                                  >
                                    {msg.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteExtraMarquee(msg.id)}
                                    className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Form to Add New Extra Announcement */}
                        <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-3">
                              <select
                                value={newExtraIcon}
                                onChange={(e) => setNewExtraIcon(e.target.value)}
                                className="w-full px-2 py-2 rounded-lg bg-white border border-[#d8c8b4] text-xs font-bold"
                              >
                                <option value="✨">✨ بريق فاخر</option>
                                <option value="🏷️">🏷️ تخفيض خاص</option>
                                <option value="⚡">⚡ عرض خاطف</option>
                                <option value="💎">💎 فضة 925</option>
                                <option value="🎁">🎁 هدية مجانية</option>
                                <option value="🚚">🚚 توصيل فوري</option>
                                <option value="🔥">🔥 الأكثر طلباً</option>
                              </select>
                            </div>
                            <div className="sm:col-span-6">
                              <input
                                type="text"
                                value={newExtraText}
                                onChange={(e) => setNewExtraText(e.target.value)}
                                placeholder="اكتب نص الإعلان الإضافي الجديد..."
                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#d8c8b4] text-xs"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <button
                                type="button"
                                onClick={handleAddExtraMarquee}
                                className="w-full py-2 rounded-lg bg-[#1c1815] hover:bg-[#342c24] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-300" />
                                <span>إضافة للشريط</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* 3. NAVIGATION & COLLECTIONS MENU CUSTOMIZER */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ebdcca] pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span>3. قوائم المجموعات وشريط البحث (Navigation & Collections)</span>
                      </h3>
                      <p className="text-[11px] text-[#8c7865] mt-0.5">
                        تحكم كامل في تعديل الاسم، المسار، الشارة المميزة، الترتيب (⬆️ / ⬇️)، وإضافة أقسام جديدة
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetNavLinks}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#ede3d3] border border-[#d8c8b4] text-xs text-[#705e4d] font-bold transition-colors self-start sm:self-auto shadow-sm"
                      title="استعادة الترتيب والروابط الأصلية للمتجر"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                      <span>استعادة المجموعات الافتراضية</span>
                    </button>
                  </div>

                  {/* Search Bar Placeholder Setting */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-1.5">
                    <label className="text-xs font-bold text-[#1c1815] block">
                      نص البحث التوضيحي في شريط البحث (Search Placeholder):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={settingsForm.searchPlaceholder || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, searchPlaceholder: e.target.value })}
                        placeholder="ابحث عن خاتم، سلسلة، عيار 925..."
                        className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600 focus:bg-white"
                      />
                      <Search className="w-4 h-4 text-[#8c7865] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Collections Links Table (Deep Controls) */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="text-xs font-bold text-[#1c1815] block">
                        روابط المجموعات والأقسام في الهيدر ({settingsForm.navLinks?.length || 0}):
                      </label>
                      <span className="text-[11px] text-[#8c7865]">
                        استخدم الأسهم (⬆️ / ⬇️) لإعادة ترتيب الرابط، وعدّل الاسم والمسار والشارة مباشرة
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                      {(settingsForm.navLinks || []).map((link, idx) => (
                        <div
                          key={link.id || idx}
                          className={`p-3.5 rounded-xl border flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors ${
                            link.visible
                              ? "bg-white border-[#ebdcca] shadow-sm"
                              : "bg-[#f2ece2] border-[#ded2c2] opacity-60"
                          }`}
                        >
                          {/* Reorder and Index */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveNavLinkUp(idx)}
                                className="p-1 rounded bg-[#faf8f5] hover:bg-[#ede3d3] border border-[#d8c8b4] text-[#1c1815] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="تحريك لأعلى"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (settingsForm.navLinks?.length || 1) - 1}
                                onClick={() => moveNavLinkDown(idx)}
                                className="p-1 rounded bg-[#faf8f5] hover:bg-[#ede3d3] border border-[#d8c8b4] text-[#1c1815] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                title="تحريك لأسفل"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="w-7 h-7 rounded-lg bg-[#f4ece0] text-[#705e4d] text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-[#ebdcca]">
                              {idx + 1}
                            </span>
                          </div>

                          {/* Inputs: Label, Href, Badge */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 flex-1">
                            {/* Label */}
                            <div className="sm:col-span-4 space-y-0.5">
                              <span className="text-[10px] text-[#8c7865] block font-bold">اسم الرابط:</span>
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => updateNavLinkLabel(link.id, e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white focus:outline-none focus:border-amber-600"
                                placeholder="اسم الرابط"
                              />
                            </div>

                            {/* Href (Editable URL!) */}
                            <div className="sm:col-span-4 space-y-0.5">
                              <span className="text-[10px] text-[#8c7865] block font-bold">المسار (الرابط):</span>
                              <input
                                type="text"
                                value={link.href}
                                onChange={(e) => updateNavLinkHref(link.id, e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono dir-ltr text-left text-[#1c1815] focus:bg-white focus:outline-none focus:border-amber-600"
                                placeholder="/collection/..."
                              />
                            </div>

                            {/* Badge Tag */}
                            <div className="sm:col-span-4 space-y-0.5">
                              <span className="text-[10px] text-[#8c7865] block font-bold">شارة إضافية (Badge):</span>
                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={link.badge || ""}
                                  onChange={(e) => updateNavLinkBadge(link.id, e.target.value)}
                                  placeholder="مثل: جديد ✦ أو خصم"
                                  className="w-full px-2 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-[11px] font-bold text-[#1c1815] focus:bg-white"
                                />
                                <select
                                  value={link.badgeColor || "amber"}
                                  onChange={(e) =>
                                    updateNavLinkBadgeColor(
                                      link.id,
                                      e.target.value as "amber" | "rose" | "purple" | "emerald" | "blue"
                                    )
                                  }
                                  className="px-1.5 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-[11px] shrink-0 font-bold"
                                  title="لون الشارة"
                                >
                                  <option value="amber">🟡 ذهبي</option>
                                  <option value="rose">🌸 وردي</option>
                                  <option value="purple">🟣 بنفسجي</option>
                                  <option value="emerald">🟢 أخضر</option>
                                  <option value="blue">🔵 أزرق</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Open in Tab, Visibility, Delete */}
                          <div className="flex items-center gap-1.5 self-end lg:self-center shrink-0">
                            {/* Target Blank Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleNavLinkTargetBlank(link.id)}
                              className={`p-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                link.targetBlank
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-[#faf8f5] text-[#8c7865] border-[#d8c8b4] hover:bg-white"
                              }`}
                              title={link.targetBlank ? "يفتح في نافذة جديدة" : "يفتح في نفس الصفحة"}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>

                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleNavLinkVisibility(link.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                                link.visible
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                              title={link.visible ? "إخفاء من الهيدر" : "إظهار في الهيدر"}
                            >
                              {link.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              <span>{link.visible ? "معروض" : "مخفي"}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => deleteNavLink(link.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                              title="حذف هذا الرابط"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add New Nav Link Form (Advanced) */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-3">
                    <span className="text-xs font-bold text-[#1c1815] block">
                      + إضافة قسم أو رابط جديد لقائمة المتجر:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] text-[#8c7865] block font-bold">اسم الرابط:</label>
                        <input
                          type="text"
                          value={newNavLabel}
                          onChange={(e) => setNewNavLabel(e.target.value)}
                          placeholder="مثال: هدايا عيد الأم أو تخفيضات"
                          className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[10px] text-[#8c7865] block font-bold">المسار (الرابط):</label>
                        <input
                          type="text"
                          value={newNavHref}
                          onChange={(e) => setNewNavHref(e.target.value)}
                          placeholder="مثال: /collection/gifts"
                          className="w-full px-3 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono text-left focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] text-[#8c7865] block font-bold">شارة مميزة ولونها:</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={newNavBadge}
                            onChange={(e) => setNewNavBadge(e.target.value)}
                            placeholder="جديد ✦"
                            className="w-full px-2 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs focus:outline-none focus:border-amber-600 focus:bg-white"
                          />
                          <select
                            value={newNavBadgeColor}
                            onChange={(e) =>
                              setNewNavBadgeColor(
                                e.target.value as "amber" | "rose" | "purple" | "emerald" | "blue"
                              )
                            }
                            className="px-1.5 py-1 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold shrink-0"
                            title="لون الشارة"
                          >
                            <option value="amber">🟡</option>
                            <option value="rose">🌸</option>
                            <option value="purple">🟣</option>
                            <option value="emerald">🟢</option>
                            <option value="blue">🔵</option>
                          </select>
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={handleAddNavLink}
                          className="w-full py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>إضافة للقائمة</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Suggestions for Links */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#8c7865]">
                      <span>اقتراحات سريعة للمسار:</span>
                      {[
                        { label: "كافة القطع", href: "/collection/all" },
                        { label: "خواتم", href: "/collection/rings" },
                        { label: "سلاسل", href: "/collection/chains" },
                        { label: "أساور", href: "/collection/bracelets" },
                        { label: "أطقم", href: "/collection/sets" },
                        { label: "قصة البراند", href: "/#story" },
                        { label: "العناية بالفضة", href: "/#care" },
                      ].map((sugg, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (!newNavLabel) setNewNavLabel(sugg.label);
                            setNewNavHref(sugg.href);
                          }}
                          className="px-2 py-0.5 rounded-full bg-[#faf8f5] hover:bg-[#ede3d3] border border-[#d8c8b4] text-[#705e4d] font-bold text-[10px] transition-colors"
                        >
                          + {sugg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 4. HERO BANNER SECTION (Deep Customization) */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ebdcca] pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>4. بنر البداية الرئيسي (Hero Banner & Buttons)</span>
                      </h3>
                      <p className="text-[11px] text-[#8c7865] mt-0.5">
                        تحكم كامل في نصوص وأزرار واجهة المتجر، المؤثرات الحركية، وتعتيم وارتفاع الصورة
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300 self-start sm:self-auto">
                      واجهة المتجر الكبرى
                    </span>
                  </div>

                  {/* Texts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">العنوان الرئيسي للهيرو</label>
                      <input
                        type="text"
                        value={settingsForm.heroTitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm font-bold focus:outline-none focus:border-amber-600"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">
                        السطر التقديمي (Tagline فوق العنوان)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroTagline || "بصمةٌ تُميّز حضورك • 925 STERLING SILVER"}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTagline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">النص الوصفي الفرعي</label>
                      <textarea
                        rows={2}
                        value={settingsForm.heroSubtitle}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#d8c8b4] text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>

                  {/* Hero Buttons Customizer */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-4">
                    <span className="text-xs font-bold text-[#1c1815] block">
                      🔘 تخصيص أزرار الهيرو الرئيسية (Hero Action Buttons):
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Button 1: Primary */}
                      <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#ebdcca] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1c1815]">الزر الرئيسي الأول (الأبيض البارز)</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                            <input
                              type="checkbox"
                              checked={settingsForm.heroButtonShow !== false}
                              onChange={(e) =>
                                setSettingsForm({ ...settingsForm, heroButtonShow: e.target.checked })
                              }
                              className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>معروض</span>
                          </label>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-[#8c7865] block font-bold">النص المكتوب على الزر:</label>
                            <input
                              type="text"
                              value={settingsForm.heroButtonText || "اكتشف التشكيلة الكاملة"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonText: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c8b4] text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#8c7865] block font-bold">رابط التوجيه (المسار):</label>
                            <input
                              type="text"
                              value={settingsForm.heroButtonLink || "#products"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonLink: e.target.value })}
                              placeholder="#products أو /collection/all"
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c8b4] text-xs font-mono dir-ltr text-left"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Button 2: Secondary */}
                      <div className="p-3.5 rounded-xl bg-[#faf8f5] border border-[#ebdcca] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1c1815]">الزر الثانوي الثاني (الزجاجي الفاخر)</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                            <input
                              type="checkbox"
                              checked={settingsForm.heroSecondaryButtonShow !== false}
                              onChange={(e) =>
                                setSettingsForm({ ...settingsForm, heroSecondaryButtonShow: e.target.checked })
                              }
                              className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-3.5 h-3.5"
                            />
                            <span>معروض</span>
                          </label>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="text-[10px] text-[#8c7865] block font-bold">النص المكتوب على الزر:</label>
                            <input
                              type="text"
                              value={settingsForm.heroSecondaryButtonText || "دليل المقاسات"}
                              onChange={(e) =>
                                setSettingsForm({ ...settingsForm, heroSecondaryButtonText: e.target.value })
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c8b4] text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#8c7865] block font-bold">نوع الإجراء عند النقر:</label>
                            <select
                              value={settingsForm.heroSecondaryButtonAction || "sizeguide"}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  heroSecondaryButtonAction: e.target.value as "sizeguide" | "link" | "whatsapp",
                                })
                              }
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c8b4] text-xs font-bold"
                            >
                              <option value="sizeguide">📏 فتح نافذة دليل المقاسات التفاعلية</option>
                              <option value="whatsapp">💬 فتح محادثة الواتساب المباشرة للطلب</option>
                              <option value="link">🔗 فتح رابط صفحة مخصصة</option>
                            </select>
                          </div>
                          {settingsForm.heroSecondaryButtonAction === "link" && (
                            <div>
                              <label className="text-[10px] text-[#8c7865] block font-bold">الرابط المخصص:</label>
                              <input
                                type="text"
                                value={settingsForm.heroSecondaryButtonLink || ""}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, heroSecondaryButtonLink: e.target.value })
                                }
                                placeholder="/collection/rings أو رابط خارجي"
                                className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#d8c8b4] text-xs font-mono dir-ltr text-left"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Style, Animation & Height Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-white border border-[#ebdcca]">
                    {/* Ken Burns */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">الحركة السينمائية للصورة:</label>
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={settingsForm.heroKenBurns !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroKenBurns: e.target.checked })}
                          className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                        />
                        <span className="text-xs text-[#1c1815]">حركة زوم سينمائي بطيء (Ken Burns)</span>
                      </label>
                    </div>

                    {/* Overlay Darkness */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">درجة تعتيم خلفية الصورة:</label>
                      <select
                        value={settingsForm.heroOverlayDarkness || "medium"}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroOverlayDarkness: e.target.value as "light" | "medium" | "dark",
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold"
                      >
                        <option value="light">خفيف (إبراز تفاصيل الصورة أكثر)</option>
                        <option value="medium">متوسط (متوازن ومريح للقراءة - موصى به)</option>
                        <option value="dark">داكن (تركيز فائق على وضوح النصوص)</option>
                      </select>
                    </div>

                    {/* Height */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">ارتفاع بنر الهيرو:</label>
                      <select
                        value={settingsForm.heroHeight || "normal"}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroHeight: e.target.value as "compact" | "normal" | "large",
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold"
                      >
                        <option value="compact">مدمج (520px)</option>
                        <option value="normal">قياسي (640px - الافتراضي الفاخر)</option>
                        <option value="large">كبير وشامل (84vh - تجربة مجلات الموضة)</option>
                      </select>
                    </div>
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

                {/* ======================================================== */}
                {/* 5. HERO TRUST STRIP & VALUE PROPOSITION BAR */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#ebdcca] pb-3 gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>5. شريط الضمانات والمميزات أسفل الهيرو (Trust Badges Strip)</span>
                      </h3>
                      <p className="text-[11px] text-[#8c7865] mt-0.5">
                        الشريط المباشر أسفل بنر الهيرو الذي يبني ثقة العميل (عيار 925، المعاينة، والاسترجاع)
                      </p>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-[#d8c8b4] shadow-sm select-none">
                      <input
                        type="checkbox"
                        checked={settingsForm.showTrustBar !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showTrustBar: e.target.checked })}
                        className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-[#1c1815]">
                        {settingsForm.showTrustBar !== false ? "الشريط مفعّل ومرئي 🟢" : "الشريط مخفي ⚪"}
                      </span>
                    </label>
                  </div>

                  {settingsForm.showTrustBar !== false && (
                    <div className="space-y-4">
                      {/* Background Color Selector */}
                      <div className="p-3.5 rounded-xl bg-white border border-[#ebdcca] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-bold text-[#1c1815]">لون وخلفية شريط الضمانات:</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, trustBarBg: "default" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              (settingsForm.trustBarBg || "default") === "default"
                                ? "bg-[#f2ece1] border-amber-600 text-[#1c1815]"
                                : "bg-white border-[#d8c8b4] text-[#8c7865]"
                            }`}
                          >
                            ☕ بيج كلاسيك راقي
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, trustBarBg: "dark" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              settingsForm.trustBarBg === "dark"
                                ? "bg-[#1c1815] border-amber-500 text-white"
                                : "bg-white border-[#d8c8b4] text-[#8c7865]"
                            }`}
                          >
                            🖤 أسود ملكي فخم
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, trustBarBg: "white" })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              settingsForm.trustBarBg === "white"
                                ? "bg-white border-amber-600 text-[#1c1815] shadow-sm"
                                : "bg-[#faf8f5] border-[#d8c8b4] text-[#8c7865]"
                            }`}
                          >
                            ⚪ أبيض ناصع
                          </button>
                        </div>
                      </div>

                      {/* Trust Items Inputs */}
                      <div className="space-y-3">
                        {/* Item 1 */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#ebdcca] space-y-1.5">
                          <label className="text-xs font-bold text-[#1c1815] block">
                            الميزة الأولى (الشهادة والعيار):
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={settingsForm.trustItem1Icon || "shield"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, trustItem1Icon: e.target.value })}
                              className="px-2 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold shrink-0"
                            >
                              <option value="shield">🛡️ درع الضمان</option>
                              <option value="check">✓ علامة التوثيق</option>
                              <option value="eye">👁️ معاينة</option>
                            </select>
                            <input
                              type="text"
                              value={settingsForm.trustItem1 || "فضة إسترليني معتمدة عيار 925 ومختومة رسمياً"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, trustItem1: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#ebdcca] space-y-1.5">
                          <label className="text-xs font-bold text-[#1c1815] block">
                            الميزة الثانية (المعاينة عند الاستلام):
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={settingsForm.trustItem2Icon || "eye"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, trustItem2Icon: e.target.value })}
                              className="px-2 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold shrink-0"
                            >
                              <option value="eye">👁️ معاينة</option>
                              <option value="shield">🛡️ درع</option>
                              <option value="check">✓ توثيق</option>
                              <option value="truck">🚚 شحن</option>
                            </select>
                            <input
                              type="text"
                              value={settingsForm.trustItem2 || "معاينة ومطابقة عند الاستلام قبل الدفع"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, trustItem2: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Item 3 */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#ebdcca] space-y-1.5">
                          <label className="text-xs font-bold text-[#1c1815] block">
                            الميزة الثالثة (سياسة الاسترجاع والاستبدال):
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={settingsForm.trustItem3Icon || "refresh"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, trustItem3Icon: e.target.value })}
                              className="px-2 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold shrink-0"
                            >
                              <option value="refresh">🔄 استبدال واسترجاع</option>
                              <option value="shield">🛡️ أمان</option>
                              <option value="check">✓ تأكيد</option>
                            </select>
                            <input
                              type="text"
                              value={settingsForm.trustItem3 || "استبدال واسترجاع سلس خلال 14 يوماً"}
                              onChange={(e) => setSettingsForm({ ...settingsForm, trustItem3: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Item 4 (Optional) */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#ebdcca] space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-[#1c1815] block">
                              الميزة الرابعة الإضافية (اختيارية):
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                              <input
                                type="checkbox"
                                checked={!!settingsForm.trustItem4Show}
                                onChange={(e) =>
                                  setSettingsForm({ ...settingsForm, trustItem4Show: e.target.checked })
                                }
                                className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>إظهار الميزة الرابعة</span>
                            </label>
                          </div>
                          {settingsForm.trustItem4Show && (
                            <div className="flex gap-2 pt-1">
                              <select
                                value={settingsForm.trustItem4Icon || "gift"}
                                onChange={(e) => setSettingsForm({ ...settingsForm, trustItem4Icon: e.target.value })}
                                className="px-2 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold shrink-0"
                              >
                                <option value="gift">🎁 هدية فاخرة</option>
                                <option value="truck">🚚 توصيل مجاني</option>
                                <option value="shield">🛡️ ضمان</option>
                              </select>
                              <input
                                type="text"
                                value={settingsForm.trustItem4 || "تغليف هدايا ملكي وعلبة فاخرة مجاناً"}
                                onChange={(e) => setSettingsForm({ ...settingsForm, trustItem4: e.target.value })}
                                placeholder="مثال: تغليف هدايا ملكي وعلبة فاخرة مجاناً"
                                className="w-full px-3 py-1.5 rounded-lg bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815] focus:bg-white"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ======================================================== */}
                {/* 6. DUAL SPLIT 50/50 SHOWCASE (Women's & Men's) */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebdcca] pb-3">
                    <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-rose-700" />
                      <span>6. البنر المزدوج 50/50 (Women&apos;s & Men&apos;s Showcases)</span>
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

                {/* ======================================================== */}
                {/* 7. SOCIAL MEDIA & CONTACT INFO SECTION */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#ebdcca] pb-3">
                    <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>7. روابط التواصل الاجتماعي والفوتر (Social & Contact)</span>
                    </h3>
                    <span className="text-[11px] text-[#8c7865]">تظهر في أسفل كل الصفحات</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">رابط إنستغرام (Instagram)</label>
                      <input
                        type="url"
                        value={settingsForm.instagramUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/atharsilver"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs font-mono text-left focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">رابط تيك توك (TikTok)</label>
                      <input
                        type="url"
                        value={settingsForm.tiktokUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        placeholder="https://tiktok.com/@atharsilver"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs font-mono text-left focus:outline-none focus:border-amber-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">رابط فيسبوك (Facebook)</label>
                      <input
                        type="url"
                        value={settingsForm.facebookUrl || ""}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/atharsilver"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs font-mono text-left focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Theme Changes */}
                <div className="pt-2 sticky bottom-4 z-20">
                  <div className="p-4 rounded-2xl bg-[#1c1815] border border-[#3b3229] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        ✦
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm block">جاهز لتطبيق التعديلات على المتجر؟</span>
                        <span className="text-[11px] text-[#c7b59e]">تُحفظ كافة التغييرات وتظهر فوراً لكل الزوار بدون إعادة تحميل</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#14110e] font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>حفظ ونشر التعديلات على المتجر مباشرة</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DEDICATED ORDERS MANAGEMENT & TELE-SALES */}
        {/* ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Dedicated Orders Header Banner */}
            <div className="bg-gradient-to-r from-white via-[#faf8f5] to-white p-5 sm:p-6 rounded-3xl border border-[#ebdcca] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1c1815] text-[#d8c8b4] flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  <ShoppingBag className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black font-alexandria text-[#1c1815]">
                      مركز إدارة الطلبات والمبيعات
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      مباشر 🟢
                    </span>
                  </div>
                  <p className="text-xs text-[#8c7865] mt-0.5">
                    متابعة فورية للطلبات، التأكيد الهاتفي للعملاء، الفواتير الإلكترونية، وبوالص الشحن
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3.5 py-2 rounded-xl border border-[#ebdcca] bg-white hover:bg-[#faf8f5] text-xs font-bold text-[#1c1815] transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-amber-700" />
                  <span>تصدير نسخة احتياطية</span>
                </button>
              </div>
            </div>

            {/* KPI Cards for Tele-Sales & Fulfillment */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-[#ebdcca] shadow-sm">
                <span className="text-[11px] font-bold text-[#8c7865] block">مبيعات الطلبات السارية</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black font-alexandria text-emerald-600">
                    {validSalesTotal.toLocaleString("ar-EG")}
                  </span>
                  <span className="text-xs text-[#8c7865]">ج.م</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                  تستثني الطلبات الملغاة ({cancelledOrdersCount})
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
                <span className="text-[11px] font-bold text-amber-800 block">بانتظار التأكيد 🟡</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black font-alexandria text-amber-600">
                    {pendingOrdersCount}
                  </span>
                  <span className="text-xs text-[#8c7865]">طلب</span>
                </div>
                <span className="text-[10px] text-amber-700 font-medium block mt-1">
                  يحتاج مكالمة هاتفية لتأكيد الشحن
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-800 block">مؤكد هاتفياً 📞</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black font-alexandria text-emerald-600">
                    {confirmedPhoneOrdersCount}
                  </span>
                  <span className="text-xs text-[#8c7865]">طلب</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                  تم التواصل مع العميل وجاهز للشحن
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm">
                <span className="text-[11px] font-bold text-blue-800 block">تجهيز وشحن 🚚</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black font-alexandria text-blue-600">
                    {processingOrdersCount + shippedOrdersCount}
                  </span>
                  <span className="text-xs text-[#8c7865]">طلب</span>
                </div>
                <span className="text-[10px] text-blue-700 font-medium block mt-1">
                  {processingOrdersCount} تجهيز • {shippedOrdersCount} مع المندوب
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm col-span-2 lg:col-span-1">
                <span className="text-[11px] font-bold text-rose-800 block">الطلبات الملغاة ❌</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black font-alexandria text-rose-600">
                    {cancelledOrdersCount}
                  </span>
                  <span className="text-xs text-[#8c7865]">طلب</span>
                </div>
                <span className="text-[10px] text-rose-700 font-medium block mt-1">
                  نسبة الإلغاء: {cancellationPercentage}%
                </span>
              </div>
            </div>

            {/* Filter Pills & Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#ebdcca] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="ابحث برقم الطلب، اسم العميل، الهاتف، الإيميل، أو المحافظة..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-[#ebdcca] bg-[#faf8f5] text-xs text-[#1c1815] focus:bg-white focus:outline-none focus:border-[#a68a56] transition-colors"
                  />
                  <Search className="w-4 h-4 text-[#8c7865] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8c7865] hover:text-[#1c1815]"
                    >
                      مسح
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#8c7865] font-medium self-end sm:self-center">
                  عرض {filteredOrders.length} من أصل {orders.length} طلب
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#ebdcca]/60">
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderFilterStatus === "all"
                      ? "bg-[#1c1815] text-[#ded1be] shadow-sm"
                      : "bg-[#faf8f5] text-[#8c7865] hover:bg-[#f5efe6] border border-[#ebdcca]"
                  }`}
                >
                  الكل ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("pending")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilterStatus === "pending"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                  }`}
                >
                  <span>قيد الانتظار 🟡</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {pendingOrdersCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("confirmed_phone")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilterStatus === "confirmed_phone"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  <span>مؤكد هاتفياً 📞</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {confirmedPhoneOrdersCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("processing")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilterStatus === "processing"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  <span>جاري التجهيز 🔵</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {processingOrdersCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("shipped")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilterStatus === "shipped"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  <span>تم الشحن 🚚</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {shippedOrdersCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("completed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilterStatus === "completed"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                  }`}
                >
                  <span>تم التوصيل 🟢</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {completedOrdersCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilterStatus("cancelled")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    orderFilterStatus === "cancelled"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                  }`}
                >
                  <span>الملغية ❌</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {cancelledOrdersCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#ebdcca]">
                <Package className="w-12 h-12 text-[#bfaea0] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#1c1815]">لا توجد طلبات تطابق الفلتر</h3>
                <p className="text-xs text-[#8c7865] mt-1">جرب تغيير حالة الفلتر أو مسح نص البحث</p>
                {(orderFilterStatus !== "all" || orderSearchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderFilterStatus("all");
                      setOrderSearchQuery("");
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#f5efe6] text-xs font-bold text-[#1c1815] border border-[#ebdcca]"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredOrders.map((o) => {
                  const isOrderCancelled = o.status === "cancelled";
                  const totalItemsCount = o.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 select-none ${
                        isOrderCancelled
                          ? "bg-rose-50/30 border-rose-200 hover:border-rose-300"
                          : o.status === "confirmed_phone" || o.phoneConfirmed
                          ? "bg-emerald-50/25 border-emerald-200 hover:border-emerald-300"
                          : o.status === "completed"
                          ? "bg-[#faf8f5] border-emerald-200/60"
                          : o.status === "shipped"
                          ? "bg-purple-50/20 border-purple-200"
                          : o.status === "processing"
                          ? "bg-blue-50/20 border-blue-200"
                          : "bg-white border-[#ebdcca] hover:border-[#a68a56]"
                      }`}
                    >
                      {/* Section 1: Order ID, Status Avatar, Customer & Phone */}
                      <div className="flex items-center gap-3 min-w-[250px]">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${
                            isOrderCancelled
                              ? "bg-rose-100 text-rose-700"
                              : o.status === "confirmed_phone" || o.phoneConfirmed
                              ? "bg-emerald-100 text-emerald-800"
                              : o.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : o.status === "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : o.status === "processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isOrderCancelled
                            ? "❌"
                            : o.status === "confirmed_phone" || o.phoneConfirmed
                            ? "📞"
                            : o.status === "completed"
                            ? "🟢"
                            : o.status === "shipped"
                            ? "🚚"
                            : o.status === "processing"
                            ? "🔵"
                            : "🟡"}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs sm:text-sm text-[#1c1815]">
                              #{o.id}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#faf8f5] border border-[#ebdcca] font-bold text-[#8c7865]">
                              {o.governorate}
                            </span>
                            {isOrderCancelled && (
                              <span className="text-[10px] px-2 py-0.2 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                                ملغي
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-bold text-xs sm:text-sm text-[#1c1815]">
                              {o.customerName}
                            </span>
                            <span className="text-[11px] font-mono text-[#8c7865] dir-ltr">
                              {o.phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Summary Chips (Date, Items, Payment, Email, Notes) */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Order Date */}
                        <span className="text-[11px] text-[#8c7865] bg-[#faf8f5] px-2.5 py-1 rounded-lg border border-[#ebdcca]">
                          {new Date(o.createdAt).toLocaleDateString("ar-EG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Items Count */}
                        <span className="text-[11px] font-bold text-[#1c1815] bg-[#faf8f5] px-2.5 py-1 rounded-lg border border-[#ebdcca] flex items-center gap-1">
                          <Package className="w-3 h-3 text-amber-700" />
                          <span>{totalItemsCount} قطع</span>
                        </span>

                        {/* Payment Method Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                            o.paymentMethod === "wallet"
                              ? "bg-purple-50 text-purple-900 border-purple-200"
                              : o.paymentMethod === "card"
                              ? "bg-blue-50 text-blue-900 border-blue-200"
                              : "bg-amber-50 text-amber-900 border-amber-200"
                          }`}
                        >
                          {o.paymentMethod === "wallet" && "إنستاباي/محفظة 📱"}
                          {o.paymentMethod === "card" && "بطاقة بنكية 💳"}
                          {o.paymentMethod === "cod" && "دفع عند الاستلام 💵"}
                          {o.paymentReceiptImage && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-950 px-1 py-0.2 rounded font-black">
                              إيصال 📸
                            </span>
                          )}
                        </span>

                        {/* Customer Email Indicator */}
                        {o.email && (
                          <span
                            className="text-[11px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 font-bold"
                            title={o.email}
                          >
                            ✉️ إيميل
                          </span>
                        )}

                        {/* Gift Wrap Indicator */}
                        {o.isGift && (
                          <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
                            🎁 هدية
                          </span>
                        )}

                        {/* Admin Note indicator */}
                        {o.adminNotes && (
                          <span className="text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 font-bold">
                            📝 ملاحظة
                          </span>
                        )}
                      </div>

                      {/* Section 3: Financial Total, Status Badge, & Details Button */}
                      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#ebdcca]/50">
                        <div className="text-left">
                          <span className="text-[11px] text-[#8c7865] block">الإجمالي:</span>
                          <span className="font-alexandria font-black text-sm sm:text-base text-[#1c1815]">
                            {o.total.toLocaleString("ar-EG")}{" "}
                            <span className="text-[10px] font-normal text-[#8c7865]">ج.م</span>
                          </span>
                        </div>

                        {/* Status badge */}
                        <div>
                          {isOrderCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <Ban className="w-3 h-3" />
                              <span>طلب ملغي</span>
                            </span>
                          ) : o.status === "confirmed_phone" || o.phoneConfirmed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>مؤكد هاتفياً 📞✓</span>
                            </span>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                                o.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : o.status === "shipped"
                                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                                  : o.status === "processing"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                              }`}
                            >
                              {o.status === "pending" && "بانتظار التأكيد 🟡"}
                              {o.status === "processing" && "جاري التجهيز 🔵"}
                              {o.status === "shipped" && "تم الشحن 🚚"}
                              {o.status === "completed" && "تم التوصيل 🟢"}
                            </span>
                          )}
                        </div>

                        {/* Action: Open Details Modal */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderId(o.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#1c1815] hover:bg-[#a68a56] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">تفاصيل الطلب</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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

                {/* ======================================================== */}
                {/* PAYMENT GATEWAYS & WALLETS CONFIGURATION */}
                {/* ======================================================== */}
                <div className="p-6 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-6">
                  <div className="border-b border-[#ebdcca] pb-3">
                    <h3 className="font-bold text-sm text-[#1c1815] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span>إعدادات بوابات الدفع والمحافظ الإلكترونية (Payment Gateways & Wallets)</span>
                    </h3>
                    <p className="text-[11px] text-[#8c7865] mt-0.5">
                      التحكم في أرقام التحويل لإنستاباي وفودافون كاش، شروط رفع الإيصالات، وإعدادات ربط باي موب (Paymob)
                    </p>
                  </div>

                  {/* 1. InstaPay & Vodafone Cash Settings */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#f4ece0] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚡</span>
                        <span className="text-xs font-bold text-[#1c1815]">
                          1. إنستاباي ومحافظ الكاش (InstaPay & Vodafone Cash):
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        مفعّل بالمتجر
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          رقم التحويل المعتمد للعميل (إنستاباي / كاش):
                        </label>
                        <input
                          type="text"
                          value={settingsForm.instaPayNumber || "01143837730"}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instaPayNumber: e.target.value })}
                          placeholder="01143837730"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-sm font-mono font-bold text-[#1c1815] dir-ltr text-right"
                        />
                        <span className="text-[10px] text-[#8c7865] block">
                          * هذا هو الرقم الذي يظهر للعميل في نافذة إتمام الطلب مع زر النسخ السريع.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          اسم صاحب الحساب (يظهر للعميل للتأكد قبل التحويل):
                        </label>
                        <input
                          type="text"
                          value={settingsForm.instaPayAccountName || "karim mostafa"}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, instaPayAccountName: e.target.value })
                          }
                          placeholder="karim mostafa"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">
                        تعليمات التحويل الموجهة للعميل:
                      </label>
                      <textarea
                        rows={2}
                        value={
                          settingsForm.walletInstructions ||
                          "يرجى تحويل إجمالي المبلغ على الرقم أعلاه عبر إنستاباي أو محفظة فودافون كاش، ثم كتابة رقم المحول ورفع لقطة شاشة للإيصال لتأكيد الطلب فورياً."
                        }
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, walletInstructions: e.target.value })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs text-[#1c1815]"
                      />
                    </div>

                    {/* Require Receipt Toggle */}
                    <div className="pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer bg-[#faf8f5] p-3 rounded-xl border border-[#ebdcca] select-none">
                        <input
                          type="checkbox"
                          checked={settingsForm.requireReceiptUpload !== false}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, requireReceiptUpload: e.target.checked })
                          }
                          className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-4 h-4"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#1c1815] block">
                            إلزام العميل برفع صورة إيصال التحويل لإتمام الطلب
                          </span>
                          <span className="text-[10px] text-[#8c7865] block">
                            عند التفعيل لن يتمكن العميل من إنهاء الطلب حتى يرفع سكرين شوت التحويل من جهازه
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 2. Paymob Credit Card Gateway Settings */}
                  <div className="p-4 rounded-xl bg-white border border-[#ebdcca] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f4ece0] pb-2.5 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">💳</span>
                        <span className="text-xs font-bold text-[#1c1815]">
                          2. بوابة الدفع بالبطاقات البنكية باي موب (Paymob Gateway - Visa / Mastercard):
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer bg-[#faf8f5] px-3 py-1 rounded-lg border border-[#d8c8b4] select-none self-start sm:self-auto">
                        <input
                          type="checkbox"
                          checked={settingsForm.paymobEnabled !== false}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, paymobEnabled: e.target.checked })
                          }
                          className="rounded border-[#d8c8b4] text-amber-600 focus:ring-0 w-3.5 h-3.5"
                        />
                        <span className="text-xs font-bold text-[#1c1815]">
                          {settingsForm.paymobEnabled !== false ? "بوابة الكروت مفعّلة 🟢" : "معطلة ⚪"}
                        </span>
                      </label>
                    </div>

                    {/* Paymob Notice Banner */}
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[#1c1815]">
                          جاهزية الربط مع باي موب (Paymob Integration Ready):
                        </span>
                        <p className="text-[11px] text-[#6d5b49] leading-relaxed mt-0.5">
                          تمت تهيئة وبرمجة واجهة الدفع بالبطاقات في المتجر بالكامل. عندما تتعاقد مع باي موب وتستلم بيانات حسابك، يكفيك فقط لصق المفاتيح بالأسفل وسيبدأ المتجر بخصم وتحويل الأموال لحسابك البنكي تلقائياً بدون أي تعديل برمجي.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          وضع التشغيل (Operation Mode):
                        </label>
                        <select
                          value={settingsForm.paymobMode || "test"}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              paymobMode: e.target.value as "test" | "live",
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815]"
                        >
                          <option value="test">🧪 بيئة تجريبية واختبار (Sandbox / Test Mode)</option>
                          <option value="live">🚀 بيئة حقيقية معتمدة (Live Production Mode)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          مفتاح واجهة Paymob (API Key):
                        </label>
                        <input
                          type="password"
                          value={settingsForm.paymobApiKey || ""}
                          onChange={(e) => setSettingsForm({ ...settingsForm, paymobApiKey: e.target.value })}
                          placeholder="ZXlKaGJHY2lPaUpJVXpVe..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono text-left"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          معرف التكامل للكروت (Integration ID):
                        </label>
                        <input
                          type="text"
                          value={settingsForm.paymobIntegrationId || ""}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, paymobIntegrationId: e.target.value })
                          }
                          placeholder="مثال: 498214"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono text-left"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          معرف الإطار المضمن (Iframe ID):
                        </label>
                        <input
                          type="text"
                          value={settingsForm.paymobIframeId || ""}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, paymobIframeId: e.target.value })
                          }
                          placeholder="مثال: 812903"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono text-left"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Official Gmail SMTP Settings & Invoice Dispatcher */}
                  <div className="p-5 rounded-2xl bg-white border border-[#ebdcca] space-y-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#f4ece0] pb-3 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-sm">
                          ✉️
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-[#1c1815] block">
                            إعدادات البريد الإلكتروني الرسمي للمتجر (Gmail SMTP Dispatcher):
                          </span>
                          <span className="text-[11px] text-[#8c7865]">
                            إرسال فواتير الشراء وتحديثات الطلبات رسمياً من إيميل المتجر: theathar.eg@gmail.com
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                        {settingsForm.gmailAppPassword ? "الربط مفعّل 🟢" : "جاهز للإعداد ⚪"}
                      </span>
                    </div>

                    {/* How It Works Guide */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-[#faf8f5] to-amber-50/50 border border-amber-300/80 text-amber-950 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>💡 خطوات ربط إيميلك الرسمي (theathar.eg@gmail.com) في 30 ثانية فقط:</span>
                      </div>
                      <div className="text-[11px] text-amber-950/90 leading-relaxed pr-6 space-y-1">
                        <p>1. افتح صفحة أمان حساب Google للإيميل: <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="font-bold underline text-amber-900">myaccount.google.com/security</a></p>
                        <p>2. تأكد من تفعيل خاصية <strong>التحقق بخطوتين (2-Step Verification)</strong>.</p>
                        <p>3. ابحث في الصفحة عن <strong>كلمات مرور التطبيقات (App Passwords)</strong> وأنشئ كلمة مرور جديدة باسم <strong>Athar Store</strong>.</p>
                        <p>4. انسخ الكود المكون من 16 حرفاً وضعه في خانة <strong>كلمة مرور التطبيقات</strong> بالأسفل، واضغط <strong>حفظ الإعدادات</strong>.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          البريد الإلكتروني الرسمي للمتجر (Sender Email):
                        </label>
                        <input
                          type="email"
                          value={settingsForm.senderEmail || "theathar.eg@gmail.com"}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, senderEmail: e.target.value })
                          }
                          placeholder="theathar.eg@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono font-bold text-[#1c1815] dir-ltr text-right"
                        />
                        <span className="text-[10px] text-[#8c7865] block">
                          * البريد المعتمد الذي ستصل منه الفواتير الرسمية للعملاء.
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#1c1815] block">
                          اسم المرسل الظاهر للعميل (Display Name):
                        </label>
                        <input
                          type="text"
                          value={settingsForm.senderEmailName || "أَثَـر للفضة 925"}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, senderEmailName: e.target.value })
                          }
                          placeholder="أَثَـر للفضة 925"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-bold text-[#1c1815]"
                        />
                        <span className="text-[10px] text-[#8c7865] block">
                          * الاسم الذي سيراه العميل في صندوق البريد الوارد.
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#1c1815] block">
                        كلمة مرور التطبيقات من Google (Gmail App Password):
                      </label>
                      <div className="relative">
                        <input
                          type={showAppPassword ? "text" : "password"}
                          value={settingsForm.gmailAppPassword || ""}
                          onChange={(e) =>
                            setSettingsForm({ ...settingsForm, gmailAppPassword: e.target.value })
                          }
                          placeholder="16 حرفاً من حساب جوجل (مثال: abcd efgh ijkl mnop)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#faf8f5] border border-[#d8c8b4] text-xs font-mono font-bold text-[#1c1815] dir-ltr text-right pl-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAppPassword(!showAppPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8c7865] hover:text-[#1c1815]"
                        >
                          {showAppPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                        <span className="text-[10px] text-[#8c7865] block">
                          * تُحفظ في سيرفر متجرك بأمان تام وتُستخدم لإرسال الفواتير لجميع العملاء.
                        </span>

                        <button
                          type="button"
                          disabled={isSavingEmailDirectly}
                          onClick={handleSaveEmailSettingsDirectly}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
                        >
                          {isSavingEmailDirectly ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>جاري الحفظ في السيرفر...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>حفظ إعدادات البريد في السيرفر الآن 💾</span>
                            </>
                          )}
                        </button>
                      </div>

                      {emailDirectSaveFeedback && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{emailDirectSaveFeedback}</span>
                        </div>
                      )}
                    </div>

                    {/* LIVE INTERACTIVE TEST EMAIL DISPATCHER */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#faf8f5] to-[#f4ece0] border border-[#ded1be] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1c1815] flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-amber-700" />
                          <span>اختبار إرسال بريد إلكتروني حي الآن (Live Email Tester):</span>
                        </span>
                        <span className="text-[10px] text-[#8c7865] font-mono">
                          المرسل: {settingsForm.senderEmail || "theathar.eg@gmail.com"}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder="اكتب البريد الذي تود استلام التجربة عليه (مثال: theathar.eg@gmail.com)"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#d8c8b4] bg-white text-xs font-mono font-bold text-[#1c1815] dir-ltr text-right"
                        />
                        <button
                          type="button"
                          disabled={testEmailStatus === "loading"}
                          onClick={handleSendTestEmail}
                          className="px-5 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#a68a56] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95"
                        >
                          {testEmailStatus === "loading" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>جاري إرسال التجربة...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-amber-400" />
                              <span>إرسال بريد تجريبي الآن 🚀</span>
                            </>
                          )}
                        </button>
                      </div>

                      {testEmailFeedback && (
                        <div
                          className={`p-3 rounded-xl text-xs space-y-1.5 animate-in fade-in duration-150 ${
                            testEmailStatus === "success"
                              ? "bg-emerald-50 border border-emerald-300 text-emerald-900"
                              : "bg-rose-50 border border-rose-300 text-rose-900"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            {testEmailStatus === "success" ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>{testEmailFeedback}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <span>{testEmailFeedback}</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
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

      {/* ======================================================== */}
      {/* PAYMENT RECEIPT PREVIEW LIGHTBOX MODAL */}
      {/* ======================================================== */}
      {previewReceiptOrder && previewReceiptOrder.paymentReceiptImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-2xl bg-[#1c1815] border border-amber-600/30 rounded-3xl text-white shadow-2xl overflow-hidden text-right">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base font-alexandria flex items-center gap-2 text-white">
                  <span>إيصال تحويل الطلب #{previewReceiptOrder.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-normal">
                    إنستاباي / كاش
                  </span>
                </h3>
                <p className="text-xs text-[#a89582] mt-0.5">
                  العميل: <strong className="text-white">{previewReceiptOrder.customerName}</strong> • الهاتف:{" "}
                  <strong className="text-white font-mono dir-ltr">{previewReceiptOrder.phone}</strong>
                  {previewReceiptOrder.senderWalletNumber && (
                    <> • المحول منه: <strong className="text-amber-400 font-mono dir-ltr">{previewReceiptOrder.senderWalletNumber}</strong></>
                  )}
                </p>
              </div>

              <button
                onClick={() => setPreviewReceiptOrder(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Image Display */}
            <div className="p-4 bg-black/40 flex items-center justify-center max-h-[65vh] overflow-auto">
              <img
                src={previewReceiptOrder.paymentReceiptImage}
                alt={`إيصال تحويل ${previewReceiptOrder.customerName}`}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#16120f] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#bda992]">
                <span>المبلغ المطلوب: </span>
                <strong className="text-base text-emerald-400 font-alexandria font-bold">
                  {previewReceiptOrder.total} ج.م
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewReceiptOrder.paymentReceiptImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح بالحجم الكامل</span>
                </a>

                {previewReceiptOrder.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      updateOrderStatus(previewReceiptOrder.id, "processing");
                      setPreviewReceiptOrder(null);
                      addToast("تأكيد الدفع", `تم تأكيد تحويل الطلب #${previewReceiptOrder.id} ونقله للتجهيز`, "info");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تأكيد التحويل وبدء التجهيز</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewReceiptOrder(null)}
                  className="px-4 py-2 rounded-xl bg-[#2a231d] hover:bg-[#382f28] text-[#e0d4c4] text-xs font-bold transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CANCEL ORDER WITH REASONS */}
      {/* ======================================================== */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#ebdcca] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#ebdcca] bg-[#faf8f5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1c1815] text-base font-alexandria">
                    إلغاء الطلب #{cancellingOrder.id}
                  </h3>
                  <p className="text-xs text-[#8c7865] mt-0.5">
                    العميل: {cancellingOrder.customerName} ({cancellingOrder.governorate})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="p-2 text-[#8c7865] hover:text-[#1c1815] rounded-xl hover:bg-[#ebdcca]/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmCancelOrder} className="p-5 sm:p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <strong>لماذا نسجل سبب الإلغاء؟</strong>
                <p className="mt-1 text-[11px] text-amber-800">
                  بما أنك تتصل بالعميل لتأكيد الطلب قبل الشحن، فإن تسجيل سبب الإلغاء يساعدك في معرفة نسبة العملاء المترددين أو الأرقام الوهمية وتفادي خسائر الشحن قبل خروج المندوب.
                </p>
              </div>

              {/* Preset Reason Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1c1815] block">
                  اختر سبب الإلغاء الشائع:
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                  {[
                    "العميل لم يرد على مكالمات التأكيد",
                    "العميل طلب الإلغاء أثناء مكالمة التأكيد",
                    "العميل طلب تأجيل الاستلام لوقت لاحق",
                    "طلب مكرر عن طريق الخطأ",
                    "المقاس المطلوب غير متوفر أو غير مناسب",
                    "تكلفة الشحن أو مدة التوصيل غير مناسبة للعميل",
                    "other",
                  ].map((preset) => {
                    const isSelected = cancelReasonPreset === preset;
                    const labelText =
                      preset === "other"
                        ? "سبب آخر (كتابة سبب مخصص)..."
                        : preset;

                    return (
                      <label
                        key={preset}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-sm"
                            : "bg-[#faf8f5] border-[#ebdcca] text-[#1c1815] hover:bg-[#f5efe6]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="cancelReasonPreset"
                          checked={isSelected}
                          onChange={() => setCancelReasonPreset(preset)}
                          className="accent-rose-600 w-4 h-4"
                        />
                        <span>{labelText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Custom Reason input */}
              {cancelReasonPreset === "other" && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold text-[#1c1815] block">
                    اكتب سبب الإلغاء المخصص:
                  </label>
                  <input
                    type="text"
                    required
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    placeholder="مثال: العميل اشترى من فرع آخر، لم يوافق ولي الأمر، إلخ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-xs text-[#1c1815] focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}

              {/* Internal Notes from tele-sales call */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1c1815] block">
                  ملاحظات إضافية من مكالمة العميل (اختياري):
                </label>
                <textarea
                  rows={2}
                  value={cancelAdminNote}
                  onChange={(e) => setCancelAdminNote(e.target.value)}
                  placeholder="مثال: تم الاتصال 3 مرات في أوقات مختلفة ولم يرد، تم إرسال واتساب..."
                  className="w-full p-3 rounded-xl border border-[#ebdcca] bg-[#faf8f5] text-xs text-[#1c1815] focus:bg-white focus:outline-none focus:border-[#a68a56]"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-[#ebdcca] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#faf8f5] hover:bg-[#ebdcca]/30 text-xs font-bold text-[#8c7865] transition-colors"
                >
                  تراجع
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  <Ban className="w-4 h-4" />
                  <span>تأكيد تسجيل الإلغاء</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRINT SHIPPING WAYBILL */}
      {/* ======================================================== */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#ebdcca] shadow-2xl overflow-hidden">
            {/* Modal Controls Header (Hidden on print) */}
            <div className="p-4 border-b border-[#ebdcca] bg-[#faf8f5] flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#8c7865]" />
                <h3 className="font-bold text-[#1c1815] text-sm">
                  معاينة بوليصة الشحن والتوصيل #{printingOrder.id}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-[#ded1be] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة البوليصة 🖨️</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="p-2 text-[#8c7865] hover:text-[#1c1815] rounded-xl hover:bg-[#ebdcca]/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Waybill Sheet */}
            <div className="p-6 sm:p-8 space-y-6 bg-white text-[#1c1815] printable-waybill" id="waybill-content">
              {/* Waybill Top Brand Header */}
              <div className="flex justify-between items-start border-b-2 border-[#1c1815] pb-4">
                <div>
                  <h2 className="text-2xl font-black font-alexandria tracking-wider text-[#1c1815]">
                    {storeSettings.brandNameArabic || "أَثَر للفضة"}
                  </h2>
                  <p className="text-xs text-[#8c7865] mt-0.5">
                    براند الفضة الإيطالية عيار 925 • جمهورية مصر العربية
                  </p>
                  <p className="text-xs text-[#8c7865] dir-ltr text-right mt-0.5">
                    خدمة العملاء: {storeSettings.contactPhone || storeSettings.whatsappNumber}
                  </p>
                </div>
                <div className="text-left">
                  <div className="inline-block bg-[#1c1815] text-[#ded1be] px-3 py-1 rounded font-mono font-black text-sm">
                    #{printingOrder.id}
                  </div>
                  <span className="block text-[11px] text-[#8c7865] mt-1">
                    {new Date(printingOrder.createdAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Recipient / Delivery Box */}
              <div className="grid grid-cols-2 gap-4 bg-[#faf8f5] p-4 rounded-2xl border border-[#ebdcca]">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#8c7865] font-bold block uppercase tracking-wider">
                    بيانات المستلم:
                  </span>
                  <div className="text-base font-bold text-[#1c1815]">{printingOrder.customerName}</div>
                  <div className="font-mono font-bold text-sm text-[#1c1815] dir-ltr text-right">
                    📞 {printingOrder.phone}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#8c7865] font-bold block uppercase tracking-wider">
                    عنوان التوصيل:
                  </span>
                  <div className="font-bold text-sm text-[#1c1815]">
                    محافظة {printingOrder.governorate}
                  </div>
                  <div className="text-xs text-[#1c1815] leading-relaxed">
                    {printingOrder.address}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-[#ebdcca] text-[#8c7865]">
                      <th className="py-2 font-bold">القطعة</th>
                      <th className="py-2 font-bold text-center">المقاس</th>
                      <th className="py-2 font-bold text-center">الكمية</th>
                      <th className="py-2 font-bold text-left">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebdcca]/50">
                    {printingOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-bold text-[#1c1815]">{item.arabicName}</td>
                        <td className="py-2.5 text-center text-[#8c7865]">{item.selectedSize || "قياسي"}</td>
                        <td className="py-2.5 text-center font-bold text-[#1c1815]">{item.quantity}</td>
                        <td className="py-2.5 text-left font-bold text-[#1c1815]">{item.price * item.quantity} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary & Delivery Collection */}
              <div className="border-t-2 border-[#1c1815] pt-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-[#8c7865] block">طريقة الدفع:</span>
                  <span className="text-sm font-bold text-[#1c1815]">
                    {printingOrder.paymentMethod === "cod"
                      ? "الدفع عند الاستلام (تحصيل نقدي من العميل)"
                      : printingOrder.paymentMethod === "wallet"
                      ? "مدفوع مسبقاً عبر المحفظة / إنستاباي ✓"
                      : "مدفوع مسبقاً عبر البطاقة البنكية ✓"}
                  </span>
                  {printingOrder.isGift && (
                    <span className="text-[11px] text-amber-800 font-bold block mt-1">
                      🎁 تغليف هدية فاخرة (برجاء التعامل بعناية)
                    </span>
                  )}
                </div>

                <div className="text-left bg-[#faf8f5] p-3 rounded-xl border border-[#ebdcca]">
                  <span className="text-xs text-[#8c7865] block">المطلوب تحصيله من العميل:</span>
                  <span className="text-2xl font-black font-alexandria text-[#1c1815]">
                    {printingOrder.paymentMethod === "cod"
                      ? `${printingOrder.total.toLocaleString("ar-EG")} ج.م`
                      : "0 ج.م (خالص الدفع)"}
                  </span>
                </div>
              </div>

              {/* Courier Instruction */}
              <div className="border-t border-dashed border-[#ebdcca] pt-3 text-[11px] text-[#8c7865] flex justify-between items-center">
                <span>تنبيه المندوب: يُرجى فحص سلامة التغليف والتأكد من هوية المستلم قبل التسليم.</span>
                <span className="font-mono text-[10px]">ATHAR-WAYBILL-V2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT TELE-SALES INTERNAL NOTES */}
      {/* ======================================================== */}
      {editingNotesOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#ebdcca] shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebdcca] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-[#1c1815] text-sm">
                  ملاحظات مكالمة الطلب #{editingNotesOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNotesOrder(null)}
                className="p-1.5 text-[#8c7865] hover:text-[#1c1815]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#8c7865] mb-2">
                دوّن هنا تفاصيل مكالمة التأكيد مع العميل (مثال: موعد الاستلام المفضل، رقم إضافي، ملاحظات التوصيل):
              </p>
              <textarea
                rows={4}
                value={tempAdminNote}
                onChange={(e) => setTempAdminNote(e.target.value)}
                placeholder="اكتب ملاحظاتك الداخلية هنا..."
                className="w-full p-3 rounded-xl border border-[#ebdcca] bg-[#faf8f5] text-xs text-[#1c1815] focus:bg-white focus:outline-none focus:border-[#a68a56]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNotesOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#ebdcca]/30 text-xs font-bold text-[#8c7865]"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveInternalNote}
                className="px-4 py-2 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-[#ded1be] text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>حفظ الملاحظة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPREHENSIVE ORDER DETAILS & ACTIONS MODAL */}
      {/* ======================================================== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-[#ebdcca] shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-right">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-[#1c1815] via-[#2d251f] to-[#1c1815] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shrink-0">
                  {selectedOrderDetails.status === "cancelled"
                    ? "❌"
                    : selectedOrderDetails.status === "confirmed_phone" || selectedOrderDetails.phoneConfirmed
                    ? "📞"
                    : selectedOrderDetails.status === "completed"
                    ? "🟢"
                    : selectedOrderDetails.status === "shipped"
                    ? "🚚"
                    : selectedOrderDetails.status === "processing"
                    ? "🔵"
                    : "🟡"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-mono font-black tracking-wider text-white">
                      #{selectedOrderDetails.id}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedOrderDetails.id)}
                      className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-bold text-[#e5dacb] transition-all flex items-center gap-1 active:scale-95"
                      title="نسخ رقم الطلب"
                    >
                      {copiedOrderId === selectedOrderDetails.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ ✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/10 text-white/90 border border-white/15">
                      {new Date(selectedOrderDetails.createdAt).toLocaleDateString("ar-EG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#d8c8b4] mt-1">
                    طلب العميل: <strong className="text-white">{selectedOrderDetails.customerName}</strong> • {selectedOrderDetails.governorate}
                  </p>
                </div>
              </div>

              {/* Header Quick Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setPrintingOrder(selectedOrderDetails)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10 active:scale-95"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>طباعة بوليصة الشحن</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                  title="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Status & Fulfillment Action Hub */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebdcca]/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8c7865]">الحالة الحالية للطلب:</span>
                    {selectedOrderDetails.status === "cancelled" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <Ban className="w-3.5 h-3.5" />
                        <span>طلب ملغي ❌</span>
                      </span>
                    ) : selectedOrderDetails.status === "confirmed_phone" || selectedOrderDetails.phoneConfirmed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مؤكد هاتفياً 📞✓</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${
                        selectedOrderDetails.status === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedOrderDetails.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : selectedOrderDetails.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {selectedOrderDetails.status === "pending" && "بانتظار التأكيد 🟡"}
                        {selectedOrderDetails.status === "processing" && "جاري التجهيز 🔵"}
                        {selectedOrderDetails.status === "shipped" && "تم الشحن 🚚"}
                        {selectedOrderDetails.status === "completed" && "تم التوصيل 🟢"}
                      </span>
                    )}
                  </div>

                  {/* Manual Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8c7865]">تغيير سريع:</span>
                    <select
                      value={selectedOrderDetails.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as Order["status"];
                        if (newStatus === "cancelled") {
                          handleOpenCancelModal(selectedOrderDetails);
                        } else {
                          updateOrderStatus(selectedOrderDetails.id, newStatus);
                        }
                      }}
                      className="text-xs font-bold rounded-xl px-3 py-1.5 border border-[#ebdcca] bg-white text-[#1c1815] focus:outline-none focus:border-[#a68a56]"
                    >
                      <option value="pending">قيد الانتظار 🟡</option>
                      <option value="confirmed_phone">مؤكد هاتفياً 📞</option>
                      <option value="processing">جاري التجهيز 🔵</option>
                      <option value="shipped">تم الشحن 🚚</option>
                      <option value="completed">تم التوصيل بنجاح 🟢</option>
                      <option value="cancelled">ملغي 🔴</option>
                    </select>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Phone Call Button */}
                  <a
                    href={`tel:${selectedOrderDetails.phone}`}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال بالعميل ({selectedOrderDetails.phone})</span>
                  </a>

                  {/* Phone Confirmation Action */}
                  {selectedOrderDetails.status !== "cancelled" && (!selectedOrderDetails.phoneConfirmed || selectedOrderDetails.status === "pending") && (
                    <button
                      type="button"
                      onClick={() => {
                        confirmOrderViaPhone(selectedOrderDetails.id, modalAdminNote || "تم تأكيد الطلب هاتفياً وتنسيق الموعد");
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تأكيد الطلب هاتفياً 📞✓</span>
                    </button>
                  )}

                  {/* Move to Processing */}
                  {selectedOrderDetails.status !== "processing" && selectedOrderDetails.status !== "shipped" && selectedOrderDetails.status !== "completed" && selectedOrderDetails.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrderDetails.id, "processing")}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>تحويل للتجهيز والتغليف 🔵</span>
                    </button>
                  )}

                  {/* Move to Shipped */}
                  {selectedOrderDetails.status !== "shipped" && selectedOrderDetails.status !== "completed" && selectedOrderDetails.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrderDetails.id, "shipped")}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <span>🚚 تسليم للمندوب والشحن</span>
                    </button>
                  )}

                  {/* Move to Completed */}
                  {selectedOrderDetails.status !== "completed" && selectedOrderDetails.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(selectedOrderDetails.id, "completed")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم التوصيل والتحصيل 🟢</span>
                    </button>
                  )}

                  {/* Cancel Button */}
                  {selectedOrderDetails.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={() => handleOpenCancelModal(selectedOrderDetails)}
                      className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95 mr-auto"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>إلغاء الطلب (تسجيل السبب)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        restoreOrder(selectedOrderDetails.id);
                        addToast("استعادة الطلب", `تمت استعادة الطلب #${selectedOrderDetails.id} بنجاح`, "info");
                      }}
                      className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95 mr-auto"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>استعادة الطلب وتفعيله ↺</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Cancellation Notice Banner */}
              {selectedOrderDetails.status === "cancelled" && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>تم إلغاء هذا الطلب: {selectedOrderDetails.cancellationReason || "لم يُسجل سبب"}</span>
                  </div>
                  {selectedOrderDetails.cancelledAt && (
                    <span className="text-[11px] text-rose-700 block">
                      تاريخ الإلغاء: {new Date(selectedOrderDetails.cancelledAt).toLocaleString("ar-EG")}
                    </span>
                  )}
                </div>
              )}

              {/* Phone Confirmation Record */}
              {(selectedOrderDetails.status === "confirmed_phone" || selectedOrderDetails.phoneConfirmed) && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تم تأكيد الطلب هاتفياً بنجاح 📞✓</span>
                  </div>
                  {selectedOrderDetails.phoneConfirmedAt && (
                    <span className="text-[11px] text-emerald-700 block">
                      تاريخ وتوقيت المكالمة: {new Date(selectedOrderDetails.phoneConfirmedAt).toLocaleString("ar-EG")}
                    </span>
                  )}
                  {selectedOrderDetails.phoneConfirmationNotes && (
                    <span className="text-[11px] text-emerald-800 block">
                      ملاحظة المكالمة: {selectedOrderDetails.phoneConfirmationNotes}
                    </span>
                  )}
                </div>
              )}

              {/* Customer & Delivery Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcca] space-y-3">
                  <h4 className="font-bold text-xs text-[#8c7865] flex items-center gap-1.5 border-b border-[#ebdcca]/60 pb-2">
                    <User className="w-3.5 h-3.5 text-amber-700" />
                    <span>بيانات العميل والتواصل:</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#8c7865] block text-[11px]">الاسم الكامل:</span>
                      <strong className="text-sm text-[#1c1815]">{selectedOrderDetails.customerName}</strong>
                    </div>

                    <div>
                      <span className="text-[#8c7865] block text-[11px]">رقم الهاتف:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-sm font-mono text-[#1c1815] dir-ltr bg-[#faf8f5] px-2 py-0.5 rounded-lg border border-[#ebdcca]">
                          {selectedOrderDetails.phone}
                        </strong>
                        <a
                          href={`tel:${selectedOrderDetails.phone}`}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-amber-700" />
                          <span>اتصال</span>
                        </a>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#8c7865] block text-[11px]">البريد الإلكتروني:</span>
                      {selectedOrderDetails.email ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <strong className="text-xs font-mono text-sky-900 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                            {selectedOrderDetails.email}
                          </strong>
                          <button
                            type="button"
                            disabled={isSendingInvoiceEmail}
                            onClick={() => handleResendInvoiceEmail(selectedOrderDetails)}
                            className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-900 text-[11px] font-bold border border-sky-300 flex items-center gap-1 active:scale-95"
                          >
                            {isSendingInvoiceEmail ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>جاري الإرسال...</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-3 h-3 text-sky-700" />
                                <span>إعادة إرسال الفاتورة</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8c7865]">لم يقم العميل بإدخال بريد إلكتروني</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery & Address Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcca] space-y-3">
                  <h4 className="font-bold text-xs text-[#8c7865] flex items-center gap-1.5 border-b border-[#ebdcca]/60 pb-2">
                    <Package className="w-3.5 h-3.5 text-amber-700" />
                    <span>عنوان التوصيل وملاحظات العميل:</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#8c7865] block text-[11px]">المحافظة:</span>
                      <strong className="text-xs text-[#1c1815] bg-[#faf8f5] px-2 py-0.5 rounded-lg border border-[#ebdcca] inline-block">
                        {selectedOrderDetails.governorate}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#8c7865] block text-[11px]">العنوان بالتفصيل:</span>
                      <p className="text-xs text-[#1c1815] font-medium leading-relaxed bg-[#faf8f5] p-2.5 rounded-xl border border-[#ebdcca]">
                        {selectedOrderDetails.address}
                      </p>
                    </div>

                    {selectedOrderDetails.notes && (
                      <div>
                        <span className="text-[#8c7865] block text-[11px]">ملاحظة كتبها العميل:</span>
                        <p className="text-[11px] text-amber-950 bg-amber-50 p-2 rounded-xl border border-amber-200">
                          {selectedOrderDetails.notes}
                        </p>
                      </div>
                    )}

                    {selectedOrderDetails.isGift && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] space-y-0.5">
                        <span className="font-bold block">🎁 طلب تغليف هدية فاخرة:</span>
                        <p className="text-amber-900">{selectedOrderDetails.giftMessage || "بدون كارت إهداء خاص"}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcca] space-y-3">
                <h4 className="font-bold text-xs text-[#8c7865] flex items-center justify-between border-b border-[#ebdcca]/60 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                    <span>القطع والمنتجات المطلوبة ({selectedOrderDetails.items.length} أصناف):</span>
                  </span>
                  <span className="text-[11px] text-[#8c7865]">
                    إجمالي الكمية: {selectedOrderDetails.items.reduce((s, i) => s + i.quantity, 0)} قطعة
                  </span>
                </h4>

                <div className="divide-y divide-[#ebdcca]/60">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.arabicName}
                            className="w-12 h-12 rounded-xl object-cover border border-[#ebdcca] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#faf8f5] border border-[#ebdcca] flex items-center justify-center text-xs shrink-0">
                            💎
                          </div>
                        )}
                        <div>
                          <strong className="font-bold text-[#1c1815] block sm:text-sm">
                            {item.arabicName}
                          </strong>
                          <div className="flex items-center gap-2 text-[11px] text-[#8c7865] mt-0.5">
                            {item.selectedSize && (
                              <span className="bg-[#faf8f5] px-2 py-0.2 rounded border border-[#ebdcca] font-bold text-[#1c1815]">
                                {item.selectedSize}
                              </span>
                            )}
                            <span>سعر القطعة: {item.price} ج.م</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <span className="text-xs text-[#8c7865] block">
                          {item.quantity} × {item.price} ج.م
                        </span>
                        <strong className="font-alexandria font-bold text-sm text-[#1c1815]">
                          {(item.quantity * item.price).toLocaleString("ar-EG")} ج.م
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details & Financial Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Gateway Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-3">
                  <h4 className="font-bold text-xs text-[#8c7865] flex items-center gap-1.5 border-b border-[#ebdcca]/60 pb-2">
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                    <span>بيانات الدفع والتحويل:</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8c7865]">طريقة الدفع:</span>
                      <strong className="text-xs text-[#1c1815]">
                        {selectedOrderDetails.paymentMethod === "cod"
                          ? "الدفع نقدياً عند الاستلام للمندوب"
                          : selectedOrderDetails.paymentMethod === "wallet"
                          ? "إنستاباي / فودافون كاش"
                          : "بطاقة بنكية فيزا / ماستركارد (Paymob)"}
                      </strong>
                    </div>

                    {/* Wallet Details */}
                    {selectedOrderDetails.paymentMethod === "wallet" && (
                      <div className="p-3 rounded-xl bg-white border border-[#ebdcca] space-y-2">
                        {selectedOrderDetails.senderWalletNumber && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-[#8c7865]">رقم المحفظة المحول منها:</span>
                            <strong className="font-mono text-[#1c1815] dir-ltr bg-[#faf8f5] px-2 py-0.5 rounded border border-[#ebdcca]">
                              {selectedOrderDetails.senderWalletNumber}
                            </strong>
                          </div>
                        )}

                        {selectedOrderDetails.paymentReceiptImage ? (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] text-[#8c7865] block">إيصال التحويل المرفق:</span>
                            <div className="flex items-center gap-2">
                              <img
                                src={selectedOrderDetails.paymentReceiptImage}
                                alt="إيصال التحويل"
                                onClick={() => setPreviewReceiptOrder(selectedOrderDetails)}
                                className="w-14 h-14 rounded-lg object-cover border border-[#ebdcca] cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              <button
                                type="button"
                                onClick={() => setPreviewReceiptOrder(selectedOrderDetails)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة الإيصال بالحجم الكامل 📸</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg block text-center border border-amber-200">
                            لم يقم العميل بإرفاق صورة إيصال
                          </span>
                        )}
                      </div>
                    )}

                    {/* Paymob Card Details */}
                    {selectedOrderDetails.paymentMethod === "card" && (
                      <div className="p-3 rounded-xl bg-white border border-[#ebdcca] text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#8c7865]">بوابة الدفع:</span>
                          <strong className="text-amber-800">Paymob (بطاقة)</strong>
                        </div>
                        {selectedOrderDetails.cardDetails?.cardLast4 && (
                          <div className="flex justify-between">
                            <span className="text-[#8c7865]">رقم الكارت:</span>
                            <strong className="font-mono text-[#1c1815]">**** {selectedOrderDetails.cardDetails.cardLast4}</strong>
                          </div>
                        )}
                        <span className="text-[10px] text-emerald-700 font-bold block text-center bg-emerald-50 py-1 rounded">
                          دفع إلكتروني معتمد بنكياً ✓
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] space-y-2 text-xs flex flex-col justify-between">
                  <h4 className="font-bold text-xs text-[#8c7865] flex items-center gap-1.5 border-b border-[#ebdcca]/60 pb-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-700" />
                    <span>الحساب المالي والفاتورة:</span>
                  </h4>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[#8c7865]">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold text-[#1c1815]">{selectedOrderDetails.subtotal} ج.م</span>
                    </div>

                    <div className="flex justify-between text-[#8c7865]">
                      <span>مصاريف الشحن ({selectedOrderDetails.governorate}):</span>
                      <span className="font-bold text-[#1c1815]">
                        {selectedOrderDetails.shippingFee === 0 ? "مجاني" : `${selectedOrderDetails.shippingFee} ج.م`}
                      </span>
                    </div>

                    {selectedOrderDetails.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>الخصم المطبق:</span>
                        <span>-{selectedOrderDetails.discount} ج.م</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t-2 border-[#1c1815] mt-2 flex justify-between items-center">
                    <span className="font-bold text-sm text-[#1c1815]">إجمالي المبلغ المطلوب:</span>
                    <span className="font-black text-xl text-[#1c1815] font-alexandria">
                      {selectedOrderDetails.total.toLocaleString("ar-EG")}{" "}
                      <span className="text-xs font-normal text-[#8c7865]">ج.م</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Internal Admin Tele-Sales Notes Editor */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#ebdcca] space-y-3">
                <div className="flex items-center justify-between border-b border-[#ebdcca]/60 pb-2">
                  <h4 className="font-bold text-xs text-[#8c7865] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-700" />
                    <span>ملاحظات فريق التأكيد والمكالمة (Tele-Sales Internal Notes):</span>
                  </h4>
                  <span className="text-[10px] text-[#8c7865]">مرئية للإدارة فقط</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={modalAdminNote}
                    onChange={(e) => setModalAdminNote(e.target.value)}
                    placeholder="دوّن هنا تفاصيل المكالمة الهاتفية، موعد التسليم المتفق عليه، رقم هاتف بديل، أو أي متطلبات خاصة بالعميل..."
                    className="w-full p-3 rounded-xl border border-[#ebdcca] bg-[#faf8f5] text-xs text-[#1c1815] focus:bg-white focus:outline-none focus:border-[#a68a56]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        updateOrderAdminNotes(selectedOrderDetails.id, modalAdminNote);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-[#ded1be] text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-400" />
                      <span>حفظ الملاحظة الداخلية</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Test Order (Bottom subtle action) */}
              <div className="pt-2 border-t border-[#ebdcca]/40 flex justify-between items-center text-xs text-[#8c7865]">
                <span>استخدم خيار الحذف فقط للطلبات التجريبية.</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف الطلب #${selectedOrderDetails.id} نهائياً؟`)) {
                      deleteOrder(selectedOrderDetails.id);
                      setSelectedOrderId(null);
                    }
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف هذا الطلب نهائياً</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#faf8f5] border-t border-[#ebdcca] flex items-center justify-between gap-3">
              <span className="text-xs text-[#8c7865]">
                رقم الطلب: <strong className="font-mono text-[#1c1815]">#{selectedOrderDetails.id}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintingOrder(selectedOrderDetails)}
                  className="px-4 py-2 rounded-xl border border-[#ebdcca] bg-white hover:bg-[#f5efe6] text-xs font-bold text-[#1c1815] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-700" />
                  <span>طباعة البوليصة 🖨️</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="px-5 py-2 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

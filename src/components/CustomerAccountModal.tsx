"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AtharLogo } from "@/components/AtharLogo";
import { useStore, Order } from "@/context/StoreContext";
import {
  X,
  User,
  Truck,
  Phone,
  MapPin,
  Search,
  LogOut,
  AlertCircle
} from "lucide-react";

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerProfile {
  name: string;
  phone: string;
  email?: string;
  governorate?: string;
  address?: string;
  createdAt: string;
}

const EGYPT_GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "المنوفية",
  "الغربية", "الدقهلية", "كفر الشيخ", "البحيرة", "دمياط",
  "الشرقية", "الإسماعيلية", "بورسعيد", "السويس", "سيناء الشمالية",
  "سيناء الجنوبية", "الفيوم", "بني سويف", "المنيا", "أسيوط",
  "سوهاج", "قنا", "الأقصر", "أسوان", "البحر الأحمر", "مطروح", "الوادي الجديد"
];

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, addToast, storeSettings } = useStore();
  const [activeTab, setActiveTab] = useState<"track" | "account">("track");

  // Track Order State
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Customer Profile State
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [govInput, setGovInput] = useState("القاهرة");
  const [addressInput, setAddressInput] = useState("");

  // Load customer profile from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("athar_customer_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setNameInput(parsed.name || "");
        setPhoneInput(parsed.phone || "");
        setEmailInput(parsed.email || "");
        setGovInput(parsed.governorate || "القاهرة");
        setAddressInput(parsed.address || "");
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  // Orders matching customer's phone
  const customerOrders = useMemo(() => {
    const p = profile?.phone?.trim();
    if (!p) return [];
    const cleanP = p.replace(/\D/g, "");
    return orders.filter((o) => {
      const oPhone = (o.phone || "").replace(/\D/g, "");
      return oPhone && (oPhone.includes(cleanP) || cleanP.includes(oPhone));
    });
  }, [orders, profile?.phone]);

  if (!isOpen) return null;

  // Handle Order Lookup
  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackSearched(true);
    const cleanId = trackOrderId.trim().toUpperCase().replace(/^#/, "");
    const cleanPhone = trackPhone.trim().replace(/\D/g, "");

    if (!cleanId && !cleanPhone) {
      addToast("تنبيه", "يرجى كتابة رقم الطلب أو رقم الهاتف للبحث", "info");
      return;
    }

    const found = orders.find((o) => {
      const oId = (o.id || "").toUpperCase().replace(/^#/, "");
      const oPhone = (o.phone || "").replace(/\D/g, "");

      const idMatches = cleanId ? oId.includes(cleanId) : false;
      const phoneMatches = cleanPhone ? oPhone.includes(cleanPhone) : false;

      if (cleanId && cleanPhone) {
        return idMatches || phoneMatches;
      }
      return cleanId ? idMatches : phoneMatches;
    });

    setTrackedOrder(found || null);
  };

  // Save Customer Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) {
      addToast("تنبيه", "يرجى إدخال الاسم ورقم الهاتف على الأقل", "info");
      return;
    }

    const newProfile: CustomerProfile = {
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      email: emailInput.trim(),
      governorate: govInput,
      address: addressInput.trim(),
      createdAt: profile?.createdAt || new Date().toISOString(),
    };

    setProfile(newProfile);
    setIsEditingProfile(false);
    try {
      localStorage.setItem("athar_customer_profile", JSON.stringify(newProfile));
      addToast("تم حفظ الحساب", "تم حفظ بياناتك بنجاح لتسريع الطلبات القادمة", "info");
    } catch {
      // Ignore
    }
  };

  const handleLogoutCustomer = () => {
    setProfile(null);
    setIsEditingProfile(false);
    setNameInput("");
    setPhoneInput("");
    setEmailInput("");
    setGovInput("القاهرة");
    setAddressInput("");
    try {
      localStorage.removeItem("athar_customer_profile");
      addToast("تم تسجيل الخروج", "تم تسجيل الخروج من حسابك في هذا المتصفح", "info");
    } catch {}
  };

  // Helper for tracking stage indicator
  const getStageNumber = (status?: string) => {
    switch (status) {
      case "pending":
        return 1;
      case "confirmed_phone":
      case "confirmed_whatsapp":
      case "processing":
        return 2;
      case "shipped":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn font-cairo"
    >
      <div
        className="w-full max-w-lg bg-[#fbf9f5] rounded-3xl shadow-2xl border border-[#ded2c0] overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#161412] text-[#f7f4ee] px-6 py-5 relative flex items-center justify-between border-b border-[#2e2925]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10">
              <User className="w-5 h-5 text-[#c5a880]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <AtharLogo variant="dark" size="sm" />
                <span className="text-xs text-[#c5a880] font-bold">| حساب العميل</span>
              </div>
              <p className="text-[11px] text-[#baa996] mt-0.5">
                تتبع حالة مشترياتك وإدارة بيانات توصيلك الشخصية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#baa996] hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#ede3d3] border-b border-[#ded2c0]">
          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "track"
                ? "bg-white text-[#161412] shadow-sm"
                : "text-[#5c4f42] hover:text-[#161412]"
            }`}
          >
            <Truck className="w-4 h-4 text-[#c5a880]" />
            <span>تتبع طلبي</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === "account"
                ? "bg-white text-[#161412] shadow-sm"
                : "text-[#5c4f42] hover:text-[#161412]"
            }`}
          >
            <User className="w-4 h-4 text-[#c5a880]" />
            <span>{profile ? "بيانات حسابي" : "تسجيل الدخول"}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* TAB 1: TRACK ORDER */}
          {activeTab === "track" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-[#e8ded0] shadow-xs">
                <h3 className="text-xs font-bold text-[#161412] mb-1 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>ابحث عن حالة شحنتك فورياً</span>
                </h3>
                <p className="text-[11px] text-[#756555] mb-3">
                  اكتب رقم الطلب الموجود في رسالة التأكيد أو رقم الهاتف المسجل به الطلب
                </p>

                <form onSubmit={handleSearchOrder} className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                        رقم الطلب (Order ID)
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: #ATH-1000"
                        value={trackOrderId}
                        onChange={(e) => setTrackOrderId(e.target.value)}
                        className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                        أو رقم الهاتف المحمول
                      </label>
                      <input
                        type="tel"
                        placeholder="مثال: 01012345678"
                        value={trackPhone}
                        onChange={(e) => setTrackPhone(e.target.value)}
                        className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5 text-[#c5a880]" />
                    <span>تتبع حالة الطلب</span>
                  </button>
                </form>
              </div>

              {/* Order Result */}
              {trackSearched && (
                <div>
                  {trackedOrder ? (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#c5a880]/40 shadow-md space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-extrabold text-[#161412]">
                              {trackedOrder.id}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#c5a880]/15 text-[#8c6b3e] border border-[#c5a880]/30">
                              {trackedOrder.status === "completed"
                                ? "تم التوصيل بنجاح"
                                : trackedOrder.status === "shipped"
                                ? "مع شركة الشحن والتوصيل"
                                : trackedOrder.status === "cancelled"
                                ? "ملغي"
                                : "قيد التجهيز والإعداد"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8c7865] mt-0.5">
                            تاريخ الطلب: {trackedOrder.createdAt ? new Date(trackedOrder.createdAt).toLocaleDateString("ar-EG") : ""}
                          </p>
                        </div>

                        <div className="text-left font-mono font-bold text-sm text-[#161412]">
                          {trackedOrder.total.toLocaleString()} ج.م
                        </div>
                      </div>

                      {/* 4-Step Visual Progression Bar */}
                      {trackedOrder.status !== "cancelled" ? (
                        <div className="py-2">
                          <div className="relative flex items-center justify-between">
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#ede3d3] -translate-y-1/2 z-0" />
                            <div
                              className="absolute top-1/2 right-0 h-1 bg-[#161412] -translate-y-1/2 z-0 transition-all duration-500"
                              style={{
                                width: `${((getStageNumber(trackedOrder.status) - 1) / 3) * 100}%`,
                              }}
                            />

                            {[
                              { label: "تم الاستلام", step: 1 },
                              { label: "جاري التجهيز", step: 2 },
                              { label: "خرج للشحن", step: 3 },
                              { label: "تم التوصيل", step: 4 },
                            ].map((s) => {
                              const isCompleted = getStageNumber(trackedOrder.status) >= s.step;
                              const isCurrent = getStageNumber(trackedOrder.status) === s.step;
                              return (
                                <div
                                  key={s.step}
                                  className="relative z-10 flex flex-col items-center"
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                                      isCompleted
                                        ? "bg-[#161412] border-[#161412] text-white"
                                        : "bg-white border-[#ded2c0] text-[#8c7865]"
                                    } ${isCurrent ? "ring-2 ring-[#c5a880] scale-110" : ""}`}
                                  >
                                    {isCompleted ? "✓" : s.step}
                                  </div>
                                  <span
                                    className={`text-[9px] mt-1 whitespace-nowrap font-medium ${
                                      isCompleted ? "text-[#161412] font-bold" : "text-[#8c7865]"
                                    }`}
                                  >
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-bold">
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span>هذا الطلب ملغي. إذا كان لديك أي استفسار يرجى التواصل معنا.</span>
                        </div>
                      )}

                      {/* Items Ordered */}
                      <div className="border-t border-[#f0e8dc] pt-3 space-y-2">
                        <span className="text-[11px] font-bold text-[#5c4f42] block">
                          القطع المشمولة في الطلب ({trackedOrder.items.length}):
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {trackedOrder.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-[#fbf9f5] border border-[#ebdcca]"
                            >
                              <div className="flex items-center gap-2">
                                {it.image && (
                                  <img
                                    src={it.image}
                                    alt={it.arabicName}
                                    className="w-7 h-7 rounded-md object-cover border border-[#ded2c0]"
                                  />
                                )}
                                <div>
                                  <span className="font-bold text-[#161412] block">
                                    {it.arabicName}
                                  </span>
                                  {it.selectedSize && (
                                    <span className="text-[10px] text-[#8c7865]">
                                      المقاس: {it.selectedSize}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="font-mono text-[#5c4f42]">
                                {it.quantity} × {it.price} ج.م
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Address Details */}
                      <div className="border-t border-[#f0e8dc] pt-3 text-[11px] text-[#5c4f42] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
                          <span>
                            {trackedOrder.governorate} - {trackedOrder.address}
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp Help Button */}
                      <a
                        href={`https://wa.me/${(storeSettings.whatsappNumber || "201143837730").replace(/\D/g, "")}?text=${encodeURIComponent(
                          `مرحباً أَثَر، أود الاستفسار عن طلبي رقم ${trackedOrder.id}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>استفسار عبر واتساب بخصوص هذا الطلب</span>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-6 text-center border border-[#ded2c0] space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                      <h4 className="text-xs font-bold text-[#161412]">لم يتم العثور على طلب</h4>
                      <p className="text-[11px] text-[#8c7865]">
                        يرجى التأكد من كتابة رقم الطلب صحيحاً أو رقم الهاتف المسجل به الطلب
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CUSTOMER ACCOUNT & PROFILE */}
          {activeTab === "account" && (
            <div className="space-y-4">
              {profile && !isEditingProfile ? (
                /* Saved Profile View */
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ded2c0] shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#161412] text-[#c5a880] flex items-center justify-center font-bold text-sm">
                          {profile.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#161412]">
                            أهلاً بك، {profile.name} ✨
                          </h4>
                          <p className="text-[10px] text-[#8c7865]">{profile.phone}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="text-[11px] font-bold text-[#8c6b3e] hover:underline"
                      >
                        تعديل البيانات
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#5c4f42]">
                      <div className="p-2 rounded-lg bg-[#fbf9f5] border border-[#ede3d3]">
                        <span className="text-[10px] text-[#8c7865] block">المحافظة</span>
                        <span className="font-bold text-[#161412]">{profile.governorate || "—"}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#fbf9f5] border border-[#ede3d3]">
                        <span className="text-[10px] text-[#8c7865] block">البريد الإلكتروني</span>
                        <span className="font-bold text-[#161412]">{profile.email || "—"}</span>
                      </div>
                      <div className="sm:col-span-2 p-2 rounded-lg bg-[#fbf9f5] border border-[#ede3d3]">
                        <span className="text-[10px] text-[#8c7865] block">العنوان المسجل</span>
                        <span className="font-bold text-[#161412]">{profile.address || "—"}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogoutCustomer}
                      className="w-full py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors mt-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>تسجيل الخروج من الحساب</span>
                    </button>
                  </div>

                  {/* Customer Previous Orders History */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-[#161412] flex items-center justify-between">
                      <span>سجل طلباتك السابقة</span>
                      <span className="text-[10px] text-[#8c7865] font-normal">
                        ({customerOrders.length} طلب)
                      </span>
                    </h4>

                    {customerOrders.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {customerOrders.map((o) => (
                          <div
                            key={o.id}
                            className="p-3 rounded-xl bg-white border border-[#e8ded0] shadow-xs flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#161412]">
                                  {o.id}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#ede3d3] text-[#5c4f42]">
                                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString("ar-EG") : ""}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8c7865] block mt-0.5">
                                {o.items.length} قطع • {o.status}
                              </span>
                            </div>

                            <div className="text-left">
                              <span className="font-mono font-bold text-[#161412] block">
                                {o.total.toLocaleString()} ج.م
                              </span>
                              <button
                                onClick={() => {
                                  setTrackOrderId(o.id);
                                  setTrackPhone(o.phone);
                                  setActiveTab("track");
                                  setTrackedOrder(o);
                                  setTrackSearched(true);
                                }}
                                className="text-[10px] text-[#8c6b3e] font-bold hover:underline"
                              >
                                تتبع الشحنة ←
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-white border border-[#ded2c0] text-center text-[11px] text-[#8c7865]">
                        لا توجد طلبات سابقة مسجلة بهذا الرقم بعد.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Profile Registration / Edit Form */
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ded2c0] shadow-xs space-y-3"
                >
                  <div className="border-b border-[#f0e8dc] pb-2">
                    <h4 className="text-xs font-bold text-[#161412]">
                      {profile ? "تعديل بيانات الحساب" : "تسجيل الدخول / إنشاء حساب عميل"}
                    </h4>
                    <p className="text-[11px] text-[#8c7865]">
                      احفظ بياناتك لتسهيل الشراء وتتبع طلباتك بنقرة واحدة
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: محمد أحمد"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                        رقم الهاتف المحمول *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="01012345678"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                        البريد الإلكتروني (اختياري)
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                        المحافظة
                      </label>
                      <select
                        value={govInput}
                        onChange={(e) => setGovInput(e.target.value)}
                        className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      >
                        {EGYPT_GOVERNORATES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#5c4f42] mb-1">
                        العنوان التفصيلي
                      </label>
                      <input
                        type="text"
                        placeholder="المنطقة، الشارع، العمارة"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        className="w-full bg-[#fbf9f5] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] text-xs font-bold transition-all shadow-md active:scale-98"
                    >
                      {profile ? "تحديث البيانات" : "حفظ الحساب"}
                    </button>
                    {profile && isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="py-2.5 px-4 rounded-xl bg-[#ede3d3] text-[#5c4f42] text-xs font-bold hover:bg-[#ded2c0]"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

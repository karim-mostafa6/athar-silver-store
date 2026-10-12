"use client";

import React, { useState, useRef } from "react";
import { CartItem, GOVERNORATES } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import {
  X,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  Banknote,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Lock,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountAmount: number;
  appliedPromo: string;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  discountAmount,
  appliedPromo,
  onOrderSuccess,
}) => {
  const { addOrder, storeSettings } = useStore();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    whatsapp: "",
    governorate: "القاهرة",
    address: "",
    notes: "",
    isGift: false,
    giftMessage: "",
    paymentMethod: "cod" as "cod" | "wallet" | "card",
  });

  // Wallet / InstaPay State
  const [senderWalletNumber, setSenderWalletNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const receiptFileInputRef = useRef<HTMLInputElement>(null);

  // Paymob Card State
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardHolder: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const currentGov = GOVERNORATES.find((g) => g.name === formData.governorate) || GOVERNORATES[0];
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : currentGov.shipping;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setReceiptError("يرجى اختيار ملف صورة صالح (JPG / PNG / WEBP)");
      return;
    }
    setReceiptError("");
    setIsUploadingReceipt(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setReceiptImage(data.url);
          setIsUploadingReceipt(false);
          return;
        }
      }
      // Fallback: Read as base64 DataURL
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptImage(event.target?.result as string);
        setIsUploadingReceipt(false);
      };
      reader.readAsDataURL(file);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptImage(event.target?.result as string);
        setIsUploadingReceipt(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substring(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.length > 0 ? parts.join(" ") : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substring(0, 4);
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("يرجى ملء الاسم ورقم الهاتف والعنوان بالتفصيل");
      return;
    }

    if (formData.paymentMethod === "wallet") {
      if (!senderWalletNumber.trim()) {
        alert("يرجى كتابة رقم الهاتف أو حساب إنستاباي الذي قمت بالتحويل منه");
        return;
      }
      if (storeSettings.requireReceiptUpload !== false && !receiptImage) {
        alert("يرجى رفع صورة أو لقطة شاشة لإيصال التحويل لتأكيد الطلب");
        return;
      }
    }

    if (formData.paymentMethod === "card") {
      if (cardData.cardNumber.replace(/\s/g, "").length < 16) {
        alert("يرجى إدخال رقم بطاقة صحيح (16 رقماً)");
        return;
      }
      if (!cardData.cardExpiry || !cardData.cardCvc) {
        alert("يرجى إدخال تاريخ انتهاء البطاقة ورمز الأمان CVV");
        return;
      }
    }

    setIsSubmitting(true);
    const newOrderId = addOrder({
      customerName: formData.fullName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      governorate: formData.governorate,
      address: formData.address,
      notes: formData.notes,
      isGift: formData.isGift,
      giftMessage: formData.giftMessage,
      items: cartItems.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        arabicName: i.product.arabicName,
        quantity: i.quantity,
        price: i.product.price,
        selectedSize: i.selectedSize,
        image: i.product.images[0],
      })),
      subtotal,
      shippingFee,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod: formData.paymentMethod,
      senderWalletNumber: formData.paymentMethod === "wallet" ? senderWalletNumber : undefined,
      paymentReceiptImage: formData.paymentMethod === "wallet" ? receiptImage : undefined,
      cardDetails:
        formData.paymentMethod === "card"
          ? {
              cardHolder: cardData.cardHolder || formData.fullName,
              cardLast4: cardData.cardNumber.replace(/\s/g, "").slice(-4) || "4242",
              paymentStatus: "mock_success",
            }
          : undefined,
    });
    setOrderId(newOrderId);

    setTimeout(() => {
      setIsSubmitting(false);
      setOrderConfirmed(true);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 },
      });

      onOrderSuccess();
    }, 900);
  };

  const handleSendToWhatsApp = () => {
    const itemsSummary = cartItems
      .map(
        (i) =>
          `• ${i.product.arabicName} ${i.selectedSize ? `(مقاس ${i.selectedSize})` : ""} × ${i.quantity} = ${
            i.product.price * i.quantity
          } ج.م`
      )
      .join("\n");

    const message = `🌟 *طلب جديد من متجر أَثَر للفضة 925* 🌟
رقم الطلب: *${orderId}*

👤 الاسم: ${formData.fullName}
📞 الهاتف: ${formData.phone}
📍 المحافظة: ${formData.governorate}
🏠 العنوان: ${formData.address}
💳 طريقة الدفع: ${
      formData.paymentMethod === "cod"
        ? "الدفع عند الاستلام (معاينة قبل الدفع)"
        : formData.paymentMethod === "wallet"
        ? `تحويل إنستاباي / فودافون كاش (رقم المحول منه: ${senderWalletNumber})`
        : `بطاقة بنكية عبر Paymob (تنتهي بـ ${cardData.cardNumber.slice(-4) || "4242"})`
    }
${receiptImage ? `📸 تم إرفاق صورة إيصال التحويل مع الطلب في لوحة التحكم` : ""}

🛍️ *المنتجات المطلوبة:*
${itemsSummary}

المجموع الفرعي: ${subtotal} ج.م
الخصم (${appliedPromo || "لا يوجد"}): -${discountAmount} ج.م
الشحن: ${shippingFee === 0 ? "مجاني" : `${shippingFee} ج.م`}
💰 *الإجمالي النهائي: ${grandTotal} ج.م*

${formData.isGift ? `🎁 طلب تغليف كهدية: "${formData.giftMessage}"` : ""}
${formData.notes ? `📝 ملاحظات: ${formData.notes}` : ""}`;

    window.open(`https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#faf8f5] border border-[#d8c8b4] rounded-3xl p-6 sm:p-8 text-[#1c1815] shadow-2xl text-right">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-white border border-[#ded1be] text-[#736150] hover:text-[#1c1815] hover:bg-[#f6efe4] transition-all"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          /* Confirmation Success Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-500/40 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 tracking-wider">تم تأكيد الطلب بنجاح</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria">
                شكراً لاختيارك براند أَثَر!
              </h3>
              <p className="text-xs sm:text-sm text-[#5a4c3e] max-w-md mx-auto">
                رقم طلبك هو <strong className="text-[#1c1815] font-mono bg-white px-2.5 py-1 rounded-lg border border-[#ded1be] shadow-sm">{orderId}</strong>. سيتواصل معك فريق خدمة العملاء لتأكيد تفاصيل وموعد الشحن.
              </p>
            </div>

            {/* Quick Order Bill Summary Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#e5dacb] text-right max-w-md mx-auto space-y-2 text-xs shadow-sm">
              <div className="flex justify-between border-b border-[#eee4d6] pb-2">
                <span className="text-[#756453]">الاسم:</span>
                <span className="font-bold text-[#1c1815]">{formData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-[#eee4d6] pb-2">
                <span className="text-[#756453]">العنوان:</span>
                <span className="font-bold text-[#1c1815]">{formData.governorate} - {formData.address}</span>
              </div>
              <div className="flex justify-between border-b border-[#eee4d6] pb-2">
                <span className="text-[#756453]">الإجمالي للدفع:</span>
                <span className="font-black text-emerald-800 font-alexandria text-sm">{grandTotal} ج.م</span>
              </div>
              <div className="flex justify-between border-b border-[#eee4d6] pb-2">
                <span className="text-[#756453]">طريقة الدفع:</span>
                <span className="text-[#1c1815] font-bold">
                  {formData.paymentMethod === "cod"
                    ? "الدفع عند الاستلام (معاينة قبل الدفع)"
                    : formData.paymentMethod === "wallet"
                    ? "تحويل إنستاباي / فودافون كاش"
                    : "بطاقة بنكية (Paymob)"}
                </span>
              </div>
              {formData.paymentMethod === "wallet" && (
                <>
                  {senderWalletNumber && (
                    <div className="flex justify-between border-b border-[#eee4d6] pb-2">
                      <span className="text-[#756453]">رقم المحول منه:</span>
                      <span className="font-mono font-bold text-[#1c1815] dir-ltr">{senderWalletNumber}</span>
                    </div>
                  )}
                  {receiptImage && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#756453]">إيصال التحويل:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم إرفاق الإيصال بنجاح</span>
                      </span>
                    </div>
                  )}
                </>
              )}
              {formData.paymentMethod === "card" && (
                <div className="flex justify-between pt-1">
                  <span className="text-[#756453]">حالة البطاقة:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مؤمنة عبر شبكة Paymob</span>
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto pt-2">
              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال الفاتورة عبر واتساب لمتابعة الشحن</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-6 rounded-xl bg-white border border-[#ded1be] hover:bg-[#f6efe4] text-[#1c1815] font-bold text-xs transition-colors"
              >
                العودة للمتجر
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1c1815] font-alexandria">
                إتمام الطلب والمعاينة
              </h2>
              <p className="text-xs text-[#6e5d4c] mt-1">
                املأ بياناتك للشحن السريع. جميع القطع تأتي مع إمكانية الفحص والمعاينة قبل الدفع.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1c1815] mb-1">
                    الاسم بالكامل *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمود"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-[#ded1be] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-[#7d6953] shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1815] mb-1">
                    رقم الهاتف المحمول *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="مثال: 01012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-[#ded1be] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-[#7d6953] shadow-inner"
                  />
                </div>
              </div>

              {/* Governorate and WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1c1815] mb-1">
                    المحافظة (لحساب الشحن) *
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full bg-white border border-[#ded1be] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1815] focus:outline-none focus:border-[#7d6953] shadow-inner"
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov.name} value={gov.name}>
                        {gov.name} ({gov.shipping} ج.م)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1815] mb-1">
                    رقم واتساب للتواصل (اختياري)
                  </label>
                  <input
                    type="tel"
                    placeholder="إذا كان مختلفاً عن رقم الهاتف"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-white border border-[#ded1be] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-[#7d6953] shadow-inner"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-[#1c1815] mb-1">
                  العنوان بالتفصيل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="المدينة / المنطقة، اسم الشارع، رقم العمارة والشقة"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-white border border-[#ded1be] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-[#7d6953] shadow-inner"
                />
              </div>

              {/* Gift Wrap Option */}
              <div className="p-3.5 rounded-2xl bg-[#f5efe4] border border-[#e5dacb] space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1c1815] font-bold">
                  <input
                    type="checkbox"
                    checked={formData.isGift}
                    onChange={(e) => setFormData({ ...formData, isGift: e.target.checked })}
                    className="rounded border-[#d8c8b4] text-[#1c1815] focus:ring-0"
                  />
                  <span>هل هذا الطلب هدية لشخص مميز؟ (تغليف هدايا ملكي مجاني 🎁)</span>
                </label>
                {formData.isGift && (
                  <input
                    type="text"
                    placeholder="اكتب رسالة الإهداء لكتابتها على كارت الهدية الفاخر..."
                    value={formData.giftMessage}
                    onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value })}
                    className="w-full bg-white border border-[#ded1be] rounded-xl px-3 py-2 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none"
                  />
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-[#1c1815] mb-2">
                  طريقة الدفع المفضلة:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 active:scale-95 ${
                      formData.paymentMethod === "cod"
                        ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-md font-bold"
                        : "bg-white text-[#524436] border-[#ded1be] hover:border-[#b8a48c]"
                    }`}
                  >
                    <Banknote className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">الدفع عند الاستلام</div>
                      <div className="text-[10px] opacity-75">معاينة قبل الدفع</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "wallet" })}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 active:scale-95 ${
                      formData.paymentMethod === "wallet"
                        ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-md font-bold"
                        : "bg-white text-[#524436] border-[#ded1be] hover:border-[#b8a48c]"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">إنستاباي / فودافون كاش</div>
                      <div className="text-[10px] opacity-75">تحويل فوري مباشر</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 active:scale-95 ${
                      formData.paymentMethod === "card"
                        ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-md font-bold"
                        : "bg-white text-[#524436] border-[#ded1be] hover:border-[#b8a48c]"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">بطاقة بنكية</div>
                      <div className="text-[10px] opacity-75">فيزا / ماستركارد (Paymob)</div>
                    </div>
                  </button>
                </div>

                {/* ---------------------------------------------------- */}
                {/* 1. INSTAPAY & VODAFONE CASH INTERACTIVE PANEL */}
                {/* ---------------------------------------------------- */}
                {formData.paymentMethod === "wallet" && (
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#faf6ef] to-[#f4ebe0] border border-[#d8c8b4] space-y-4 shadow-sm animate-fadeIn text-right">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#e5dacb] pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          ⚡
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#1c1815]">
                            تحويل فوري عبر إنستاباي / فودافون كاش
                          </h4>
                          <span className="text-[10px] text-[#7d6953]">
                            تحويل فوري مباشر بدون أي رسوم إضافية
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-200">
                          InstaPay
                        </span>
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full border border-rose-200">
                          Vodafone Cash
                        </span>
                      </div>
                    </div>

                    {/* Transfer Number Box */}
                    <div className="p-4 rounded-xl bg-white border border-[#ded1be] space-y-2 shadow-inner">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#7d6953]">
                          رقم التحويل الرسمي المعتمد:
                        </span>
                        <span className="text-[11px] font-medium text-[#7d6953]">
                          الاسم: <strong className="text-[#1c1815]">{storeSettings.instaPayAccountName || "karim mostafa"}</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-[#faf8f5] p-2.5 rounded-xl border border-[#e5dacb] gap-2">
                        <span className="font-mono text-base sm:text-lg font-black text-[#1c1815] tracking-wider dir-ltr">
                          {storeSettings.instaPayNumber || "01143837730"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber(storeSettings.instaPayNumber || "01143837730")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-[#1c1815] text-white hover:bg-[#382f28]"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>تم النسخ ✓</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ الرقم</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-[#6d5b49] leading-relaxed pt-1">
                        {storeSettings.walletInstructions ||
                          "يرجى تحويل إجمالي المبلغ على الرقم أعلاه عبر تطبيق إنستاباي أو محفظة فودافون كاش، ثم كتابة رقم المحول ورفع صورة إيصال التحويل بالأسفل لتأكيد حجز القطعة فوراً."}
                      </p>
                    </div>

                    {/* Sender Info Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1c1815] mb-1">
                          رقم الهاتف أو حساب إنستاباي الذي قمت بالتحويل منه *
                        </label>
                        <input
                          type="text"
                          required={formData.paymentMethod === "wallet"}
                          placeholder="مثال: 011xxxxxxxx أو username@instapay"
                          value={senderWalletNumber}
                          onChange={(e) => setSenderWalletNumber(e.target.value)}
                          className="w-full bg-white border border-[#ded1be] rounded-xl px-3.5 py-2.5 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-amber-600 font-mono shadow-inner text-right"
                        />
                      </div>

                      {/* Receipt Upload Dropzone */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-[#1c1815]">
                            صورة إيصال التحويل (Receipt Screenshot)
                            {storeSettings.requireReceiptUpload !== false ? " *" : " (اختياري)"}
                          </label>
                          {receiptImage && (
                            <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>تم إرفاق الصورة</span>
                            </span>
                          )}
                        </div>

                        <input
                          type="file"
                          ref={receiptFileInputRef}
                          onChange={handleReceiptUpload}
                          accept="image/*"
                          className="hidden"
                        />

                        {receiptError && (
                          <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{receiptError}</span>
                          </div>
                        )}

                        {!receiptImage ? (
                          <div
                            onClick={() => receiptFileInputRef.current?.click()}
                            className="w-full p-4 rounded-xl border-2 border-dashed border-[#d8c8b4] bg-white hover:bg-[#faf8f5] hover:border-amber-600 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group"
                          >
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                              {isUploadingReceipt ? (
                                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Upload className="w-5 h-5" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-[#1c1815]">
                              {isUploadingReceipt ? "جاري معالجة ورفع الصورة..." : "اضغط لرفع لقطة شاشة / صورة الإيصال من جهازك"}
                            </span>
                            <span className="text-[10px] text-[#8c7865]">
                              (يدعم JPG، PNG، WEBP - ستصل الصورة للإدارة مع تفاصيل الطلب)
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-white border border-[#ded1be] flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#d8c8b4] shrink-0 bg-black/5">
                                <img
                                  src={receiptImage}
                                  alt="إيصال التحويل"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <span className="text-xs font-bold text-[#1c1815] block truncate">
                                  تم إرفاق إيصال التحويل بنجاح
                                </span>
                                <span className="text-[10px] text-emerald-700 font-medium">
                                  جاهز للإرسال وتأكيد الطلب
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => receiptFileInputRef.current?.click()}
                                className="px-2.5 py-1.5 rounded-lg bg-[#faf8f5] hover:bg-[#f2ece1] border border-[#d8c8b4] text-[11px] font-bold text-[#1c1815] transition-colors"
                              >
                                تغيير الصورة
                              </button>
                              <button
                                type="button"
                                onClick={() => setReceiptImage("")}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                title="حذف الصورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* 2. PAYMOB CARD GATEWAY INTERACTIVE PANEL */}
                {/* ---------------------------------------------------- */}
                {formData.paymentMethod === "card" && (
                  <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-[#1c1815] via-[#241e1a] to-[#1c1815] text-white border-2 border-amber-600/30 space-y-4 shadow-xl animate-fadeIn text-right">
                    {/* Header with Paymob & Card Badges */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-xs">✦ Paymob</span>
                          <span className="text-white/40 text-xs">|</span>
                          <h4 className="text-xs font-black text-white">
                            بوابة الدفع الإلكتروني بالبطاقات البنكية
                          </h4>
                        </div>
                        <span className="text-[10px] text-amber-200/70">
                          قبول بطاقات فيزا، ماستركارد، وبطاقات ميزة الوطنية
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                        <span>3D SECURE</span>
                      </div>
                    </div>

                    {/* Paymob Mock Card Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#dfd0be] mb-1">
                          اسم حامل البطاقة (كما هو مدون عليها)
                        </label>
                        <input
                          type="text"
                          placeholder={formData.fullName || "AHMED MAHMOUD"}
                          value={cardData.cardHolder}
                          onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 text-right uppercase tracking-wider"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#dfd0be] mb-1">
                          رقم البطاقة البنكية (16 رقماً)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            value={cardData.cardNumber}
                            onChange={(e) =>
                              setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })
                            }
                            maxLength={19}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono tracking-widest text-left dir-ltr"
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70">
                            <CreditCard className="w-4 h-4 text-amber-400" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-[#dfd0be] mb-1">
                            تاريخ الانتهاء (MM/YY)
                          </label>
                          <input
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            value={cardData.cardExpiry}
                            onChange={(e) =>
                              setCardData({ ...cardData, cardExpiry: formatExpiry(e.target.value) })
                            }
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#dfd0be] mb-1">
                            رمز الأمان (CVV خلف البطاقة)
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength={4}
                              value={cardData.cardCvc}
                              onChange={(e) => setCardData({ ...cardData, cardCvc: e.target.value.slice(0, 4) })}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono text-center"
                            />
                            <Lock className="w-3 h-3 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Paymob Security Notice */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5 text-[11px] text-amber-100/80">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">
                          🔒 دفع إلكتروني مشفر ومحمي بنكياً 100%
                        </span>
                        <span>
                          بوابة الدفع مهيأة بنظام Paymob المتوافق مع معايير البنك المركزي المصري. عند التعاقد مع باي موب سيتم خصم المبلغ وتأكيد العملية تلقائياً.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Final Summary */}
              <div className="p-4 rounded-2xl bg-[#f8f4ec] border border-[#e5dacb] space-y-2 text-xs">
                <div className="flex justify-between text-[#554638]">
                  <span>المجموع الفرعي ({cartItems.reduce((a, b) => a + b.quantity, 0)} قطع)</span>
                  <span className="font-bold font-alexandria text-[#1c1815]">{subtotal} ج.م</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>الخصم ({appliedPromo})</span>
                    <span>-{discountAmount} ج.م</span>
                  </div>
                )}
                <div className="flex justify-between text-[#554638]">
                  <span>مصاريف الشحن ({formData.governorate})</span>
                  <span>{shippingFee === 0 ? "مجاني" : `${shippingFee} ج.م`}</span>
                </div>
                <div className="flex justify-between text-base font-black text-[#1c1815] pt-2 border-t border-[#ded1be]">
                  <span>المبلغ الإجمالي للدفع</span>
                  <span className="text-xl font-alexandria text-[#1c1815]">{grandTotal} ج.م</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-[#1c1815] text-[#faf8f5] font-black text-sm shadow-xl shadow-[#1c1815]/15 hover:bg-[#2e2620] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري تأكيد الطلب...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#d8c8b4]" />
                    <span>تأكيد طلب الشراء الآن ({grandTotal} ج.م)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

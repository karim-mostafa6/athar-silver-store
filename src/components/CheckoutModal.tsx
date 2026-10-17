"use client";

import React, { useState, useRef, useEffect } from "react";
import { CartItem, GOVERNORATES } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import {
  X,
  CheckCircle2,
  CreditCard,
  Banknote,
  ShieldCheck,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Lock,
  Trash2,
  Loader2,
  Mail,
  PhoneCall,
  Package,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

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
  const { submitOrder, storeSettings, clearCart } = useStore();
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
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

  interface ConfirmedOrderDetails {
    orderId: string;
    items: Array<{
      name: string;
      arabicName: string;
      quantity: number;
      price: number;
      selectedSize?: string;
      image: string;
    }>;
    subtotal: number;
    shippingFee: number;
    discount: number;
    grandTotal: number;
    fullName: string;
    phone: string;
    email?: string;
    governorate: string;
    address: string;
    notes?: string;
    isGift?: boolean;
    giftMessage?: string;
    paymentMethod: "cod" | "wallet" | "card";
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isOrderIdCopied, setIsOrderIdCopied] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderDetails | null>(null);
  const [countdown, setCountdown] = useState(45);

  useEffect(() => {
    if (!orderConfirmed) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [orderConfirmed]);

  useBodyScrollLock(isOpen);
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !orderConfirmed) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, orderConfirmed, onClose]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const currentGov = GOVERNORATES.find((g) => g.name === formData.governorate) || GOVERNORATES[0];
  const configuredFee =
    storeSettings.governorateShippingRates?.[formData.governorate] ?? currentGov.shipping;
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : configuredFee;
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    setSubmitError("");

    const orderPayload = {
      customerName: formData.fullName,
      phone: formData.phone,
      email: formData.email.trim() || undefined,
      governorate: formData.governorate,
      address: formData.address,
      notes: formData.notes,
      isGift: formData.isGift,
      giftMessage: formData.giftMessage,
      promoCode: appliedPromo || undefined,
      honeypot: honeypot || undefined,
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
              paymentStatus: "mock_success" as const,
            }
          : undefined,
    };

    const result = await submitOrder(orderPayload);
    if (!result.success) {
      setIsSubmitting(false);
      setSubmitError(result.error || "حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مجدداً.");
      return;
    }

    const newOrderId = result.orderId;
    if (!newOrderId) {
      setIsSubmitting(false);
      setSubmitError("تعذر الحصول على رقم الطلب المعتمد من الخادم. يرجى المحاولة مجدداً.");
      return;
    }
    setOrderId(newOrderId);

    // Save persistent snapshot of the order before cart is cleared
    const orderSnapshot: ConfirmedOrderDetails = {
      orderId: newOrderId,
      items: cartItems.map((i) => ({
        name: i.product.name,
        arabicName: i.product.arabicName,
        quantity: i.quantity,
        price: i.product.price,
        selectedSize: i.selectedSize,
        image: i.product.images[0] || "",
      })),
      subtotal,
      shippingFee,
      discount: discountAmount,
      grandTotal,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email.trim() || undefined,
      governorate: formData.governorate,
      address: formData.address,
      notes: formData.notes,
      isGift: formData.isGift,
      giftMessage: formData.giftMessage,
      paymentMethod: formData.paymentMethod,
    };
    setConfirmedOrder(orderSnapshot);

    // If customer entered email, send order confirmation & invoice
    if (formData.email.trim() && formData.email.includes("@")) {
      fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: newOrderId,
          customerName: formData.fullName,
          email: formData.email.trim(),
          phone: formData.phone,
          governorate: formData.governorate,
          address: formData.address,
          total: grandTotal,
          subtotal,
          shippingFee,
          discount: discountAmount,
          paymentMethod: formData.paymentMethod,
          isGift: formData.isGift,
          giftMessage: formData.giftMessage,
          items: cartItems.map((i) => ({
            arabicName: i.product.arabicName,
            quantity: i.quantity,
            price: i.product.price,
            selectedSize: i.selectedSize,
          })),
          status: "new_order",
          senderEmail: storeSettings.senderEmail || "theorma.eg@gmail.com",
          senderName: storeSettings.senderEmailName || "ORMA للفضة 925",
        }),
      }).catch((err) => console.warn("Email send notification:", err));
    }

    // Clear cart immediately
    clearCart();

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
    }, 700);
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setIsOrderIdCopied(true);
    setTimeout(() => setIsOrderIdCopied(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !orderConfirmed) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] max-h-[92dvh] overflow-y-auto bg-[#faf8f5] border border-[#d8c8b4] rounded-3xl p-5 sm:p-8 text-[#1c1815] shadow-2xl text-right overscroll-contain custom-scrollbar"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-white border border-[#ded1be] text-[#736150] hover:text-[#1c1815] hover:bg-[#f6efe4] transition-all"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          /* ========================================================
             ROYAL CONFIRMATION SUCCESS SCREEN (ORMA 925)
             ======================================================== */
          (() => {
            const order = confirmedOrder || {
              orderId,
              items: [],
              subtotal,
              shippingFee,
              discount: discountAmount,
              grandTotal,
              fullName: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              governorate: formData.governorate,
              address: formData.address,
              notes: formData.notes,
              isGift: formData.isGift,
              giftMessage: formData.giftMessage,
              paymentMethod: formData.paymentMethod,
            };

            const whatsappMessage = `أهلاً متجر أورما، قمت بعمل طلب جديد رقم #${order.orderId} بقيمة ${order.grandTotal.toLocaleString("ar-EG")} ج.م، وأرغب في متابعة تأكيد الشحنة.`;
            const whatsappUrl = `https://wa.me/201143837730?text=${encodeURIComponent(whatsappMessage)}`;

            return (
              <div className="py-4 space-y-5 text-right">
                {/* Royal Success Header */}
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-[#161412] text-[#c5a880] border-2 border-[#c5a880]/40 flex items-center justify-center mx-auto shadow-xl">
                    <Check className="w-8 h-8 text-[#c5a880]" />
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    تم استلام وتسجيل طلبك بنجاح
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#161412] font-amiri tracking-tight">
                    شكراً لاختيارك براند أورما
                  </h3>
                  <p className="text-xs sm:text-sm text-[#756555] font-light max-w-md mx-auto leading-relaxed">
                    تم حفظ طلبك على السيستم وجاري مراجعته وتجهيزه في علبة إهداء مخملية فاخرة تليق بذوقك.
                  </p>
                </div>

                {/* Official Order Number & Action Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e8ded0] shadow-sm space-y-3 text-center">
                  <span className="text-xs font-medium text-[#756555] block">
                    رقم طلبك الرسمي (يرجى حفظه لمتابعة الشحنة):
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-[#161412] tracking-wider dir-ltr">
                      #{order.orderId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="px-3.5 py-1.5 rounded-xl bg-[#f7f4ee] hover:bg-[#ede3d3] border border-[#d8c8b4] text-xs font-bold text-[#161412] transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                      title="نسخ رقم الطلب"
                    >
                      {isOrderIdCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#8c7865]" />
                          <span>نسخ الرقم</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Direct WhatsApp Followup Button */}
                  <div className="pt-1">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>متابعة الطلب مباشرة عبر واتساب المتجر (01143837730)</span>
                    </a>
                  </div>
                </div>

                {/* Order Items Summary */}
                {order.items && order.items.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-[#e8ded0] shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#f0e8dc] pb-2 text-xs font-bold text-[#161412]">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-[#c5a880]" />
                        <span>القطع المختارة في طلبك ({order.items.length})</span>
                      </div>
                      <span className="text-[11px] text-[#8c7865] font-light">فضة إسترليني 925</span>
                    </div>

                    <div className="divide-y divide-[#f7f4ee] max-h-48 overflow-y-auto custom-scrollbar">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-3 py-2 text-xs">
                          <div className="flex items-center gap-2.5">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.arabicName}
                                className="w-11 h-11 rounded-lg object-cover border border-[#e8ded0] bg-[#f7f4ee] shrink-0"
                              />
                            )}
                            <div>
                              <span className="font-bold text-[#161412] block line-clamp-1">{item.arabicName}</span>
                              <div className="flex items-center gap-2 text-[10px] text-[#8c7865] mt-0.5">
                                <span>الكمية: {item.quantity}</span>
                                {item.selectedSize && (
                                  <span className="px-1.5 py-0.2 rounded bg-[#f7f4ee] border border-[#e8ded0] text-[#161412]">
                                    مقاس {item.selectedSize}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-[#161412] font-cairo shrink-0">
                            {(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comprehensive Financial Breakdown (The Core Fix) */}
                <div className="p-4 rounded-2xl bg-white border border-[#e8ded0] shadow-sm space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#161412] border-b border-[#f0e8dc] pb-2">
                    <Package className="w-4 h-4 text-[#c5a880]" />
                    <span>الملخص المالي وتفاصيل الفاتورة</span>
                  </div>

                  <div className="flex justify-between items-center text-[#756555] py-0.5">
                    <span>المجموع الفرعي للقطع:</span>
                    <span className="font-bold text-[#161412] font-cairo">
                      {order.subtotal.toLocaleString("ar-EG")} ج.م
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#756555] py-0.5">
                    <span>مصاريف الشحن والتوصيل:</span>
                    <span className={`font-bold font-cairo ${order.shippingFee === 0 ? "text-emerald-700" : "text-[#161412]"}`}>
                      {order.shippingFee === 0 ? "شحن مجاني لكافة المحافظات" : `${order.shippingFee.toLocaleString("ar-EG")} ج.م`}
                    </span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between items-center text-rose-600 py-0.5 font-medium">
                      <span>الخصم الترويجي:</span>
                      <span className="font-bold font-cairo">
                        -{order.discount.toLocaleString("ar-EG")} ج.م
                      </span>
                    </div>
                  )}

                  {/* Prominent Total Card */}
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#161412] text-[#f7f4ee] mt-2 shadow-sm">
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs sm:text-sm text-[#d4b896] block">
                        الإجمالي النهائي المطلوب دفعه:
                      </span>
                      <span className="text-[10px] text-[#b8a998]">
                        شامل كافة القطع والشحن والضمان
                      </span>
                    </div>
                    <span className="font-bold text-lg sm:text-xl text-[#ffffff] font-cairo">
                      {order.grandTotal.toLocaleString("ar-EG")} ج.م
                    </span>
                  </div>
                </div>

                {/* Customer & Shipping Details Card */}
                <div className="p-4 rounded-2xl bg-white border border-[#e8ded0] shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#f0e8dc] pb-1.5">
                    <span className="text-[#756555]">اسم العميل:</span>
                    <span className="font-bold text-[#161412]">{order.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#f0e8dc] pb-1.5">
                    <span className="text-[#756555]">رقم الهاتف:</span>
                    <span className="font-bold text-[#161412] dir-ltr font-mono">{order.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#f0e8dc] pb-1.5">
                    <span className="text-[#756555]">عنوان الشحن:</span>
                    <span className="font-bold text-[#161412]">{order.governorate} - {order.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#756555]">طريقة الدفع:</span>
                    <span className="text-[#161412] font-bold">
                      {order.paymentMethod === "cod"
                        ? "الدفع عند الاستلام (نقداً عند التوصيل)"
                        : order.paymentMethod === "wallet"
                        ? "تحويل إنستاباي / فودافون كاش"
                        : "بطاقة بنكية (Paymob)"}
                    </span>
                  </div>
                </div>

                {/* Phone Confirmation Reassurance */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-[#5c4f42] flex items-start gap-3 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#161412] block">تأكيد ومتابعة الشحنة هاتفياً</span>
                    <p className="text-[11px] leading-relaxed text-[#756555]">
                      سيتواصل معك ممثل خدمة العملاء هاتفياً على الرقم (<strong>{order.phone}</strong>) لتأكيد تفاصيل المقاسات والعنوان وموعد الاستلام المناسب لك قبل خروج الشحنة.
                    </p>
                  </div>
                </div>

                {/* Email Confirmation Notification */}
                {order.email && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold block text-[#161412]">تم إرسال الفاتورة لبريدك الإلكتروني</span>
                      <p className="text-[11px] text-blue-800 leading-relaxed">
                        تم إرسال ملخص الطلب وفاتورة الشراء الملكية الرسمية إلى: <strong>{order.email}</strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons: Continue Shopping & Refresh */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderConfirmed(false);
                      setConfirmedOrder(null);
                      onClose();
                    }}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <span>متابعة التسوق والعودة للمتجر</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-[#8c7865] px-1 pt-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>فضة إسترليني معتمدة 925 • ضمان أصالة رسمي</span>
                    </span>
                    <span className="font-mono text-[10px]">
                      العودة التلقائية: 00:{String(countdown).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          /* Checkout Form */
          <div>
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1c1815] font-tajawal">
                إتمام الطلب وتأكيد الشحن
              </h2>
              <p className="text-xs text-[#6e5d4c] mt-1 font-tajawal">
                املأ بياناتك للشحن السريع. تصلك القطعة في بوكس ORMA المخملي الفاخر مع كارت الضمان والفاتورة الرسمية.
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
                        {gov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1815] mb-1">
                    البريد الإلكتروني (اختياري) 📧
                  </label>
                  <input
                    type="email"
                    placeholder="لاستلام فاتورة وتحديثات الشحن فورياً"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      <div className="text-[10px] opacity-75">شحن آمن وسريع</div>
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

              {/* Anti-Spam Honeypot field (Hidden from humans, traps automated spam bots) */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Submission Error Banner */}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed text-right flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-[#1c1815] text-[#faf8f5] font-black text-sm shadow-xl shadow-[#1c1815]/15 hover:bg-[#2e2620] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>جاري تأكيد الطلب...</span>
                  </span>
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

"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { GOVERNORATES, CartItem } from "@/data/products";
import { OrmaLogo } from "@/components/OrmaLogo";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  CreditCard,
  Banknote,
  Upload,
  Copy,
  Check,
  Trash2,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Tag,
  Truck,
  Sparkles,
  Gift,
  Printer,
  Phone,
  Home,
  Package,
  Mail,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedPromo,
    setAppliedPromo,
    discountAmount,
    storeSettings,
    addOrder,
    addToast,
  } = useStore();

  // Contact & Delivery Form
  const [email, setEmail] = useState("");
  const [emailOffers, setEmailOffers] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [governorate, setGovernorate] = useState("القاهرة");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "wallet" | "card">("cod");

  // Wallet / InstaPay State
  const [senderWalletNumber, setSenderWalletNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState("");
  const receiptFileInputRef = useRef<HTMLInputElement>(null);

  // Card Payment State
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardHolder: "",
  });

  // Gift & Order Notes
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");
  const [confirmedSnapshot, setConfirmedSnapshot] = useState<{
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    fullName: string;
    phone: string;
    email: string;
    governorate: string;
    address: string;
    paymentMethod: "cod" | "wallet" | "card";
  } | null>(null);

  // Mobile Order Summary Accordion
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Pre-fill from localStorage if previously saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem("athar_checkout_customer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.lastName) setLastName(parsed.lastName);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.apartment) setApartment(parsed.apartment);
        if (parsed.city) setCity(parsed.city);
        if (parsed.governorate) setGovernorate(parsed.governorate);
        if (parsed.phone) setPhone(parsed.phone);
      }
    } catch {}
  }, []);

  // Financial Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const freeThreshold = storeSettings.freeShippingThreshold || 1500;
  const isFreeShipping = subtotal >= freeThreshold;

  const shippingFee = useMemo(() => {
    if (isFreeShipping) return 0;
    if (storeSettings.governorateShippingRates && storeSettings.governorateShippingRates[governorate] !== undefined) {
      return storeSettings.governorateShippingRates[governorate];
    }
    // Regional Fallback
    if (["القاهرة", "الجيزة"].includes(governorate)) return storeSettings.shippingCairoGiza || 45;
    if (governorate === "الإسكندرية") return storeSettings.shippingAlex || 55;
    if (
      [
        "القليوبية",
        "المنوفية",
        "الغربية",
        "الدقهلية",
        "كفر الشيخ",
        "البحيرة",
        "دمياط",
        "الشرقية",
        "الإسماعيلية",
        "بورسعيد",
        "السويس",
      ].includes(governorate)
    ) {
      return storeSettings.shippingDeltaCanal || 65;
    }
    return storeSettings.shippingUpperEgypt || 80;
  }, [governorate, isFreeShipping, storeSettings]);

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  // Promo Code Handler
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoInput.trim().toUpperCase();
    if (!code) {
      setPromoError("يرجى إدخال كود الخصم أولاً");
      return;
    }

    const validCode = (storeSettings.promoCode || "ORMA10").toUpperCase();
    if (code === validCode) {
      setAppliedPromo(code);
      setPromoSuccess(`تم تفعيل خصم ${storeSettings.promoDiscountPercent || 10}% بنجاح! ✨`);
      setPromoInput("");
    } else {
      setPromoError("كود الخصم غير صالح أو منتهي الصلاحية");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo("");
    setPromoSuccess("");
    setPromoError("");
  };

  // Image Upload for Wallets
  const handleReceiptUpload = (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setReceiptError("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت");
      return;
    }

    setIsUploadingReceipt(true);
    setReceiptError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setReceiptImage(result);
      setIsUploadingReceipt(false);
      addToast("تم رفع الإيصال", "تم إرفاق إيصال التحويل بنجاح", "info");
    };
    reader.onerror = () => {
      setIsUploadingReceipt(false);
      setReceiptError("حدث خطأ أثناء قراءة الصورة");
    };
    reader.readAsDataURL(file);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast("تم النسخ", "تم نسخ الرقم إلى الحافظة بنجاح", "info");
  };

  // Submit Order Handler
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      addToast("السلة فارغة", "يرجى إضافة قطع للسلة أولاً قبل إتمام الطلب", "info");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName) {
      addToast("بيانات ناقصة", "يرجى كتابة الاسم الأول واسم العائلة", "info");
      return;
    }

    if (!phone.trim()) {
      addToast("بيانات ناقصة", "يرجى كتابة رقم الهاتف للتواصل", "info");
      return;
    }

    if (!address.trim()) {
      addToast("بيانات ناقصة", "يرجى كتابة العنوان بالتفصيل", "info");
      return;
    }

    // Wallets validation
    if (paymentMethod === "wallet") {
      if (storeSettings.requireReceiptUpload && !receiptImage) {
        setReceiptError("يرجى إرفاق صورة إيصال التحويل لتأكيد الطلب");
        addToast("إيصال التحويل مطلوب", "يرجى رفع لقطة شاشة لإيصال التحويل", "info");
        return;
      }
    }

    // Save customer info for next time
    if (saveInfo) {
      try {
        localStorage.setItem(
          "athar_checkout_customer",
          JSON.stringify({
            email,
            firstName,
            lastName,
            address,
            apartment,
            city,
            governorate,
            phone,
          })
        );
      } catch {}
    }

    setIsSubmitting(true);

    const fullAddress = apartment ? `${address} - ${apartment}` : address;

    // Create Order with sequential 4-digit ID
    const newOrderId = addOrder({
      customerName: fullName,
      phone: phone.trim(),
      email: email.trim() || undefined,
      governorate,
      address: fullAddress,
      notes: orderNotes.trim() || undefined,
      isGift,
      giftMessage: isGift ? giftMessage.trim() || "تغليف هدية ملكي فاخر" : undefined,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        arabicName: item.product.arabicName,
        quantity: item.quantity,
        price: item.product.price,
        selectedSize: item.selectedSize,
        image: item.product.images[0] || "",
      })),
      subtotal,
      shippingFee,
      discount: discountAmount,
      total: grandTotal,
      paymentMethod,
      senderWalletNumber: paymentMethod === "wallet" ? senderWalletNumber : undefined,
      paymentReceiptImage: paymentMethod === "wallet" ? receiptImage : undefined,
      cardDetails:
        paymentMethod === "card"
          ? {
              cardHolder: cardData.cardHolder || fullName,
              cardLast4: cardData.cardNumber.replace(/\s/g, "").slice(-4) || "4242",
              paymentStatus: "mock_success",
            }
          : undefined,
    });

    setConfirmedOrderId(newOrderId);
    setConfirmedSnapshot({
      items: [...cartItems],
      subtotal,
      shippingFee,
      discount: discountAmount,
      total: grandTotal,
      fullName,
      phone: phone.trim(),
      email: email.trim(),
      governorate,
      address: fullAddress,
      paymentMethod,
    });

    // Send confirmation email if provided
    if (email.trim() && email.includes("@")) {
      fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: newOrderId,
          customerName: fullName,
          email: email.trim(),
          phone: phone.trim(),
          governorate,
          address: fullAddress,
          total: grandTotal,
          subtotal,
          shippingFee,
          discount: discountAmount,
          paymentMethod,
          isGift,
          giftMessage,
          items: cartItems.map((i) => ({
            arabicName: i.product.arabicName,
            quantity: i.quantity,
            price: i.product.price,
            selectedSize: i.selectedSize,
          })),
          status: "new_order",
          senderEmail: storeSettings.senderEmail || "theorma.eg@gmail.com",
          senderName: storeSettings.senderEmailName || "ORMA للفضة 925",
          gmailAppPassword: storeSettings.gmailAppPassword,
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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 700);
  };

  // -------------------------------------------------------------
  // SUCCESS CONFIRMATION SCREEN
  // -------------------------------------------------------------
  if (orderConfirmed && confirmedSnapshot) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-[#161412] font-cairo py-10 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header Branding */}
          <div className="text-center pb-4 border-b border-[#ded2c0]">
            <OrmaLogo variant="light" size="lg" href="/" />
          </div>

          {/* Success Hero Card */}
          <div className="bg-white rounded-3xl border border-[#ded2c0] shadow-xl p-6 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border-2 border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-[#8c7865] uppercase tracking-widest block mb-1">
                تم استلام طلبك بنجاح
              </span>
              <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-[#161412]">
                شكراً لتسوقك من دار أَثَـر للفضة 925
              </h1>
              <p className="text-xs sm:text-sm text-[#756555] mt-1.5 max-w-lg mx-auto">
                يسعدنا إبلاغك بأنه تم تسجيل وتأكيد أوردرك وجاري تجهيزه وتغليفه الفاخر لشحنه لباب منزلك.
              </p>
            </div>

            {/* Order Number Box */}
            <div className="inline-flex items-center gap-3 bg-[#f7f4ee] border border-[#d8c8b4] rounded-2xl px-5 py-3">
              <span className="text-xs text-[#756555]">رقم الطلب الخاص بك:</span>
              <span className="font-mono text-base sm:text-lg font-black text-[#161412]">
                #{confirmedOrderId}
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(confirmedOrderId)}
                className="p-1 rounded-md hover:bg-white text-[#756555] hover:text-[#161412] transition-colors"
                title="نسخ رقم الطلب"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Order Details & Summary Card */}
          <div className="bg-white rounded-3xl border border-[#ded2c0] shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-sm font-bold text-[#161412] flex items-center gap-2 pb-3 border-b border-[#f0e8dc]">
              <Package className="w-4 h-4 text-[#c5a880]" />
              <span>تفاصيل الطلب والقطع المطلوبة</span>
            </h2>

            {/* Items */}
            <div className="space-y-3 divide-y divide-[#f5efe6]">
              {confirmedSnapshot.items.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl border border-[#e8ded0] overflow-hidden bg-[#f7f4ee] shrink-0">
                      <img
                        src={item.product.images[0] || ""}
                        alt={item.product.arabicName}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#161412] text-white text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#161412]">{item.product.arabicName}</h3>
                      {item.selectedSize && (
                        <span className="text-[11px] text-[#8c7865] block">مقاس: {item.selectedSize}</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-[#161412] font-mono">
                    {(item.product.price * item.quantity).toLocaleString("en-US")} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-4 border-t border-[#f0e8dc] space-y-2 text-xs text-[#756555]">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-[#161412] font-mono">{confirmedSnapshot.subtotal.toLocaleString("en-US")} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>مصاريف الشحن:</span>
                <span className="font-bold text-[#161412] font-mono">
                  {confirmedSnapshot.shippingFee === 0 ? "شحن مجاني 🚚" : `${confirmedSnapshot.shippingFee} ج.م`}
                </span>
              </div>
              {confirmedSnapshot.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>خصم الكوبون:</span>
                  <span className="font-mono">-{confirmedSnapshot.discount.toLocaleString("en-US")} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#161412] pt-2 border-t border-[#ded2c0]">
                <span>المبلغ الإجمالي:</span>
                <span className="text-lg font-black font-mono text-[#161412]">
                  {confirmedSnapshot.total.toLocaleString("en-US")} ج.م
                </span>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="pt-4 border-t border-[#f0e8dc] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-[#8c7865] block mb-0.5">الاسم ورقم الهاتف:</span>
                <span className="font-bold text-[#161412] block">{confirmedSnapshot.fullName}</span>
                <span className="font-mono text-[#756555] dir-ltr block">{confirmedSnapshot.phone}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#8c7865] block mb-0.5">عنوان التوصيل:</span>
                <span className="font-semibold text-[#161412] block">{confirmedSnapshot.governorate}</span>
                <span className="text-[#756555] block">{confirmedSnapshot.address}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-[#c5a880]" />
              <span>العودة للصفحة الرئيسية ومواصلة التسوق</span>
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#ded2c0] text-[#161412] hover:bg-[#f7f4ee] text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#8c7865]" />
              <span>طباعة إيصال الطلب</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY CART VIEW
  // -------------------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white text-[#161412] font-cairo flex flex-col justify-center items-center py-16 px-4" dir="rtl">
        <div className="text-center max-w-md mx-auto space-y-5">
          <div className="pb-4">
            <OrmaLogo variant="light" size="lg" href="/" />
          </div>

          <div className="w-20 h-20 rounded-full bg-[#f7f4ee] text-[#8c7865] mx-auto flex items-center justify-center border border-[#ded2c0]">
            <ShoppingBag className="w-9 h-9 text-[#c5a880]" />
          </div>

          <div>
            <h1 className="font-amiri text-2xl font-bold text-[#161412]">سلة المشتريات فارغة</h1>
            <p className="text-xs sm:text-sm text-[#756555] mt-1.5 leading-relaxed">
              لم تقم بإضافة أي قطع من الفضة الإسترليني إلى سلتك بعد. تفضل باستعراض أحدث التشكيلات الملكية.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md"
          >
            <span>استعراض تشكيلات أَثَـر</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN STANDALONE SHOPIFY-STYLE CHECKOUT VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-[#161412] font-cairo" dir="rtl">
      {/* Top Header - Clean Centered Logo matching Shopify */}
      <header className="border-b border-[#e8ded0] bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-[#756555] hover:text-[#161412] flex items-center gap-1 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">العودة للمتجر</span>
          </Link>

          <div className="flex-1 flex justify-center">
            <OrmaLogo variant="light" size="md" href="/" />
          </div>

          <div className="flex items-center gap-1 text-xs text-[#8c7865]">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">دفع آمن ومحمي</span>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden border-b border-[#e8ded0] bg-[#faf8f5]">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-bold text-[#161412]"
        >
          <div className="flex items-center gap-2 text-[#161412]">
            <ShoppingBag className="w-4 h-4 text-[#c5a880]" />
            <span>{isMobileSummaryOpen ? "إخفاء ملخص الطلب" : "عرض ملخص الطلب والأصناف"}</span>
            {isMobileSummaryOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-[#8c7865]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[#8c7865]" />
            )}
          </div>
          <span className="font-mono text-sm font-black text-[#161412]">
            {grandTotal.toLocaleString("en-US")} ج.م
          </span>
        </button>

        {/* Mobile Expanded Summary */}
        {isMobileSummaryOpen && (
          <div className="px-4 py-4 border-t border-[#e8ded0] space-y-4 bg-white animate-fadeIn">
            {/* Products List */}
            <div className="space-y-3 divide-y divide-[#f5efe6]">
              {cartItems.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl border border-[#ded2c0] overflow-visible bg-[#f7f4ee] shrink-0">
                      <img
                        src={item.product.images[0] || ""}
                        alt={item.product.arabicName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#161412] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#161412] line-clamp-1">{item.product.arabicName}</h4>
                      {item.selectedSize && (
                        <span className="text-[10px] text-[#8c7865]">مقاس: {item.selectedSize}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#161412] font-mono">
                    {(item.product.price * item.quantity).toLocaleString("en-US")} ج.م
                  </span>
                </div>
              ))}
            </div>

            {/* Mobile Promo Code */}
            <form onSubmit={handleApplyPromo} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="كود الخصم أو كوبون الهدية"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-[#f7f4ee] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#161412] focus:outline-none uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#161412] hover:bg-[#2e2925] text-white text-xs font-bold rounded-xl shrink-0"
                >
                  تطبيق
                </button>
              </div>
              {promoError && <p className="text-[11px] text-rose-600 mt-1 font-bold">{promoError}</p>}
              {promoSuccess && <p className="text-[11px] text-emerald-700 mt-1 font-bold">{promoSuccess}</p>}
            </form>

            {/* Mobile Breakdown */}
            <div className="space-y-2 text-xs pt-2 border-t border-[#f0e8dc] text-[#756555]">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-mono text-[#161412] font-bold">{subtotal.toLocaleString("en-US")} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>الشحن والتوصيل:</span>
                <span className="font-mono text-[#161412] font-bold">
                  {shippingFee === 0 ? "مجاناً 🚚" : `${shippingFee} ج.م`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>الخصم:</span>
                  <span className="font-mono">-{discountAmount.toLocaleString("en-US")} ج.م</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#161412] pt-2 border-t border-[#ded2c0]">
                <span>الإجمالي:</span>
                <span className="font-mono text-lg font-black">{grandTotal.toLocaleString("en-US")} ج.م</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Container - 2 Columns Desktop */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* =========================================================
              LEFT COLUMN: CHECKOUT FORM (Shopify Pattern)
              ========================================================= */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#161412] flex items-center gap-2">
                  <span>معلومات التواصل</span>
                </h2>
                <span className="text-[11px] text-[#8c7865]">لتأكيد الطلب وإرسال الفاتورة</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#161412] mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors dir-ltr text-right"
                  />
                  <Mail className="w-4 h-4 text-[#a89582] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-[#756555]">
                <input
                  type="checkbox"
                  checked={emailOffers}
                  onChange={(e) => setEmailOffers(e.target.checked)}
                  className="rounded border-[#ded2c0] text-[#161412] focus:ring-0"
                />
                <span>أرسل لي آخر العروض والخصومات الحصرية والقطع الجديدة</span>
              </label>
            </div>

            {/* 2. Delivery Section */}
            <div className="space-y-4 pt-4 border-t border-[#e8ded0]">
              <h2 className="text-base font-bold text-[#161412]">
                عنوان الشحن والتوصيل
              </h2>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-[#161412] mb-1">
                  الدولة / المنطقة
                </label>
                <div className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#161412] flex items-center justify-between">
                  <span>مصر (Egypt)</span>
                  <Truck className="w-4 h-4 text-[#8c7865]" />
                </div>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#161412] mb-1">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: كريم"
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#161412] mb-1">
                    اسم العائلة / اللقب *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: مصطفى"
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-semibold text-[#161412] mb-1">
                  العنوان بالتفصيل * (اسم الشارع، المنطقة، رقم العمارة)
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: شارع النزهة، مصر الجديدة، عمارة 15"
                  className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors"
                />
              </div>

              {/* Apartment, Suite (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-[#161412] mb-1">
                  رقم الشقة، الطابق، علامة مميزة (اختياري)
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="مثال: شقة 4، الطابق الثالث، بجوار مسجد..."
                  className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors"
                />
              </div>

              {/* City, Governorate, Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#161412] mb-1">
                    المدينة / المركز *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="المدينة"
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#161412] mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] font-semibold focus:outline-none focus:border-[#161412] transition-colors cursor-pointer"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g.name} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#161412] mb-1">
                    الرقم البريدي (اختياري)
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="11511"
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#161412] mb-1">
                  رقم الهاتف للتواصل وتأكيد الشحن *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] transition-colors dir-ltr text-right font-mono"
                  />
                  <Phone className="w-4 h-4 text-[#a89582] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Save Information Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-[#756555]">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="rounded border-[#ded2c0] text-[#161412] focus:ring-0"
                />
                <span>حفظ هذه البيانات لتسريع عمليات الشراء القادمة</span>
              </label>
            </div>

            {/* 3. Shipping Method Section */}
            <div className="space-y-3 pt-4 border-t border-[#e8ded0]">
              <h2 className="text-base font-bold text-[#161412]">
                طريقة الشحن والتوصيل
              </h2>

              <div className="border-2 border-[#161412] bg-[#fdfbf7] rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-[#161412] bg-white flex items-center justify-center shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#161412] block">
                      {storeSettings.checkoutShippingMethodTitle || "شحن قياسي سريع (خلال 2-4 أيام عمل)"}
                    </span>
                    <span className="text-[11px] text-[#756555] block">
                      توصيل مباشر لباب منزلك مع التنسيق المسبق هاتفياً
                    </span>
                  </div>
                </div>

                <div className="text-left font-mono font-bold text-xs sm:text-sm text-[#161412]">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-bold font-cairo">مجاناً 🚚</span>
                  ) : (
                    <span>{shippingFee} ج.م</span>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Payment Section (Shopify-Style Accordion) */}
            <div className="space-y-3 pt-4 border-t border-[#e8ded0]">
              <div>
                <h2 className="text-base font-bold text-[#161412]">
                  طريقة الدفع
                </h2>
                <p className="text-xs text-[#756555] mt-0.5">
                  {storeSettings.checkoutSecurityBadgeText || "جميع المعاملات مشفرة وآمنة بنسبة 100%."}
                </p>
              </div>

              <div className="border border-[#ded2c0] rounded-2xl overflow-hidden divide-y divide-[#ded2c0] bg-white shadow-xs">
                {/* Option 1: Cash on Delivery (COD) */}
                {storeSettings.checkoutEnableCOD !== false && (
                  <div>
                    <label
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        paymentMethod === "cod" ? "bg-[#fcfaf7]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "cod" ? "border-[#161412] border-4" : "border-[#ded2c0]"
                          }`}
                        />
                        <span className="text-xs font-bold text-[#161412]">الدفع عند الاستلام (Cash on Delivery)</span>
                      </div>
                      <Banknote className="w-5 h-5 text-[#8c7865]" />
                    </label>

                    {paymentMethod === "cod" && (
                      <div className="p-4 bg-[#f7f4ee] border-t border-[#ded2c0] text-xs text-[#756555] leading-relaxed animate-fadeIn">
                        سداد قيمة الطلب ومصاريف الشحن نقداً بالكامل لمندوب التوصيل عند استلام الشحنة لباب بيتك.
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2: Electronic Wallets / InstaPay */}
                {storeSettings.checkoutEnableWallets !== false && (
                  <div>
                    <label
                      onClick={() => setPaymentMethod("wallet")}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        paymentMethod === "wallet" ? "bg-[#fcfaf7]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "wallet" ? "border-[#161412] border-4" : "border-[#ded2c0]"
                          }`}
                        />
                        <span className="text-xs font-bold text-[#161412]">
                          محفظة إلكترونية (إنستاباي InstaPay / فودافون كاش)
                        </span>
                      </div>
                      <CreditCard className="w-5 h-5 text-[#8c7865]" />
                    </label>

                    {paymentMethod === "wallet" && (
                      <div className="p-4 sm:p-5 bg-[#f7f4ee] border-t border-[#ded2c0] space-y-3.5 text-xs animate-fadeIn">
                        <p className="text-[#756555] leading-relaxed">
                          {storeSettings.walletInstructions ||
                            "يرجى تحويل إجمالي المبلغ إلى حساب إنستاباي أو محفظة فودافون كاش، ثم إرفاق صورة الإيصال."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* InstaPay Card */}
                          <div className="bg-white p-3 rounded-xl border border-[#ded2c0] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#8c7865] block">حساب إنستاباي (InstaPay):</span>
                              <span className="font-mono font-bold text-xs text-[#161412]">
                                {storeSettings.instaPayUsername || storeSettings.instaPayNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(storeSettings.instaPayUsername || storeSettings.instaPayNumber)
                              }
                              className="p-1.5 rounded-lg bg-[#f7f4ee] hover:bg-[#e8ded0] text-[#161412] text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </button>
                          </div>

                          {/* Vodafone Cash Card */}
                          <div className="bg-white p-3 rounded-xl border border-[#ded2c0] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#8c7865] block">فودافون كاش (Vodafone Cash):</span>
                              <span className="font-mono font-bold text-xs text-[#161412]">
                                {storeSettings.vodafoneCashNumber}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyText(storeSettings.vodafoneCashNumber)}
                              className="p-1.5 rounded-lg bg-[#f7f4ee] hover:bg-[#e8ded0] text-[#161412] text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ</span>
                            </button>
                          </div>
                        </div>

                        {/* Sender Number Input */}
                        <div>
                          <label className="block text-[11px] font-semibold text-[#161412] mb-1">
                            رقم المحفظة التي قمت بالتحويل منها (اختياري)
                          </label>
                          <input
                            type="text"
                            value={senderWalletNumber}
                            onChange={(e) => setSenderWalletNumber(e.target.value)}
                            placeholder="010xxxxxxxx"
                            className="w-full bg-white border border-[#ded2c0] rounded-xl px-3 py-2 text-xs font-mono dir-ltr text-right focus:outline-none"
                          />
                        </div>

                        {/* Receipt Upload */}
                        <div>
                          <input
                            type="file"
                            ref={receiptFileInputRef}
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleReceiptUpload(e.target.files[0])}
                            className="hidden"
                          />

                          <label className="block text-[11px] font-semibold text-[#161412] mb-1">
                            إرفاق صورة إيصال التحويل {storeSettings.requireReceiptUpload && "*"}
                          </label>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => receiptFileInputRef.current?.click()}
                              disabled={isUploadingReceipt}
                              className="px-4 py-2 bg-white border border-[#ded2c0] hover:bg-gray-50 rounded-xl text-xs font-bold text-[#161412] flex items-center gap-2 transition-all shadow-xs"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                              <span>{isUploadingReceipt ? "جاري الرفع..." : "اختر صورة الإيصال"}</span>
                            </button>
                            {receiptImage && (
                              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                تم إرفاق الصورة بنجاح
                              </span>
                            )}
                          </div>
                          {receiptError && <p className="text-[11px] text-rose-600 font-bold mt-1">{receiptError}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Option 3: Credit Card */}
                {storeSettings.checkoutEnableCards !== false && (
                  <div>
                    <label
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        paymentMethod === "card" ? "bg-[#fcfaf7]" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            paymentMethod === "card" ? "border-[#161412] border-4" : "border-[#ded2c0]"
                          }`}
                        />
                        <span className="text-xs font-bold text-[#161412]">بطاقة دفع إلكتروني (Visa / Mastercard)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold bg-[#1a1f71] text-white px-1.5 py-0.5 rounded font-mono">
                          VISA
                        </span>
                        <span className="text-[10px] font-bold bg-[#eb001b] text-white px-1.5 py-0.5 rounded font-mono">
                          MC
                        </span>
                      </div>
                    </label>

                    {paymentMethod === "card" && (
                      <div className="p-4 sm:p-5 bg-[#f7f4ee] border-t border-[#ded2c0] space-y-3 text-xs animate-fadeIn">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#161412] mb-1">
                            رقم البطاقة (Card number)
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardData.cardNumber}
                              onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                              placeholder="0000 0000 0000 0000"
                              className="w-full bg-white border border-[#ded2c0] rounded-xl px-3 py-2 text-xs font-mono dir-ltr focus:outline-none"
                            />
                            <Lock className="w-3.5 h-3.5 text-[#a89582] absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#161412] mb-1">
                              تاريخ الانتهاء (MM / YY)
                            </label>
                            <input
                              type="text"
                              value={cardData.cardExpiry}
                              onChange={(e) => setCardData({ ...cardData, cardExpiry: e.target.value })}
                              placeholder="12/28"
                              className="w-full bg-white border border-[#ded2c0] rounded-xl px-3 py-2 text-xs font-mono dir-ltr focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#161412] mb-1">
                              رمز الأمان (CVV)
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardData.cardCvc}
                              onChange={(e) => setCardData({ ...cardData, cardCvc: e.target.value })}
                              placeholder="123"
                              className="w-full bg-white border border-[#ded2c0] rounded-xl px-3 py-2 text-xs font-mono dir-ltr focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#161412] mb-1">
                            الاسم على البطاقة (Name on card)
                          </label>
                          <input
                            type="text"
                            value={cardData.cardHolder}
                            onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                            placeholder="KARIM MOSTAFA"
                            className="w-full bg-white border border-[#ded2c0] rounded-xl px-3 py-2 text-xs dir-ltr focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 5. Gift Option & Notes Section */}
            {storeSettings.checkoutEnableGiftOption !== false && (
              <div className="space-y-3 pt-4 border-t border-[#e8ded0]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#161412]">
                  <input
                    type="checkbox"
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="rounded border-[#ded2c0] text-[#161412] focus:ring-0"
                  />
                  <Gift className="w-4 h-4 text-[#c5a880]" />
                  <span>هذا الطلب هدية لشخص مميز (تغليف فاخر وبدون طباعة الأسعار)</span>
                </label>

                {isGift && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl animate-fadeIn space-y-2">
                    <label className="block text-[11px] font-bold text-amber-900">
                      كتابة رسالة كارت الإهداء الملكي:
                    </label>
                    <textarea
                      rows={2}
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="اكتب رسالة الإهداء الخاصة بك هنا لتتم طباعتها داخل كارت أَثَر الفاخر..."
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-[#161412] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#161412] mb-1">
                    ملاحظات إضافية للتوصيل (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="أي ملاحظات خاصة بالاستلام أو مواعيد التوصيل..."
                    className="w-full bg-white border border-[#ded2c0] rounded-xl p-2.5 text-xs text-[#161412] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 6. Submit Button & Trust Strip */}
            <div className="pt-4 border-t border-[#e8ded0] space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] font-bold text-sm transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جاري تسجيل الطلب وتأكيده...</span>
                ) : (
                  <>
                    <span>تأكيد الطلب الآن</span>
                    <span>•</span>
                    <span className="font-mono">{grandTotal.toLocaleString("en-US")} ج.م</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[#756555] pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>دفع آمن ومحمي 100%</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a880]" />
                  <span>فضة إسترليني أصلية 925</span>
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: ORDER SUMMARY (Shopify Desktop Pattern)
              ========================================================= */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24">
            <div className="bg-[#faf8f5] border border-[#e8ded0] rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#161412] flex items-center justify-between pb-3 border-b border-[#e8ded0]">
                <span>ملخص الطلب ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} قطعة)</span>
                <ShoppingBag className="w-4 h-4 text-[#c5a880]" />
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1 divide-y divide-[#f0e8dc] custom-scrollbar">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail with floating quantity badge on corner matching Shopify */}
                      <div className="relative w-16 h-16 rounded-2xl border border-[#ded2c0] bg-white overflow-visible shrink-0 shadow-xs">
                        <img
                          src={item.product.images[0] || ""}
                          alt={item.product.arabicName}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-[#161412] text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-[#161412] leading-snug line-clamp-2">
                          {item.product.arabicName}
                        </h3>
                        {item.selectedSize && (
                          <span className="text-[10px] text-[#8c7865] block font-mono">
                            المقاس: {item.selectedSize}
                          </span>
                        )}

                        {/* Inline quantity adjuster */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedSize)
                            }
                            className="w-5 h-5 rounded bg-white border border-[#ded2c0] text-[#756555] hover:text-[#161412] text-xs font-bold flex items-center justify-center"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-xs font-mono font-bold text-[#161412] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="w-5 h-5 rounded bg-white border border-[#ded2c0] text-[#756555] hover:text-[#161412] text-xs font-bold flex items-center justify-center"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                            className="text-[#a89582] hover:text-rose-600 mr-2 transition-colors"
                            title="حذف القطعة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-xs font-bold text-[#161412] font-mono">
                        {(item.product.price * item.quantity).toLocaleString("en-US")} ج.م
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Input Field */}
              <div className="pt-4 border-t border-[#e8ded0]">
                {appliedPromo ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-emerald-900">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-emerald-700" />
                      <span>الكوبون المفعل: ({appliedPromo})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      إلغاء الكوبون
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="كود الخصم أو كوبون الهدية"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="flex-1 bg-white border border-[#ded2c0] rounded-xl px-3.5 py-2.5 text-xs text-[#161412] focus:outline-none focus:border-[#161412] uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-5 py-2.5 rounded-xl bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] font-bold text-xs transition-colors shrink-0 shadow-sm"
                      >
                        تطبيق
                      </button>
                    </div>
                    {promoError && <p className="text-[11px] text-rose-600 font-bold">{promoError}</p>}
                    {promoSuccess && <p className="text-[11px] text-emerald-700 font-bold">{promoSuccess}</p>}
                  </div>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2.5 text-xs text-[#756555] pt-4 border-t border-[#e8ded0]">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-bold text-[#161412] font-mono">{subtotal.toLocaleString("en-US")} ج.م</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>الشحن والتوصيل ({governorate}):</span>
                  </span>
                  <span className="font-bold font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold font-cairo">شحن مجاني 🚚</span>
                    ) : (
                      <span className="text-[#161412]">{shippingFee} ج.م</span>
                    )}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>قيمة الخصم:</span>
                    <span className="font-mono">-{discountAmount.toLocaleString("en-US")} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline text-base font-bold text-[#161412] pt-3 border-t border-[#ded2c0]">
                  <div>
                    <span className="font-amiri text-lg">الإجمالي المستحق:</span>
                    <span className="text-[10px] text-[#8c7865] block font-normal">شامل ضريبة القيمة المضافة والشحن</span>
                  </div>
                  <div className="text-left">
                    <span className="text-xs text-[#8c7865] font-mono ml-1">EGP</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-[#161412]">
                      {grandTotal.toLocaleString("en-US")}
                    </span>
                    <span className="text-xs font-normal mr-1">ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

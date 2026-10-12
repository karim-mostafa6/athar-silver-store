"use client";

import React, { useState } from "react";
import { CartItem, GOVERNORATES } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { X, CheckCircle2, MessageCircle, CreditCard, Banknote, ShieldCheck } from "lucide-react";
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = storeSettings.freeShippingThreshold;
  const currentGov = GOVERNORATES.find((g) => g.name === formData.governorate) || GOVERNORATES[0];
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : currentGov.shipping;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("يرجى ملء الاسم ورقم الهاتف والعنوان بالتفصيل");
      return;
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
        ? "الدفع عند الاستلام (COD)"
        : formData.paymentMethod === "wallet"
        ? "محفظة فودافون كاش / إنستاباي"
        : "بطاقة بنكية"
    }

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
              <div className="flex justify-between">
                <span className="text-[#756453]">طريقة الدفع:</span>
                <span className="text-[#1c1815] font-medium">
                  {formData.paymentMethod === "cod" ? "الدفع عند الاستلام" : "فودافون كاش / إنستاباي"}
                </span>
              </div>
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
                      <div className="text-[10px] opacity-75">فيزا / ماستركارد</div>
                    </div>
                  </button>
                </div>
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

"use client";

import React, { useState } from "react";
import { CartItem } from "@/data/products";
import { X, Trash2, ShoppingBag, ArrowLeft, Check, Sparkles, AlertCircle } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, selectedSize?: string) => void;
  onRemoveItem: (productId: string, selectedSize?: string) => void;
  onProceedToCheckout: () => void;
  appliedPromo: string;
  setAppliedPromo: (promo: string) => void;
  discountAmount: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedPromo,
  setAppliedPromo,
  discountAmount,
}) => {
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Lock body scroll and listen for Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 2500;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    if (clean === "ORMA10" || clean === "ATHAR10") {
      setAppliedPromo(clean);
      setPromoMessage({ text: "تم تطبيق خصم 10% بنجاح!", error: false });
    } else if (clean === "ORMA20" || clean === "ATHAR20") {
      if (subtotal >= 3000) {
        setAppliedPromo(clean);
        setPromoMessage({ text: "تم تطبيق كود VIP بخصم 20%!", error: false });
      } else {
        setPromoMessage({ text: "كود الخصم يتطلب مشتريات بـ 3,000 ج.م كحد أدنى", error: true });
      }
    } else {
      setPromoMessage({ text: "كوبون الخصم غير صحيح أو منتهي الصلاحية", error: true });
    }
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] border-r border-[#ded1be] text-[#1c1815] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#e5dacb] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#806953]" />
              <h2 className="text-lg font-bold text-[#1c1815] font-alexandria">سلة المشتريات</h2>
              <span className="text-xs bg-[#f0e6d6] text-[#4d3f31] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#dfd2be]">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)} قطع
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#786653] hover:text-[#1c1815] hover:bg-[#ede3d3] transition-colors"
              aria-label="إغلاق السلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3.5 bg-[#f5efe4] border-b border-[#e5dacb] text-xs text-right">
            {amountToFreeShipping > 0 ? (
              <p className="text-[#57493b] mb-1.5">
                أضف بقيمة <strong className="text-[#1c1815] font-bold">{amountToFreeShipping} ج.م</strong> إضافية لتحصل على <span className="text-emerald-700 font-bold">شحن مجاني</span>!
              </p>
            ) : (
              <p className="text-emerald-700 font-bold flex items-center gap-1 mb-1.5 justify-end">
                <Sparkles className="w-3.5 h-3.5" />
                مبروك! لقد حصلت على شحن مجاني لكافة المحافظات
              </p>
            )}
            <div className="w-full h-2 bg-[#e2d5c2] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#cbb8a0] via-[#8f7961] to-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4ece0] border border-[#ded1be] flex items-center justify-center text-[#806953]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c1815] mb-1 font-tajawal">سلتك فارغة حالياً</h3>
                  <p className="text-xs text-[#705e4d] max-w-xs font-tajawal">
                    استكشف تشكيلة ORMA للفضة الإسترليني 925 واختر قطعتك المفضلة لتترك بصمة لا تُمحى.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#1c1815] text-[#faf8f5] font-bold text-xs hover:bg-[#2e2620] transition-all shadow-sm"
                >
                  استكشف المنتجات الآن
                </button>
              </div>
            ) : (
              cartItems.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedSize || idx}`}
                  className="p-3.5 rounded-2xl bg-white border border-[#e8ded0] flex gap-3 text-right items-center shadow-sm"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.arabicName}
                    className="w-20 h-20 rounded-xl object-cover bg-[#f5efe4] border border-[#e5dacb] shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-[#1c1815] truncate">
                      {item.product.arabicName}
                    </h4>

                    {item.selectedSize && (
                      <span className="inline-block text-[10px] bg-[#f5efe4] text-[#554737] px-2 py-0.5 rounded border border-[#e4d7c5] font-medium">
                        المقاس: {item.selectedSize}
                      </span>
                    )}

                    <div className="text-xs font-bold text-[#1c1815] font-alexandria">
                      {item.product.price} <span className="font-cairo text-[10px] text-[#6d5c4b] font-normal">ج.م</span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 bg-[#f8f4ec] border border-[#ded1be] rounded-lg px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedSize)
                          }
                          className="text-[#5c4b3a] hover:text-[#1c1815] text-xs px-1 font-bold"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono text-[#1c1815] px-1">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedSize)
                          }
                          className="text-[#5c4b3a] hover:text-[#1c1815] text-xs px-1 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                        className="text-[#998673] hover:text-rose-600 p-1 transition-colors"
                        title="حذف القطعة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-[#e5dacb] bg-[#f8f4ec] space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="كود الخصم (مثال: ORMA10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="flex-1 bg-white border border-[#ded1be] rounded-xl px-3 py-2 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-[#7c6953] font-mono uppercase shadow-inner"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#1c1815] hover:bg-[#2e2620] text-[#faf8f5] font-bold text-xs transition-colors shrink-0 shadow-sm"
                  >
                    تطبيق
                  </button>
                </div>
                {promoMessage && (
                  <p
                    className={`text-[11px] flex items-center gap-1 font-bold ${
                      promoMessage.error ? "text-rose-600" : "text-emerald-700"
                    }`}
                  >
                    {promoMessage.error ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    {promoMessage.text}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-[#524436] pt-2 border-t border-[#e2d5c2]">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span className="font-bold text-[#1c1815] font-alexandria">{subtotal} ج.م</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>خصم الكوبون ({appliedPromo})</span>
                    <span>-{discountAmount} ج.م</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>مصاريف الشحن</span>
                  <span className="text-[#6d5b4a]">
                    {subtotal >= freeShippingThreshold ? "مجاناً" : "تُحدد حسب المحافظة"}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#1c1815] pt-2 border-t border-[#e2d5c2]">
                  <span>الإجمالي التقريبي</span>
                  <span className="text-lg font-black font-alexandria text-[#1c1815]">
                    {finalTotal} <span className="text-xs font-cairo font-normal">ج.م</span>
                  </span>
                </div>
              </div>

              {/* Proceed to checkout button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1c1815] text-[#faf8f5] font-bold text-sm shadow-lg shadow-[#1c1815]/15 hover:bg-[#2e2620] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

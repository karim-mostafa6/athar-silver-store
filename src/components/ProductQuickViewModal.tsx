"use client";

import React, { useState } from "react";
import { Product } from "@/data/products";
import { X, ShieldCheck, ShoppingBag, MessageCircle, Heart, Sparkles, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, size?: string, quantity?: number) => void;
  onOpenSizeGuide: () => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onOpenSizeGuide,
  onNotify,
}) => {
  const { storeSettings } = useStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.defaultSize || (product?.sizes ? product.sizes[0] : undefined)
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Lock body scroll and listen for Escape key
  React.useEffect(() => {
    if (!product) return;
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
  }, [product, onClose]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, quantity);
    setIsAdded(true);
    onNotify?.("تمت الإضافة للسلة", `تم إضافة ${quantity} × ${product.arabicName}`, "cart");
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1000);
  };

  const handleWhatsAppOrder = () => {
    const sizeText = selectedSize ? ` (المقاس: ${selectedSize})` : "";
    const qtyText = quantity > 1 ? ` (العدد: ${quantity})` : "";
    const total = product.price * quantity;
    const productUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/product/${product.id}`
        : `https://athar-silver-store.vercel.app/product/${product.id}`;
    const cleanPhone = (storeSettings?.whatsappNumber || "01143837730").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone.replace(/^0/, "")}`;
    const msg = encodeURIComponent(
      `مرحباً براند أَثَر، أود طلب: ${product.arabicName}${sizeText}${qtyText} بإجمالي ${total} ج.م.\n\n*رابط صفحة المنتج:* ${productUrl}`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#faf8f5] border border-[#d8c8b4] p-5 sm:p-8 text-[#1c1815] shadow-2xl overscroll-contain custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white border border-[#ded1be] text-[#6d5b4a] hover:text-[#1c1815] hover:bg-[#f6efe4] transition-all z-10 active:scale-90"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#f5efe4] border border-[#e5dacb] shadow-inner">
              <img
                src={product.images[selectedImage]}
                alt={product.arabicName}
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#3d3227] text-xs font-mono font-bold px-2.5 py-1 rounded border border-[#ded1be] shadow-sm">
                925 STERLING
              </span>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${
                      selectedImage === idx
                        ? "border-[#1c1815] scale-105 shadow-sm"
                        : "border-[#e5dacb] opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="صورة إضافية" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantee Box */}
            <div className="p-4 rounded-2xl bg-[#f4eee2] border border-[#e2d5c2] space-y-2 text-xs text-[#524436]">
              <div className="flex items-center gap-2 text-[#1c1815] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>ضمان ومزايا أَثَر الفاخرة:</span>
              </div>
              <ul className="space-y-1 text-[#665545] pr-5 list-disc">
                <li>{product.warrantyDuration || "فضة إسترليني أصلية عيار 925 مختومة ومضمونة."}</li>
                <li>{product.returnPolicyNote || "تغليف محكم واسترجاع خلال 14 يوماً طبقاً لسياسة الاستبدال."}</li>
                <li>تغليف فاخر في بوكس مخملي أنيق ومنديل تلميع هدية.</li>
              </ul>
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="text-right space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-[#73604f] mb-2">
                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded text-[11px] font-bold border border-emerald-200">
                  ✓ عيار 925 أصلي ومختوم
                </span>
                <span className="bg-[#f0e6d6] text-[#4d3f31] px-2.5 py-0.5 rounded text-[11px] font-bold border border-[#dfd2be]">
                  الوزن: ~{product.weightGrams} جرام
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#1c1815] font-alexandria leading-snug">
                {product.arabicName}
              </h2>

              <p className="text-xs text-[#7d6b59] font-mono mt-1">{product.name}</p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#e5dacb] shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-[#7a6857] block font-medium">السعر الحالي</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria">
                    {product.price * quantity}
                  </span>
                  <span className="text-sm font-semibold text-[#5c4c3b]">ج.م</span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#94816e] line-through">
                      {product.originalPrice * quantity} ج.م
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left">
                <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  متوفر وجاهز للشحن
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-[#57493b] leading-relaxed font-light">
              {product.description}
            </p>

            {/* Features list */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#1c1815]">أبرز المواصفات:</span>
              <div className="grid grid-cols-1 gap-1 text-xs text-[#524436]">
                {product.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8c7760]" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#e8ded0]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1c1815]">اختر المقاس:</span>
                  <button
                    type="button"
                    onClick={onOpenSizeGuide}
                    className="text-[#6d5b49] hover:text-[#1c1815] underline underline-offset-2 flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8c7760]" />
                    دليل المقاسات
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        selectedSize === s
                          ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-sm animate-pop"
                          : "bg-white text-[#524334] border-[#ded1be] hover:border-[#9c8770]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="pt-3 border-t border-[#e8ded0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1c1815]">الكمية:</span>
                <div className="flex items-center gap-3 bg-white border border-[#ded1be] rounded-xl px-2 py-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-lg text-[#524436] hover:bg-[#f6efe4] flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-[#1c1815] font-mono px-2">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-lg text-[#524436] hover:bg-[#f6efe4] flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isAdded}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-md ${
                    isAdded
                      ? "bg-emerald-600 text-white animate-pop"
                      : "bg-[#1c1815] text-[#faf8f5] hover:bg-[#2e2620]"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة للسلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#d8c8b4]" />
                      <span>أضف إلى السلة ({product.price * quantity} ج.م)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors active:scale-95 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اطلب عبر واتساب</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition-all active:scale-90 flex items-center justify-center shadow-sm ${
                    isWishlisted
                      ? "bg-rose-500 text-white border-rose-400"
                      : "bg-white border-[#ded1be] text-[#554737] hover:text-rose-500"
                  }`}
                  aria-label="المفضلة"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { Product } from "@/data/products";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Product[];
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveWishlist,
  onAddToCart,
  onNotify,
}) => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#faf8f5] border-r border-[#ded1be] text-[#1c1815] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#e5dacb] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600 fill-current" />
              <h2 className="text-lg font-bold text-[#1c1815] font-alexandria">قائمة المفضلة</h2>
              <span className="text-xs bg-[#f0e6d6] text-[#4d3f31] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#dfd2be]">
                {wishlist.length} قطع
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#786653] hover:text-[#1c1815] hover:bg-[#ede3d3] transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#f4ece0] border border-[#ded1be] flex items-center justify-center text-[#806953]">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1c1815] mb-1">لا توجد قطع في المفضلة بعد</h3>
                  <p className="text-xs text-[#705e4d] max-w-xs">
                    انقر على أيقونة القلب على أي قطعة تعجبك للرجوع إليها وحفظها في أي وقت.
                  </p>
                </div>
              </div>
            ) : (
              wishlist.map((product) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#e8ded0] flex gap-3 text-right items-center shadow-sm"
                >
                  <img
                    src={product.images[0]}
                    alt={product.arabicName}
                    className="w-20 h-20 rounded-xl object-cover bg-[#f5efe4] border border-[#e5dacb] shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-[#1c1815] truncate">
                      {product.arabicName}
                    </h4>

                    <div className="text-xs font-bold text-[#1c1815] font-alexandria">
                      {product.price}{" "}
                      <span className="font-cairo text-[10px] text-[#6d5c4b] font-normal">ج.م</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart(product);
                          onRemoveWishlist(product);
                          onNotify?.("تم النقل للسلة", `تم نقل "${product.arabicName}" إلى السلة`, "cart");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1815] text-[#faf8f5] font-bold text-[11px] hover:bg-[#2e2620] transition-all shadow-sm active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#d8c8b4]" />
                        <span>نقل إلى السلة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onRemoveWishlist(product);
                          onNotify?.("تم الحذف", `تم حذف "${product.arabicName}" من المفضلة`, "wishlist");
                        }}
                        className="text-[#998673] hover:text-rose-600 p-1 transition-colors"
                        title="حذف من المفضلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#e5dacb] bg-[#f8f4ec]">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white border border-[#ded1be] hover:bg-[#f6efe4] text-[#1c1815] font-bold text-xs transition-colors shadow-sm"
            >
              متابعة التسوق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

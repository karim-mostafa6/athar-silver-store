"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Product } from "@/data/products";
import { Heart, ShoppingBag, Eye, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onAddToCart?: (product: Product, size?: string) => void;
  onQuickView?: (product: Product) => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
}) => {
  const store = useStore();
  const [selectedSize] = useState<string | undefined>(
    product.defaultSize || (product.sizes ? product.sizes[0] : undefined)
  );
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const effectivelyWishlisted =
    isWishlisted !== undefined ? isWishlisted : store.isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, selectedSize);
    } else {
      store.addToCart(product, selectedSize);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    } else {
      store.toggleWishlist(product);
    }
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      store.setQuickViewProduct(product);
    }
  };

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <Link
      href={`/product/${product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col cursor-pointer select-none text-center block"
    >
      {/* Product Image Container with Dual-Hover Swap */}
      <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#f5f1eb] mb-3.5 transition-shadow duration-300 group-hover:shadow-[0_12px_30px_-8px_rgba(30,25,20,0.12)]">
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={product.arabicName}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
            isHovered && product.images.length > 1
              ? "opacity-0 scale-105"
              : "opacity-100 scale-100 group-hover:scale-105"
          }`}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80";
          }}
        />

        {/* Secondary Model / Angle Image on Hover */}
        {product.images.length > 1 && (
          <img
            src={secondaryImage}
            alt={`${product.arabicName} على الموديل`}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? "opacity-100 scale-105" : "opacity-0 scale-95 pointer-events-none"
            }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80";
            }}
          />
        )}

        {/* Minimal Badges: Top Left */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1 items-start">
          {product.customBadge ? (
            <span className="bg-[#1c1815] text-[#ded1be] border border-[#524436] text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider shadow-sm">
              {product.customBadge}
            </span>
          ) : product.isNew ? (
            <span className="bg-[#1c1815] text-[#faf8f5] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              NEW
            </span>
          ) : product.isBestSeller ? (
            <span className="bg-white text-[#1c1815] border border-[#ded1be] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              BEST SELLER
            </span>
          ) : null}
        </div>

        {/* Minimal Wishlist Heart: Top Right */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            effectivelyWishlisted
              ? "bg-rose-50 text-rose-500 scale-105 shadow-sm"
              : "bg-white/80 text-[#544639] opacity-0 group-hover:opacity-100 hover:bg-white hover:text-rose-500 hover:scale-110"
          }`}
          aria-label="المفضلة"
        >
          <Heart
            className={`w-3.5 h-3.5 ${effectivelyWishlisted ? "fill-current" : ""}`}
          />
        </button>

        {/* Slide-Up Action Bar on Hover */}
        <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="flex-1 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#1c1815] text-[11px] font-bold hover:bg-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 border border-[#e8ded0]"
          >
            <Eye className="w-3 h-3 text-[#73604e]" />
            <span>معاينة</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdded}
            className={`flex-1 py-2 rounded-full text-[11px] font-bold shadow-md active:scale-95 transition-all flex items-center justify-center gap-1 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#1c1815] text-[#faf8f5] hover:bg-[#332a23]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>أُضيف!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 text-[#d8c8b4]" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Centered Minimal Product Details */}
      <div className="flex flex-col items-center space-y-1 px-1">
        {/* Product Title */}
        <h3 className="text-xs sm:text-sm font-medium text-[#1c1815] group-hover:text-[#80684f] transition-colors line-clamp-1 max-w-[95%]">
          {product.arabicName}
        </h3>

        {/* Centered Price */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {product.originalPrice && (
            <span className="text-[11px] text-[#9c8976] line-through">
              {product.originalPrice} ج.م
            </span>
          )}
          <span className="text-xs sm:text-sm font-bold text-[#1c1815] font-alexandria">
            EGP {product.price.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </Link>
  );
};

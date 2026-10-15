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
      className="group flex flex-col cursor-pointer select-none text-center block transition-all duration-300"
    >
      {/* Product Image Container: Beige #D8C8B3 with Charcoal 12% border */}
      <div className="relative aspect-[4/5] w-full rounded-md overflow-hidden bg-[#D8C8B3] mb-3.5 transition-all duration-500 border border-[#292722]/12 group-hover:border-[#8E7545] group-hover:shadow-[0_12px_28px_-6px_rgba(41,39,34,0.12)]">
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
            <span className="bg-[#292722] text-[#F5F0E7] border border-[#292722]/30 text-[10px] font-medium px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
              {product.customBadge}
            </span>
          ) : product.isNew ? (
            <span className="bg-[#292722] text-[#F5F0E7] text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              NEW
            </span>
          ) : product.isBestSeller ? (
            <span className="bg-[#F5F0E7] text-[#292722] border border-[#292722]/12 text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
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
              ? "bg-rose-50 text-rose-500 scale-105 shadow-xs"
              : "bg-[#F5F0E7]/80 text-[#292722] opacity-0 group-hover:opacity-100 hover:bg-[#F5F0E7] hover:text-rose-500 hover:scale-110"
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
            className="flex-1 py-2 rounded-full bg-[#F5F0E7]/95 backdrop-blur-md text-[#292722] text-[11px] font-medium hover:bg-[#F5F0E7] shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 border border-[#292722]/12"
          >
            <Eye className="w-3 h-3 text-[#292722]/70" />
            <span>معاينة</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isAdded}
            className={`flex-1 py-2 rounded-full text-[11px] font-medium shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1 ${
              isAdded
                ? "bg-emerald-600 text-white"
                : "bg-[#292722] text-[#F5F0E7] hover:bg-[#3d3a33]"
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" />
                <span>أُضيف!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 text-[#B7A078]" />
                <span>أضف للسلة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Centered Minimal Product Details */}
      <div className="flex flex-col items-center space-y-1 px-1">
        {/* Product Title: Charcoal #292722 */}
        <h3 className="text-xs sm:text-sm font-normal text-[#292722] group-hover:text-[#8E7545] transition-colors duration-300 line-clamp-1 max-w-[95%] leading-relaxed font-amiri">
          {product.arabicName}
        </h3>

        {/* Centered Minimal Price: Gold #8E7545 */}
        <div className="flex items-center justify-center gap-1.5 pt-0.5">
          <span className="text-xs sm:text-sm font-semibold text-[#8E7545] font-cairo tracking-tight">
            {product.price.toLocaleString("en-US")}
          </span>
          <span className="text-[10px] text-[#8E7545] font-light">ج.م</span>
          {product.originalPrice && (
            <span className="text-[10px] text-[#292722]/40 line-through font-light mr-1">
              {product.originalPrice.toLocaleString("en-US")} ج.م
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

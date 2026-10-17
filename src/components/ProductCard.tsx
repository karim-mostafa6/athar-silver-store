"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/data/products";
import { Heart, ShoppingBag, Eye, Check, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { getCacheBustedImageUrl } from "@/lib/version";

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
  onAddToCart?: (product: Product, size?: string) => void;
  onQuickView?: (product: Product) => void;
  onNotify?: (title: string, msg: string, type: "cart" | "wishlist" | "promo" | "info") => void;
  /** false = no entrance animation; "fade" = opacity only (no vertical movement, so nothing jumps). */
  animateIn?: boolean | "fade" | "rise";
  /** Load the image immediately (above-the-fold cards) so it doesn't pop in late. */
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onQuickView,
  animateIn = true,
  priority = false,
}) => {
  const store = useStore();
  const [selectedSize] = useState<string | undefined>(
    product.defaultSize || (product.sizes ? product.sizes[0] : undefined)
  );
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // Phones/tablets have no real hover: a tap used to "hover" the card first (second image + action
  // buttons) and needed a second tap to open it. On touch devices the card opens straight away.
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  const effectivelyWishlisted =
    isWishlisted !== undefined ? isWishlisted : store.isWishlisted(product.id);

  const isOutOfStock =
    product.inStock === false ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
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

  const primaryImage = getCacheBustedImageUrl(product.images[0]);
  const secondaryImage = getCacheBustedImageUrl(product.images[1] || product.images[0]);

  return (
    <motion.div
      initial={animateIn === "fade" ? { opacity: 0 } : animateIn === "rise" ? { opacity: 0, y: 10 } : animateIn ? { opacity: 0, y: 24 } : false}
      whileInView={animateIn === "fade" || animateIn === "rise" ? (animateIn === "rise" ? { opacity: 1, y: 0 } : { opacity: 1 }) : animateIn ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={canHover ? { y: -6 } : undefined}
      whileTap={canHover ? undefined : { scale: 0.96, opacity: 0.85 }}
      className="group flex flex-col cursor-pointer select-none text-right block transition-all duration-300"
    >
      <Link
        href={`/product/${product.id}`}
        onMouseEnter={canHover ? () => setIsHovered(true) : undefined}
        onMouseLeave={canHover ? () => setIsHovered(false) : undefined}
        className="flex flex-col h-full"
      >
        {/* Product Image Container: Beige #D8C8B3 with Charcoal 12% border */}
        <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#D8C8B3] mb-3.5 transition-all duration-500 border border-[#292722]/12 [@media(hover:hover)]:group-hover:border-[#8E7545] [@media(hover:hover)]:group-hover:shadow-[0_18px_36px_-8px_rgba(41,39,34,0.16)]">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.arabicName}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered && product.images.length > 1
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100 [@media(hover:hover)]:group-hover:scale-105"
            }`}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
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

          {/* Subtle Luxury Sheen Sweep on Hover */}
          <div className="absolute inset-0 pointer-events-none opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-150%] [@media(hover:hover)]:group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
          </div>

          {/* Minimal Badges: Top Left */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1 items-start">
            {isOutOfStock ? (
              <span className="bg-[#292722]/95 backdrop-blur-md text-[#f7d7d7] border border-rose-500/40 text-[10px] font-tajawal font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                SOLD OUT
              </span>
            ) : product.customBadge ? (
              <span className="bg-[#292722] text-[#F5F0E7] border border-[#292722]/30 text-[10px] font-tajawal font-medium px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
                {product.customBadge}
              </span>
            ) : product.isNew ? (
              <span className="bg-[#292722] text-[#F5F0E7] text-[10px] font-tajawal font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                NEW
              </span>
            ) : product.isBestSeller ? (
              <span className="bg-[#F5F0E7] text-[#292722] border border-[#292722]/12 text-[10px] font-tajawal font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-[#8E7545]" />
                الأكثر طلباً
              </span>
            ) : null}
          </div>

          {/* Minimal Wishlist Heart: Top Right with spring animation */}
          <motion.button
            type="button"
            onClick={handleHeartClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-300 before:content-[''] before:absolute before:-inset-[7px] ${
              effectivelyWishlisted
                ? "bg-rose-50 text-rose-500 scale-105 shadow-sm"
                
                : "bg-[#F5F0E7]/85 text-[#292722] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 hover:bg-[#F5F0E7] hover:text-rose-500 hover:scale-110 shadow-xs"
            }`}
            aria-label="المفضلة"
          >
            <Heart
              className={`w-3.5 h-3.5 ${effectivelyWishlisted ? "fill-current" : ""}`}
            />
          </motion.button>

          {/* Slide-Up Action Bar on Hover (desktop only) */}
          {canHover && <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-all duration-300 transform translate-y-2 [@media(hover:hover)]:group-hover:translate-y-0 z-10">
            <motion.button
              type="button"
              onClick={handleQuickViewClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-2 rounded-full bg-[#F5F0E7]/95 backdrop-blur-md text-[#292722] text-[11px] font-tajawal font-medium hover:bg-[#F5F0E7] shadow-sm transition-all flex items-center justify-center gap-1 border border-[#292722]/12"
            >
              <Eye className="w-3 h-3 text-[#292722]/70" />
              <span>معاينة</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleAdd}
              disabled={isAdded || isOutOfStock}
              whileHover={isOutOfStock ? {} : { scale: 1.03 }}
              whileTap={isOutOfStock ? {} : { scale: 0.95 }}
              className={`flex-1 py-2 rounded-full text-[11px] font-tajawal font-medium shadow-sm transition-all flex items-center justify-center gap-1 ${
                isOutOfStock
                  ? "bg-stone-300 text-stone-600 cursor-not-allowed border border-stone-300"
                  : isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-[#292722] text-[#F5F0E7] hover:bg-[#3d3a33]"
              }`}
            >
              <AnimatePresence mode="wait">
                {isOutOfStock ? (
                  <span className="font-tajawal text-[10px] font-bold">غير متوفر</span>
                ) : isAdded ? (
                  <motion.div
                    key="added"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>أُضيف!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3 h-3 text-[#B7A078]" />
                    <span>أضف للسلة</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>}
        </div>

        {/* Centered Minimal Product Details */}
        <div className="flex flex-col items-start space-y-1.5 px-1 mt-auto">
          {/* Product Title: Charcoal #292722 */}
          <h3 className="text-sm sm:text-[15px] font-cairo font-semibold text-[#292722] [@media(hover:hover)]:group-hover:text-[#8E7545] transition-colors duration-300 line-clamp-2 w-full leading-relaxed">
            {product.arabicName}
          </h3>

          {/* Centered Minimal Price: Gold #8E7545 */}
          <div className="flex items-baseline justify-start gap-1.5 pt-0.5">
            <span className="text-sm sm:text-base font-tajawal font-bold text-[#292722] tracking-tight">
              {product.price.toLocaleString("en-US")}
            </span>
            <span className="text-[11px] text-[#292722] font-tajawal font-medium">ج.م</span>
            {product.originalPrice && (
              <span className="text-[11px] text-[#292722]/40 line-through font-tajawal font-normal mr-1">
                {product.originalPrice.toLocaleString("en-US")} ج.م
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

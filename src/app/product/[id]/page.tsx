"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import {
  Heart,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Check,
  Share2,
  Scale,
  AlertCircle,
} from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const {
    products,
    storeSettings,
    addToCart,
    toggleWishlist,
    isWishlisted,
    setIsSizeGuideOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    addToast,
  } = useStore();

  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [productId, products]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const dragRef = React.useRef(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.defaultSize || (product?.sizes ? product.sizes[0] : undefined)
  );
  const [engravingText, setEngravingText] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"specs" | "shipping" | "care" | null>("specs");
  // Sticky mobile buy bar: shown only once the main "add to bag" button has scrolled out of view.
  const addBtnRef = useRef<HTMLButtonElement | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const el = addBtnRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [productId, product]);

  if (!product) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center px-4 space-y-4">
        <h1 className="text-2xl font-bold text-[#292722]">القطعة غير متوفرة حالياً</h1>
        <p className="text-xs text-[#705e4d]">
          عذراً، لم نتمكن من العثور على هذه القطعة. يمكنك استكشاف بقية تشكيلة أورما الفاخرة.
        </p>
        <Link
          href="/collection/all"
          className="inline-block px-8 py-3 rounded-full bg-[#292722] text-[#F5F0E7] text-xs font-bold"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const effectivelyWishlisted = isWishlisted(product.id);

  // Smart Product Attribute Detection: Ring vs Weight-based piece
  const isRingProduct = Boolean(
    product.category === "rings" ||
    product.category?.toLowerCase().includes("ring") ||
    product.arabicName?.includes("خاتم") ||
    product.arabicName?.includes("دبل") ||
    (product.collections || []).some(
      (c) => c === "rings" || c.toLowerCase().includes("ring") || c.includes("خواتم")
    )
  );

  const isOutOfStock =
    product.inStock === false ||
    (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const handleBuyNow = () => {
    if (isOutOfStock) {
      addToast("تنبيه", "هذه القطعة غير متوفرة حالياً بالمخزن", "info");
      return;
    }
    let effectiveSize = isRingProduct ? selectedSize : undefined;
    if (engravingText.trim()) {
      effectiveSize = effectiveSize
        ? `${effectiveSize} (نقش ليزر: ${engravingText.trim()})`
        : `نقش ليزر: ${engravingText.trim()}`;
    }
    addToCart(product, effectiveSize, quantity);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      addToast("تنبيه", "هذه القطعة غير متوفرة حالياً بالمخزن", "info");
      return;
    }
    let effectiveSize = isRingProduct ? selectedSize : undefined;
    if (engravingText.trim()) {
      effectiveSize = effectiveSize
        ? `${effectiveSize} (نقش ليزر: ${engravingText.trim()})`
        : `نقش ليزر: ${engravingText.trim()}`;
    }
    addToCart(product, effectiveSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWhatsAppOrder = () => {
    const sizeText = (isRingProduct && selectedSize) ? ` (المقاس: ${selectedSize})` : "";
    const productUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://orma-silver.vercel.app/product/${product.id}`;
    const cleanPhone = (storeSettings.whatsappNumber || "01143837730").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone.replace(/^0/, "")}`;
    const msg = encodeURIComponent(
      `مرحباً دار ORMA، أود طلب هذه القطعة الفاخرة:\n\n*القطعة:* ${product.arabicName}\n*الكود:* ${
        product.sku || product.id
      }\n${sizeText ? `*المقاس:* ${selectedSize}\n` : ""}*الكمية:* ${quantity}\n*الإجمالي:* ${
        product.price * quantity
      } ج.م.\n\n*رابط صفحة المنتج:* ${productUrl}`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.arabicName,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("تم نسخ الرابط", "رابط القطعة جاهز للمشاركة الآن", "info");
    }
  };

  // Related products (same category or gender)
  const relatedProducts = products.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.gender === product.gender)
  ).slice(0, 5);

  return (
    <>
    <div className="pt-8 sm:pt-12 pb-28 lg:pb-12 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 animate-fade-in-up">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[13px] text-[#7d6c5c] mb-6 font-tajawal">
        <Link href="/" className="hover:text-[#292722] transition-colors">
          الرئيسية
        </Link>
        <span className="text-[#c4b5a5]">/</span>
        <Link
          href={`/collection/${product.gender === "women" ? "women" : product.gender === "men" ? "men" : "all"}`}
          className="hover:text-[#292722] transition-colors"
        >
          {product.gender === "women" ? "تشكيلة نسائية" : product.gender === "men" ? "تشكيلة رجالية" : "كافة القطع"}
        </Link>
        <span className="text-[#c4b5a5]">/</span>
        <span className="text-[#292722] font-normal line-clamp-1">{product.arabicName}</span>
      </nav>

      {/* Main 2-Column Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Right Column (Image Gallery) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col lg:flex-row-reverse gap-4">
          {/* Main Large Display Image */}
          <div
            data-gallery="main"
            className="relative aspect-square w-full lg:flex-1 min-w-0 rounded-[24px] overflow-hidden bg-[#E3D6C2] select-none"
            style={{ touchAction: "pan-y" }}
            onTouchStart={(e) => {
              touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              dragRef.current = 0;
              setDragX(0);
            }}
            onTouchMove={(e) => {
              const st = touchStart.current;
              if (!st || product.images.length < 2) return;
              const dx = e.touches[0].clientX - st.x;
              const dy = e.touches[0].clientY - st.y;
              if (Math.abs(dx) > Math.abs(dy)) {
                dragRef.current = dx;
                setDragX(dx);
              }
            }}
            onTouchEnd={() => {
              const n = product.images.length;
              if (touchStart.current && n > 1 && Math.abs(dragRef.current) > 45) {
                const left = dragRef.current < 0;
                setActiveImageIdx((i) => (left ? (i + 1) % n : (i - 1 + n) % n));
              }
              touchStart.current = null;
              dragRef.current = 0;
              setDragX(0);
            }}
            onTouchCancel={() => {
              touchStart.current = null;
              setDragX(0);
            }}
          >
            <img
              draggable={false}
              style={{ transform: dragX ? `translateX(${dragX * 0.35}px)` : undefined, transition: dragX ? "none" : "transform .25s ease" }}
              key={activeImageIdx}
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.arabicName}
              className="img-fade-in w-full h-full object-cover object-center"
              width={800}
              height={800}
              fetchPriority="high"
              decoding="async"
            />

            {product.images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10 lg:hidden pointer-events-none">
                {product.images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === activeImageIdx ? "w-5 bg-[#292722]" : "w-1.5 bg-[#292722]/35"}`}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              {isOutOfStock ? (
                <span className="bg-[#292722]/95 backdrop-blur-md text-[#f7d7d7] border border-rose-500/50 text-[11px] font-sans font-bold px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-pulse" />
                  SOLD OUT • نفد من المخزون
                </span>
              ) : (
                <span className="bg-[#F5F0E7] text-[#292722] border border-[#292722]/14 text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 tracking-[0.06em]">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  925 STERLING SILVER
                </span>
              )}
              {discountPercent > 0 && !isOutOfStock && (
                <span className="bg-[#292722] text-[#F5F0E7] text-xs px-3.5 py-1.5 rounded-full">
                  خصم {discountPercent}%
                </span>
              )}
            </div>

            {/* Share & Wishlist Floating Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 shadow-md ${
                  effectivelyWishlisted
                    ? "bg-rose-50 text-rose-500 border-rose-200"
                    : "bg-white/90 text-[#544639] border-[#ded1be] hover:bg-white hover:text-rose-500"
                }`}
                aria-label="المفضلة"
              >
                <Heart className={`w-4 h-4 ${effectivelyWishlisted ? "fill-current" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-white/90 backdrop-blur-md border border-[#ded1be] text-[#544639] hover:bg-white hover:text-[#292722] transition-all shadow-md active:scale-90"
                aria-label="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails Gallery Strip */}
          {product.images.length > 1 && (
            <div className="flex lg:flex-col items-center gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none lg:w-[92px] shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-20 lg:w-full lg:h-auto lg:aspect-square rounded-[14px] overflow-hidden shrink-0 border transition-all duration-300 ${
                    activeImageIdx === idx
                      ? "border-[#292722] border-2"
                      : "border-[#292722]/12 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" width={80} height={80} loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          )}

          </div>

        </div>

        {/* Left Column (Product Details & Actions) */}
        <div className="lg:col-span-5 space-y-6 text-right lg:sticky lg:top-28">
          <div>
            {/* Hallmark Tag */}
            <div className="eyebrow text-base mb-2">
              ORMA Exclusive • {product.purity}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[38px] font-light text-[#292722] font-cairo leading-[1.4] tracking-tight">
              {product.arabicName}
            </h1>

            {/* English Title & Hallmark */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-3 border-t border-[#eee5d8]">
              <span className="text-xs text-[#705e4d] font-sans font-light tracking-wide">
                {product.name}
                {product.sku ? <span className="mx-2 text-[#c5a880]">•</span> : null}
                {product.sku ? <span data-sku className="font-mono tracking-wider">كود: {product.sku}</span> : null}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#524436] bg-[#f8f5f0] px-3 py-1 rounded-full text-[11px] font-normal border border-[#ded1be]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                فضة إسترليني أصلية عيار 925
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="py-5 border-y border-[#292722]/12">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-semibold text-[#292722] font-cairo">
                  {product.price.toLocaleString("en-US")}
                </span>
                <span className="text-[15px] font-normal text-[#292722]">ج.م</span>
                {product.originalPrice && (
                  <span className="text-xs text-[#9e8d7c] line-through mr-2 font-light">
                    {product.originalPrice.toLocaleString("en-US")} ج.م
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="text-[11px] font-medium text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                    نفد من المخزون مؤقتاً
                  </span>
                ) : (
                  <span className="text-[13px] text-[#2f6b4a] bg-[#e6efe8] px-3 py-1 rounded-full">
                    متوفر بالمخزن
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[11px] font-normal text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full">
                    وفر {discountPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Smart Product Attributes: Size Selector ONLY for rings/bands */}
          {isRingProduct && product.sizes && product.sizes.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sm text-[#292722]">المقاس</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#8E7545] border-b border-[#8E7545] flex items-center gap-1 font-normal transition-colors"
                >
                  <span>دليل المقاسات</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[56px] h-12 px-4 rounded-xl text-[15px] border transition-all duration-300 active:scale-95 ${
                      selectedSize === s
                        ? "bg-[#292722] text-[#F5F0E7] border-[#292722]"
                        : "bg-transparent text-[#292722] border-[#292722]/25 hover:border-[#292722]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : !isRingProduct ? (
            /* Chains, bracelets, and weight-based pieces */
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf6f0] border border-[#ece4d8] text-xs">
              <div className="flex items-center gap-2 text-[#524436]">
                <Scale className="w-4 h-4 text-[#8c7865]" />
                <span className="font-medium">الوزن الصافي:</span>
                <span className="font-bold text-[#292722]">~{product.weightGrams || 5} جرام فضة 925</span>
              </div>
              <span className="text-[11px] text-[#8c7865] bg-white px-2.5 py-0.5 rounded-full border border-[#ded1be]">
                مقاس مريح قياسي
              </span>
            </div>
          ) : null}

          {/* Custom Laser Engraving Input Card */}
          {product.customEngravingAvailable && (
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#292722] flex items-center gap-1.5">
                  <span>نقش ليزر مجاني (اختياري)</span>
                </span>
                <span className="text-[10px] text-[#8c7865] font-sans">
                  {(product.customEngravingMaxChars || 12) - engravingText.length} حرف متبقي
                </span>
              </div>
              <input
                type="text"
                maxLength={product.customEngravingMaxChars || 12}
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                placeholder="اسم أو تاريخ - حتى 12 حرف"
                className="w-full h-[50px] px-4 rounded-xl bg-[#fbf8f3] border border-[#292722]/25 text-[15px] font-normal text-[#292722] placeholder:text-[#a09080] placeholder:font-light focus:outline-none focus:border-[#292722] transition-colors"
              />
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            {isOutOfStock ? (
              <div className="space-y-3">
                <div className="w-full py-4 px-6 rounded-2xl bg-stone-200 text-stone-600 font-medium text-xs tracking-wider flex items-center justify-center gap-2 cursor-not-allowed border border-stone-300">
                  <AlertCircle className="w-4 h-4 text-stone-500" />
                  <span>نفد من المخزون مؤقتاً • SOLD OUT</span>
                </div>
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#292722] hover:bg-[#2c241e] text-white text-xs font-medium tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#d8c8b4]" />
                  <span>تواصل معنا للاستفسار عن توفره عبر واتساب</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#292722]/25 rounded-full h-14">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-14 rounded-full flex items-center justify-center text-xl text-[#292722] active:scale-90 transition-colors"
                    >
                      -
                    </button>
                    <span className="min-w-[28px] text-center font-bold text-[#292722]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-14 rounded-full flex items-center justify-center text-xl text-[#292722] active:scale-90 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    ref={addBtnRef}
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`flex-1 h-14 px-6 rounded-full font-bold text-[15px] transition-all duration-300 active:scale-95 btn-shine flex items-center justify-center gap-2 ${
                      isAdded
                        ? "bg-[#2f6b4a] text-white"
                        : "bg-[#292722] hover:bg-[#1E1C18] text-[#F5F0E7]"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تمت الإضافة للسلة!</span>
                      </>
                    ) : (
                      <>
                        <span>أضف إلى السلة</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buy it now: straight to checkout */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full h-14 px-6 rounded-full bg-[#8E7545] hover:bg-[#7a6439] text-white font-bold text-[15px] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>اشتري الآن</span>
                </button>

                {/* Direct WhatsApp Order Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full h-[52px] px-6 rounded-full border border-[#2f6b4a] text-[#2f6b4a] hover:bg-[#2f6b4a] hover:text-white font-bold text-[15px] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>اطلب عبر واتساب</span>
                </button>
              </>
            )}
          </div>

          {/* Trust grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["فضة 925 أصلية", product.warrantyDuration || "ضمان رسمي معتمد"],
              ["شحن لكل مصر", "2–4 أيام عمل"],
              ["استرجاع واستبدال", `خلال ${storeSettings.returnPolicyDays || 14} يوماً`],
              ["تغليف هدية مجاني", "علبة وكارت إهداء"],
            ].map(([t, d]) => (
              <div key={t} className="p-4 rounded-[14px] border border-[#292722]/12 text-[13px] leading-[1.7] text-[#5c5346]">
                <b className="block text-sm text-[#292722]">{t}</b>
                {d}
              </div>
            ))}
          </div>

          {/* Expandable Accordions */}
          <div className="border-t border-[#292722]/12">
            {/* Spec Accordion */}
            <div className="border-b border-[#292722]/12 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "specs" ? null : "specs")}
                className="w-full min-h-[56px] text-right flex items-center justify-between text-[15px] font-bold text-[#292722]"
              >
                <span>المواصفات وتفاصيل الصياغة</span>
                <span aria-hidden="true">{openAccordion === "specs" ? "−" : "+"}</span>
              </button>
              {openAccordion === "specs" && (
                <div className="pb-5 text-sm text-[#5c5346] space-y-2 leading-[2] animate-fade-in">
                  <p>{product.description}</p>
                  <ul className="list-disc list-inside space-y-1 pt-1 text-[#5c4b3a]">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                    <li>الوزن التقريبي: ~{product.weightGrams} جرام من الفضة النقية</li>
                    <li>عيار الفضة: 925 إسترليني معتمد ومختوم</li>
                    {product.warrantyDuration && (
                      <li className="font-medium text-emerald-800">الضمان: {product.warrantyDuration}</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Shipping Accordion */}
            <div className="border-b border-[#292722]/12 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                className="w-full min-h-[56px] text-right flex items-center justify-between text-[15px] font-bold text-[#292722]"
              >
                <span>الشحن والتوصيل</span>
                <span aria-hidden="true">{openAccordion === "shipping" ? "−" : "+"}</span>
              </button>
              {openAccordion === "shipping" && (
                <div className="pb-5 text-sm text-[#5c5346] space-y-2 leading-[2] animate-fade-in">
                  <p>
                    • <strong className="font-medium text-[#292722]">تغليف محكم ومؤمن:</strong>{" "}
                    تصلك الشحنة في بوكس ORMA المخملي الملكي ومغلفة بشرائط أمان محكمة لضمان وصول القطعة جديدة وبأعلى درجات الخصوصية.
                  </p>
                  <p>
                    • <strong className="font-medium text-[#292722]">مدة التوصيل:</strong>{" "}
                    {storeSettings.shippingPolicyTimeline || "24-48 ساعة للقاهرة والجيزة، و2-4 أيام لباقي محافظات مصر."}
                  </p>
                  <p>
                    • <strong className="font-medium text-[#292722]">الاستبدال والاسترجاع:</strong>{" "}
                    {product.returnPolicyNote ||
                      storeSettings.returnPolicyText ||
                      `متاح مجاناً خلال ${storeSettings.returnPolicyDays || 14} يوماً من الاستلام.`}
                  </p>
                </div>
              )}
            </div>

            {/* Care Accordion */}
            <div className="border-b border-[#292722]/12 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                className="w-full min-h-[56px] text-right flex items-center justify-between text-[15px] font-bold text-[#292722]"
              >
                <span>العناية بالقطعة</span>
                <span aria-hidden="true">{openAccordion === "care" ? "−" : "+"}</span>
              </button>
              {openAccordion === "care" && (
                <div className="pb-5 text-sm text-[#5c5346] space-y-2 leading-[2] animate-fade-in">
                  <p>• تجنب رش العطور أو مستحضرات التجميل الكيميائية المباشرة على الفضة.</p>
                  <p>• احفظ قطعتك في علبة مخملية جافة أو كيس محكم لحمايتها من الرطوبة عند عدم ارتدائها.</p>
                  <p>• استخدم منديل تلميع الفضة المجاني المرفق في شحنتك لاستعادة البريق فوراً.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Carousel/Grid */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-4">
          <h2 className="mb-8 text-3xl sm:text-4xl font-light text-[#292722] font-cairo">قطع تكمّل إطلالتك</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} animateIn={false} priority />
            ))}
          </div>
        </section>
      )}
    </div>

      {/* Sticky mobile buy bar */}
      {!isOutOfStock && (
        <div
          className={`lg:hidden fixed inset-x-0 bottom-0 z-30 bg-[#F5F0E7]/95 backdrop-blur border-t border-[#e8ded0] pl-4 pr-[84px] pt-3 transition-transform duration-300 ${
            showStickyBar ? "translate-y-0" : "translate-y-full pointer-events-none"
          }`}
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          aria-hidden={!showStickyBar}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0 text-right leading-tight">
              <div className="text-base font-bold text-[#292722]">{(product.price * quantity).toLocaleString("en-US")} ج.م</div>
              {quantity > 1 && <div className="text-[10px] text-[#8a7663]">{quantity} قطع</div>}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              tabIndex={showStickyBar ? 0 : -1}
              className={`flex-1 min-h-[48px] rounded-2xl text-xs font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 ${
                isAdded ? "bg-emerald-600 text-white" : "bg-[#292722] text-[#F5F0E7]"
              }`}
            >
              {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4 text-[#d8c8b4]" />}
              <span>{isAdded ? "تمت الإضافة" : "أضف إلى السلة"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

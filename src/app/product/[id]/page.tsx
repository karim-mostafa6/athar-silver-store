"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Gift,
  Heart,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  Ruler,
  Share2,
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
    addToast,
  } = useStore();

  const product = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [productId, products]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.defaultSize || (product?.sizes ? product.sizes[0] : undefined)
  );
  const [selectedPlating, setSelectedPlating] = useState<"silver" | "gold" | "rosegold">("silver");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<"specs" | "shipping" | "care" | null>("specs");

  if (!product) {
    return (
      <div className="py-24 max-w-xl mx-auto text-center px-4 space-y-4">
        <h1 className="text-2xl font-bold text-[#1c1815]">القطعة غير متوفرة حالياً</h1>
        <p className="text-xs text-[#705e4d]">
          عذراً، لم نتمكن من العثور على هذه القطعة. يمكنك استكشاف بقية تشكيلة أَثَـر الفاخرة.
        </p>
        <Link
          href="/collection/all"
          className="inline-block px-8 py-3 rounded-full bg-[#1c1815] text-[#faf8f5] text-xs font-bold"
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

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 600);
  };

  const handleWhatsAppOrder = () => {
    const sizeText = selectedSize ? ` (المقاس: ${selectedSize})` : "";
    const platingText =
      selectedPlating === "gold"
        ? " [مطلي ذهب 18K]"
        : selectedPlating === "rosegold"
        ? " [مطلي روز جولد]"
        : " [فضة 925 طبيعية]";
    const msg = encodeURIComponent(
      `مرحباً براند أَثَر، أود طلب: ${product.arabicName}${sizeText}${platingText} (الكمية: ${quantity}) بسعر ${
        product.price * quantity
      } ج.م.\nرابط القطعة: ${product.images[activeImageIdx] || product.images[0]}`
    );
    window.open(`https://wa.me/${storeSettings.whatsappNumber}?text=${msg}`, "_blank");
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
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#705e4d] mb-8 font-medium">
        <Link href="/" className="hover:text-[#1c1815] transition-colors">
          الرئيسية
        </Link>
        <span>/</span>
        <Link
          href={`/collection/${product.gender === "women" ? "women" : product.gender === "men" ? "men" : "all"}`}
          className="hover:text-[#1c1815] transition-colors"
        >
          {product.gender === "women" ? "تشكيلة نسائية" : product.gender === "men" ? "تشكيلة رجالية" : "كافة القطع"}
        </Link>
        <span>/</span>
        <span className="text-[#1c1815] font-bold line-clamp-1">{product.arabicName}</span>
      </nav>

      {/* Main 2-Column Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Right Column (Image Gallery) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Display Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#f5f1eb] border border-[#ece4d8] shadow-sm">
            <img
              src={product.images[activeImageIdx] || product.images[0]}
              alt={product.arabicName}
              className="w-full h-full object-cover object-center transition-all duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              <span className="bg-white/95 backdrop-blur-md text-[#1c1815] border border-[#ded1be] text-[11px] font-mono font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-600" />
                925 STERLING SILVER
              </span>
              {discountPercent > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
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
                className="p-3 rounded-full bg-white/90 backdrop-blur-md border border-[#ded1be] text-[#544639] hover:bg-white hover:text-[#1c1815] transition-all shadow-md active:scale-90"
                aria-label="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails Gallery Strip */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    activeImageIdx === idx
                      ? "border-[#1c1815] scale-105 shadow-md"
                      : "border-[#e8ded0] opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 4 Mini Trust Badges Below Gallery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#eee5d8] text-center">
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1">
              <ShieldCheck className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-bold text-[#1c1815]">فضة 925 أصلية</div>
              <div className="text-[9px] text-[#705e4d]">مختومة ومضمونة</div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1">
              <Truck className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-bold text-[#1c1815]">شحن لجميع مصر</div>
              <div className="text-[9px] text-[#705e4d]">2-4 أيام عمل</div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1">
              <RotateCcw className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-bold text-[#1c1815]">معاينة عند الاستلام</div>
              <div className="text-[9px] text-[#705e4d]">قبل السداد التام</div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1">
              <Gift className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-bold text-[#1c1815]">تغليف ملكي مجاني</div>
              <div className="text-[9px] text-[#705e4d]">علبة وكارت إهداء</div>
            </div>
          </div>
        </div>

        {/* Left Column (Product Details & Actions) */}
        <div className="lg:col-span-6 space-y-6 text-right">
          <div>
            {/* Hallmark Tag */}
            <div className="text-[11px] font-mono tracking-widest text-[#8a7663] uppercase mb-2">
              ATHAR EXCLUSIVE • {product.purity}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-alexandria leading-snug">
              {product.arabicName}
            </h1>

            {/* English Title & Reviews */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-2 border-t border-[#eee5d8]">
              <span className="text-xs text-[#705e4d] font-mono">{product.name}</span>
              <div className="flex items-center gap-1.5 text-xs text-[#705e4d]">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-[#1c1815]">{product.rating.toFixed(1)}</span>
                <span>({product.reviewsCount} تقييم حقيقي)</span>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-5 rounded-2xl bg-white border border-[#ece4d8] flex items-center justify-between">
            <div className="text-right">
              {product.originalPrice && (
                <span className="text-xs text-[#8c7a67] line-through block mb-1">
                  EGP {product.originalPrice.toLocaleString("en-US")}
                </span>
              )}
              <div className="text-2xl sm:text-3xl font-black text-[#1c1815] font-alexandria">
                EGP {product.price.toLocaleString("en-US")}
              </div>
            </div>
            <div className="text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                متوفر للشحن الفوري ✓
              </span>
              <div className="text-[10px] text-[#705e4d] mt-1">شامل الدمغة والعلبة الفاخرة</div>
            </div>
          </div>

          {/* Plating Finish Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1c1815]">
              نوع الطلاء والتشطيب:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlating("silver")}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  selectedPlating === "silver"
                    ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-sm"
                    : "bg-white text-[#5c4d3f] border-[#e2d5c2] hover:bg-[#f6efe4]"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400" />
                <span>فضة 925 نقية</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlating("gold")}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  selectedPlating === "gold"
                    ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-sm"
                    : "bg-white text-[#5c4d3f] border-[#e2d5c2] hover:bg-[#f6efe4]"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500" />
                <span>مطلي ذهب 18K</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlating("rosegold")}
                className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  selectedPlating === "rosegold"
                    ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-sm"
                    : "bg-white text-[#5c4d3f] border-[#e2d5c2] hover:bg-[#f6efe4]"
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-300 border border-rose-400" />
                <span>مطلي روز جولد</span>
              </button>
            </div>
          </div>

          {/* Size Selector (If applicable) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1c1815]">اختر المقاس:</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#7d6852] hover:text-[#1c1815] underline decoration-[#d8c8b4] flex items-center gap-1 font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>دليل مقاسات الخواتم</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] py-2 px-3.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                      selectedSize === s
                        ? "bg-[#1c1815] text-[#faf8f5] border-[#1c1815] shadow-sm"
                        : "bg-white text-[#5c4d3f] border-[#ded2c0] hover:border-[#8f7a62]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex items-center bg-white border border-[#ded2c0] rounded-2xl p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-[#5c4d3f] hover:bg-[#f4ece0] active:scale-90"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-[#1c1815] font-mono">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-[#5c4d3f] hover:bg-[#f4ece0] active:scale-90"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 shadow-lg flex items-center justify-center gap-2 ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1c1815] hover:bg-[#302822] text-[#faf8f5] shadow-[#1c1815]/15"
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
                    <span>أضف إلى السلة • ADD TO BAG</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct WhatsApp Order Button */}
            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>اطلب فوراً عبر واتساب • ORDER VIA WHATSAPP</span>
            </button>
          </div>

          {/* Expandable Accordions */}
          <div className="border-t border-[#eee5d8] pt-4 space-y-3">
            {/* Spec Accordion */}
            <div className="border border-[#ece4d8] rounded-2xl bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "specs" ? null : "specs")}
                className="w-full p-4 text-right flex items-center justify-between text-xs font-bold text-[#1c1815]"
              >
                <span>مواصفات القطعة وتفاصيل الصياغة</span>
                {openAccordion === "specs" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === "specs" && (
                <div className="px-4 pb-4 text-xs text-[#6e5d4d] space-y-2 border-t border-[#f4eee4] pt-3 leading-relaxed">
                  <p>{product.description}</p>
                  <ul className="list-disc list-inside space-y-1 pt-1 text-[#5c4b3a]">
                    {product.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                    <li>الوزن التقريبي: ~{product.weightGrams} جرام من الفضة النقية</li>
                    <li>عيار الفضة: 925 إسترليني معتمد ومختوم</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Shipping Accordion */}
            <div className="border border-[#ece4d8] rounded-2xl bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                className="w-full p-4 text-right flex items-center justify-between text-xs font-bold text-[#1c1815]"
              >
                <span>الشحن والمعاينة والاستبدال</span>
                {openAccordion === "shipping" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === "shipping" && (
                <div className="px-4 pb-4 text-xs text-[#6e5d4d] space-y-2 border-t border-[#f4eee4] pt-3 leading-relaxed">
                  <p>• <strong>معاينة كاملة:</strong> يحق لك فتح الشحنة ومعاينة الفضة والتأكد من مطابقتها قبل دفع أي مبلغ للمندوب.</p>
                  <p>• <strong>مدة التوصيل:</strong> 24-48 ساعة للقاهرة والجيزة، و2-4 أيام لباقي محافظات مصر.</p>
                  <p>• <strong>الاستبدال والاسترجاع:</strong> متاح مجاناً خلال 14 يوماً من الاستلام.</p>
                </div>
              )}
            </div>

            {/* Care Accordion */}
            <div className="border border-[#ece4d8] rounded-2xl bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                className="w-full p-4 text-right flex items-center justify-between text-xs font-bold text-[#1c1815]"
              >
                <span>إرشادات الحفاظ على لمعان الفضة</span>
                {openAccordion === "care" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === "care" && (
                <div className="px-4 pb-4 text-xs text-[#6e5d4d] space-y-2 border-t border-[#f4eee4] pt-3 leading-relaxed">
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
        <section className="mt-20 pt-16 border-t border-[#e8ded0]">
          <div className="text-center mb-10 space-y-2">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8a7663] uppercase">
              RECOMMENDED FOR YOU
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-alexandria">
              قطع أخرى قد تنال إعجابك
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

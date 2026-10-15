"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ProductCard";
import {
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
  const [engravingText, setEngravingText] = useState<string>("");
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
    let effectiveSize = selectedSize;
    if (engravingText.trim()) {
      effectiveSize = effectiveSize
        ? `${effectiveSize} (نقش ليزر: ${engravingText.trim()})`
        : `نقش ليزر: ${engravingText.trim()}`;
    }
    addToCart(product, effectiveSize, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 600);
  };

  const handleWhatsAppOrder = () => {
    const sizeText = selectedSize ? ` (المقاس: ${selectedSize})` : "";
    const productUrl =
      typeof window !== "undefined"
        ? window.location.href
        : `https://athar-silver-store.vercel.app/product/${product.id}`;
    const cleanPhone = (storeSettings.whatsappNumber || "01143837730").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("20") ? cleanPhone : `20${cleanPhone.replace(/^0/, "")}`;
    const msg = encodeURIComponent(
      `مرحباً دار ORMA، أود طلب هذه القطعة الفاخرة:\n\n*القطعة:* ${product.arabicName}\n*الكود:* ${
        product.id
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
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#7d6c5c] mb-8 font-light">
        <Link href="/" className="hover:text-[#1c1815] transition-colors">
          الرئيسية
        </Link>
        <span className="text-[#c4b5a5]">/</span>
        <Link
          href={`/collection/${product.gender === "women" ? "women" : product.gender === "men" ? "men" : "all"}`}
          className="hover:text-[#1c1815] transition-colors"
        >
          {product.gender === "women" ? "تشكيلة نسائية" : product.gender === "men" ? "تشكيلة رجالية" : "كافة القطع"}
        </Link>
        <span className="text-[#c4b5a5]">/</span>
        <span className="text-[#1c1815] font-normal line-clamp-1">{product.arabicName}</span>
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
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              <span className="bg-white/95 backdrop-blur-md text-[#1c1815] border border-[#ded1be] text-[11px] font-sans font-medium px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-600" />
                925 STERLING SILVER
              </span>
              {discountPercent > 0 && (
                <span className="bg-[#1c1815] text-[#faf8f5] text-[10px] font-medium px-2.5 py-0.5 rounded-full shadow-sm tracking-wider">
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
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${
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
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1 hover-lift transition-all">
              <ShieldCheck className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-medium text-[#1c1815]">فضة 925 أصلية</div>
              <div className="text-[10px] text-[#705e4d] font-light truncate" title={product.warrantyDuration || storeSettings.warrantyPolicyText}>
                {product.warrantyDuration || storeSettings.warrantyPolicyText || "ضمان رسمي معتمد"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1 hover-lift transition-all">
              <Truck className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-medium text-[#1c1815]">شحن لجميع مصر</div>
              <div className="text-[10px] text-[#705e4d] font-light truncate" title={storeSettings.shippingPolicyTimeline}>
                {storeSettings.shippingPolicyTimeline || "2-4 أيام عمل"}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1 hover-lift transition-all">
              <RotateCcw className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-medium text-[#1c1815]">
                استرجاع واستبدال
              </div>
              <div className="text-[10px] text-[#705e4d] font-light">
                خلال {storeSettings.returnPolicyDays || 14} يوماً
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#ece4d8] space-y-1 hover-lift transition-all">
              <Gift className="w-4 h-4 text-[#705e4d] mx-auto" />
              <div className="text-[11px] font-medium text-[#1c1815]">تغليف ملكي مجاني</div>
              <div className="text-[10px] text-[#705e4d] font-light">علبة وكارت إهداء</div>
            </div>
          </div>
        </div>

        {/* Left Column (Product Details & Actions) */}
        <div className="lg:col-span-6 space-y-6 text-right">
          <div>
            {/* Hallmark Tag */}
            <div className="text-[11px] font-sans tracking-[0.2em] text-[#8a7663] uppercase mb-2 font-light">
              ORMA EXCLUSIVE • {product.purity}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-light text-[#1c1815] font-cairo leading-relaxed tracking-tight">
              {product.arabicName}
            </h1>

            {/* English Title & Hallmark */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-2 pt-3 border-t border-[#eee5d8]">
              <span className="text-xs text-[#705e4d] font-sans font-light tracking-wide">{product.name}</span>
              <span className="inline-flex items-center gap-1.5 text-[#524436] bg-[#f8f5f0] px-3 py-1 rounded-full text-[11px] font-normal border border-[#ded1be]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                فضة إسترليني أصلية عيار 925
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-5 rounded-2xl bg-white border border-[#ece4d8] shadow-[0_2px_15px_rgba(28,24,21,0.02)]">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-light text-[#1c1815] font-cairo tracking-tight">
                  {product.price.toLocaleString("en-US")}
                </span>
                <span className="text-xs font-normal text-[#8c7865] tracking-wider">ج.م</span>
                {product.originalPrice && (
                  <span className="text-xs text-[#9e8d7c] line-through mr-2 font-light">
                    {product.originalPrice.toLocaleString("en-US")} ج.م
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <span className="text-[11px] font-normal text-rose-700 bg-rose-50 border border-rose-200/70 px-2.5 py-0.5 rounded-full">
                  وفر {discountPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Size Selector (If applicable) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#1c1815]">اختر المقاس:</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-[#7d6852] hover:text-[#1c1815] underline decoration-[#d8c8b4] flex items-center gap-1 font-normal transition-colors"
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
                    className={`min-w-[46px] py-2 px-3.5 rounded-xl text-xs font-medium border transition-all duration-300 active:scale-95 ${
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

          {/* Custom Laser Engraving Input Card */}
          {product.customEngravingAvailable && (
            <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#e2d5c2] space-y-2 text-right">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1c1815] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#8c7865]" />
                  <span>خدمة النقش والحفر بالليزر على الفضة:</span>
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
                placeholder="اكتب الاسم أو التاريخ أو الحرف المطلوب نقشه..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#d8c8b4] text-xs font-normal text-[#1c1815] placeholder:text-[#a09080] placeholder:font-light focus:outline-none focus:border-[#1c1815] transition-colors"
              />
              <p className="text-[10px] text-[#705e4d] font-light">
                ✨ حفر دقيق عالي الجودة داخل أو على جسم القطعة يخلد ذكرياتك.
              </p>
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-normal text-[#5c4d3f] hover:bg-[#f4ece0] active:scale-90 transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-normal text-sm text-[#1c1815] font-sans">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-normal text-[#5c4d3f] hover:bg-[#f4ece0] active:scale-90 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 py-4 px-6 rounded-2xl font-medium text-xs tracking-wider transition-all duration-300 active:scale-95 shadow-lg hover-lift flex items-center justify-center gap-2 ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1c1815] hover:bg-[#2c241e] text-[#faf8f5] shadow-[#1c1815]/15"
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
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700/95 hover:bg-emerald-700 text-white text-xs font-medium tracking-wide transition-all shadow-md active:scale-95 hover-lift flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>اطلب فوراً عبر واتساب • ORDER VIA WHATSAPP</span>
            </button>
          </div>

          {/* Expandable Accordions */}
          <div className="border-t border-[#eee5d8] pt-4 space-y-3">
            {/* Spec Accordion */}
            <div className="border border-[#ece4d8] rounded-2xl bg-white overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "specs" ? null : "specs")}
                className="w-full p-4 text-right flex items-center justify-between text-xs sm:text-sm font-medium text-[#1c1815]"
              >
                <span>مواصفات القطعة وتفاصيل الصياغة</span>
                {openAccordion === "specs" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === "specs" && (
                <div className="px-4 pb-4 text-xs text-[#6e5d4d] space-y-2 border-t border-[#f4eee4] pt-3 leading-relaxed font-light animate-fade-in">
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
            <div className="border border-[#ece4d8] rounded-2xl bg-white overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "shipping" ? null : "shipping")}
                className="w-full p-4 text-right flex items-center justify-between text-xs sm:text-sm font-medium text-[#1c1815]"
              >
                <span>الشحن وسياسة الاستبدال</span>
                {openAccordion === "shipping" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === "shipping" && (
                <div className="px-4 pb-4 text-xs text-[#6e5d4d] space-y-2 border-t border-[#f4eee4] pt-3 leading-relaxed font-light animate-fade-in">
                  <p>
                    • <strong className="font-medium text-[#1c1815]">تغليف محكم ومؤمن:</strong>{" "}
                    تصلك الشحنة في بوكس ORMA المخملي الملكي ومغلفة بشرائط أمان محكمة لضمان وصول القطعة جديدة وبأعلى درجات الخصوصية.
                  </p>
                  <p>
                    • <strong className="font-medium text-[#1c1815]">مدة التوصيل:</strong>{" "}
                    {storeSettings.shippingPolicyTimeline || "24-48 ساعة للقاهرة والجيزة، و2-4 أيام لباقي محافظات مصر."}
                  </p>
                  <p>
                    • <strong className="font-medium text-[#1c1815]">الاستبدال والاسترجاع:</strong>{" "}
                    {product.returnPolicyNote ||
                      storeSettings.returnPolicyText ||
                      `متاح مجاناً خلال ${storeSettings.returnPolicyDays || 14} يوماً من الاستلام.`}
                  </p>
                </div>
              )}
            </div>

            {/* Care Accordion */}
            <div className="border border-[#ece4d8] rounded-2xl bg-white overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
                className="w-full p-4 text-right flex items-center justify-between text-xs sm:text-sm font-medium text-[#1c1815]"
              >
                <span>إرشادات الحفاظ على لمعان الفضة</span>
                {openAccordion === "care" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordion === "care" && (
                <div className="px-4 pb-4 text-xs text-[#6e5d4d] space-y-2 border-t border-[#f4eee4] pt-3 leading-relaxed font-light animate-fade-in">
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
            <span className="text-[11px] font-sans tracking-[0.25em] text-[#8a7663] uppercase font-light">
              RECOMMENDED FOR YOU
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-[#1c1815] font-cairo tracking-tight">
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

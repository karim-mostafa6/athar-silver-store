"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, DEFAULT_CUSTOM_PAGES, CustomPage } from "@/context/StoreContext";
import { AtharLogo } from "@/components/AtharLogo";
import {
  ShieldCheck,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  ArrowRight,
  Clock,
  Truck,
  CheckCircle2,
  Gem,
  Award,
  RefreshCw,
  HeartHandshake,
} from "lucide-react";

export default function DynamicCustomPage() {
  const { storeSettings } = useStore();
  const params = useParams();
  const slug = (params?.slug as string) || "";

  // Lookup page from storeSettings.customPages or fallback
  const page: CustomPage | undefined = useMemo(() => {
    const list =
      Array.isArray(storeSettings.customPages) && storeSettings.customPages.length > 0
        ? storeSettings.customPages
        : DEFAULT_CUSTOM_PAGES;

    const found = list.find((p) => p.slug === slug || p.id === slug);
    if (found) return found;

    // Fallback to DEFAULT_CUSTOM_PAGES if user created a custom list but missed defaults
    return DEFAULT_CUSTOM_PAGES.find((p) => p.slug === slug || p.id === slug);
  }, [storeSettings.customPages, slug]);

  const whatsappNumber = storeSettings.whatsappNumber || "01143837730";
  const contactPhone = storeSettings.contactPhone || "01143837730";
  const contactEmail = storeSettings.contactEmail || storeSettings.senderEmail || "theathar.eg@gmail.com";
  const instagramUrl = storeSettings.instagramUrl || "https://instagram.com/theathar.eg";

  // Clean whatsapp url helper
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/2${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
    `مرحباً دار أَثَر ✦ أنا مهتم بـ "${page?.title || "منتجاتكم"}" ومحتاج استفسار سريع.`
  )}`;

  if (!page || page.isPublished === false) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f0e7db] text-[#8c7865] flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-[#c5a880]" />
        </div>
        <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-[#161412] mb-3">
          الصفحة المطلوبة غير متوفرة حالياً
        </h1>
        <p className="text-xs sm:text-sm text-[#756555] max-w-md mb-8 leading-relaxed">
          عذراً، قد تكون الصفحة قيد التحديث أو تم تعديل رابطها بواسطة الإدارة. يمكنك دائماً تصفح المتجر واكتشاف روائع الفضة.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2b2521] transition-all shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>
      </div>
    );
  }

  // Split content by paragraphs
  const paragraphs = page.content
    ? page.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7f4ee] text-[#161412] pb-20 font-cairo">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#efe8dc]/60 border-b border-[#e5dcd0] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-[#756555]">
          <Link href="/" className="hover:text-[#161412] transition-colors">
            الرئيسية
          </Link>
          <span className="text-[#c5a880]">/</span>
          <span className="text-[#8c7865]">الصفحات</span>
          <span className="text-[#c5a880]">/</span>
          <span className="font-bold text-[#161412] truncate">{page.title}</span>
        </div>
      </div>

      {/* Hero Banner or Header */}
      <header className="relative overflow-hidden bg-[#161412] text-[#f7f4ee]">
        {page.bannerImage ? (
          <div className="relative w-full h-[240px] sm:h-[340px] lg:h-[400px]">
            <img
              src={page.bannerImage}
              alt={page.title}
              className="w-full h-full object-cover object-center brightness-[0.55] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#161412] via-[#161412]/40 to-transparent" />
            <div className="absolute inset-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 sm:pb-14">
              {page.englishTitle && (
                <div className="text-[11px] font-sans tracking-[0.25em] text-[#dfcbb3] uppercase mb-2 font-medium">
                  {page.englishTitle}
                </div>
              )}
              <h1 className="font-amiri text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {page.title}
              </h1>
              {page.subtitle && (
                <p className="font-amiri text-xs sm:text-base text-[#ded5c7] max-w-2xl font-light leading-relaxed">
                  {page.subtitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
            <div className="flex justify-center mb-4">
              <AtharLogo variant="dark" size="md" />
            </div>
            {page.englishTitle && (
              <div className="text-[11px] font-sans tracking-[0.25em] text-[#c5a880] uppercase mb-2 font-medium">
                {page.englishTitle}
              </div>
            )}
            <h1 className="font-amiri text-2xl sm:text-4xl font-bold text-white mb-3">
              {page.title}
            </h1>
            {page.subtitle && (
              <p className="font-amiri text-xs sm:text-base text-[#c4b6a4] max-w-2xl mx-auto font-light leading-relaxed">
                {page.subtitle}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
        {/* Dynamic Interactive Highlights based on Page Type */}
        {slug === "warranty" && (
          <div className="mb-10 bg-gradient-to-br from-[#1c1916] to-[#2b2520] text-[#f7f4ee] rounded-2xl p-6 sm:p-8 border border-[#c5a880]/40 shadow-xl relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#c5a880]/10 rounded-full blur-2xl" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-[#c5a880]/20 border border-[#c5a880]/40 flex items-center justify-center shrink-0 text-[#c5a880]">
                <Award className="w-9 h-9" />
              </div>
              <div className="space-y-2 text-center sm:text-right">
                <span className="text-[10px] tracking-widest text-[#c5a880] font-sans font-bold uppercase">
                  ROYAL LIFETIME WARRANTY
                </span>
                <h2 className="font-amiri text-xl sm:text-2xl font-bold text-white">
                  وثيقة الضمان الملكي المعتمد مدى الحياة
                </h2>
                <p className="text-xs sm:text-sm text-[#ded5c7] leading-relaxed font-light">
                  تضمن دار أَثَر نقاء الفضة الإسترليني عيار 925 الإيطالية والسويسرية بنسبة 100%، مع كارت ضمان رسمي داخل كل علبة وخدمة تلميع مجانية مدى الحياة.
                </p>
              </div>
            </div>
          </div>
        )}

        {slug === "returns" && (
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#f4ece0] text-[#8c7865] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h3 className="font-bold text-xs text-[#161412]">فضة إسترليني أصلية 925</h3>
              <p className="text-[11px] text-[#756555] leading-relaxed">
                كافة القطع مصنوعة من الفضة الخالصة عيار 925 ومدموغة بالختم الرسمي مع كارت ضمان معتمد.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#f4ece0] text-[#8c7865] mx-auto flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h3 className="font-bold text-xs text-[#161412]">استبدال خلال 14 يوماً</h3>
              <p className="text-[11px] text-[#756555] leading-relaxed">
                مرونة كاملة في استبدال المقاس أو التصميم بكل يسر وسرعة.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#f4ece0] text-[#8c7865] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h3 className="font-bold text-xs text-[#161412]">شحن مجاني للعيوب</h3>
              <p className="text-[11px] text-[#756555] leading-relaxed">
                في حال وجود أي عيب مصنعي نتحمل تكاليف الشحن كاملة مع استبدال فوري.
              </p>
            </div>
          </div>
        )}

        {slug === "care" && (
          <div className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] space-y-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f0e8dc] text-[#8c7865] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#c5a880]" />
                </div>
                <h3 className="font-bold text-xs text-[#161412]">العطور والكحول</h3>
              </div>
              <p className="text-xs text-[#756555] leading-relaxed pr-11">
                ارتدِ قطعتك بعد رش العطر وجفاف الكريمات لحماية طبقة الروديوم البلاتيني اللامعة.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] space-y-2 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f0e8dc] text-[#8c7865] flex items-center justify-center shrink-0">
                  <Gem className="w-4 h-4 text-[#c5a880]" />
                </div>
                <h3 className="font-bold text-xs text-[#161412]">الحفظ في العلبة الأصلية</h3>
              </div>
              <p className="text-xs text-[#756555] leading-relaxed pr-11">
                احفظ مجوهراتك داخل علبة أثر المخملية المبطنة بمكان جاف عند عدم ارتدائها.
              </p>
            </div>
          </div>
        )}

        {slug === "about" && (
          <div className="mb-10 bg-white rounded-2xl p-6 sm:p-8 border border-[#e8ded0] shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#161412] text-[#f7f4ee] flex items-center justify-center shrink-0 shadow-md">
              <HeartHandshake className="w-8 h-8 text-[#c5a880]" />
            </div>
            <div className="space-y-1 text-center sm:text-right">
              <h2 className="font-amiri text-lg sm:text-xl font-bold text-[#161412]">
                شعارنا الدائم: الأثر لا يُهدى بل يُترك
              </h2>
              <p className="text-xs sm:text-sm text-[#756555] leading-relaxed">
                كل قطعة من روائع أثر مصممة لتكون بصمة تخلد حضورك، ومصنوعة بأيدي أمهر الصاغة الإيطاليين من الفضة عيار 925 النقية.
              </p>
            </div>
          </div>
        )}

        {/* Formatted Paragraphs */}
        <article className="bg-white rounded-2xl border border-[#e8ded0] shadow-sm p-6 sm:p-10 space-y-6">
          {paragraphs.map((p, idx) => {
            const isHeader = p.endsWith(":") || p.startsWith("1.") || p.startsWith("2.") || p.startsWith("3.") || p.startsWith("4.");
            return (
              <div key={idx} className="space-y-2">
                <p
                  className={`text-xs sm:text-sm leading-relaxed text-[#3b322a] whitespace-pre-line ${
                    isHeader ? "font-bold text-[#161412] border-r-2 border-[#c5a880] pr-3" : "font-normal"
                  }`}
                >
                  {p}
                </p>
              </div>
            );
          })}
        </article>

        {/* Interactive Contact Section if slug is contact */}
        {slug === "contact" && (
          <section className="mt-10 space-y-6">
            <h2 className="font-amiri text-xl font-bold text-[#161412]">قنوات التواصل الفوري والمباشر</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* WhatsApp Card */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-5 shadow-sm transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold">محادثة واتساب مباشرة ✦</div>
                  <div className="text-[11px] text-emerald-100 font-mono mt-0.5">{whatsappNumber}</div>
                  <div className="text-[10px] text-emerald-200 mt-1">متواجدون للرد الفوري على مدار الساعة</div>
                </div>
              </a>

              {/* Phone Card */}
              <a
                href={`tel:${contactPhone}`}
                className="bg-white hover:bg-[#faf6f0] border border-[#e8ded0] text-[#161412] rounded-xl p-5 shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0e7db] text-[#8c7865] flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-[#c5a880]" />
                </div>
                <div>
                  <div className="text-xs font-bold">الاتصال الهاتفي المباشر</div>
                  <div className="text-[11px] text-[#756555] font-mono mt-0.5">{contactPhone}</div>
                  <div className="text-[10px] text-[#8c7865] mt-1">يومياً من 10:00 ص حتى 11:00 م</div>
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${contactEmail}`}
                className="bg-white hover:bg-[#faf6f0] border border-[#e8ded0] text-[#161412] rounded-xl p-5 shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f0e7db] text-[#8c7865] flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-[#c5a880]" />
                </div>
                <div>
                  <div className="text-xs font-bold">البريد الإلكتروني المعتمد</div>
                  <div className="text-[11px] text-[#756555] font-mono mt-0.5">{contactEmail}</div>
                  <div className="text-[10px] text-[#8c7865] mt-1">للاستفسارات والتعاون التجاري</div>
                </div>
              </a>

              {/* Instagram Card */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white rounded-xl p-5 shadow-sm transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 fill-none stroke-currentColor stroke-2" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold">حساب إنستجرام الرسمي</div>
                  <div className="text-[11px] text-white/90 font-mono mt-0.5">@theathar.eg</div>
                  <div className="text-[10px] text-white/80 mt-1">شاهد أحدث التشكيلات والكواليس الحصرية</div>
                </div>
              </a>
            </div>

            {/* Additional Info Badges */}
            <div className="bg-[#f0e8dc]/70 rounded-xl p-5 border border-[#ded2c0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#6e5d4e]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#c5a880]" />
                <span>أوقات العمل: يومياً 10:00 صباحاً – 11:00 مساءً بتوقيت القاهرة</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#c5a880]" />
                <span>توصيل سريع لكافة محافظات الجمهورية</span>
              </div>
            </div>
          </section>
        )}

        {/* Quick Footer Action Callout */}
        <div className="mt-12 pt-8 border-t border-[#e2d7c7] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
          <div>
            <h3 className="font-amiri text-base font-bold text-[#161412]">
              هل ترغب في استكشاف روائع الفضة الإسترليني 925؟
            </h3>
            <p className="text-xs text-[#756555] mt-1">
              تشكيلة واسعة من الخواتم والسلاسل والأساور الملكية بانتظارك.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/collection/all"
              className="px-5 py-2.5 rounded-xl bg-[#161412] text-[#f7f4ee] text-xs font-bold hover:bg-[#2b2521] transition-all shadow-sm"
            >
              تصفح التشكيلة الكاملة
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>محادثة واتساب</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

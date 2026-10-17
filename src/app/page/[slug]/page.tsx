"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, DEFAULT_CUSTOM_PAGES, CustomPage } from "@/context/StoreContext";
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
  const contactEmail = storeSettings.contactEmail || storeSettings.senderEmail || "theorma.eg@gmail.com";
  const instagramUrl = storeSettings.instagramUrl || "https://instagram.com/ormasilver";

  // Clean whatsapp url helper
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/2${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(
    `مرحباً دار ORMA ✦ أنا مهتم بـ "${page?.title || "منتجاتكم"}" ومحتاج استفسار سريع.`
  )}`;

  if (!page || page.isPublished === false) {
    return (
      <div dir="rtl" className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f0e7db] text-[#8c7865] flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-[#c5a880]" />
        </div>
        <h1 className="font-cairo text-2xl sm:text-3xl font-bold text-[#292722] mb-3">
          الصفحة المطلوبة غير متوفرة حالياً
        </h1>
        <p className="text-xs sm:text-sm text-[#756555] max-w-md mb-8 leading-relaxed">
          عذراً، قد تكون الصفحة قيد التحديث أو تم تعديل رابطها بواسطة الإدارة. يمكنك دائماً تصفح المتجر واكتشاف روائع الفضة.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#292722] text-[#f7f4ee] text-xs font-bold hover:bg-[#2b2521] transition-all shadow-md"
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

  const coreLinks = [
    { slug: "returns", label: "الاستبدال والاسترجاع" },
    { slug: "warranty", label: "سياسة الضمان" },
    { slug: "care", label: "العناية بالفضة" },
    { slug: "about", label: "عن ORMA" },
    { slug: "contact", label: "تواصل معنا" },
  ];
  const extraLinks = (Array.isArray(storeSettings.customPages) ? storeSettings.customPages : [])
    .filter((p) => p.isPublished && p.showInFooter && !coreLinks.some((c) => c.slug === p.slug))
    .map((p) => ({ slug: p.slug, label: p.footerLabel || p.title }));
  const sideLinks = [...coreLinks, ...extraLinks];

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F0E7] text-[#292722] pb-20 font-cairo">
      {/* Title band */}
      <header className="bg-[#F5F0E7] border-b border-[#292722]/12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8 pb-10 sm:pt-12 sm:pb-14">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#7d6c5c] mb-6 sm:mb-8">
            <Link href="/" className="py-2 hover:text-[#292722] transition-colors">الرئيسية</Link>
            <span>/</span>
            <span className="text-[#292722] truncate">{page.title}</span>
          </nav>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 text-right">
              {page.englishTitle && <div className="eyebrow text-base sm:text-xl mb-2 normal-case">{page.englishTitle}</div>}
              <h1 className="font-cairo font-light text-4xl sm:text-6xl leading-[1.2] text-[#292722]">{page.title}</h1>
              {page.subtitle && (
                <p className="text-sm sm:text-lg text-[#5c5346] mt-4 max-w-xl leading-[1.9]">{page.subtitle}</p>
              )}
            </div>
            {page.bannerImage && (
              <div className="hidden md:block md:col-span-4">
                <div className="relative h-[200px] max-w-[300px] ml-auto overflow-hidden bg-[#D8C8B3]" style={{ borderRadius: "999px 999px 20px 20px / 150px 150px 20px 20px" }}>
                  <img src={page.bannerImage} alt={page.title} className="img-fade-in absolute inset-0 w-full h-full object-cover" decoding="async" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-8 sm:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      <aside className="lg:col-span-3 lg:sticky lg:top-28">
        <nav aria-label="صفحات المتجر" className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
          {sideLinks.map((l) => (
            <Link
              key={l.slug}
              href={`/page/${l.slug}`}
              className={`shrink-0 min-h-[46px] flex items-center px-4 rounded-xl text-sm transition-colors whitespace-nowrap ${
                l.slug === slug ? "bg-[#292722] text-[#F5F0E7] font-bold" : "text-[#292722] hover:bg-[#D8C8B3]/45"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:col-span-9 min-w-0">
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
                <h2 className="font-cairo text-xl sm:text-2xl font-bold text-white">
                  وثيقة الضمان الملكي المعتمد مدى الحياة
                </h2>
                <p className="text-xs sm:text-sm text-[#ded5c7] leading-relaxed font-light">
                  تضمن دار أورما نقاء الفضة الإسترليني عيار 925 الإيطالية والسويسرية بنسبة 100%، مع كارت ضمان رسمي داخل كل علبة وخدمة تلميع مجانية مدى الحياة.
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
              <h3 className="font-bold text-xs text-[#292722]">فضة إسترليني أصلية 925</h3>
              <p className="text-[11px] text-[#756555] leading-relaxed">
                كافة القطع مصنوعة من الفضة الخالصة عيار 925 ومدموغة بالختم الرسمي مع كارت ضمان معتمد.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#f4ece0] text-[#8c7865] mx-auto flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h3 className="font-bold text-xs text-[#292722]">استبدال خلال 14 يوماً</h3>
              <p className="text-[11px] text-[#756555] leading-relaxed">
                مرونة كاملة في استبدال المقاس أو التصميم بكل يسر وسرعة.
              </p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-[#e8ded0] text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#f4ece0] text-[#8c7865] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#c5a880]" />
              </div>
              <h3 className="font-bold text-xs text-[#292722]">شحن مجاني للعيوب</h3>
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
                <h3 className="font-bold text-xs text-[#292722]">العطور والكحول</h3>
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
                <h3 className="font-bold text-xs text-[#292722]">الحفظ في العلبة الأصلية</h3>
              </div>
              <p className="text-xs text-[#756555] leading-relaxed pr-11">
                احفظ مجوهراتك داخل علبة ORMA المخملية المبطنة بمكان جاف عند عدم ارتدائها.
              </p>
            </div>
          </div>
        )}

        {slug === "about" && (
          <div className="mb-10 bg-white rounded-2xl p-6 sm:p-8 border border-[#e8ded0] shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-[#292722] text-[#F5F0E7] flex items-center justify-center shrink-0 shadow-md">
              <HeartHandshake className="w-8 h-8 text-[#B7A078]" />
            </div>
            <div className="space-y-1 text-center sm:text-right">
              <h2 className="font-cairo text-lg sm:text-xl font-bold text-[#292722]">
                شعارنا الدائم: مش بتتهدي.. بتتساب
              </h2>
              <p className="text-xs sm:text-sm text-[#756555] leading-relaxed">
                كل قطعة من روائع ORMA مصممة لتكون بصمة تخلد حضورك، ومصنوعة بأيدي أمهر الصاغة من الفضة عيار 925 النقية.
              </p>
            </div>
          </div>
        )}

        {/* Formatted Paragraphs */}
        <article className="bg-[#fbf8f3] rounded-3xl border border-[#292722]/12 p-6 sm:p-10 space-y-6">
          {paragraphs.map((p, idx) => {
            const isHeader = p.endsWith(":") || p.startsWith("1.") || p.startsWith("2.") || p.startsWith("3.") || p.startsWith("4.");
            return (
              <div key={idx} className="space-y-2">
                <p
                  className={`text-sm sm:text-[17px] leading-[2.1] text-[#4a4236] whitespace-pre-line ${
                    isHeader ? "font-bold text-[#292722] border-r-2 border-[#c5a880] pr-3" : "font-normal"
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
            <h2 className="font-cairo text-xl font-bold text-[#292722]">قنوات التواصل الفوري والمباشر</h2>
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
                className="bg-white hover:bg-[#faf6f0] border border-[#e8ded0] text-[#292722] rounded-xl p-5 shadow-sm transition-all flex items-center gap-4"
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
                className="bg-white hover:bg-[#faf6f0] border border-[#e8ded0] text-[#292722] rounded-xl p-5 shadow-sm transition-all flex items-center gap-4"
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
                  <div className="text-[11px] text-white/90 font-mono mt-0.5">@ormasilver</div>
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
            <h3 className="font-cairo text-base font-bold text-[#292722]">
              هل ترغب في استكشاف روائع الفضة الإسترليني 925؟
            </h3>
            <p className="text-xs text-[#756555] mt-1">
              تشكيلة واسعة من الخواتم والسلاسل والأساور الملكية بانتظارك.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/collection/all"
              className="px-5 py-2.5 rounded-full bg-[#292722] text-[#f7f4ee] text-xs font-bold hover:bg-[#2b2521] transition-all shadow-sm"
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
    </div>
  );
}

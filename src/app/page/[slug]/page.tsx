"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStore, DEFAULT_CUSTOM_PAGES, CustomPage } from "@/context/StoreContext";
import { Sparkles, Phone, MessageCircle, Mail, ArrowRight, Clock, Truck } from "lucide-react";

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

  // Content blocks: a block's first line ending with ":" becomes a section heading, the rest is its text.
  const blocks = paragraphs.map((raw) => {
    const lines = raw.split("\n");
    const first = lines[0].trim();
    if (lines.length > 1 && first.endsWith(":")) {
      return { heading: first.replace(/^\d+\.\s*/, "").replace(/:$/, ""), text: lines.slice(1).join("\n").trim() };
    }
    if (lines.length === 1 && first.endsWith(":")) {
      return { heading: first.replace(/^\d+\.\s*/, "").replace(/:$/, ""), text: "" };
    }
    return { heading: "", text: raw.trim() };
  });
  const steps = (page.steps ?? DEFAULT_CUSTOM_PAGES.find((d) => d.slug === page.slug)?.steps ?? []).filter((st) => st.title || st.text);
  const ctaTitle = page.ctaTitle || "محتاج مساعدة في طلب؟";
  const ctaText = page.ctaText || "فريقنا بيرد على واتساب كل يوم.";

  return (
    <div dir="rtl" className="min-h-screen bg-[#F5F0E7] text-[#292722] pb-20 font-cairo">
      {/* Title */}
      <header className="px-4 sm:px-8 lg:px-16 pt-12 sm:pt-[72px] pb-10 sm:pb-12 text-center">
        {page.englishTitle && <div className="eyebrow text-lg sm:text-xl normal-case">{page.englishTitle}</div>}
        <h1 className="font-cairo font-light text-4xl sm:text-6xl leading-[1.25] mt-1.5 text-[#292722]">{page.title}</h1>
        {page.subtitle && (
          <p className="mx-auto mt-4 max-w-[560px] text-base sm:text-lg leading-[1.9] text-[#5c5346] font-tajawal">{page.subtitle}</p>
        )}
      </header>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 pt-4 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
        <aside className="lg:col-span-3 lg:sticky lg:top-24">
          <nav aria-label="صفحات المتجر" className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            {sideLinks.map((l) => (
              <Link
                key={l.slug}
                href={`/page/${l.slug}`}
                className={`shrink-0 min-h-[48px] flex items-center px-4 rounded-xl text-[15px] transition-colors whitespace-nowrap ${
                  l.slug === slug ? "bg-[#292722] text-[#F5F0E7] font-bold" : "text-[#292722] hover:bg-[#D8C8B3]/45"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="lg:col-span-9 min-w-0 flex flex-col gap-10">
          {steps.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((st, i) => (
                <div key={i} className="p-6 border border-[#292722]/12 rounded-[18px] flex flex-col gap-2.5 bg-[#fbf8f3]">
                  <div className="font-cormorant text-[34px] leading-none text-[#8E7545]">{String(i + 1).padStart(2, "0")}</div>
                  <div className="font-cairo font-semibold text-lg">{st.title}</div>
                  <div className="text-sm leading-[1.9] text-[#5c5346] font-tajawal">{st.text}</div>
                </div>
              ))}
            </div>
          )}

          {blocks.map((b, idx) => (
            <section key={idx} className="flex flex-col gap-3.5">
              {b.heading && <h2 className="font-cairo font-semibold text-2xl sm:text-[26px]">{b.heading}</h2>}
              {b.text && (
                <p className="text-base sm:text-[17px] leading-[2.1] text-[#4a4236] font-tajawal whitespace-pre-line">{b.text}</p>
              )}
            </section>
          ))}

          {slug === "contact" && (
            <section className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#2f6b4a] hover:bg-[#285c3f] text-white rounded-[18px] p-5 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">محادثة واتساب مباشرة</div>
                    <div className="text-xs text-white/80 mt-0.5 dir-ltr text-right">{whatsappNumber}</div>
                  </div>
                </a>
                <a
                  href={`tel:${contactPhone}`}
                  className="bg-[#fbf8f3] hover:border-[#8E7545]/60 border border-[#292722]/12 text-[#292722] rounded-[18px] p-5 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D8C8B3]/50 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[#8E7545]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">الاتصال الهاتفي</div>
                    <div className="text-xs text-[#5c5346] mt-0.5 dir-ltr text-right">{contactPhone}</div>
                  </div>
                </a>
                <a
                  href={`mailto:${contactEmail}`}
                  className="bg-[#fbf8f3] hover:border-[#8E7545]/60 border border-[#292722]/12 text-[#292722] rounded-[18px] p-5 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#D8C8B3]/50 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#8E7545]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">البريد الإلكتروني</div>
                    <div className="text-xs text-[#5c5346] mt-0.5 dir-ltr text-right">{contactEmail}</div>
                  </div>
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#292722] hover:bg-[#1E1C18] text-[#F5F0E7] rounded-[18px] p-5 transition-colors flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-[#B7A078]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">إنستجرام</div>
                    <div className="text-xs text-[#D8C8B3] mt-0.5">@ormasilver</div>
                  </div>
                </a>
              </div>
              <div className="rounded-[18px] p-5 border border-[#292722]/12 flex flex-wrap items-center justify-between gap-4 text-sm text-[#5c5346]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8E7545]" />
                  <span>أوقات العمل: يومياً 10:00 ص – 11:00 م بتوقيت القاهرة</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#8E7545]" />
                  <span>توصيل لكل محافظات مصر</span>
                </div>
              </div>
            </section>
          )}

          {/* Closing call-to-action */}
          <div className="p-6 sm:p-8 rounded-[20px] bg-[#292722] text-[#F5F0E7] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="font-cairo font-light text-2xl sm:text-[26px]">{ctaTitle}</div>
              <div className="mt-1.5 text-[15px] text-[#D8C8B3] font-tajawal">{ctaText}</div>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-shine inline-flex items-center justify-center min-h-[52px] px-8 rounded-full bg-[#F5F0E7] text-[#292722] font-bold whitespace-nowrap hover:bg-white transition-colors"
            >
              تواصل عبر واتساب
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

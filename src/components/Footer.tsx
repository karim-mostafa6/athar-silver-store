"use client";

import React, { useMemo } from "react";
import { Sparkles, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useStore, DEFAULT_CATEGORIES } from "@/context/StoreContext";

interface FooterProps {
  onOpenSizeGuide?: () => void;
  onSelectCategory?: (cat: string) => void;
  onSelectGender?: (gender: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
}) => {
  const { storeSettings } = useStore();

  const brandTitle =
    storeSettings.footerBrandTitle !== undefined
      ? storeSettings.footerBrandTitle
      : storeSettings.brandNameArabic || "أَثَـر";
  const englishTag =
    storeSettings.footerEnglishTag !== undefined
      ? storeSettings.footerEnglishTag
      : "ATHAR SILVER JEWELRY 925";
  const brandBio =
    storeSettings.footerBrandBio !== undefined
      ? storeSettings.footerBrandBio
      : "براند مصري راقٍ متخصص في الفضة الإسترليني عيار 925 الإيطالية والتركية، نصوغ قطعاً خالدة تجمع بين أصالة المعدن النفيس والأناقة العصرية لتترك أثراً استثنائياً في كل مكان.";

  // Categories list synchronized with collectionPages & custom categories
  const categoriesList = useMemo(() => {
    const list =
      storeSettings.categories && storeSettings.categories.length > 0
        ? storeSettings.categories
        : DEFAULT_CATEGORIES;
    return list.map((c) => ({
      id: c.id,
      label: storeSettings.collectionPages?.[c.id]?.title || c.label,
      href: `/collection/${c.slug || c.id}`,
    }));
  }, [storeSettings.categories, storeSettings.collectionPages]);

  // Payment Badges
  const paymentBadges = useMemo(() => {
    const raw =
      storeSettings.footerPaymentBadgesText !== undefined
        ? storeSettings.footerPaymentBadgesText
        : "دفع عند الاستلام, فودافون كاش, إنستاباي InstaPay, Visa / Master";
    if (!raw.trim()) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [storeSettings.footerPaymentBadgesText]);

  const showCategoriesCol = storeSettings.footerColCategoriesShow !== false;
  const showCustomerServiceCol = storeSettings.footerColCustomerServiceShow !== false;
  const showContactCol = storeSettings.footerColContactShow !== false;

  const categoriesColTitle = storeSettings.footerColCategoriesTitle || "أقسام المتجر";
  const customerServiceColTitle = storeSettings.footerColCustomerServiceTitle || "خدمة العملاء";
  const contactColTitle = storeSettings.footerColContactTitle || "تواصل معنا";

  const sizeGuideText =
    storeSettings.footerSizeGuideText !== undefined
      ? storeSettings.footerSizeGuideText
      : "دليل مقاسات الخواتم";
  const silverCareText =
    storeSettings.footerSilverCareText !== undefined
      ? storeSettings.footerSilverCareText
      : "طرق العناية بالفضة";
  const warrantyText =
    storeSettings.warrantyPolicyText || "ضمان رسمي مدى الحياة على أصالة وجودة الفضة.";
  const returnPolicyText =
    storeSettings.returnPolicyTitle ||
    `سياسة الاستبدال خلال ${storeSettings.returnPolicyDays || 14} يوماً`;
  const shippingText =
    storeSettings.shippingPolicyTimeline || "شحن آمن وتوصيل لجميع المحافظات";

  const contactPhone =
    storeSettings.contactPhone || storeSettings.whatsappNumber || "+20 114 383 7730";
  const contactEmail =
    storeSettings.senderEmail || storeSettings.contactEmail || "theathar.eg@gmail.com";
  const contactAddress =
    storeSettings.contactAddress || "القاهرة، جمهورية مصر العربية (شحن لجميع المحافظات)";
  const paymentTitle =
    storeSettings.footerPaymentTitle !== undefined
      ? storeSettings.footerPaymentTitle
      : "طرق الدفع المعتمدة:";

  const copyrightText =
    storeSettings.footerCopyrightText !== undefined
      ? storeSettings.footerCopyrightText
      : `© ${new Date().getFullYear()} أَثَر (ATHAR) لفضة 925. جميع الحقوق محفوظة.`;
  const passionTagline =
    storeSettings.footerPassionTagline !== undefined
      ? storeSettings.footerPassionTagline
      : "صُنع بحرفية وشغف ❤️ ليترك أثراً لا يُمحى";

  const hasAnySocial =
    storeSettings.instagramUrl ||
    storeSettings.facebookUrl ||
    storeSettings.whatsappNumber ||
    storeSettings.tiktokUrl;

  return (
    <footer className="bg-[#1c1815] border-t border-[#382f27] text-[#c9b8a3] text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            {(brandTitle || englishTag) && (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2e2620] border border-[#524436] p-0.5 shadow-md flex items-center justify-center shrink-0">
                  <span className="text-xl font-black text-[#faf8f5]">
                    {brandTitle ? brandTitle.trim().charAt(0) : "أ"}
                  </span>
                </div>
                <div>
                  {brandTitle && (
                    <span className="text-2xl font-black text-white font-alexandria block">
                      {brandTitle}
                    </span>
                  )}
                  {englishTag && (
                    <span className="text-[10px] font-mono text-[#a8957e] block tracking-wider font-bold">
                      {englishTag}
                    </span>
                  )}
                </div>
              </div>
            )}

            {brandBio && (
              <p className="text-xs text-[#b8a794] leading-relaxed max-w-sm font-light">
                {brandBio}
              </p>
            )}

            {hasAnySocial && (
              <div className="flex items-center gap-3 pt-2">
                {storeSettings.instagramUrl && (
                  <a
                    href={storeSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-[#d8c8b4] hover:text-white hover:border-[#7d6953] transition-colors"
                    aria-label="إنستجرام"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {storeSettings.facebookUrl && (
                  <a
                    href={storeSettings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-[#d8c8b4] hover:text-white hover:border-[#7d6953] transition-colors"
                    aria-label="فيسبوك"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                  </a>
                )}
                {storeSettings.tiktokUrl && (
                  <a
                    href={storeSettings.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-[#d8c8b4] hover:text-white hover:border-[#7d6953] transition-colors"
                    aria-label="تيك توك"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.3 6.3 0 0 0 1.86-4.47V8.71a8.21 8.21 0 0 0 4.91 1.6V6.86a4.8 4.8 0 0 1-1-.17z" />
                    </svg>
                  </a>
                )}
                {storeSettings.whatsappNumber && (
                  <a
                    href={`https://wa.me/20${storeSettings.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:border-[#7d6953] transition-colors"
                    aria-label="واتساب"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links / Collections */}
          {showCategoriesCol && (
            <div className="space-y-3">
              {categoriesColTitle && (
                <h4 className="text-sm font-bold text-white font-alexandria">
                  {categoriesColTitle}
                </h4>
              )}
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/collection/all" className="hover:text-white transition-colors">
                    {storeSettings.collectionPages?.["all"]?.title || "جميع المنتجات"}
                  </Link>
                </li>
                <li>
                  <Link href="/collection/women" className="hover:text-white transition-colors">
                    {storeSettings.collectionPages?.["women"]?.title || "تشكيلة نسائية"}
                  </Link>
                </li>
                <li>
                  <Link href="/collection/men" className="hover:text-white transition-colors">
                    {storeSettings.collectionPages?.["men"]?.title || "تشكيلة رجالية"}
                  </Link>
                </li>
                {categoriesList
                  .filter((c) => !["all", "women", "men"].includes(c.id))
                  .map((cat) => (
                    <li key={cat.id}>
                      <Link href={cat.href} className="hover:text-white transition-colors">
                        {cat.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Customer Service & Guides */}
          {showCustomerServiceCol && (
            <div className="space-y-3">
              {customerServiceColTitle && (
                <h4 className="text-sm font-bold text-white font-alexandria">
                  {customerServiceColTitle}
                </h4>
              )}
              <ul className="space-y-2 text-xs">
                {sizeGuideText && (
                  <li>
                    <button
                      onClick={onOpenSizeGuide}
                      className="hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#c4b19c]" />
                      {sizeGuideText}
                    </button>
                  </li>
                )}
                {silverCareText && (
                  <li>
                    <a href="#care" className="hover:text-white transition-colors">
                      {silverCareText}
                    </a>
                  </li>
                )}
                {warrantyText && (
                  <li>
                    <span className="hover:text-white cursor-default leading-relaxed block">
                      {warrantyText}
                    </span>
                  </li>
                )}
                {returnPolicyText && (
                  <li>
                    <span className="hover:text-white cursor-default leading-relaxed block">
                      {returnPolicyText}
                    </span>
                  </li>
                )}
                {shippingText && (
                  <li>
                    <span className="hover:text-white cursor-default leading-relaxed block">
                      {shippingText}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Contact Details */}
          {showContactCol && (
            <div className="space-y-3">
              {contactColTitle && (
                <h4 className="text-sm font-bold text-white font-alexandria">
                  {contactColTitle}
                </h4>
              )}
              <div className="space-y-2.5 text-xs">
                {contactPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="dir-ltr font-mono text-[#f5f0e8]">{contactPhone}</span>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#baa894] shrink-0" />
                    <span className="font-mono text-[#f5f0e8]">{contactEmail}</span>
                  </div>
                )}
                {contactAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#baa894] shrink-0 mt-0.5" />
                    <span className="text-[#d8c8b4] leading-relaxed">{contactAddress}</span>
                  </div>
                )}
              </div>

              {(paymentTitle || paymentBadges.length > 0) && (
                <div className="pt-2">
                  {paymentTitle && (
                    <span className="text-[11px] font-bold text-[#faf8f5] block mb-1.5">
                      {paymentTitle}
                    </span>
                  )}
                  {paymentBadges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-[#e0d3c1]">
                      {paymentBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-[#2b241e] border border-[#45392e]"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        {(copyrightText || passionTagline) && (
          <div className="mt-12 pt-6 border-t border-[#382e25] flex flex-col sm:flex-row items-center justify-between text-xs text-[#998772] gap-4">
            {copyrightText ? <p>{copyrightText}</p> : <div />}
            {passionTagline && (
              <div className="flex items-center gap-2">
                <span>{passionTagline}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

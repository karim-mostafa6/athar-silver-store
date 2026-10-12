"use client";

import React from "react";
import { Sparkles, Phone, Mail, MapPin, Heart } from "lucide-react";

import Link from "next/link";

interface FooterProps {
  onOpenSizeGuide?: () => void;
  onSelectCategory?: (cat: string) => void;
  onSelectGender?: (gender: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
}) => {
  return (
    <footer className="bg-[#1c1815] border-t border-[#382f27] text-[#c9b8a3] text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#2e2620] border border-[#524436] p-0.5 shadow-md flex items-center justify-center">
                <span className="text-xl font-black text-[#faf8f5]">أ</span>
              </div>
              <div>
                <span className="text-2xl font-black text-white font-alexandria">أَثَـر</span>
                <span className="text-[10px] font-mono text-[#a8957e] block tracking-wider font-bold">
                  ATHAR SILVER JEWELRY 925
                </span>
              </div>
            </div>

            <p className="text-xs text-[#b8a794] leading-relaxed max-w-sm font-light">
              براند مصري راقٍ متخصص في الفضة الإسترليني عيار 925 الإيطالية والتركية. نصوغ قطعاً خالدة تجمع بين أصالة المعدن النفيس والأناقة العصرية لتترك أثراً استثنائياً في كل مكان.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-[#d8c8b4] hover:text-white hover:border-[#7d6953] transition-colors"
                aria-label="إنستجرام"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-[#d8c8b4] hover:text-white hover:border-[#7d6953] transition-colors"
                aria-label="فيسبوك"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/201000000000"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#2b241e] border border-[#42372d] flex items-center justify-center text-emerald-400 hover:text-emerald-300 hover:border-[#7d6953] transition-colors"
                aria-label="واتساب"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-alexandria">أقسام المتجر</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/collection/all" className="hover:text-white transition-colors">
                  جميع المنتجات
                </Link>
              </li>
              <li>
                <Link href="/collection/women" className="hover:text-white transition-colors">
                  تشكيلة نسائية
                </Link>
              </li>
              <li>
                <Link href="/collection/men" className="hover:text-white transition-colors">
                  تشكيلة رجالية
                </Link>
              </li>
              <li>
                <Link href="/collection/rings" className="hover:text-white transition-colors">
                  خواتم فضة 925
                </Link>
              </li>
              <li>
                <Link href="/collection/chains" className="hover:text-white transition-colors">
                  سلاسل ودلايات إيطالي
                </Link>
              </li>
              <li>
                <Link href="/collection/bracelets" className="hover:text-white transition-colors">
                  أساور وبناجر وتنس
                </Link>
              </li>
              <li>
                <Link href="/collection/sets" className="hover:text-white transition-colors">
                  أطقم هدايا ملكية
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Guides */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-alexandria">خدمة العملاء</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#c4b19c]" />
                  دليل مقاسات الخواتم
                </button>
              </li>
              <li>
                <a href="#care" className="hover:text-white transition-colors">
                  طرق العناية بالفضة
                </a>
              </li>
              <li>
                <a href="#story" className="hover:text-white transition-colors">
                  شهادة الضمان والأصالة
                </a>
              </li>
              <li>
                <span className="hover:text-white cursor-default">
                  سياسة الاستبدال خلال 14 يوماً
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-default">
                  الشحن والمعاينة عند الاستلام
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-alexandria">تواصل معنا</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="dir-ltr font-mono text-[#f5f0e8]">+20 100 000 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#baa894] shrink-0" />
                <span className="font-mono text-[#f5f0e8]">support@atharsilver.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#baa894] shrink-0 mt-0.5" />
                <span className="text-[#d8c8b4] leading-relaxed">
                  القاهرة، جمهورية مصر العربية (شحن لجميع المحافظات)
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#faf8f5] block mb-1.5">
                طرق الدفع المعتمدة:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] text-[#e0d3c1]">
                <span className="px-2 py-0.5 rounded bg-[#2b241e] border border-[#45392e]">
                  دفع عند الاستلام
                </span>
                <span className="px-2 py-0.5 rounded bg-[#2b241e] border border-[#45392e]">
                  فودافون كاش
                </span>
                <span className="px-2 py-0.5 rounded bg-[#2b241e] border border-[#45392e]">
                  إنستاباي InstaPay
                </span>
                <span className="px-2 py-0.5 rounded bg-[#2b241e] border border-[#45392e]">
                  Visa / Master
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#382e25] flex flex-col sm:flex-row items-center justify-between text-xs text-[#998772] gap-4">
          <p>© {new Date().getFullYear()} أَثَر (ATHAR) لفضة 925. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>صُنع بحرفية وشغف</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <span>ليترك أثراً لا يُمحى</span>
            </div>
            <Link
              href="/admin"
              className="text-[#baa894] hover:text-amber-200 transition-colors opacity-70 hover:opacity-100 text-[11px]"
            >
              🔒 إدارة المتجر
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

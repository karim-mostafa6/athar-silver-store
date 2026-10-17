"use client";

import React, { useState } from "react";
import { X, Ruler, Check, Circle, Scissors, Lightbulb, ChevronDown, ImageIcon } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { OrmaLogo } from "./OrmaLogo";
import { IllustrationPrepare, IllustrationWrap, IllustrationRead } from "./RingMeasureIllustrations";

// Egyptian rulers are in cm, so everything the customer sees or types is in cm.
const toLatinNumber = (raw: string) =>
  parseFloat(
    raw
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[٫,،]/g, ".")
      .replace(/[^0-9.]/g, "")
  );

interface RingSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeTable = [
  { us: "6", arabic: "16", mmDiameter: 16.5, mmCircumference: 51.8, note: "مقاس نسائي صغير" },
  { us: "7", arabic: "17", mmDiameter: 17.3, mmCircumference: 54.4, note: "المقاس النسائي الأكثر شيوعاً" },
  { us: "8", arabic: "18", mmDiameter: 18.1, mmCircumference: 57.0, note: "نسائي متوسط / رجالي نحيف" },
  { us: "9", arabic: "19", mmDiameter: 18.9, mmCircumference: 59.5, note: "رجالي متوسط" },
  { us: "10", arabic: "20", mmDiameter: 19.8, mmCircumference: 62.1, note: "المقاس الرجالي الأكثر طلباً" },
  { us: "11", arabic: "21", mmDiameter: 20.6, mmCircumference: 64.6, note: "رجالي عريض" },
  { us: "12", arabic: "22", mmDiameter: 21.4, mmCircumference: 67.2, note: "رجالي كبير" },
];

type Tab = "calc" | "table" | "how";

export const RingSizeGuideModal: React.FC<RingSizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<Tab>("calc");
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<(typeof sizeTable)[number] | null>(null);

  useBodyScrollLock(isOpen);
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cm = toLatinNumber(value);
    if (!cm || isNaN(cm)) return;
    const val = cm * 10; // table is stored in mm
    const key = "mmCircumference" as const;
    let closest = sizeTable[0];
    for (const row of sizeTable) {
      if (Math.abs(val - row[key]) < Math.abs(val - closest[key])) closest = row;
    }
    setResult(closest);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "calc", label: "احسب مقاسي" },
    { id: "table", label: "جدول المقاسات" },
    { id: "how", label: "كيف أقيس؟" },
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      dir="rtl"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1a1916]/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-xl flex flex-col overflow-hidden h-[88vh] h-[88dvh] sm:h-[min(86dvh,700px)] bg-[#F5F0E7] sm:rounded-[28px] rounded-t-[28px] text-[#292722] shadow-2xl text-right font-tajawal"
      >
        {/* Header */}
        <div className="relative shrink-0 bg-[#292722] text-[#F5F0E7] px-6 pt-6 pb-8 overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full border border-[#B7A078]/25" />
          <div className="pointer-events-none absolute -top-8 -left-8 w-32 h-32 rounded-full border border-[#B7A078]/25" />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-[#F5F0E7]/10 hover:bg-[#F5F0E7]/20 text-[#F5F0E7] flex items-center justify-center transition-colors active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-center text-center gap-3">
            <OrmaLogo variant="dark" size="sm" />
            <div className="flex items-center gap-3 w-full max-w-[260px] [@media(max-height:700px)]:hidden">
              <span className="h-px flex-1 bg-[#B7A078]/50" />
              <Ruler className="w-4 h-4 text-[#B7A078]" />
              <span className="h-px flex-1 bg-[#B7A078]/50" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-cairo leading-tight">دليل مقاسات الخواتم</h2>
            <p className="text-[13px] text-[#D8C8B3] leading-relaxed max-w-sm [@media(max-height:700px)]:hidden">
              اعرفي مقاس إصبعك بدقة، ليصلك خاتم أورما مريحاً كأنه صُنع لك.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 px-4 sm:px-6 -mt-4 relative z-10">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white border border-[#292722]/12 shadow-md">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  bodyRef.current?.scrollTo({ top: 0 });
                }}
                className={`py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${
                  tab === t.id ? "bg-[#292722] text-[#F5F0E7] shadow" : "text-[#292722]/65 hover:text-[#292722]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-5 pb-4">
          {/* ───────── Calculator ───────── */}
          {tab === "calc" && (
            <div className="space-y-4">
              <form onSubmit={handleCalculate} className="space-y-3">
                <p className="text-[12px] text-[#292722]/60 -mb-1">
                  اكتبي محيط إصبعك بالسنتيمتر زي ما بتقرأيه من المسطرة، مثلاً <b className="text-[#292722]">5.4</b> يعني 5 سم و4 مم.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    dir="ltr"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="مثال: 5.4"
                    className="w-full bg-white border border-[#292722]/15 rounded-2xl py-3.5 pl-4 pr-14 text-lg text-left font-bold text-[#292722] placeholder:text-[#292722]/30 placeholder:font-normal focus:outline-none focus:border-[#8E7545] focus:ring-2 focus:ring-[#8E7545]/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E7545]">سم</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#292722] hover:bg-[#3a3630] text-[#F5F0E7] font-bold text-sm transition-all active:scale-[0.98] shadow-md"
                >
                  احسبي مقاسي
                </button>
              </form>

              <button
                type="button"
                onClick={() => setTab("how")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-[#8E7545]/60 text-[13px] font-bold text-[#8E7545] hover:bg-white/60 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                مش عارفة تقيسي؟ شوفي الطريقة بالصور
              </button>

              {result && (
                <div className="rounded-2xl bg-gradient-to-br from-[#292722] to-[#3b362e] text-[#F5F0E7] p-5 text-center shadow-lg animate-pop">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#B7A078] font-bold tracking-wide mb-2">
                    <Check className="w-3.5 h-3.5" /> مقاسك الأنسب
                  </div>
                  <div className="flex items-end justify-center gap-6">
                    <div>
                      <div className="text-5xl font-black font-lora leading-none">{result.us}</div>
                      <div className="text-[11px] text-[#D8C8B3] mt-1.5">أمريكي (US)</div>
                    </div>
                    <div className="w-px h-12 bg-[#B7A078]/40" />
                    <div>
                      <div className="text-5xl font-black font-lora leading-none">{result.arabic}</div>
                      <div className="text-[11px] text-[#D8C8B3] mt-1.5">مصري / عربي</div>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#D8C8B3] mt-4">
                    بين مقاسين؟ اختاري الأكبر، فالخاتم المريح أفضل من الضيق.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ───────── Table ───────── */}
          {tab === "table" && (
            <ul className="space-y-2.5">
              {sizeTable.map((row) => {
                const active = result?.us === row.us;
                return (
                  <li
                    key={row.us}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-colors ${
                      active ? "bg-white border-[#8E7545] ring-1 ring-[#8E7545]/30" : "bg-white/70 border-[#292722]/10"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full border border-[#8E7545]/50 bg-[#F5F0E7] flex flex-col items-center justify-center shrink-0">
                      <span className="text-lg font-black font-lora leading-none text-[#292722]">{row.us}</span>
                      <span className="text-[9px] text-[#8E7545] font-bold leading-none mt-0.5">US</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[13px] font-bold">
                        <span>مصري {row.arabic}</span>
                        {active && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#8E7545] text-white">مقاسك</span>}
                      </div>
                      <div className="text-[11px] text-[#292722]/60 truncate">{row.note}</div>
                    </div>
                    <div className="text-left shrink-0 font-mono text-[11px] leading-5 text-[#292722]/75" dir="ltr">
                      <div>{(row.mmCircumference / 10).toFixed(2)} سم</div>
                    </div>
                  </li>
                );
              })}
              <li className="text-[11px] text-[#292722]/55 text-center pt-1" dir="rtl">
                الرقم المعروض هو محيط الإصبع بالسنتيمتر
              </li>
            </ul>
          )}

          {/* ───────── How to measure ───────── */}
          {tab === "how" && (
            <div className="space-y-3">
              {[
                { Icon: Scissors, t: "جهّزي خيطاً أو شريطاً ورقياً", d: "قصّي شريطاً رفيعاً غير قابل للتمدد (خيط أو شريط ورقي)، وجهّزي مسطرة عادية بالسنتيمتر.", Img: IllustrationPrepare },
                { Icon: Circle, t: "لفّيه حول قاعدة الإصبع", d: "حول الإصبع الذي سترتدين فيه الخاتم، وعلّمي مكان التقاء الطرفين بالقلم.", Img: IllustrationWrap },
                { Icon: Ruler, t: "قيسي الطول بالمسطرة", d: "هذا هو محيط إصبعك بالسنتيمتر (مثلاً 5.4 سم). اكتبيه في «احسب مقاسي» أو طابقيه مع الجدول.", Img: IllustrationRead },
              ].map(({ Icon, t, d, Img }, i) => {
                const open = openStep === i;
                return (
                  <div key={i} className="rounded-2xl bg-white/80 border border-[#292722]/10 overflow-hidden">
                    <div className="flex gap-3.5 p-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#292722] text-[#B7A078] flex items-center justify-center shrink-0 relative">
                        <Icon className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8E7545] text-white text-[9px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold">{t}</div>
                        <div className="text-[12px] text-[#292722]/65 leading-relaxed mt-0.5">{d}</div>
                        <button
                          type="button"
                          onClick={() => setOpenStep(open ? null : i)}
                          aria-expanded={open}
                          className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#8E7545] active:scale-95 transition-transform py-1"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          {open ? "إخفاء الصورة" : "شوف الصورة"}
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>
                    {open && (
                      <div className="px-3.5 pb-3.5 animate-fadeIn">
                        <Img />
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex gap-2.5 p-3.5 rounded-2xl bg-[#D8C8B3]/45 border border-[#B7A078]/50 text-[12px] leading-relaxed">
                <Lightbulb className="w-4 h-4 text-[#8E7545] shrink-0 mt-0.5" />
                <span>
                  قيسي في آخر اليوم أو بعد الدفء، فالإصبع يكون أكبر قليلاً. وتجنّبي القياس والأيدي باردة.
                </span>
              </div>
            </div>
          )}

        </div>

        <div className="shrink-0 px-4 sm:px-6 pt-3 safe-bottom border-t border-[#292722]/10 bg-[#F5F0E7]">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl border border-[#292722]/20 bg-white hover:bg-[#F5F0E7] text-[#292722] font-bold text-sm transition-colors active:scale-[0.98]"
          >
            فهمت، شكراً
          </button>
        </div>
      </div>
    </div>
  );
};

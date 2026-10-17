"use client";

import React, { useState } from "react";
import { X, Ruler, Check, Circle, Scissors, MoveHorizontal, Lightbulb } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { OrmaLogo } from "./OrmaLogo";

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
type Mode = "circ" | "diam";

export const RingSizeGuideModal: React.FC<RingSizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<Tab>("calc");
  const [mode, setMode] = useState<Mode>("circ");
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
    const val = parseFloat(value);
    if (!val || isNaN(val)) return;
    const key = mode === "circ" ? "mmCircumference" : "mmDiameter";
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
        className="relative w-full sm:max-w-xl max-h-[94vh] max-h-[94dvh] overflow-y-auto bg-[#F5F0E7] sm:rounded-[28px] rounded-t-[28px] text-[#292722] shadow-2xl text-right overscroll-contain font-tajawal"
      >
        {/* Header */}
        <div className="relative bg-[#292722] text-[#F5F0E7] px-6 pt-7 pb-8 overflow-hidden">
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
            <div className="flex items-center gap-3 w-full max-w-[260px]">
              <span className="h-px flex-1 bg-[#B7A078]/50" />
              <Ruler className="w-4 h-4 text-[#B7A078]" />
              <span className="h-px flex-1 bg-[#B7A078]/50" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-amiri leading-tight">دليل مقاسات الخواتم</h2>
            <p className="text-[13px] text-[#D8C8B3] leading-relaxed max-w-sm">
              اعرفي مقاس إصبعك بدقة، ليصلك خاتم أورما مريحاً كأنه صُنع لك.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 -mt-4 relative z-10">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-white border border-[#292722]/12 shadow-md">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95 ${
                  tab === t.id ? "bg-[#292722] text-[#F5F0E7] shadow" : "text-[#292722]/65 hover:text-[#292722]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-5 pb-6">
          {/* ───────── Calculator ───────── */}
          {tab === "calc" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "circ" as Mode, label: "محيط الإصبع", sub: "قياس بالخيط أو الورقة", Icon: MoveHorizontal },
                  { id: "diam" as Mode, label: "قطر خاتم عندك", sub: "القطر الداخلي بالمليمتر", Icon: Circle },
                ].map(({ id, label, sub, Icon }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setMode(id);
                      setResult(null);
                      setValue("");
                    }}
                    className={`text-right p-3 rounded-2xl border transition-all active:scale-[0.98] ${
                      mode === id
                        ? "bg-white border-[#8E7545] shadow-sm ring-1 ring-[#8E7545]/30"
                        : "bg-white/50 border-[#292722]/12 hover:bg-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${mode === id ? "text-[#8E7545]" : "text-[#292722]/45"}`} />
                    <div className="text-[13px] font-bold">{label}</div>
                    <div className="text-[11px] text-[#292722]/55">{sub}</div>
                  </button>
                ))}
              </div>

              <form onSubmit={handleCalculate} className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={mode === "circ" ? "مثال: 54.5" : "مثال: 17.3"}
                    className="w-full bg-white border border-[#292722]/15 rounded-2xl py-3.5 pr-4 pl-14 text-lg font-bold text-[#292722] placeholder:text-[#292722]/30 placeholder:font-normal focus:outline-none focus:border-[#8E7545] focus:ring-2 focus:ring-[#8E7545]/20"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8E7545]">مم</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#292722] hover:bg-[#3a3630] text-[#F5F0E7] font-bold text-sm transition-all active:scale-[0.98] shadow-md"
                >
                  احسبي مقاسي
                </button>
              </form>

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
                      <div>Ø {row.mmDiameter.toFixed(1)} mm</div>
                      <div>⟲ {row.mmCircumference.toFixed(1)} mm</div>
                    </div>
                  </li>
                );
              })}
              <li className="text-[11px] text-[#292722]/55 text-center pt-1" dir="rtl">
                Ø القطر الداخلي · ⟲ محيط الإصبع
              </li>
            </ul>
          )}

          {/* ───────── How to measure ───────── */}
          {tab === "how" && (
            <div className="space-y-3">
              {[
                { Icon: Scissors, t: "جهّزي خيطاً أو شريطاً ورقياً", d: "قصّي شريطاً رفيعاً غير قابل للتمدد، وسطره مسطرة بالمليمتر." },
                { Icon: Circle, t: "لفّيه حول قاعدة الإصبع", d: "حول الإصبع الذي سترتدين فيه الخاتم، وعلّمي مكان التقاء الطرفين بالقلم." },
                { Icon: Ruler, t: "قيسي الطول بالمسطرة", d: "هذا هو محيط إصبعك بالمليمتر. اكتبيه في «احسب مقاسي» أو طابقيه مع الجدول." },
              ].map(({ Icon, t, d }, i) => (
                <div key={i} className="flex gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-[#292722]/10">
                  <div className="w-10 h-10 rounded-full bg-[#292722] text-[#B7A078] flex items-center justify-center shrink-0 relative">
                    <Icon className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8E7545] text-white text-[9px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-[13px] font-bold">{t}</div>
                    <div className="text-[12px] text-[#292722]/65 leading-relaxed mt-0.5">{d}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2.5 p-3.5 rounded-2xl bg-[#D8C8B3]/45 border border-[#B7A078]/50 text-[12px] leading-relaxed">
                <Lightbulb className="w-4 h-4 text-[#8E7545] shrink-0 mt-0.5" />
                <span>
                  قيسي في آخر اليوم أو بعد الدفء، فالإصبع يكون أكبر قليلاً. وتجنّبي القياس والأيدي باردة.
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-6 w-full py-3.5 rounded-2xl border border-[#292722]/20 bg-white hover:bg-[#F5F0E7] text-[#292722] font-bold text-sm transition-colors active:scale-[0.98]"
          >
            فهمت، شكراً
          </button>
        </div>
      </div>
    </div>
  );
};

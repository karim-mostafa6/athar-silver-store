"use client";

import React, { useState } from "react";
import { X, Sparkles, Ruler, CheckCircle, Info } from "lucide-react";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

interface RingSizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RingSizeGuideModal: React.FC<RingSizeGuideModalProps> = ({ isOpen, onClose }) => {
  const [testMm, setTestMm] = useState("");
  const [calculatedSize, setCalculatedSize] = useState<string | null>(null);

  useBodyScrollLock(isOpen);
  // Lock body scroll and listen for Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeTable = [
    { us: "6", arabic: "16", mmDiameter: 16.5, mmCircumference: 51.8, note: "مقاس نسائي صغير" },
    { us: "7", arabic: "17", mmDiameter: 17.3, mmCircumference: 54.4, note: "المقاس النسائي الأكثر شيوعاً" },
    { us: "8", arabic: "18", mmDiameter: 18.1, mmCircumference: 57.0, note: "نسائي متوسط / رجالي نحيف" },
    { us: "9", arabic: "19", mmDiameter: 18.9, mmCircumference: 59.5, note: "رجالي متوسط" },
    { us: "10", arabic: "20", mmDiameter: 19.8, mmCircumference: 62.1, note: "المقاس الرجالي الأكثر طلباً" },
    { us: "11", arabic: "21", mmDiameter: 20.6, mmCircumference: 64.6, note: "رجالي عريض" },
    { us: "12", arabic: "22", mmDiameter: 21.4, mmCircumference: 67.2, note: "رجالي كبير" },
  ];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(testMm);
    if (!val || isNaN(val)) return;

    let closest = sizeTable[0];
    let minDiff = Math.abs(val - sizeTable[0].mmDiameter);

    for (const item of sizeTable) {
      const diff = Math.abs(val - item.mmDiameter);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }

    setCalculatedSize(`المقاس الأنسب لك هو المقاس الأمريكي: ${closest.us} (المصري: ${closest.arabic})`);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overscroll-contain"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] max-h-[92dvh] overflow-y-auto bg-[#faf8f5] border border-[#d8c8b4] rounded-3xl p-5 sm:p-8 text-[#1c1815] shadow-2xl text-right overscroll-contain custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-white border border-[#ded1be] text-[#736150] hover:text-[#1c1815] hover:bg-[#f6efe4] transition-all"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-6 h-6 text-[#8a7258]" />
          <h2 className="text-xl sm:text-2xl font-black text-[#1c1815] font-alexandria">
            دليل مقاسات الخواتم التفاعلي
          </h2>
        </div>
        <p className="text-xs text-[#6e5d4d] mb-6">
          تعرف على مقاس إصبعك بدقة تامة لتضمن أن خاتم أورما يأتي مناسباً ومريحاً لك 100%.
        </p>

        {/* Interactive Calculator */}
        <div className="p-4 rounded-2xl bg-white border border-[#e5dacb] mb-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1c1815]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>حاسبة المقاس الفوري (قطر الخاتم الداخلي بالمليمتر):</span>
          </div>

          <form onSubmit={handleCalculate} className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="اكتب قطر الخاتم بالـ mm (مثال: 17.5)"
              value={testMm}
              onChange={(e) => setTestMm(e.target.value)}
              className="flex-1 bg-[#f9f5ee] border border-[#ded1be] rounded-xl px-3 py-2 text-xs text-[#1c1815] placeholder-[#8f806f] focus:outline-none focus:border-[#7c6953] shadow-inner"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1c1815] text-[#faf8f5] font-bold text-xs hover:bg-[#2e2620] transition-all shrink-0 active:scale-95 shadow-sm"
            >
              احسب مقاسي
            </button>
          </form>

          {calculatedSize && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-pop">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{calculatedSize}</span>
            </div>
          )}
        </div>

        {/* Size Table */}
        <div className="overflow-x-auto mb-6 bg-white rounded-2xl border border-[#e5dacb] p-2 shadow-sm">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-[#eee4d6] text-[#6d5b4a]">
                <th className="py-2.5 px-3">المقاس الأمريكي (US)</th>
                <th className="py-2.5 px-3">المقاس المصري / العربي</th>
                <th className="py-2.5 px-3">القطر الداخلي (mm)</th>
                <th className="py-2.5 px-3">المحيط (mm)</th>
                <th className="py-2.5 px-3">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e9dc]">
              {sizeTable.map((row) => (
                <tr key={row.us} className="hover:bg-[#fbf7f0] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#1c1815] font-mono">{row.us}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#544537]">{row.arabic}</td>
                  <td className="py-2.5 px-3 text-[#544537] font-mono">{row.mmDiameter} مم</td>
                  <td className="py-2.5 px-3 text-[#544537] font-mono">{row.mmCircumference} مم</td>
                  <td className="py-2.5 px-3 text-[11px] text-[#7d6b59]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How to measure in 3 steps */}
        <div className="p-4 rounded-2xl bg-[#f5efe4] border border-[#e5dacb] space-y-3 text-xs text-[#524436]">
          <div className="flex items-center gap-2 font-bold text-[#1c1815]">
            <Info className="w-4 h-4 text-[#8a7258]" />
            <span>كيف تقيس إصبعك في المنزل بالخيط أو الورقة؟</span>
          </div>
          <ol className="space-y-1.5 list-decimal pr-5 text-[#524436]">
            <li>لف شريطاً ورقياً رفيعاً أو خيطاً حول قاعدة الإصبع الذي ترغب بارتداء الخاتم فيه.</li>
            <li>علّم بالقلم النقطة التي يلتقي عندها طرفا الورقة أو الخيط بدقة.</li>
            <li>افرد الشريط وقس الطول بالمسطرة بالمليمتر (هذا هو محيط الإصبع)، ثم طابقه مع الجدول أعلاه!</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#1c1815] hover:bg-[#2e2620] text-[#faf8f5] font-bold text-xs transition-colors shadow-sm active:scale-95"
          >
            فهمت، حسناً
          </button>
        </div>
      </div>
    </div>
  );
};

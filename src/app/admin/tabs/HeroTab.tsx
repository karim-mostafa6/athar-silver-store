"use client";

import { ImageIcon, Save, Trash2, Upload } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import { compressImageFile } from "@/lib/adminImages";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
  addToast: (title: string, message: string, type: "cart" | "wishlist" | "promo" | "info") => void;
  isSavingSettings: boolean;

}

export default function HeroTab({ settingsForm, setSettingsForm, handleSaveSettings, addToast }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* ===============================================
          SINGLE CLASSIC HERO BANNER FALLBACK
          =============================================== */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <ImageIcon className="w-4 h-4 text-[#c5a880]" />
          <span>إعدادات البانر الرئيسي (Hero)</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              العنوان الرئيسي (Hero Title) — استخدم سطراً جديداً للتقسيم
            </label>
            <textarea
              rows={2}
              value={settingsForm.heroTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
              placeholder="أورما: لا تُهدى&#10;بل تُترك"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              النص التعريفي (Hero Subtitle)
            </label>
            <input
              type="text"
              value={settingsForm.heroSubtitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
              placeholder="مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى."
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              الشعار الإعلاني القصير (Hero Tagline)
            </label>
            <input
              type="text"
              value={settingsForm.heroTagline || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroTagline: e.target.value })}
              placeholder="صياغة إيطالية يدوية فاخرة"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                نص الزر الأساسي
              </label>
              <input
                type="text"
                value={settingsForm.heroButtonText || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonText: e.target.value })}
                placeholder="تسوق المجموعة"
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                رابط الزر الأساسي
              </label>
              <input
                type="text"
                value={settingsForm.heroButtonLink || "/#products"}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonLink: e.target.value })}
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722] dir-ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="heroBtnShow"
              checked={settingsForm.heroButtonShow !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroButtonShow: e.target.checked })}
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <label htmlFor="heroBtnShow" className="text-xs font-medium text-[#292722] cursor-pointer">
              إظهار الزر الأساسي في البانر
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f0e8dc]">
            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                نص الزر الثانوي
              </label>
              <input
                type="text"
                value={settingsForm.heroSecondaryButtonText || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonText: e.target.value })}
                placeholder="اكتشف ORMA"
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                رابط الزر الثانوي
              </label>
              <input
                type="text"
                value={settingsForm.heroSecondaryButtonLink || "/#story"}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonLink: e.target.value })}
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722] dir-ltr"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="heroSecBtnShow"
              checked={settingsForm.heroSecondaryButtonShow !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryButtonShow: e.target.checked })}
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <label htmlFor="heroSecBtnShow" className="text-xs font-medium text-[#292722] cursor-pointer">
              إظهار الزر الثانوي في البانر
            </label>
          </div>

          <div className="pt-2 border-t border-[#f0e8dc] space-y-2">
            <label className="block text-xs font-medium text-[#756555]">
              صورة خلفية البانر الرئيسي (رفع ملف من الجهاز أو رابط مباشر)
            </label>

            {settingsForm.heroImageUrl && (
              <div className="flex items-center gap-3 p-3 bg-[#F5F0E7] rounded-xl border border-[#ded2c0]">
                <div className="h-14 w-28 bg-white rounded-lg border border-[#d8c8b4] overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={settingsForm.heroImageUrl}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-bold text-emerald-700 block">صورة البانر محددة</span>
                  <span className="text-[10px] text-[#756555] truncate block dir-ltr">
                    {settingsForm.heroImageUrl.startsWith("data:") ? "صورة مرفوعة من الجهاز" : settingsForm.heroImageUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, heroImageUrl: "" })}
                  className="p-1.5 text-[#8c7865] hover:text-rose-600 rounded-lg"
                  title="إزالة صورة البانر"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settingsForm.heroImageUrl || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                placeholder="https://... أو اضغط زر الرفع من جهازك"
                className="flex-1 min-w-0 bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722] dir-ltr"
              />
              <label className="shrink-0 px-3.5 py-2.5 rounded-lg bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap">
                <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                <span>رفع من جهازك</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const dataUrl = await compressImageFile(file);
                      if (dataUrl) {
                        setSettingsForm((prev) => ({ ...prev, heroImageUrl: dataUrl }));
                        addToast("تم اختيار صورة البانر", "تم تحديث صورة البانر الرئيسي بنجاح", "info");
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>

        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ إعدادات البانر الرئيسي</span>
      </button>
    </div>
  );
}

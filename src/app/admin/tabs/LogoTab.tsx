"use client";

import { Globe, Save, Trash2, Upload } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import { compressImageFile } from "@/lib/adminImages";
import { OrmaLogo } from "@/components/OrmaLogo";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
  addToast: (title: string, message: string, type: "cart" | "wishlist" | "promo" | "info") => void;

}

export default function LogoTab({ settingsForm, setSettingsForm, handleSaveSettings, addToast }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Globe className="w-4 h-4 text-[#c5a880]" />
          <span>الشعار والهوية البصرية (Logo & Brand Identity)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              نوع الشعار (Logo Type)
            </label>
            <select
              value={settingsForm.logoType || "both"}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  logoType: e.target.value as "text" | "image" | "both",
                })
              }
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-3 py-2.5 text-xs text-[#161412]"
            >
              <option value="text">نص خطي فقط (ORMA)</option>
              <option value="image">صورة شعار مخصصة (Image)</option>
              <option value="both">كلاهما معاً (Both)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              ارتفاع الشعار بالبيكسل ({settingsForm.logoHeight || 40}px)
            </label>
            <input
              type="range"
              min={20}
              max={80}
              value={settingsForm.logoHeight || 40}
              onChange={(e) => setSettingsForm({ ...settingsForm, logoHeight: Number(e.target.value) })}
              className="w-full accent-[#161412]"
            />
          </div>
        </div>

        {/* Logo Image URL and Upload from PC */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#756555]">
            صورة الشعار (رفع ملف من الجهاز أو رابط مباشر)
          </label>

          {settingsForm.logoImageUrl && (
            <div className="flex items-center gap-3 p-3 bg-[#f7f4ee] rounded-xl border border-[#ded2c0]">
              <div className="h-12 w-28 bg-white rounded border border-[#d8c8b4] p-1 flex items-center justify-center overflow-hidden">
                <img
                  src={settingsForm.logoImageUrl}
                  alt="Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 text-xs">
                <span className="font-bold text-emerald-700 block">شعار مخصص نشط</span>
                <span className="text-[10px] text-[#756555] truncate block dir-ltr">
                  {settingsForm.logoImageUrl.startsWith("data:") ? "صورة مرفوعة من الجهاز" : settingsForm.logoImageUrl}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, logoImageUrl: "" })}
                className="p-1.5 text-[#8c7865] hover:text-rose-600 rounded-lg"
                title="إزالة الشعار"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={settingsForm.logoImageUrl || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSettingsForm((prev) => ({
                  ...prev,
                  logoImageUrl: val,
                  logoType: prev.logoType === "text" && val ? "image" : prev.logoType,
                }));
              }}
              placeholder="https://... أو اضغط زر الرفع من جهازك"
              className="flex-1 min-w-0 bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
            />
            <label className="shrink-0 px-3.5 py-2.5 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap">
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
                      setSettingsForm((prev) => ({
                        ...prev,
                        logoImageUrl: dataUrl,
                        logoType: prev.logoType === "text" ? "image" : prev.logoType,
                      }));
                      addToast("تم اختيار الشعار", "تم تحديد وتعيين صورة الشعار بنجاح", "info");
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f0e8dc]">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              اسم البراند بالعربية
            </label>
            <input
              type="text"
              value={settingsForm.brandNameArabic || "أورما"}
              onChange={(e) => setSettingsForm({ ...settingsForm, brandNameArabic: e.target.value })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold text-[#161412]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              اسم البراند بالإنجليزية
            </label>
            <input
              type="text"
              value={settingsForm.brandNameEnglish || "ORMA"}
              onChange={(e) => setSettingsForm({ ...settingsForm, brandNameEnglish: e.target.value })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold font-mono text-[#161412] dir-ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">
            الشعار اللفظي الملحق (Slogan / Subtitle)
          </label>
          <input
            type="text"
            value={settingsForm.brandSubtitle || "مش بتتهدي.. بتتساب"}
            onChange={(e) => setSettingsForm({ ...settingsForm, brandSubtitle: e.target.value })}
            className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
          />
        </div>

        {/* Live Logo Preview Box */}
        <div className="p-6 bg-[#f7f4ee] rounded-xl border border-[#ded2c0] flex flex-col items-center justify-center gap-2">
          <span className="text-[10px] text-[#8c7865] uppercase tracking-wider mb-2">معاينة مباشرة للشعار:</span>
          <OrmaLogo variant="light" size="lg" showSlogan />
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ الشعار والهوية البصرية</span>
      </button>
    </div>
  );
}

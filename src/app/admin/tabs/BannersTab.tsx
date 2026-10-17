"use client";

import { Save, Sparkles, Trash2, Upload } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import { compressImageFile } from "@/lib/adminImages";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
  addToast: (title: string, message: string, type: "cart" | "wishlist" | "promo" | "info") => void;
  isSavingSettings: boolean;

}

export default function BannersTab({ settingsForm, setSettingsForm, handleSaveSettings, addToast, isSavingSettings }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Main Banner Controls */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-5">
        <div className="text-sm font-bold text-[#292722] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c5a880]" />
            <span>البانرات الإعلانية المخصصة والتحكم في موقعها بالمتجر</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={settingsForm.promoBannerShow !== false}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, promoBannerShow: e.target.checked })
              }
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <span className="font-bold text-[#292722]">تفعيل ظهور البانر في المتجر</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Position Picker */}
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              موقع البانر في صفحة المتجر (Position) *
            </label>
            <select
              value={settingsForm.promoBannerPosition || "after_hero"}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  promoBannerPosition: e.target.value as "top" | "after_hero" | "between_products" | "before_care" | "before_footer",
                })
              }
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] font-bold focus:outline-none"
            >
              <option value="after_hero">بعد البانر الرئيسي وقبل المنتجات (موصى به)</option>
              <option value="top">أعلى الصفحة تحت شريط التنقل مباشرة</option>
              <option value="between_products">بين قسم المنتجات وقسم قصة البراند</option>
              <option value="before_care">قبل قسم دليل العناية بالفضة</option>
              <option value="before_footer">أسفل الموقع فوق الفوتر مباشرة</option>
            </select>
            <span className="text-[10px] text-[#8c7865] mt-1 block">
              يمكنك نقل البانر لأي مكان في الموقع بحرية كاملة
            </span>
          </div>

          {/* Theme Picker */}
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              المظهر اللوني للبانر (Theme)
            </label>
            <select
              value={settingsForm.promoBannerTheme || "charcoal"}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  promoBannerTheme: e.target.value as "charcoal" | "sand" | "gold" | "burgundy",
                })
              }
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none"
            >
              <option value="charcoal">فحم ملكي داكن مع لمعان برونزي (Charcoal & Gold)</option>
              <option value="gold">ذهبي برونزي ملكي دافئ (Royal Bronze Gold)</option>
              <option value="sand">رملي ناعم كلاسيكي (Warm Sand & Charcoal)</option>
              <option value="burgundy">عنابي ملكي دافئ (Royal Burgundy)</option>
            </select>
          </div>
        </div>

        {/* Banner Texts */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              شارة البانر العلوية (Badge)
            </label>
            <input
              type="text"
              value={settingsForm.promoBannerBadge || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, promoBannerBadge: e.target.value })
              }
              placeholder="عرض استثنائي لفترة محدودة"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              عنوان البانر الرئيسي (Headline) *
            </label>
            <input
              type="text"
              value={settingsForm.promoBannerTitle || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, promoBannerTitle: e.target.value })
              }
              placeholder="تألقي ببريق الفضة الإيطالية عيار 925"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              النص الترويجي التفصيلي (Subtitle)
            </label>
            <textarea
              rows={2}
              value={settingsForm.promoBannerSubtitle || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, promoBannerSubtitle: e.target.value })
              }
              placeholder="احصل على خصم 10% فوري عند استخدام كود ORMA10 مع شحن مجاني للطلبات المؤكدة اليوم."
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                نص زر التحويل (CTA Button)
              </label>
              <input
                type="text"
                value={settingsForm.promoBannerButtonText || ""}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, promoBannerButtonText: e.target.value })
                }
                placeholder="تسوق العروض الآن"
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                رابط الزر (Href)
              </label>
              <input
                type="text"
                value={settingsForm.promoBannerButtonLink || ""}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, promoBannerButtonLink: e.target.value })
                }
                placeholder="#products أو رابط صفحة التشكيلة"
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none dir-ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#756555]">
              صورة ترويجية في البانر (رفع ملف من الجهاز أو رابط مباشر)
            </label>

            {settingsForm.promoBannerImageUrl && (
              <div className="flex items-center gap-3 p-3 bg-[#F5F0E7] rounded-xl border border-[#ded2c0]">
                <div className="h-14 w-28 bg-white rounded-lg border border-[#d8c8b4] overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={settingsForm.promoBannerImageUrl}
                    alt="Promo Banner Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-bold text-emerald-700 block">صورة البانر الترويجي محددة</span>
                  <span className="text-[10px] text-[#756555] truncate block dir-ltr">
                    {settingsForm.promoBannerImageUrl.startsWith("data:") ? "صورة مرفوعة من الجهاز" : settingsForm.promoBannerImageUrl}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, promoBannerImageUrl: "" })}
                  className="p-1.5 text-[#8c7865] hover:text-rose-600 rounded-lg"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settingsForm.promoBannerImageUrl || ""}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, promoBannerImageUrl: e.target.value })
                }
                placeholder="https://images.unsplash.com/... أو اضغط زر الرفع من جهازك"
                className="flex-1 min-w-0 bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none dir-ltr"
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
                        setSettingsForm((prev) => ({ ...prev, promoBannerImageUrl: dataUrl }));
                        addToast("تم اختيار صورة البانر", "تم تحديد صورة البانر الترويجي بنجاح", "info");
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Live Banner Preview Card */}
        <div className="pt-4 border-t border-[#f0e8dc]">
          <span className="text-xs font-bold text-[#292722] block mb-2">
            معاينة حية لشكل البانر حسب إعداداتك الحالية:
          </span>
          <div
            className={`p-6 rounded-xl border shadow-md relative overflow-hidden transition-all ${
              settingsForm.promoBannerTheme === "sand"
                ? "bg-[#eee4d5] text-[#292722] border-[#ded1be]"
                : settingsForm.promoBannerTheme === "gold"
                ? "bg-gradient-to-r from-[#211a14] via-[#2d2319] to-[#1a140f] text-[#fbf7f0] border-[#c5a880]/40"
                : settingsForm.promoBannerTheme === "burgundy"
                ? "bg-[#201014] text-white border-[#913d4b]/40"
                : "bg-[#292722] text-[#F5F0E7] border-[#2e2925]"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2">
                {settingsForm.promoBannerBadge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 border border-white/20">
                    {settingsForm.promoBannerBadge}
                  </span>
                )}
                <h4 className="font-amiri text-xl font-bold">
                  {settingsForm.promoBannerTitle || "عنوان البانر الإعلاني"}
                </h4>
                <p className="text-xs opacity-80 max-w-md">
                  {settingsForm.promoBannerSubtitle || "النص الترويجي المصاحب للبانر..."}
                </p>
                {settingsForm.promoBannerButtonText && (
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1.5 rounded-lg text-xs font-bold bg-[#c5a880] text-[#292722]">
                      {settingsForm.promoBannerButtonText}
                    </span>
                  </div>
                )}
              </div>
              {settingsForm.promoBannerImageUrl && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black/20">
                  <img
                    src={settingsForm.promoBannerImageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-[#c5a880]" />
            <span>حفظ إعدادات البانر في السحابة فورياً</span>
          </button>
        </div>
      </div>
    </div>
  );
}

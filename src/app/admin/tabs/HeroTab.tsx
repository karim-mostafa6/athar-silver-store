"use client";

import { ChevronDown, ChevronUp, ImageIcon, Layers, Plus, Save, Trash2, Upload } from "lucide-react";
import type { StoreSettings, HeroSlideItem } from "@/context/StoreContext";
import { compressImageFile } from "@/lib/adminImages";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
  addToast: (title: string, message: string, type: "cart" | "wishlist" | "promo" | "info") => void;
  isSavingSettings: boolean;

}

export default function HeroTab({ settingsForm, setSettingsForm, handleSaveSettings, addToast, isSavingSettings }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* ===============================================
          HERO SLIDER (MULTI-SLIDE CAROUSEL)
          =============================================== */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-5">
        <div className="text-sm font-bold text-[#292722] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c5a880]" />
            <span>سلايدر البانر الرئيسي المتحرك (يتقلب تلقائياً كل 5 ثواني)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const newSlide: HeroSlideItem = {
                id: `slide-${Date.now()}`,
                imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=85",
                title: "مش بتتهدي..",
                titleLine2: "بتتساب",
                subtitle: "مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك وتبقى بصمة لا تُمحى.",
                primaryButtonText: "تسوّق المجموعة",
                primaryButtonLink: "/collection/all",
                secondaryButtonText: "اكتشف ORMA",
                secondaryButtonLink: "#story",
                overlayDarkness: "medium",
                contentAlign: "right",
                enabled: true,
                badge: "تشكيلة جديدة",
              };
              const currentSlides = settingsForm.heroSlides || [];
              setSettingsForm({ ...settingsForm, heroSlides: [...currentSlides, newSlide] });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>إضافة شريحة للمناسبات / العروض</span>
          </button>
        </div>

        <div className="text-xs text-[#756555] bg-[#F5F0E7] rounded-lg p-3 border border-[#e8ded0] leading-relaxed">
          يمكنك إضافة عدة شرائح مصورة هنا لتتحول واجهة المتجر إلى سلايدر تفاعلي بعرض الصفحة يتقلب تلقائياً كل 5 ثوانٍ مع شريط تقدم وتأثير حركة سلس. يمكنك تخصيص صورة ونصوص وزر كل شريحة لأي مناسبة أو عرض خاص.
        </div>

        {(!settingsForm.heroSlides || settingsForm.heroSlides.length === 0) ? (
          <div className="py-8 text-center text-xs text-[#8c7865] border-2 border-dashed border-[#e8ded0] rounded-xl space-y-2">
            <p className="font-bold text-[#292722]">لم يتم إضافة أي شريحة بعد في السلايدر المتعدد</p>
            <p>يعمل المتجر حالياً بنظام البانر الكلاسيكي الفردي. اضغط على الزر أعلاه لإضافة أول شريحة لسلايدر المناسبات.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {settingsForm.heroSlides.map((slide, idx) => (
              <div key={slide.id} className="border border-[#e8ded0] rounded-xl overflow-hidden bg-[#F5F0E7]">
                <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[#e8ded0]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#292722] text-[#F5F0E7] text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#292722] truncate max-w-[200px]">
                      {slide.title || "شريحة بدون عنوان"} {slide.titleLine2 ? `• ${slide.titleLine2}` : ""}
                    </span>
                    {slide.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0e8dc] text-[#5c4f42] font-medium">
                        {slide.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#756555] font-medium">
                      <input
                        type="checkbox"
                        checked={slide.enabled !== false}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, enabled: e.target.checked } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        className="rounded border-[#ded2c0] text-[#292722]"
                      />
                      <span>مُفعّلة</span>
                    </label>
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [...(settingsForm.heroSlides || [])];
                          const temp = arr[idx - 1];
                          arr[idx - 1] = arr[idx];
                          arr[idx] = temp;
                          setSettingsForm({ ...settingsForm, heroSlides: arr });
                        }}
                        className="p-1 rounded text-[#8c7865] hover:text-[#292722] hover:bg-[#f0e8dc]"
                        title="تحريك لأعلى"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    )}
                    {idx < (settingsForm.heroSlides || []).length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const arr = [...(settingsForm.heroSlides || [])];
                          const temp = arr[idx + 1];
                          arr[idx + 1] = arr[idx];
                          arr[idx] = temp;
                          setSettingsForm({ ...settingsForm, heroSlides: arr });
                        }}
                        className="p-1 rounded text-[#8c7865] hover:text-[#292722] hover:bg-[#f0e8dc]"
                        title="تحريك لأسفل"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف هذه الشريحة؟`)) {
                          const updated = (settingsForm.heroSlides || []).filter((_, i) => i !== idx);
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }
                      }}
                      className="p-1 rounded text-[#8c7865] hover:text-rose-600 hover:bg-rose-50"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Image upload */}
                  <div>
                    <label className="block font-medium text-[#756555] mb-1">
                      صورة خلفية الشريحة (رفع من جهازك أو رابط مباشر) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, imageUrl: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="https://... أو اضغط رفع من جهازك"
                        className="flex-1 bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none dir-ltr"
                      />
                      <label className="px-3.5 py-2 rounded-lg bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>رفع</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const dataUrl = await compressImageFile(file);
                              if (dataUrl) {
                                const updated = (settingsForm.heroSlides || []).map((s, i) =>
                                  i === idx ? { ...s, imageUrl: dataUrl } : s
                                );
                                setSettingsForm({ ...settingsForm, heroSlides: updated });
                                addToast("تم اختيار الصورة", "تم تحديث صورة الشريحة بنجاح", "info");
                              }
                            }
                          }}
                        />
                      </label>
                      {slide.imageUrl && (
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-[#ded2c0] shrink-0 bg-black">
                          <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        العنوان الرئيسي (السطر الأول) *
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, title: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="أورما: لا تُهدى بل تُترك"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        السطر الثاني (يظهر بلون ذهبي فخم)
                      </label>
                      <input
                        type="text"
                        value={slide.titleLine2 || ""}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, titleLine2: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="بل يُترك"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Badge + Darkness + Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        شارة الشريحة (Badge)
                      </label>
                      <input
                        type="text"
                        value={slide.badge || ""}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, badge: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="عرض خاص بمناسبة العيد"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        درجة تعتيم الصورة
                      </label>
                      <select
                        value={slide.overlayDarkness || "medium"}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, overlayDarkness: e.target.value as "light" | "medium" | "dark" } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                      >
                        <option value="light">خفيف (إظهار وضوح الصورة أكثر)</option>
                        <option value="medium">متوسط (متوازن ومريح للقراءة)</option>
                        <option value="dark">داكن (تركيز أكبر على النص الملكي)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        محاذاة النص
                      </label>
                      <select
                        value={slide.contentAlign || "right"}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, contentAlign: e.target.value as "center" | "right" | "left" } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                      >
                        <option value="right">يمين (افتراضي فاخر)</option>
                        <option value="center">وسط</option>
                        <option value="left">يسار</option>
                      </select>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block font-medium text-[#756555] mb-1">
                      النص التوضيحي (Subtitle)
                    </label>
                    <input
                      type="text"
                      value={slide.subtitle || ""}
                      onChange={(e) => {
                        const updated = (settingsForm.heroSlides || []).map((s, i) =>
                          i === idx ? { ...s, subtitle: e.target.value } : s
                        );
                        setSettingsForm({ ...settingsForm, heroSlides: updated });
                      }}
                      placeholder="مصوغات فضية نقية عيار 925 صُممت لتخلد تفاصيلك..."
                      className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#f0e8dc]">
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        نص الزر الأساسي
                      </label>
                      <input
                        type="text"
                        value={slide.primaryButtonText || ""}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, primaryButtonText: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="تسوق المجموعة"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        رابط الزر الأساسي
                      </label>
                      <input
                        type="text"
                        value={slide.primaryButtonLink || ""}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, primaryButtonLink: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="/collection/all أو #products"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none dir-ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        نص الزر الثانوي (رابط نصي أنيق)
                      </label>
                      <input
                        type="text"
                        value={slide.secondaryButtonText || ""}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, secondaryButtonText: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="اكتشف ORMA"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#756555] mb-1">
                        رابط الزر الثانوي
                      </label>
                      <input
                        type="text"
                        value={slide.secondaryButtonLink || ""}
                        onChange={(e) => {
                          const updated = (settingsForm.heroSlides || []).map((s, i) =>
                            i === idx ? { ...s, secondaryButtonLink: e.target.value } : s
                          );
                          setSettingsForm({ ...settingsForm, heroSlides: updated });
                        }}
                        placeholder="#story"
                        className="w-full bg-white border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722] focus:outline-none dir-ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-[#c5a880]" />
            <span>حفظ شرائح السلايدر في السحابة فورياً</span>
          </button>
        </div>
      </div>

      {/* ===============================================
          SINGLE CLASSIC HERO BANNER FALLBACK
          =============================================== */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <ImageIcon className="w-4 h-4 text-[#c5a880]" />
          <span>إعدادات البانر الكلاسيكي الفردي (Hero Section)</span>
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

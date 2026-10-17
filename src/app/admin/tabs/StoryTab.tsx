"use client";

import { Package, Save, ShieldCheck, Sparkles, Star, Trash2, Upload } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import { compressImageFile } from "@/lib/adminImages";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
  addToast: (title: string, message: string, type: "cart" | "wishlist" | "promo" | "info") => void;

}

export default function StoryTab({ settingsForm, setSettingsForm, handleSaveSettings, addToast }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Products Section on Homepage */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Package className="w-4 h-4 text-[#c5a880]" />
          <span>نصوص قسم استعراض المنتجات بالصفحة الرئيسية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">الشارة العلوية (Badge)</label>
            <input
              type="text"
              value={settingsForm.productsSectionBadge || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, productsSectionBadge: e.target.value })}
              placeholder="تشكيلة الفضة الإسترليني"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">عنوان القسم الرئيسي</label>
            <input
              type="text"
              value={settingsForm.productsSectionTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, productsSectionTitle: e.target.value })}
              placeholder="روائع الصياغة الإيطالية"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">الوصف الفرعي للقسم</label>
            <input
              type="text"
              value={settingsForm.productsSectionSubtitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, productsSectionSubtitle: e.target.value })}
              placeholder="قطع مختارة من الفضة عيار 925 النقية"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Gender Split Section */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Star className="w-4 h-4 text-[#c5a880]" />
          <span>قسم التشكيلتين (نسائي / رجالي - Gender Split)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Women */}
          <div className="p-4 bg-[#F5F0E7] rounded-xl border border-[#ded2c0] space-y-3">
            <h5 className="font-bold text-xs text-[#292722] border-b border-[#d8c8b4] pb-2">التشكيلة النسائية</h5>
            <input
              type="text"
              value={settingsForm.splitWomenTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenTitle: e.target.value })}
              placeholder="العنوان بالعربية"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <input
              type="text"
              value={settingsForm.splitWomenEnglishTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenEnglishTitle: e.target.value })}
              placeholder="English Title: WOMEN'S COLLECTION"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-mono"
            />
            <input
              type="text"
              value={settingsForm.splitWomenButtonText || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenButtonText: e.target.value })}
              placeholder="نص الزر: EXPLORE NOW"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
            <input
              type="text"
              value={settingsForm.splitWomenLink || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenLink: e.target.value })}
              placeholder="رابط التوجيه (افتراضي: /collection/women)"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr font-mono"
            />
            {/* Women Image Upload & Preview */}
            <div className="space-y-1.5 pt-1">
              {settingsForm.splitWomenImage && (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#ded2c0]">
                  <div className="w-10 h-10 rounded overflow-hidden border shrink-0">
                    <img src={settingsForm.splitWomenImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-[#756555] truncate flex-1 dir-ltr">
                    {settingsForm.splitWomenImage.startsWith("data:") ? "صورة مرفوعة" : settingsForm.splitWomenImage}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, splitWomenImage: "" })}
                    className="text-[#8c7865] hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={settingsForm.splitWomenImage || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, splitWomenImage: e.target.value })}
                  placeholder="رابط الصورة أو رفع ملف"
                  className="flex-1 bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr"
                />
                <label className="px-2.5 py-1.5 rounded bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <Upload className="w-3 h-3 text-[#c5a880]" />
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
                          setSettingsForm((prev) => ({ ...prev, splitWomenImage: dataUrl }));
                          addToast("تم اختيار الصورة", "تم تحديث صورة التشكيلة النسائية", "info");
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Men */}
          <div className="p-4 bg-[#F5F0E7] rounded-xl border border-[#ded2c0] space-y-3">
            <h5 className="font-bold text-xs text-[#292722] border-b border-[#d8c8b4] pb-2">التشكيلة الرجالية</h5>
            <input
              type="text"
              value={settingsForm.splitMenTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitMenTitle: e.target.value })}
              placeholder="العنوان بالعربية"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <input
              type="text"
              value={settingsForm.splitMenEnglishTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitMenEnglishTitle: e.target.value })}
              placeholder="English Title: MEN'S COLLECTION"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-mono"
            />
            <input
              type="text"
              value={settingsForm.splitMenButtonText || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitMenButtonText: e.target.value })}
              placeholder="نص الزر: EXPLORE NOW"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
            <input
              type="text"
              value={settingsForm.splitMenLink || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, splitMenLink: e.target.value })}
              placeholder="رابط التوجيه (افتراضي: /collection/men)"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr font-mono"
            />
            
            {/* Men Image Upload & Preview */}
            <div className="space-y-1.5 pt-1">
              {settingsForm.splitMenImage && (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#ded2c0]">
                  <div className="w-10 h-10 rounded overflow-hidden border shrink-0">
                    <img src={settingsForm.splitMenImage} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[10px] text-[#756555] truncate flex-1 dir-ltr">
                    {settingsForm.splitMenImage.startsWith("data:") ? "صورة مرفوعة" : settingsForm.splitMenImage}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSettingsForm({ ...settingsForm, splitMenImage: "" })}
                    className="text-[#8c7865] hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={settingsForm.splitMenImage || ""}
                  onChange={(e) => setSettingsForm({ ...settingsForm, splitMenImage: e.target.value })}
                  placeholder="رابط الصورة أو رفع ملف"
                  className="flex-1 bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr"
                />
                <label className="px-2.5 py-1.5 rounded bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <Upload className="w-3 h-3 text-[#c5a880]" />
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
                          setSettingsForm((prev) => ({ ...prev, splitMenImage: dataUrl }));
                          addToast("تم اختيار الصورة", "تم تحديث صورة التشكيلة الرجالية", "info");
                        }
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Story & 4 Pillars */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Sparkles className="w-4 h-4 text-[#c5a880]" />
          <span>قصة البراند وأركان التميز الـ 4 (Brand Story)</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={settingsForm.storySectionShow !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, storySectionShow: e.target.checked })}
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <span>إظهار قسم القصة في المتجر</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">شارة القصة (Badge)</label>
            <input
              type="text"
              value={settingsForm.storyBadge || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyBadge: e.target.value })}
              placeholder="أصالة وحرفية"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">عنوان القصة</label>
            <input
              type="text"
              value={settingsForm.storyTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyTitle: e.target.value })}
              placeholder="القطعة اللي بتفضل بعد ما اللحظة تعدّي"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1">نص قصة البراند</label>
          <textarea
            rows={3}
            value={settingsForm.storySubtitle || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, storySubtitle: e.target.value })}
            placeholder="نصنع كل قطعة في ORMA من الفضة الإسترليني عيار 925..."
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#756555]">صورة قسم القصة (ورشة / تصنيع) - اختياري</label>
          {settingsForm.storyImageUrl && (
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#ded2c0]">
              <div className="w-10 h-10 rounded overflow-hidden border shrink-0">
                <img src={settingsForm.storyImageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] text-[#756555] truncate flex-1 dir-ltr">
                {settingsForm.storyImageUrl.startsWith("data:") ? "صورة مرفوعة" : settingsForm.storyImageUrl}
              </span>
              <button type="button" onClick={() => setSettingsForm({ ...settingsForm, storyImageUrl: "" })} className="text-[#8c7865] hover:text-rose-600 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={settingsForm.storyImageUrl || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyImageUrl: e.target.value })}
              placeholder="رابط الصورة أو رفع ملف"
              className="flex-1 bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs dir-ltr"
            />
            <label className="px-2.5 py-1.5 rounded bg-[#292722] text-[#F5F0E7] text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <Upload className="w-3 h-3 text-[#c5a880]" />
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
                      setSettingsForm((prev) => ({ ...prev, storyImageUrl: dataUrl }));
                      addToast("تم اختيار الصورة", "تم تحديث صورة قسم القصة", "info");
                    }
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#f0e8dc]">
          {/* Pillar 1 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">الركيزة 1</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.storyPillar1Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar1Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.storyPillar1Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar1Title: e.target.value })}
              placeholder="فضة 925 نقية ومختومة"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.storyPillar1Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar1Desc: e.target.value })}
              placeholder="وصف الركيزة..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Pillar 2 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">الركيزة 2</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.storyPillar2Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar2Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.storyPillar2Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar2Title: e.target.value })}
              placeholder="صياغة يدوية احترافية"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.storyPillar2Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar2Desc: e.target.value })}
              placeholder="وصف الركيزة..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Pillar 3 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">الركيزة 3</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.storyPillar3Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar3Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.storyPillar3Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar3Title: e.target.value })}
              placeholder="تغليف هدايا ملكي"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.storyPillar3Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar3Desc: e.target.value })}
              placeholder="وصف الركيزة..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Pillar 4 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">الركيزة 4</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.storyPillar4Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar4Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.storyPillar4Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar4Title: e.target.value })}
              placeholder="ضمان أصالة وتألق مستمر"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.storyPillar4Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, storyPillar4Desc: e.target.value })}
              placeholder="وصف الركيزة..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Silver Care Section & 4 Tips */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
          <span>دليل العناية بالفضة والنصائح الـ 4 (Silver Care)</span>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={settingsForm.careSectionShow !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, careSectionShow: e.target.checked })}
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <span>إظهار قسم العناية بالفضة</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">عنوان قسم العناية</label>
            <input
              type="text"
              value={settingsForm.careTitle || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTitle: e.target.value })}
              placeholder="كيف تحافظ على بريق فضتك للأبد؟"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs font-bold"
            />
          </div>
        </div>

        {/* 4 Care Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#f0e8dc]">
          {/* Tip 1 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">النصيحة 1</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.careTip1Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, careTip1Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.careTip1Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip1Title: e.target.value })}
              placeholder="العطور والمواد الكيميائية"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.careTip1Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip1Desc: e.target.value })}
              placeholder="ارتدِ قطعتك بعد رش العطر لحماية الفضة..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Tip 2 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">النصيحة 2</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.careTip2Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, careTip2Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.careTip2Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip2Title: e.target.value })}
              placeholder="الحفظ في العلبة"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.careTip2Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip2Desc: e.target.value })}
              placeholder="احفظها في علبة ORMA المبطنة بمكان جاف..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Tip 3 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">النصيحة 3</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.careTip3Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, careTip3Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.careTip3Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip3Title: e.target.value })}
              placeholder="المسح بعد الاستخدام"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.careTip3Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip3Desc: e.target.value })}
              placeholder="امسحها بقطعة قماش ناعمة وجافة بعد كل ارتداء..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Tip 4 */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#292722]">النصيحة 4</span>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.careTip4Show !== false}
                  onChange={(e) => setSettingsForm({ ...settingsForm, careTip4Show: e.target.checked })}
                  className="rounded border-[#ded2c0] text-[#292722]"
                />
                <span>ظاهر</span>
              </label>
            </div>
            <input
              type="text"
              value={settingsForm.careTip4Title || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip4Title: e.target.value })}
              placeholder="الارتداء المستمر"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs font-bold"
            />
            <textarea
              rows={2}
              value={settingsForm.careTip4Desc || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, careTip4Desc: e.target.value })}
              placeholder="الارتداء اليومي الطبيعي يحافظ على نقاء الفضة وحيويتها..."
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ نصوص القصة والعناية</span>
      </button>
    </div>
  );
}

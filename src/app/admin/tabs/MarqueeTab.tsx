"use client";

import { Megaphone, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { StoreSettings, MarqueeExtraMessage } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;

}

export default function MarqueeTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  const [newExtraMsgText, setNewExtraMsgText] = useState<string>("");
  // Helper for Marquee Extra Messages
  const addMarqueeExtraMessage = () => {
    if (!newExtraMsgText.trim()) return;
    const newMsg: MarqueeExtraMessage = {
      id: `msg-${Date.now()}`,
      text: newExtraMsgText.trim(),
      visible: true,
    };
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: [...(prev.marqueeExtraMessages || []), newMsg],
    }));
    setNewExtraMsgText("");
  };

  const removeMarqueeExtraMessage = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: (prev.marqueeExtraMessages || []).filter((m) => m.id !== id),
    }));
  };

  const toggleMarqueeExtraMessage = (id: string) => {
    setSettingsForm((prev) => ({
      ...prev,
      marqueeExtraMessages: (prev.marqueeExtraMessages || []).map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      ),
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Megaphone className="w-4 h-4 text-[#c5a880]" />
          <span>شريط الإعلانات المتحرك (Marquee Bar)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showMarqueeCheck"
              checked={settingsForm.showMarquee}
              onChange={(e) => setSettingsForm({ ...settingsForm, showMarquee: e.target.checked })}
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <label htmlFor="showMarqueeCheck" className="text-xs font-bold text-[#292722] cursor-pointer">
              تفعيل شريط الإعلانات
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">الثيم واللون</label>
            <select
              value={settingsForm.marqueeTheme || "default"}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  marqueeTheme: e.target.value as "default" | "dark" | "gold" | "burgundy",
                })
              }
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722]"
            >
              <option value="default">كريمي افتراضي</option>
              <option value="dark">داكن Charcoal</option>
              <option value="gold">ذهبي فاخر</option>
              <option value="burgundy">عنابي ملكي</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1">سرعة الحركة</label>
            <select
              value={settingsForm.marqueeSpeed || "normal"}
              onChange={(e) =>
                setSettingsForm({
                  ...settingsForm,
                  marqueeSpeed: e.target.value as "slow" | "normal" | "fast",
                })
              }
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs text-[#292722]"
            >
              <option value="slow">هادئة (Slow)</option>
              <option value="normal">متوسطة (Normal)</option>
              <option value="fast">سريعة (Fast)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="marqueePause"
            checked={settingsForm.marqueePauseOnHover !== false}
            onChange={(e) => setSettingsForm({ ...settingsForm, marqueePauseOnHover: e.target.checked })}
            className="rounded border-[#ded2c0] text-[#292722]"
          />
          <label htmlFor="marqueePause" className="text-xs font-medium text-[#292722] cursor-pointer">
            إيقاف الحركة عند تمرير الماوس فوق الشريط (Pause on hover)
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1">
            رسالة إعلانية مخصصة رئيسية
          </label>
          <input
            type="text"
            value={settingsForm.marqueeCustomText || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, marqueeCustomText: e.target.value })}
            placeholder="خصومات حصرية بمناسبة إطلاق تشكيلة الصيف..."
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
          />
        </div>

        {/* Subsections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#f0e8dc]">
          {/* Countdown */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.marqueeShowCountdown}
                onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowCountdown: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>عداد تنازلي للعرض (Countdown)</span>
            </label>
            <input
              type="text"
              value={settingsForm.marqueeCountdownLabel || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, marqueeCountdownLabel: e.target.value })}
              placeholder="ينتهي العرض الخاص خلال:"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#756555]">ساعات العداد:</span>
              <input
                type="number"
                value={settingsForm.marqueeCountdownHours || 24}
                onChange={(e) => setSettingsForm({ ...settingsForm, marqueeCountdownHours: Number(e.target.value) })}
                className="w-20 bg-white border border-[#ded2c0] rounded px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Free Shipping */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.marqueeShowFreeShipping}
                onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowFreeShipping: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>رسالة الشحن المجاني</span>
            </label>
            <input
              type="text"
              value={settingsForm.marqueeFreeShippingText || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, marqueeFreeShippingText: e.target.value })}
              placeholder="شحن مجاني على كافة الطلبات اليوم"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Promo */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.marqueeShowPromo}
                onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowPromo: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>إبراز كوبون الخصم</span>
            </label>
            <input
              type="text"
              value={settingsForm.marqueePromoPrefix || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, marqueePromoPrefix: e.target.value })}
              placeholder="استخدم كود الخصم الحصري"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Warranty */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.marqueeShowWarranty}
                onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowWarranty: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>رسالة الضمان والفحص</span>
            </label>
            <input
              type="text"
              value={settingsForm.marqueeWarrantyText || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, marqueeWarrantyText: e.target.value })}
              placeholder="معاينة القطعة وضمان الفضة 925"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>

          {/* Gift Wrap */}
          <div className="p-3 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] space-y-2 sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.marqueeShowGiftWrap}
                onChange={(e) => setSettingsForm({ ...settingsForm, marqueeShowGiftWrap: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>رسالة تغليف الهدايا</span>
            </label>
            <input
              type="text"
              value={settingsForm.marqueeGiftWrapText || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, marqueeGiftWrapText: e.target.value })}
              placeholder="تغليف هدايا فاخر متاح مجاناً مع كل طلب"
              className="w-full bg-white border border-[#ded2c0] rounded px-3 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Extra Messages Array */}
        <div className="pt-4 border-t border-[#f0e8dc] space-y-3">
          <div className="text-xs font-bold text-[#292722]">
            رسائل متحركة إضافية في الشريط (Extra Messages):
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newExtraMsgText}
              onChange={(e) => setNewExtraMsgText(e.target.value)}
              placeholder="اكتب رسالة إضافية للشريط..."
              className="flex-1 min-w-0 bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-3 py-2 text-xs"
            />
            <button
              type="button"
              onClick={addMarqueeExtraMessage}
              className="px-4 py-2 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold hover:bg-[#2e2925]"
            >
              إضافة
            </button>
          </div>

          <div className="space-y-2">
            {(settingsForm.marqueeExtraMessages || []).map((msg) => (
              <div
                key={msg.id}
                className="flex items-center justify-between p-2.5 bg-[#F5F0E7] rounded-lg border border-[#e4dcce] text-xs"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={msg.visible}
                    onChange={() => toggleMarqueeExtraMessage(msg.id)}
                    className="rounded border-[#ded2c0] text-[#292722]"
                  />
                  <span className={msg.visible ? "text-[#292722]" : "text-[#8c7865] line-through"}>
                    {msg.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeMarqueeExtraMessage(msg.id)}
                  className="text-rose-600 hover:text-rose-800 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ إعدادات شريط الإعلانات</span>
      </button>
    </div>
  );
}

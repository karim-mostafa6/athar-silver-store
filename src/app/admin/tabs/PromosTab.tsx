"use client";

import { Save, Tag } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
}

export default function PromosTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Tag className="w-4 h-4 text-[#c5a880]" />
          <span>كوبونات الخصم الترويجية والعروض</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              كود الكوبون الفعّال (Promo Code)
            </label>
            <input
              type="text"
              value={settingsForm.promoCode || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, promoCode: e.target.value.toUpperCase() })}
              placeholder="ORMA10"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] font-mono font-bold focus:outline-none dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              نسبة الخصم (%)
            </label>
            <input
              type="number"
              value={settingsForm.promoDiscountPercent || 10}
              onChange={(e) => setSettingsForm({ ...settingsForm, promoDiscountPercent: Number(e.target.value) })}
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              حد الشحن المجاني المرتبط (ج.م)
            </label>
            <input
              type="number"
              value={settingsForm.freeShippingThreshold || 1500}
              onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ الكوبونات والعروض</span>
      </button>
    </div>
  );
}

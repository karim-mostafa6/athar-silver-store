"use client";

import { Save, ShieldCheck } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
}

export default function PoliciesTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <ShieldCheck className="w-4 h-4 text-[#c5a880]" />
          <span>سياسات المتجر (الاستبدال والاسترجاع والضمان)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              مهلة الاستبدال والاسترجاع (بالأيام)
            </label>
            <input
              type="number"
              value={settingsForm.returnPolicyDays || 14}
              onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyDays: Number(e.target.value) })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs font-bold text-[#161412]"
            />
          </div>

        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">
            النص التفصيلي لسياسة الاستبدال والاسترجاع
          </label>
          <textarea
            rows={3}
            value={settingsForm.returnPolicyText || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, returnPolicyText: e.target.value })}
            placeholder="يحق للعميل معاينة واستبدال القطعة خلال 14 يوماً بشرط أن تكون بحالتها الأصلية..."
            className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">
            نص ضمان الفضة والشهادة المعتمدة (Warranty Policy)
          </label>
          <textarea
            rows={3}
            value={settingsForm.warrantyPolicyText || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, warrantyPolicyText: e.target.value })}
            placeholder="جميع قطع متجر ORMA مصوغة من الفضة الإسترليني عيار 925 المعتمدة والمختومة رسميًا..."
            className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">
            الجدول الزمني المعتاد للشحن والتوصيل (Shipping Timeline)
          </label>
          <input
            type="text"
            value={settingsForm.shippingPolicyTimeline || "التوصيل خلال 2-4 أيام عمل لكافة محافظات مصر"}
            onChange={(e) => setSettingsForm({ ...settingsForm, shippingPolicyTimeline: e.target.value })}
            className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
          />
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ سياسات المتجر والضمان</span>
      </button>
    </div>
  );
}

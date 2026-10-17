"use client";

import { Save, Truck } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";
import { EGYPT_GOVERNORATES } from "../constants";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
}

export default function ShippingTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  const updateGovRate = (govName: string, rate: number) => {
    const currentRates = { ...(settingsForm.governorateShippingRates || {}) };
    currentRates[govName] = rate;
    setSettingsForm((prev) => ({ ...prev, governorateShippingRates: currentRates }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Regional & Free Shipping */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Truck className="w-4 h-4 text-[#c5a880]" />
          <span>المناطق الإقليمية الرئيسية وحد الشحن المجاني</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              حد الشحن المجاني (ج.م)
            </label>
            <input
              type="number"
              value={settingsForm.freeShippingThreshold || 1500}
              onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              شحن القاهرة والجيزة (ج.م)
            </label>
            <input
              type="number"
              value={settingsForm.shippingCairoGiza || 45}
              onChange={(e) => setSettingsForm({ ...settingsForm, shippingCairoGiza: Number(e.target.value) })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              شحن الإسكندرية (ج.م)
            </label>
            <input
              type="number"
              value={settingsForm.shippingAlex || 55}
              onChange={(e) => setSettingsForm({ ...settingsForm, shippingAlex: Number(e.target.value) })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              شحن الدلتا والقناة (ج.م)
            </label>
            <input
              type="number"
              value={settingsForm.shippingDeltaCanal || 65}
              onChange={(e) => setSettingsForm({ ...settingsForm, shippingDeltaCanal: Number(e.target.value) })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              شحن الصعيد والمحافظات النائية (ج.م)
            </label>
            <input
              type="number"
              value={settingsForm.shippingUpperEgypt || 80}
              onChange={(e) => setSettingsForm({ ...settingsForm, shippingUpperEgypt: Number(e.target.value) })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* All 27 Governorates Rates Table */}
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#161412] flex items-center justify-between border-b border-[#f0e8dc] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#c5a880]" />
            <span>جدول تسعير الشحن التفصيلي لكافة الـ 27 محافظة مصرية</span>
          </div>
          <span className="text-xs text-[#756555]">27 محافظة</span>
        </div>

        <p className="text-xs text-[#756555] mb-4">
          يمكنك تخصيص سعر الشحن بدقة لكل محافظة على حدة. يتم اعتماد هذه الأسعار فورياً في حاسبة السلة وإتمام الطلب.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {EGYPT_GOVERNORATES.map((gov) => {
            const currentRate =
              settingsForm.governorateShippingRates?.[gov.name] ?? gov.defaultRate;

            return (
              <div
                key={gov.name}
                className="flex items-center justify-between p-3 bg-[#f7f4ee] rounded-lg border border-[#e4dcce] text-xs"
              >
                <span className="font-bold text-[#161412]">{gov.name}</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={currentRate}
                    onChange={(e) => updateGovRate(gov.name, Number(e.target.value))}
                    className="w-20 bg-white border border-[#ded2c0] rounded px-2.5 py-1 text-xs text-center font-bold text-[#161412] focus:outline-none focus:border-[#161412]"
                  />
                  <span className="text-[#8c7865] text-[11px]">ج.م</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ أسعار الشحن والمحافظات في السحابة</span>
      </button>
    </div>
  );
}

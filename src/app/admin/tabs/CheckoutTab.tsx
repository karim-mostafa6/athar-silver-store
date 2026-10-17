"use client";

import { ExternalLink, Save, ShoppingBag } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
  isSavingSettings: boolean;
}

export default function CheckoutTab({ settingsForm, setSettingsForm, handleSaveSettings, isSavingSettings }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl border border-[#ded2c0] p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#f0e8dc]">
          <div>
            <h3 className="font-amiri text-lg font-bold text-[#292722] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#c5a880]" />
              <span>إعدادات صفحة الدفع والشراء المستقلة (Shopify Checkout)</span>
            </h3>
            <p className="text-xs text-[#756555] mt-1">
              التحكم الكامل في نصوص وخيارات صفحة الدفع المستقلة التي تظهر للعملاء عند الضغط على السلة.
            </p>
          </div>

          <a
            href="/checkout"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#c5a880]" />
            <span>معاينة صفحة الدفع الحية</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#292722] mb-1">
              اسم طريقة الشحن الافتراضية
            </label>
            <input
              type="text"
              value={settingsForm.checkoutShippingMethodTitle || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, checkoutShippingMethodTitle: e.target.value })
              }
              placeholder="شحن قياسي سريع (خلال 2-4 أيام عمل)"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#292722] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#292722] mb-1">
              نص شارة الأمان والخصوصية أسفل طرق الدفع
            </label>
            <input
              type="text"
              value={settingsForm.checkoutSecurityBadgeText || ""}
              onChange={(e) =>
                setSettingsForm({ ...settingsForm, checkoutSecurityBadgeText: e.target.value })
              }
              placeholder="جميع المعاملات مشفرة وآمنة بنسبة 100%"
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-xl px-3 py-2 text-xs text-[#292722] focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#f0e8dc]">
          <h4 className="text-xs font-bold text-[#292722]">تفعيل طرق الدفع في صفحة الشراء:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#ded2c0] bg-[#F5F0E7] cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.checkoutEnableCOD !== false}
                onChange={(e) => setSettingsForm({ ...settingsForm, checkoutEnableCOD: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>الدفع عند الاستلام (COD)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#ded2c0] bg-[#F5F0E7] cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.checkoutEnableWallets !== false}
                onChange={(e) => setSettingsForm({ ...settingsForm, checkoutEnableWallets: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>المحافظ وإنستاباي</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#ded2c0] bg-[#F5F0E7] cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={settingsForm.checkoutEnableCards !== false}
                onChange={(e) => setSettingsForm({ ...settingsForm, checkoutEnableCards: e.target.checked })}
                className="rounded border-[#ded2c0] text-[#292722]"
              />
              <span>البطاقات البنكية (فيزا/ماستركارد)</span>
            </label>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#f0e8dc]">
          <h4 className="text-xs font-bold text-[#292722]">خيارات إضافية في صفحة الشراء:</h4>
          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-[#ded2c0] bg-[#F5F0E7] cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={settingsForm.checkoutEnableGiftOption !== false}
              onChange={(e) => setSettingsForm({ ...settingsForm, checkoutEnableGiftOption: e.target.checked })}
              className="rounded border-[#ded2c0] text-[#292722]"
            />
            <span>إتاحة خيار تغليف الهدية وكتابة كارت الإهداء</span>
          </label>
        </div>

        <div className="pt-4 border-t border-[#f0e8dc] flex items-center justify-between">
          <span className="text-xs text-[#756555]">
            ملاحظة: يمكنك تعديل أسعار الشحن للمحافظات من تبويب «الشحن والمحافظات»، وأرقام إنستاباي من تبويب «طرق الدفع».
          </span>
          <button
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="px-6 py-2.5 rounded-xl bg-[#292722] hover:bg-[#2e2925] text-[#F5F0E7] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-[#c5a880]" />
            <span>{isSavingSettings ? "جاري الحفظ..." : "حفظ التعديلات بالسحابة"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

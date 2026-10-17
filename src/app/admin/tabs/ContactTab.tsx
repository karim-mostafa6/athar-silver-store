"use client";

import { Phone, Save } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
}

export default function ContactTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Phone className="w-4 h-4 text-[#c5a880]" />
          <span>بيانات التواصل وقنوات السوشيال ميديا</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              رقم الواتساب الرسمي (مباشر)
            </label>
            <input
              type="text"
              value={settingsForm.whatsappNumber || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
              placeholder="01143837730"
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              رقم الهاتف المباشر للاتصال
            </label>
            <input
              type="text"
              value={settingsForm.contactPhone || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
              placeholder="01143837730"
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              البريد الإلكتروني الرسمي
            </label>
            <input
              type="email"
              value={settingsForm.contactEmail || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
              placeholder="theorma.eg@gmail.com"
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr focus:outline-none"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-[#f0e8dc] space-y-4">
          <div className="text-xs font-bold text-[#161412]">روابط منصات التواصل:</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                رابط إنستجرام (Instagram)
              </label>
              <input
                type="text"
                value={settingsForm.instagramUrl || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/ormasilver"
                className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                رابط فيسبوك (Facebook)
              </label>
              <input
                type="text"
                value={settingsForm.facebookUrl || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                placeholder="https://facebook.com"
                className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#756555] mb-1.5">
                رابط تيك توك (TikTok)
              </label>
              <input
                type="text"
                value={settingsForm.tiktokUrl || ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com"
                className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#161412] dir-ltr focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ بيانات التواصل والسوشيال</span>
      </button>
    </div>
  );
}

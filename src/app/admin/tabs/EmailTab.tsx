"use client";

import { Mail, Save } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
}

export default function EmailTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#161412] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
          <Mail className="w-4 h-4 text-[#c5a880]" />
          <span>إعدادات البريد الإلكتروني الرسمي (Gmail SMTP)</span>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>ملاحظة هامة لإرسال إيميلات تأكيد الطلبات للعملاء:</strong>
          <br />
          استخدم &quot;كلمة مرور التطبيقات (App Password)&quot; المكونة من 16 حرفاً من حساب Google، وليس كلمة مرور الإيميل الشخصية العادية.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              اسم الراسل الرسمي (Sender Name)
            </label>
            <input
              type="text"
              value={settingsForm.senderEmailName || "متجر ORMA للفضة"}
              onChange={(e) => setSettingsForm({ ...settingsForm, senderEmailName: e.target.value })}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756555] mb-1.5">
              البريد الإلكتروني للراسل (Sender Email)
            </label>
            <input
              type="email"
              value={settingsForm.senderEmail || ""}
              onChange={(e) => setSettingsForm({ ...settingsForm, senderEmail: e.target.value })}
              placeholder="theorma.eg@gmail.com"
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">
            كلمة مرور التطبيقات (Gmail App Password)
          </label>
          <input
            type="password"
            value={settingsForm.gmailAppPassword || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, gmailAppPassword: e.target.value })}
            placeholder="xxxx xxxx xxxx xxxx"
            className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#161412] dir-ltr font-mono"
          />
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ إعدادات البريد الإلكتروني</span>
      </button>
    </div>
  );
}

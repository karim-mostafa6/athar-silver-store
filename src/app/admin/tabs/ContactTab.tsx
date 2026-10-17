"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Phone, Save } from "lucide-react";
import type { StoreSettings } from "@/context/StoreContext";

interface Props {
  settingsForm: StoreSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<StoreSettings>>;
  handleSaveSettings: () => void;
}

function WhatsAppCard({ settingsForm, setSettingsForm }: Pick<Props, "settingsForm" | "setSettingsForm">) {
  const [provider, setProvider] = useState<string>("...");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/whatsapp/test", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProvider(d.configured && d.configured !== "none" ? String(d.configured) : "غير مضبوط"))
      .catch(() => setProvider("تعذر الفحص"));
  }, []);

  const runTest = async () => {
    setBusy(true);
    setResult(null);
    try {
      const r = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const d = await r.json();
      setResult(d.ok ? { ok: true, text: "اتبعتت ✓ شوف الواتساب على الرقم ده." } : { ok: false, text: d.error || "فشل الإرسال" });
    } catch {
      setResult({ ok: false, text: "مفيش اتصال بالسيرفر." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
      <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
        <MessageCircle className="w-4 h-4 text-[#c5a880]" />
        <span>تأكيد الطلب التلقائي على واتساب (بعد 3 دقايق)</span>
      </div>
      <p className="text-xs text-[#756555]">
        مزوّد الخدمة المتصل حالياً: <b className="text-[#292722]">{provider}</b>. الرسالة بتتبعت للعميل تلقائياً بعد 3 دقايق من الطلب، ولوحة الطلبات بتتحدث لوحدها.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">اسم قالب Meta المعتمد</label>
          <input
            type="text"
            value={settingsForm.waTemplateName || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, waTemplateName: e.target.value })}
            placeholder="order_confirmation_ar"
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] dir-ltr focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#756555] mb-1.5">لغة القالب</label>
          <input
            type="text"
            value={settingsForm.waTemplateLang || ""}
            onChange={(e) => setSettingsForm({ ...settingsForm, waTemplateLang: e.target.value })}
            placeholder="ar"
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] dir-ltr focus:outline-none"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#756555] mb-1.5">جرّب على رقمك</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] dir-ltr focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={runTest}
          disabled={busy || !phone.trim()}
          className="px-5 py-2.5 rounded-lg bg-[#292722] text-[#F5F0E7] text-xs font-bold disabled:opacity-50"
        >
          {busy ? "جاري الإرسال..." : "ابعت رسالة تجريبية"}
        </button>
      </div>
      {result && (
        <p className={`text-xs font-bold ${result.ok ? "text-emerald-700" : "text-rose-700"}`} dir="auto">
          {result.text}
        </p>
      )}
    </div>
  );
}

export default function ContactTab({ settingsForm, setSettingsForm, handleSaveSettings }: Props) {
  return (
    <div className="space-y-6 max-w-4xl">
      <WhatsAppCard settingsForm={settingsForm} setSettingsForm={setSettingsForm} />
      <div className="bg-white rounded-xl border border-[#e8ded0] shadow-sm p-6 space-y-4">
        <div className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3 mb-4">
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
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] dir-ltr focus:outline-none"
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
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] dir-ltr focus:outline-none"
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
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2.5 text-xs text-[#292722] dir-ltr focus:outline-none"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-[#f0e8dc] space-y-4">
          <div className="text-xs font-bold text-[#292722]">روابط منصات التواصل:</div>

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
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] dir-ltr focus:outline-none"
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
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] dir-ltr focus:outline-none"
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
                className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-4 py-2 text-xs text-[#292722] dir-ltr focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4 text-[#c5a880]" />
        <span>حفظ بيانات التواصل والسوشيال</span>
      </button>
    </div>
  );
}

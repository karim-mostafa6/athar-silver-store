"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Package, Truck, Home, Search, XCircle } from "lucide-react";

interface TrackOrder {
  id: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  governorate: string;
  total: number;
  items: { name: string; quantity: number; size?: string; image?: string }[];
}

const STEPS = [
  { key: "received", label: "تم استلام الطلب", icon: Check },
  { key: "processing", label: "جاري التجهيز", icon: Package },
  { key: "shipped", label: "في الطريق إليك", icon: Truck },
  { key: "completed", label: "تم التسليم", icon: Home },
];

function stepIndex(status: string): number {
  if (status === "completed") return 3;
  if (status === "shipped") return 2;
  if (status === "processing") return 1;
  return 0;
}

function TrackInner() {
  const params = useSearchParams();
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackOrder | null>(null);

  useEffect(() => {
    const q = params.get("id");
    if (q) setId(q);
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, phone }),
      });
      const data = await res.json();
      if (data.ok) setOrder(data.order);
      else setError(data.error || "مالقيناش الطلب.");
    } catch {
      setError("حصل خطأ في الاتصال، جرّب تاني.");
    } finally {
      setLoading(false);
    }
  };

  const cancelled = order?.status === "cancelled";
  const idx = order ? stepIndex(order.status) : 0;
  const inputCls =
    "w-full bg-[#fbf8f3] border border-[#292722]/25 rounded-xl px-4 h-[54px] text-base text-[#292722] focus:outline-none focus:border-[#292722]";

  return (
    <div className="bg-[#F5F0E7] min-h-[70vh] py-14 sm:py-20 px-4" dir="rtl">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="eyebrow mb-3">Order Tracking</div>
          <h1 className="font-cairo font-semibold text-3xl sm:text-4xl text-[#292722]">تتبّع طلبك</h1>
          <p className="text-[#5c5346] mt-3 text-[15px] leading-relaxed">اكتب رقم الطلب والموبايل اللي طلبت بيه وشوف وصل لفين.</p>
        </div>

        <form onSubmit={submit} className="space-y-4 bg-[#fbf8f3] border border-[#292722]/14 rounded-[24px] p-6 sm:p-8">
          <div>
            <label className="block text-sm font-medium mb-2">رقم الطلب</label>
            <input className={`${inputCls} dir-ltr text-right font-mono`} value={id} onChange={(e) => setId(e.target.value)} placeholder="ORM-1033" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">رقم الموبايل</label>
            <input className={`${inputCls} dir-ltr text-right font-mono`} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" required />
          </div>
          {error && <p className="text-sm text-rose-600 font-bold">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-[58px] rounded-full bg-[#292722] text-[#F5F0E7] font-bold text-base btn-shine flex items-center justify-center gap-2 disabled:opacity-60">
            <Search className="w-4 h-4" />
            <span>{loading ? "جاري البحث..." : "تتبّع الطلب"}</span>
          </button>
        </form>

        {order && (
          <div className="mt-8 bg-[#fbf8f3] border border-[#292722]/14 rounded-[24px] p-6 sm:p-8 space-y-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[#7d6c5c]">طلب رقم</div>
                <div className="font-mono font-bold text-lg dir-ltr">{order.id}</div>
              </div>
              <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${cancelled ? "bg-rose-50 text-rose-700" : "bg-[#292722] text-[#F5F0E7]"}`}>
                {order.statusLabel}
              </span>
            </div>

            {cancelled ? (
              <div className="flex items-center gap-3 text-rose-700 text-sm">
                <XCircle className="w-5 h-5" />
                <span>اتلغى الطلب ده. لو ده مش المقصود كلمنا على واتساب.</span>
              </div>
            ) : (
              <ol className="space-y-5">
                {STEPS.map((st, i) => {
                  const done = i <= idx;
                  const Icon = st.icon;
                  return (
                    <li key={st.key} className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center border ${done ? "bg-[#292722] text-[#F5F0E7] border-[#292722]" : "border-[#292722]/25 text-[#8a7d6c]"}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className={`text-[15px] ${done ? "font-bold text-[#292722]" : "text-[#8a7d6c]"}`}>{st.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <div className="border-t border-[#292722]/12 pt-5 space-y-2 text-sm">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between gap-3">
                  <span>{it.name}{it.size ? ` (${it.size})` : ""} × {it.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-[#292722]/12 font-bold text-base">
                <span>الإجمالي</span>
                <span>{order.total.toLocaleString("en-US")} ج.م</span>
              </div>
            </div>

            <a
              href={`https://wa.me/201143837730?text=${encodeURIComponent(`أهلاً أورما، عايز أتابع طلبي رقم ${order.id}`)}`}
              className="block text-center h-12 leading-[48px] rounded-full border border-[#292722] font-bold text-sm hover:bg-[#292722] hover:text-[#F5F0E7] transition-colors"
            >
              كلّمنا على واتساب
            </a>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-[#7d6c5c] hover:text-[#292722] underline underline-offset-4">الرجوع للمتجر</Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-[#F5F0E7]" />}>
      <TrackInner />
    </Suspense>
  );
}

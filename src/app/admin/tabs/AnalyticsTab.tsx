"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp, Share2, Filter, Coins } from "lucide-react";
import type { Order } from "@/context/StoreContext";
import type { Product } from "@/data/products";

export interface OrderMetrics {
  revenue: number;
  total: number;
  pending: number;
  confirmed: number;
}

// "Reports & sales indicators" tab of the admin dashboard.
const SOURCE_LABEL: Record<string, string> = {
  instagram: "إنستجرام",
  tiktok: "تيك توك",
  facebook: "فيسبوك",
  google: "جوجل",
  whatsapp: "واتساب",
  youtube: "يوتيوب",
  snapchat: "سناب شات",
  twitter: "تويتر / X",
  direct: "مباشر",
  other: "أخرى",
};

interface FunnelData {
  funnel: Record<string, number>;
  bySource: Record<string, Record<string, number>>;
  carts: { total: number; notified: number; recovered: number };
}

export default function AnalyticsTab({
  orders,
  orderMetrics,
  products,
}: {
  orders: Order[];
  orderMetrics: OrderMetrics;
  products: Product[];
}) {
  const [days, setDays] = useState(30);
  const [fd, setFd] = useState<FunnelData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/analytics?days=${days}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.ok) setFd(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [days]);

  const sinceMs = Date.now() - days * 86400000;
  const validOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled" && new Date(o.createdAt).getTime() >= sinceMs),
    [orders, sinceMs]
  );

  // Orders & revenue by source
  const bySourceOrders = useMemo(() => {
    const m: Record<string, { orders: number; revenue: number }> = {};
    for (const o of validOrders) {
      const k = o.source || "direct";
      m[k] = m[k] || { orders: 0, revenue: 0 };
      m[k].orders += 1;
      m[k].revenue += o.total || 0;
    }
    return Object.entries(m).sort((a, b) => b[1].orders - a[1].orders);
  }, [validOrders]);

  // Profit margin per product (uses the cost snapshotted on the order, else the product's current cost)
  const margins = useMemo(() => {
    const costNow = new Map(products.map((p) => [p.id, p.costPrice || 0]));
    const m = new Map<string, { name: string; units: number; revenue: number; cost: number; hasCost: boolean }>();
    for (const o of validOrders) {
      for (const it of o.items || []) {
        const cost = Number(it.costPrice) || costNow.get(it.productId) || 0;
        const row = m.get(it.productId) || { name: it.arabicName || it.name, units: 0, revenue: 0, cost: 0, hasCost: false };
        row.units += it.quantity || 1;
        row.revenue += (it.price || 0) * (it.quantity || 1);
        if (cost > 0) {
          row.cost += cost * (it.quantity || 1);
          row.hasCost = true;
        }
        m.set(it.productId, row);
      }
    }
    return Array.from(m.values()).sort((a, b) => b.revenue - a.revenue);
  }, [validOrders, products]);

  const f = fd?.funnel || { view: 0, add_to_cart: 0, checkout_start: 0, purchase: 0 };
  const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");

  return (
    <div className="space-y-6">
      {/* Header Box */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#F5F0E7] border border-[#ded2c0] flex items-center justify-center text-[#292722]">
            <BarChart3 className="w-4 h-4 text-[#c5a880]" />
          </div>
          <h3 className="font-amiri text-xl font-bold text-[#292722]">
            التقارير ومؤشرات المبيعات
          </h3>
        </div>
        <p className="text-xs text-[#756555] mt-1">
          نظرة تفصيلية على حجم الإيرادات، توزيع حالات الطلبات، وإحصائيات المحافظات.
        </p>
      </div>

      {/* The 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-[#756555] block mb-1">إجمالي المبيعات</span>
          <span className="text-xl sm:text-2xl font-bold text-[#292722]">
            {orderMetrics.revenue.toLocaleString("en-US")}
            <span className="text-xs font-normal text-[#8c7865] mr-1">ج.م</span>
          </span>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-[#756555] block mb-1">إجمالي الطلبات</span>
          <span className="text-xl sm:text-2xl font-bold text-[#292722]">
            {orderMetrics.total}
          </span>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-amber-700 block mb-1">قيد الانتظار (جديدة)</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-600">
            {orderMetrics.pending}
          </span>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-emerald-700 block mb-1">مؤكدة وجاهزة للشحن</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">
            {orderMetrics.confirmed}
          </span>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8ded0] shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
          <TrendingUp className="w-4 h-4 text-[#c5a880]" />
          <span>توزيع حالات الطلبات الحالية</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
            <span className="block text-amber-800 text-[11px] font-semibold mb-1">قيد الانتظار</span>
            <span className="text-lg font-bold text-amber-900 font-mono">
              {orders.filter((o) => o.status === "pending").length}
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
            <span className="block text-blue-800 text-[11px] font-semibold mb-1">مؤكدة هاتفياً</span>
            <span className="text-lg font-bold text-blue-900 font-mono">
              {orders.filter((o) => o.status === "confirmed_phone").length}
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <span className="block text-emerald-800 text-[11px] font-semibold mb-1">مؤكدة واتساب</span>
            <span className="text-lg font-bold text-emerald-900 font-mono">
              {orders.filter((o) => o.status === "confirmed_whatsapp").length}
            </span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5">
            <span className="block text-indigo-800 text-[11px] font-semibold mb-1">جاري التجهيز</span>
            <span className="text-lg font-bold text-indigo-900 font-mono">
              {orders.filter((o) => o.status === "processing").length}
            </span>
          </div>

          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5">
            <span className="block text-purple-800 text-[11px] font-semibold mb-1">تم الشحن</span>
            <span className="text-lg font-bold text-purple-900 font-mono">
              {orders.filter((o) => o.status === "shipped").length}
            </span>
          </div>

          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5">
            <span className="block text-teal-800 text-[11px] font-semibold mb-1">تم التوصيل بنجاح</span>
            <span className="text-lg font-bold text-teal-900 font-mono">
              {orders.filter((o) => o.status === "completed").length}
            </span>
          </div>

          <div className="bg-gray-100 border border-gray-200 rounded-xl p-3.5">
            <span className="block text-gray-700 text-[11px] font-semibold mb-1">ملغي</span>
            <span className="text-lg font-bold text-gray-800 font-mono">
              {orders.filter((o) => o.status === "cancelled").length}
            </span>
          </div>

          <div className="bg-[#F5F0E7] border border-[#ded2c0] rounded-xl p-3.5">
            <span className="block text-[#756555] text-[11px] font-semibold mb-1">متوسط قيمة الطلب</span>
            <span className="text-lg font-bold text-[#292722] font-mono">
              {orderMetrics.total > 0
                ? Math.round(orderMetrics.revenue / orderMetrics.total).toLocaleString("en-US")
                : 0}{" "}
              <span className="text-[10px] font-normal">ج.م</span>
            </span>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#756555] font-semibold">الفترة:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg border font-bold ${days === d ? "bg-[#292722] text-[#F5F0E7] border-[#292722]" : "bg-white text-[#292722] border-[#ded2c0]"}`}
          >
            آخر {d} يوم
          </button>
        ))}
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8ded0] shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
          <Filter className="w-4 h-4 text-[#c5a880]" />
          <span>رحلة العميل: من الزيارة للطلب</span>
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {[
            { k: "view", label: "زيارات", v: f.view, note: "" },
            { k: "add_to_cart", label: "أضافوا للسلة", v: f.add_to_cart, note: pct(f.add_to_cart, f.view) + " من الزيارات" },
            { k: "checkout_start", label: "دخلوا صفحة الدفع", v: f.checkout_start, note: pct(f.checkout_start, f.add_to_cart) + " من السلة" },
            { k: "purchase", label: "أتمّوا الطلب", v: f.purchase, note: pct(f.purchase, f.checkout_start) + " من الدفع" },
          ].map((x) => (
            <div key={x.k} className="bg-[#F5F0E7] border border-[#ded2c0] rounded-xl p-3.5">
              <span className="block text-[#756555] text-[11px] font-semibold mb-1">{x.label}</span>
              <span className="text-lg font-bold text-[#292722] font-mono">{x.v.toLocaleString("en-US")}</span>
              {x.note && <span className="block text-[10px] text-[#8c7865] mt-1">{x.note}</span>}
            </div>
          ))}
        </div>
        {fd && (
          <p className="text-[11px] text-[#756555]">
            سلات متروكة اتسجلت: <b>{fd.carts.total}</b> • اتبعتلك تنبيه عنها: <b>{fd.carts.notified}</b> • رجعوا وكمّلوا الطلب: <b>{fd.carts.recovered}</b>
          </p>
        )}
        <p className="text-[10px] text-[#8c7865]">العدّ بيبدأ من لحظة تفعيل التتبع. الأرقام مجهولة الهوية (بدون كوكيز).</p>
      </div>

      {/* Sources */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8ded0] shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
          <Share2 className="w-4 h-4 text-[#c5a880]" />
          <span>مصدر الطلبات</span>
        </h4>
        {bySourceOrders.length === 0 ? (
          <p className="text-xs text-[#756555]">لسه مفيش طلبات في الفترة دي. المصدر بيتسجّل مع الطلبات الجديدة (إنستجرام، تيك توك، مباشر…).</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#756555] text-right border-b border-[#f0e8dc]">
                  <th className="py-2 font-semibold">المصدر</th>
                  <th className="py-2 font-semibold">طلبات</th>
                  <th className="py-2 font-semibold">إيراد</th>
                  <th className="py-2 font-semibold">زيارات</th>
                  <th className="py-2 font-semibold">نسبة التحويل</th>
                </tr>
              </thead>
              <tbody>
                {bySourceOrders.map(([src, v]) => {
                  const visits = fd?.bySource?.[src]?.view || 0;
                  return (
                    <tr key={src} className="border-b border-[#f7f1e8]">
                      <td className="py-2.5 font-bold text-[#292722]">{SOURCE_LABEL[src] || src}</td>
                      <td className="py-2.5 font-mono">{v.orders}</td>
                      <td className="py-2.5 font-mono">{v.revenue.toLocaleString("en-US")} ج.م</td>
                      <td className="py-2.5 font-mono">{visits || "—"}</td>
                      <td className="py-2.5 font-mono">{visits ? pct(fd?.bySource?.[src]?.purchase || 0, visits) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-[#8c7865]">
          للتفريق بدقة حط في لينك البايو: <span className="font-mono dir-ltr inline-block">?utm_source=instagram</span> أو <span className="font-mono dir-ltr inline-block">?utm_source=tiktok</span>
        </p>
      </div>

      {/* Margins */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8ded0] shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-[#292722] flex items-center gap-2 border-b border-[#f0e8dc] pb-3">
          <Coins className="w-4 h-4 text-[#c5a880]" />
          <span>هامش الربح لكل منتج</span>
        </h4>
        {margins.length === 0 ? (
          <p className="text-xs text-[#756555]">مفيش مبيعات في الفترة دي.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[#756555] text-right border-b border-[#f0e8dc]">
                  <th className="py-2 font-semibold">المنتج</th>
                  <th className="py-2 font-semibold">مباع</th>
                  <th className="py-2 font-semibold">إيراد</th>
                  <th className="py-2 font-semibold">تكلفة</th>
                  <th className="py-2 font-semibold">ربح</th>
                  <th className="py-2 font-semibold">هامش</th>
                </tr>
              </thead>
              <tbody>
                {margins.map((m) => {
                  const profit = m.revenue - m.cost;
                  return (
                    <tr key={m.name} className="border-b border-[#f7f1e8]">
                      <td className="py-2.5 font-bold text-[#292722]">{m.name}</td>
                      <td className="py-2.5 font-mono">{m.units}</td>
                      <td className="py-2.5 font-mono">{m.revenue.toLocaleString("en-US")}</td>
                      <td className="py-2.5 font-mono">{m.hasCost ? m.cost.toLocaleString("en-US") : "—"}</td>
                      <td className={`py-2.5 font-mono font-bold ${m.hasCost ? "text-emerald-700" : "text-[#8c7865]"}`}>{m.hasCost ? profit.toLocaleString("en-US") : "—"}</td>
                      <td className="py-2.5 font-mono">{m.hasCost && m.revenue > 0 ? `${Math.round((profit / m.revenue) * 100)}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-[10px] text-[#8c7865]">حط &quot;سعر التكلفة&quot; في كل منتج (من تعديل المنتج) عشان الهامش يظهر. سعر التكلفة بيظهر لك إنت بس ومش بيتعرض للزوار.</p>
      </div>
    </div>
  );
}

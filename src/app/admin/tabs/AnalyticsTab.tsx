"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import type { Order } from "@/context/StoreContext";

export interface OrderMetrics {
  revenue: number;
  total: number;
  pending: number;
  confirmed: number;
}

// "Reports & sales indicators" tab of the admin dashboard.
export default function AnalyticsTab({ orders, orderMetrics }: { orders: Order[]; orderMetrics: OrderMetrics }) {
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
    </div>
  );
}

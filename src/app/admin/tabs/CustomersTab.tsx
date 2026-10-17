"use client";

import { MapPin, MessageCircle, PhoneCall, Search, UserPlus, Users } from "lucide-react";
import type { CustomerSummary, ManualOrderForm, ActiveTab } from "./types";


interface Props {
  customersList: CustomerSummary[];
  filteredCustomers: CustomerSummary[];
  customerSearchQuery: string;
  setCustomerSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  customerSortBy: "recent" | "orders" | "spent";
  setCustomerSortBy: React.Dispatch<React.SetStateAction<"recent" | "orders" | "spent">>;
  setOrderSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: (tab: ActiveTab) => void;
  setManualOrderForm: React.Dispatch<React.SetStateAction<ManualOrderForm>>;
  setIsCreateOrderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

}

export default function CustomersTab({ customersList, filteredCustomers, customerSearchQuery, setCustomerSearchQuery, customerSortBy, setCustomerSortBy, setOrderSearchQuery, setActiveTab, setManualOrderForm, setIsCreateOrderModalOpen }: Props) {
  return (
    <div className="space-y-6">
      {/* Header Box */}
      <div className="bg-white rounded-2xl border border-[#e8ded0] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5F0E7] border border-[#ded2c0] flex items-center justify-center text-[#292722]">
              <Users className="w-4 h-4 text-[#c5a880]" />
            </div>
            <h3 className="font-amiri text-xl font-bold text-[#292722]">
              قاعدة العملاء والمشترين
            </h3>
          </div>
          <p className="text-xs text-[#756555] mt-1">
            سجل شامل ومحدث تلقائياً ببيانات كافة العملاء، مع إمكانية التواصل الفوري وإصدار طلبات جديدة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setManualOrderForm({
                customerName: "",
                phone: "",
                email: "",
                governorate: "القاهرة",
                address: "",
                notes: "",
                paymentMethod: "cod",
                discount: 0,
                customShippingFee: null,
                items: [],
              });
              setIsCreateOrderModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#292722] text-[#F5F0E7] hover:bg-[#2e2925] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#c5a880]" />
            <span>+ إضافة طلب / عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Customer Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-[#756555] block mb-1">إجمالي العملاء المسجلين</span>
          <span className="text-xl sm:text-2xl font-bold text-[#292722] font-mono">
            {customersList.length}
            <span className="text-xs font-normal text-[#8c7865] mr-1">عميل</span>
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-[#756555] block mb-1">عملاء متكررين الشراء</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
            {customersList.filter((c) => c.totalOrders > 1).length}
            <span className="text-xs font-normal text-[#8c7865] mr-1">عميل</span>
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#e8ded0] shadow-sm">
          <span className="text-xs text-[#756555] block mb-1">متوسط إنفاق العميل</span>
          <span className="text-xl sm:text-2xl font-bold text-[#292722] font-mono">
            {customersList.length > 0
              ? Math.round(
                  customersList.reduce((acc, c) => acc + c.totalSpent, 0) /
                    customersList.length
                ).toLocaleString("en-US")
              : 0}
            <span className="text-xs font-normal text-[#8c7865] mr-1">ج.م</span>
          </span>
        </div>
      </div>

      {/* Customer Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-[#e8ded0] space-y-3 shadow-sm text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="ابحث باسم العميل، رقم الهاتف، أو المحافظة..."
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              className="w-full bg-[#F5F0E7] border border-[#ded2c0] rounded-lg pr-9 pl-4 py-2 text-xs text-[#292722] focus:outline-none focus:border-[#292722]"
            />
            <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#756555] font-medium">الترتيب حسب:</span>
            <select
              value={customerSortBy}
              onChange={(e) => setCustomerSortBy(e.target.value as "recent" | "orders" | "spent")}
              className="bg-[#F5F0E7] border border-[#ded2c0] rounded-lg px-2.5 py-2 text-xs text-[#292722] font-semibold focus:outline-none"
            >
              <option value="recent">الأحدث نشاطاً وطلباً</option>
              <option value="orders">الأكثر طلباً (عدد الطلبات)</option>
              <option value="spent">الأعلى إنفاقاً (إجمالي الشراء)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e8ded0]">
          <Users className="w-12 h-12 text-[#baa996] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[#292722] mb-1">لا يوجد عملاء مطابقين للبحث</h3>
          <p className="text-xs text-[#756555]">سيتم تسجيل أي عميل يقوم بالطلب تلقائياً هنا في قاعدة العملاء.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => {
            const cleanPhone = cust.phone.replace(/\D/g, "");
            const waLink = `https://wa.me/20${cleanPhone}?text=${encodeURIComponent(
              `أهلاً بحضرتك يا ${cust.name}، بنكلمك من متجر ORMA للفضة الإسترليني 925.`
            )}`;

            return (
              <div
                key={cust.phone || cust.name}
                className="bg-white rounded-2xl border border-[#e8ded0] p-4 sm:p-5 shadow-xs hover:border-[#c5a880] hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  {/* Top: Avatar & Name */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-[#292722] text-[#c5a880] font-bold text-sm flex items-center justify-center border border-[#c5a880]/30 shrink-0 shadow-xs">
                        {cust.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#292722] truncate">
                          {cust.name}
                        </h4>
                        <span className="font-mono text-xs text-[#8c7865] dir-ltr block">
                          {cust.phone}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F0E7] text-[#292722] border border-[#ded2c0] shrink-0">
                      {cust.totalOrders} {cust.totalOrders === 1 ? "طلب" : "طلبات"}
                    </span>
                  </div>

                  {/* Address Info */}
                  <div className="bg-[#F5F0E7] p-2.5 rounded-xl border border-[#ede5d8] text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[#292722] font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#c5a880] shrink-0" />
                      <span>{cust.governorate}</span>
                    </div>
                    {cust.address && (
                      <p className="text-[11px] text-[#756555] truncate" title={cust.address}>
                        {cust.address}
                      </p>
                    )}
                  </div>

                  {/* Financials & Last Order */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f0e8dc]">
                    <div>
                      <span className="block text-[10px] text-[#8c7865]">إجمالي المشتريات:</span>
                      <span className="font-bold text-[#292722] font-mono text-sm">
                        {cust.totalSpent.toLocaleString("en-US")} ج.م
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[10px] text-[#8c7865]">آخر نشاط:</span>
                      <span className="text-[11px] text-[#5c4f42] font-medium">
                        {new Date(cust.lastOrderDate).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-[#f0e8dc]">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSearchQuery(cust.phone || cust.name);
                      setActiveTab("orders");
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#F5F0E7] hover:bg-[#ede3d3] border border-[#ded2c0] text-[11px] font-bold text-[#292722] transition-colors text-center"
                  >
                    عرض الطلبات
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setManualOrderForm({
                        customerName: cust.name,
                        phone: cust.phone,
                        email: "",
                        governorate: cust.governorate || "القاهرة",
                        address: cust.address || "",
                        notes: "",
                        paymentMethod: "cod",
                        discount: 0,
                        customShippingFee: null,
                        items: [],
                      });
                      setIsCreateOrderModalOpen(true);
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-[#292722] hover:bg-[#2e2925] text-[11px] font-bold text-[#c5a880] transition-colors"
                    title="إنشاء طلب جديد لهذا العميل"
                  >
                    + طلب
                  </button>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors"
                    title="محادثة واتساب"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <a
                    href={`tel:${cust.phone}`}
                    className="p-1.5 rounded-lg bg-[#F5F0E7] hover:bg-[#ede3d3] border border-[#ded2c0] text-[#292722] transition-colors"
                    title="اتصال هاتفي"
                  >
                    <PhoneCall className="w-4 h-4 text-[#c5a880]" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

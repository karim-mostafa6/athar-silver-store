"use client";

import { Calendar, Download, Eye, MessageCircle, Printer, RotateCw, Search, ShoppingBag, UserPlus } from "lucide-react";
import type { Order } from "@/context/StoreContext";
import type { OrderDatePreset, ManualOrderForm } from "./types";


interface Props {
  orders: Order[];
  filteredOrders: Order[];
  selectedOrderIds: string[];
  setSelectedOrderIds: React.Dispatch<React.SetStateAction<string[]>>;
  orderDatePreset: OrderDatePreset;
  setOrderDatePreset: React.Dispatch<React.SetStateAction<OrderDatePreset>>;
  orderCustomDate: string;
  setOrderCustomDate: React.Dispatch<React.SetStateAction<string>>;
  isRefreshingOrders: boolean;
  bulkStatusToApply: Order["status"];
  setBulkStatusToApply: React.Dispatch<React.SetStateAction<Order["status"]>>;
  orderStatusFilter: string;
  setOrderStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  orderSearchQuery: string;
  setOrderSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedOrderForDetails: React.Dispatch<React.SetStateAction<Order | null>>;
  setManualOrderForm: React.Dispatch<React.SetStateAction<ManualOrderForm>>;
  setIsCreateOrderModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  formatOrderDateYMD: (dateString: string) => string;
  updateOrderStatus: (orderId: string, status: Order["status"], cancellationReason?: string) => void;
  bulkUpdateOrderStatus: (orderIds: string[], status: Order["status"]) => void;
  handleManualRefreshOrders: () => void | Promise<void>;
  handlePrintMultipleOrders: (orders: Order[]) => void;
  exportOrdersToCSV: (orders: Order[]) => void;

}

export default function OrdersTab({ orders, filteredOrders, selectedOrderIds, setSelectedOrderIds, orderDatePreset, setOrderDatePreset, orderCustomDate, setOrderCustomDate, isRefreshingOrders, bulkStatusToApply, setBulkStatusToApply, orderStatusFilter, setOrderStatusFilter, orderSearchQuery, setOrderSearchQuery, setSelectedOrderForDetails, setManualOrderForm, setIsCreateOrderModalOpen, formatOrderDateYMD, updateOrderStatus, bulkUpdateOrderStatus, handleManualRefreshOrders, handlePrintMultipleOrders, exportOrdersToCSV }: Props) {
  return (
    <div className="space-y-4">
      {/* Filter and Search Bar with Day/Date Filter & Manual Order Creation */}
      <div className="bg-white rounded-xl p-4 border border-[#e8ded0] space-y-3 shadow-sm text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="ابحث باسم العميل، رقم الهاتف، أو رقم الطلب..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="w-full bg-[#f7f4ee] border border-[#ded2c0] rounded-lg pr-9 pl-4 py-2 text-xs text-[#161412] focus:outline-none focus:border-[#161412]"
            />
            <Search className="w-4 h-4 text-[#8c7865] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#756555] font-medium">الحالة:</span>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-2 text-xs text-[#161412] focus:outline-none"
            >
              <option value="all">كافة الحالات ({orders.length})</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed_phone">تم التأكيد هاتفياً</option>
              <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
              <option value="processing">جاري التجهيز</option>
              <option value="shipped">جاري الشحن</option>
              <option value="completed">تم التوصيل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>

          {/* Day / Date Filter Preset */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8c7865]" />
            <span className="text-[#756555] font-medium">الفترة:</span>
            <select
              value={orderDatePreset}
              onChange={(e) => setOrderDatePreset(e.target.value as "all" | "today" | "yesterday" | "last7" | "last30" | "custom")}
              className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-2 text-xs text-[#161412] font-semibold focus:outline-none"
            >
              <option value="all">كافة الأوقات (الكل)</option>
              <option value="today">اليوم ({orders.filter(o => formatOrderDateYMD(o.createdAt) === formatOrderDateYMD(new Date().toISOString())).length})</option>
              <option value="yesterday">الأمس</option>
              <option value="last7">آخر 7 أيام</option>
              <option value="last30">آخر 30 يوم</option>
              <option value="custom">اختيار يوم محدد...</option>
            </select>
          </div>

          {/* Custom Date Input */}
          {orderDatePreset === "custom" && (
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={orderCustomDate}
                onChange={(e) => setOrderCustomDate(e.target.value)}
                className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2 py-1.5 text-xs text-[#161412] focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Realtime Live Pulse Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium shadow-2xs select-none shrink-0"
            title="المزامنة الفورية نشطة (Real-time Streaming) - تتحدث الطلبات تلقائياً فور تعديلها من تيليجرام أو السيرفر"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold tracking-tight">مزامنة فورية ⚡</span>
          </div>

          {/* Realtime Manual Refresh Orders Button */}
          <button
            type="button"
            onClick={handleManualRefreshOrders}
            disabled={isRefreshingOrders}
            className="px-3 py-2 rounded-lg bg-[#f7f4ee] hover:bg-[#ede5d8] text-[#161412] border border-[#ded2c0] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0 disabled:opacity-50"
            title="تحديث ومزامنة كافة الطلبات من السحابة والسيرفر فورياً"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#8c7865] ${isRefreshingOrders ? "animate-spin text-[#c5a880]" : ""}`} />
            <span>{isRefreshingOrders ? "جاري التحديث..." : "تحديث الطلبات"}</span>
          </button>

          {/* Shopify-style Create Manual Order Button */}
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
            className="px-3.5 py-2 rounded-lg bg-[#161412] hover:bg-[#2e2925] text-[#c5a880] border border-[#c5a880]/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            title="إنشاء طلب يدوي لعميل وإضافته للسيستم"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ طلب / عميل جديد</span>
          </button>
        </div>

        {/* Date Filter Active Information Banner */}
        {orderDatePreset !== "all" && (
          <div className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg p-2.5 px-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#161412]">
              <Calendar className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>
                فلترة اليوم: <strong>{orderDatePreset === "today" ? "اليوم" : orderDatePreset === "yesterday" ? "الأمس" : orderDatePreset === "custom" ? (orderCustomDate || "تاريخ محدد") : orderDatePreset === "last7" ? "آخر 7 أيام" : "آخر 30 يوم"}</strong>
              </span>
              <span className="bg-white border border-[#ded2c0] px-2 py-0.5 rounded text-[11px] font-bold text-[#161412]">
                {filteredOrders.length} طلب
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#756555]">
                إجمالي مبيعات اليوم: <strong className="text-[#161412] font-mono">{filteredOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0).toLocaleString("en-US")} ج.م</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setOrderDatePreset("all");
                  setOrderCustomDate("");
                }}
                className="text-xs text-rose-700 hover:text-rose-900 underline font-medium"
              >
                عرض الكل
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Select All & Bulk Actions Toolbar */}
      <div className="bg-white rounded-xl p-3 px-4 border border-[#e8ded0] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <label className="flex items-center gap-2.5 cursor-pointer font-bold text-[#161412] select-none">
          <input
            type="checkbox"
            checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
            onChange={() => {
              if (selectedOrderIds.length === filteredOrders.length) {
                setSelectedOrderIds([]);
              } else {
                setSelectedOrderIds(filteredOrders.map((o) => o.id));
              }
            }}
            className="w-4 h-4 rounded border-[#ded2c0] text-[#161412] cursor-pointer accent-[#161412]"
          />
          <span>تحديد الكل ({filteredOrders.length} طلب)</span>
        </label>

        {selectedOrderIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#161412] text-[#f7f4ee] px-2.5 py-1 rounded-md text-[11px] font-bold">
              تم تحديد: {selectedOrderIds.length}
            </span>

            {/* Bulk Status Select */}
            <div className="flex items-center gap-1">
              <select
                value={bulkStatusToApply}
                onChange={(e) => setBulkStatusToApply(e.target.value as Order["status"])}
                className="bg-[#f7f4ee] border border-[#ded2c0] rounded-lg px-2.5 py-1 text-xs text-[#161412] font-medium focus:outline-none"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                <option value="processing">جاري التجهيز</option>
                <option value="shipped">تم الشحن</option>
                <option value="completed">تم التوصيل بنجاح</option>
                <option value="cancelled">ملغي</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`هل أنت متأكد من تغيير حالة ${selectedOrderIds.length} طلبات إلى "${bulkStatusToApply}"؟`)) {
                    bulkUpdateOrderStatus(selectedOrderIds, bulkStatusToApply);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-[#161412] hover:bg-[#2e2925] text-[#f7f4ee] text-xs font-bold transition-all shadow-sm"
              >
                تطبيق
              </button>
            </div>

            {/* Print Selected Invoices */}
            <button
              type="button"
              onClick={() => {
                const toPrint = orders.filter((o) => selectedOrderIds.includes(o.id));
                handlePrintMultipleOrders(toPrint);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#f7f4ee] hover:bg-[#e8ded0] border border-[#ded2c0] text-[#161412] text-xs font-medium flex items-center gap-1 transition-all"
              title="طباعة بوالص الشحن للطلبات المحددة"
            >
              <Printer className="w-3.5 h-3.5 text-[#c5a880]" />
              <span>طباعة البوالص ({selectedOrderIds.length})</span>
            </button>

            {/* Export Selected to CSV */}
            <button
              type="button"
              onClick={() => {
                const toExport = orders.filter((o) => selectedOrderIds.includes(o.id));
                exportOrdersToCSV(toExport);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#f7f4ee] hover:bg-[#e8ded0] border border-[#ded2c0] text-[#161412] text-xs font-medium flex items-center gap-1 transition-all"
              title="تصدير الطلبات المحددة كملف Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>تصدير CSV</span>
            </button>

            {/* Deselect Button */}
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="px-2 py-1 text-xs text-[#756555] hover:text-[#161412] underline"
            >
              إلغاء التحديد
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-[#8c7865]">
            يمكنك تحديد عدة طلبات لتغيير حالتها دفعة واحدة أو طباعة البوالص وتصديرها
          </span>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e8ded0]">
          <ShoppingBag className="w-12 h-12 text-[#baa996] mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-[#161412] mb-1">لا توجد طلبات تطابق هذا البحث</h3>
          <p className="text-xs text-[#756555]">ستظهر جميع الطلبات الجديدة هنا فور ورودها تلقائياً.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const whatsappLink = `https://wa.me/20${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
              `أهلاً بحضرتك يا ${order.customerName}، بنكلمك من متجر ORMA للفضة 925 بخصوص طلبك رقم (${order.id}) بقيمة ${order.total} ج.م.`
            )}`;
            const totalItemsCount = order.items.reduce((acc, item) => acc + (item.quantity || 1), 0);
            const isSelected = selectedOrderIds.includes(order.id);

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrderForDetails(order)}
                className={`rounded-xl py-2.5 px-3.5 sm:px-4 border transition-all cursor-pointer group shadow-2xs hover:shadow-md ${
                  isSelected
                    ? "bg-[#fdfbf7] border-[#c5a880] ring-1 ring-[#c5a880]"
                    : "bg-white border-[#e8ded0] hover:border-[#c5a880]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
                  {/* Order Overview Right */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Checkbox for Select All / Bulk */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 flex items-center justify-center"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedOrderIds((prev) =>
                            prev.includes(order.id) ? prev.filter((id) => id !== order.id) : [...prev, order.id]
                          );
                        }}
                        className="w-4 h-4 rounded border-[#ded2c0] text-[#161412] cursor-pointer accent-[#161412]"
                      />
                    </div>

                    {/* Luxury Order ID Badge */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#161412] text-[#f7f4ee] font-mono font-bold text-xs border border-[#3e3832] shadow-xs tracking-wider shrink-0">
                      <span className="text-[#c5a880] text-[10px]">#</span>
                      <span>{order.id.replace(/^#/, "")}</span>
                    </div>

                    {/* Date & Payment Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] text-[#8c7865] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {order.paymentMethod && (
                        <span className="hidden sm:inline-block text-[10px] font-semibold bg-[#faf8f5] px-2 py-0.5 rounded border border-[#e8ded0] text-[#756555] whitespace-nowrap">
                          {order.paymentMethod === "cod" ? "عند الاستلام" : order.paymentMethod === "wallet" ? "محفظة" : "فيزا"}
                        </span>
                      )}
                    </div>

                    {/* Customer & Item Details */}
                    <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#161412] truncate group-hover:text-[#8c6b3e] transition-colors">
                        {order.customerName}
                      </h4>
                      <span className="text-xs text-[#756555] font-medium whitespace-nowrap">• {order.governorate}</span>
                      <span className="dir-ltr text-xs font-mono text-[#8c7865] whitespace-nowrap">• {order.phone}</span>
                      <span className="text-[10px] font-bold bg-[#f7f4ee] text-[#161412] px-1.5 py-0.5 rounded border border-[#ded2c0] whitespace-nowrap">
                        {totalItemsCount} {totalItemsCount === 1 ? "قطعة" : "قطع"}
                      </span>
                    </div>
                  </div>

                  {/* Order Financials & Quick Actions Left */}
                  <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#f0e8dc] shrink-0">
                    {/* Price */}
                    <div className="text-right lg:text-left pl-1">
                      <span className="text-sm sm:text-base font-bold text-[#161412] font-mono">
                        {order.total.toLocaleString("en-US")} <span className="text-[10px] font-normal text-[#8c7865]">ج.م</span>
                      </span>
                    </div>

                    {/* Status Dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order["status"])}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                          order.status === "pending"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : order.status.startsWith("confirmed")
                            ? "bg-blue-50 text-blue-900 border-blue-300"
                            : order.status === "shipped"
                            ? "bg-purple-50 text-purple-900 border-purple-300"
                            : order.status === "completed"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="confirmed_phone">تم التأكيد هاتفياً</option>
                        <option value="confirmed_whatsapp">تم التأكيد واتساب</option>
                        <option value="processing">جاري التجهيز</option>
                        <option value="shipped">تم الشحن</option>
                        <option value="completed">تم التوصيل بنجاح</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>

                    {/* Open Details Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrderForDetails(order);
                      }}
                      className="px-3 py-1 rounded-lg bg-[#161412] text-[#f7f4ee] hover:bg-[#2e2925] text-xs font-bold transition-all flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#c5a880]" />
                      <span>التفاصيل</span>
                    </button>

                    {/* WhatsApp Link */}
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors shrink-0"
                      title="محادثة واتساب سريعة"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

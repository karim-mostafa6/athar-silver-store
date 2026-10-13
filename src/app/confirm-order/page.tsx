"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore, Order } from "@/context/StoreContext";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from "lucide-react";

function ConfirmOrderContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("id") || "";
  const initialAction = searchParams.get("action") || "";

  const {
    orders,
    storeSettings,
    confirmOrderViaWhatsApp,
    cancelOrderViaWhatsApp,
  } = useStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState("أريد تغيير المقاس أو الموديل");
  const [customReason, setCustomReason] = useState("");
  const [showCancelSurvey, setShowCancelSurvey] = useState(initialAction === "cancel");
  const [hasJustConfirmed, setHasJustConfirmed] = useState(false);
  const [hasJustCancelled, setHasJustCancelled] = useState(false);

  // Find order by ID from context or localStorage fallback
  useEffect(() => {
    if (!orderIdFromUrl) return;

    const matched = orders.find(
      (o) => o.id.toLowerCase() === orderIdFromUrl.toLowerCase()
    );

    if (matched) {
      setOrder(matched);
    } else {
      try {
        const raw = localStorage.getItem("athar_orders");
        if (raw) {
          const parsed: Order[] = JSON.parse(raw);
          const found = parsed.find(
            (o) => o.id.toLowerCase() === orderIdFromUrl.toLowerCase()
          );
          if (found) setOrder(found);
        }
      } catch {
        // Ignore
      }
    }
  }, [orderIdFromUrl, orders]);

  // Handle URL action=confirm if status is still pending
  useEffect(() => {
    if (initialAction === "confirm" && order && order.status === "pending" && !hasJustConfirmed) {
      confirmOrderViaWhatsApp(order.id);
      setHasJustConfirmed(true);
    }
  }, [initialAction, order, hasJustConfirmed, confirmOrderViaWhatsApp]);

  const handleConfirmClick = () => {
    if (!order) return;
    confirmOrderViaWhatsApp(order.id);
    setHasJustConfirmed(true);
    setShowCancelSurvey(false);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    const reasonToSave =
      selectedReason === "other"
        ? customReason.trim() || "سبب مخصص من العميل"
        : selectedReason;

    cancelOrderViaWhatsApp(order.id, reasonToSave);
    setHasJustCancelled(true);
    setShowCancelSurvey(false);
  };

  // If no orderId or order not found
  if (!orderIdFromUrl || !order) {
    return (
      <div className="min-h-screen bg-[#faf8f5] text-[#1c1815] flex flex-col justify-between py-12 px-4 dir-rtl text-right">
        <div className="max-w-lg mx-auto w-full bg-white border border-[#ebdcca] rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-alexandria text-[#1c1815]">
            لم نتمكن من العثور على الطلب
          </h2>
          <p className="text-xs text-[#8c7865] leading-relaxed">
            يرجى التأكد من الضغط على الرابط الصحيح المرسل لك عبر رسالة الواتساب، أو التواصل مباشرة مع خدمة عملاء براند أَثَر.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-[#1c1815] text-[#ded1be] text-xs font-bold hover:bg-[#382f28] transition-colors"
            >
              الذهاب للمتجر الرئيسي
            </Link>
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل مع خدمة العملاء</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = order.status === "confirmed_whatsapp" || order.whatsappConfirmed || hasJustConfirmed;
  const isCancelled = order.status === "cancelled" || hasJustCancelled;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1815] py-8 sm:py-12 px-4 dir-rtl text-right selection:bg-[#ebdcca]">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="text-2xl sm:text-3xl font-black font-alexandria tracking-widest text-[#1c1815]">
              {storeSettings.brandNameArabic || "أَثَر للفضة 925"}
            </h1>
          </Link>
          <span className="text-[11px] text-[#8c7865] block font-medium">
            بوابة تأكيد ومتابعة الطلبات الرسمية • الفضة الإيطالية عيار 925
          </span>
        </div>

        {/* Status Card Banner */}
        <div className="bg-white rounded-3xl border border-[#ebdcca] shadow-sm overflow-hidden p-6 sm:p-7 space-y-6">
          {/* Top Order Badge & Date */}
          <div className="flex items-center justify-between border-b border-[#ebdcca] pb-4">
            <div>
              <span className="text-[10px] text-[#8c7865] block">رقم طلبك:</span>
              <span className="font-mono font-bold text-base text-[#1c1815]">#{order.id}</span>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-[#8c7865] block">تاريخ الطلب:</span>
              <span className="text-xs font-medium text-[#1c1815]">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Current Decision State */}
          {isConfirmed ? (
            /* STATE A: CONFIRMED VIA WHATSAPP */
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 tracking-wider">
                  تم تأكيد رغبتك في استلام الشحنة بنجاح 📲✓
                </span>
                <h3 className="text-lg sm:text-xl font-black font-alexandria text-[#1c1815]">
                  شكراً لك أستاذ {order.customerName}!
                </h3>
                <p className="text-xs text-[#6e5d4e] max-w-md mx-auto leading-relaxed pt-1">
                  تم تسجيل تأكيدك في نظامنا تلقائياً. سيقوم فريق خدمة العملاء بالتواصل معك هاتفياً قبل خروج الشحنة لتأكيد موعد التسليم الدقيق وتجهيز القطع بعناية فائقة.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-emerald-800 font-bold bg-white/70 py-2 px-3 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ضمان الفضة 925 + تغليف آمن ومحكم مع كارت الضمان</span>
              </div>
            </div>
          ) : isCancelled ? (
            /* STATE B: CANCELLED VIA WHATSAPP */
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-300 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-rose-800 tracking-wider">
                  تم إلغاء هذا الطلب بناءً على طلبك ❌
                </span>
                <h3 className="text-base font-bold text-rose-950">
                  تم إيقاف تجهيز الطلب #{order.id}
                </h3>
                {order.cancellationReason && (
                  <p className="text-xs text-rose-800 bg-white/80 p-2 rounded-xl border border-rose-200 inline-block mt-1">
                    السبب المسجل: {order.cancellationReason}
                  </p>
                )}
                <p className="text-xs text-[#8c7865] max-w-md mx-auto pt-1">
                  لن يتم شحن أي شيء ولن تتكبد أي مصاريف. إذا كان هذا عن طريق الخطأ وترغب في استعادة طلبك:
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmClick}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#1c1815] hover:bg-[#382f28] text-[#ded1be] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تفعيل وتأكيد الطلب الآن</span>
              </button>
            </div>
          ) : (
            /* STATE C: PENDING CONFIRMATION - ACTION BUTTONS */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>طلبك بانتظار التأكيد لبدء التجهيز</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  حرصاً على سرعة وصول شحنتك، يُرجى تأكيد رغبتك في الاستلام أو إعلامنا في حال رغبتك في الإلغاء قبل خروج المندوب.
                </p>
              </div>

              {!showCancelSurvey ? (
                /* Primary Actions */
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmClick}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>نعم، أؤكد رغبتي في استلام الطلب والشحن ✅</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCancelSurvey(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>إلغاء الطلب (إذا غيرت رأيك)</span>
                  </button>
                </div>
              ) : (
                /* Cancellation Reason Survey Form */
                <form
                  onSubmit={handleCancelSubmit}
                  className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="border-b border-rose-200/80 pb-2">
                    <h4 className="font-bold text-xs text-rose-950">
                      نأسف لعدم إتمام الطلب هذه المرة! برجاء توضيح سبب الإلغاء:
                    </h4>
                    <p className="text-[11px] text-rose-800 mt-0.5">
                      يساعدنا رأيك في تحسين جودة قطعنا وخدمات التوصيل.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      "أريد تغيير المقاس أو الموديل",
                      "موعد التوصيل لا يناسبني حالياً",
                      "تم عمل الطلب عن طريق الخطأ / طلب مكرر",
                      "تكلفة الشحن أو مدة التوصيل غير مناسبة",
                      "other",
                    ].map((reasonKey) => {
                      const isSelected = selectedReason === reasonKey;
                      const label =
                        reasonKey === "other"
                          ? "سبب آخر (مخصص)..."
                          : reasonKey;

                      return (
                        <label
                          key={reasonKey}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "bg-white border-rose-400 font-bold text-rose-950 shadow-sm"
                              : "bg-white/60 border-rose-100 text-[#1c1815] hover:bg-white"
                          }`}
                        >
                          <input
                            type="radio"
                            name="customerCancelReason"
                            checked={isSelected}
                            onChange={() => setSelectedReason(reasonKey)}
                            className="accent-rose-600 w-3.5 h-3.5"
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>

                  {selectedReason === "other" && (
                    <input
                      type="text"
                      required
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="اكتب سبب الإلغاء هنا..."
                      className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs text-[#1c1815] focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCancelSurvey(false)}
                      className="px-3 py-2 rounded-xl bg-white text-xs font-bold text-[#8c7865] hover:bg-white/80"
                    >
                      تراجع
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      تأكيد إلغاء الطلب ❌
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Customer & Address Details */}
          <div className="pt-4 border-t border-[#ebdcca] space-y-3 text-xs">
            <span className="font-bold text-[#8c7865] block uppercase tracking-wider text-[10px]">
              بيانات المستلم وعنوان التوصيل:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#faf8f5] p-4 rounded-2xl border border-[#ebdcca]">
              <div>
                <span className="text-[#8c7865] block text-[11px]">اسم العميل:</span>
                <span className="font-bold text-sm text-[#1c1815]">{order.customerName}</span>
              </div>
              <div>
                <span className="text-[#8c7865] block text-[11px]">رقم الهاتف:</span>
                <span className="font-mono font-bold text-[#1c1815] dir-ltr inline-block">
                  {order.phone}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#8c7865] block text-[11px]">العنوان:</span>
                <span className="text-[#1c1815] font-medium block">
                  محافظة {order.governorate} - {order.address}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Breakdown */}
          <div className="space-y-2">
            <span className="font-bold text-[#8c7865] block uppercase tracking-wider text-[10px]">
              القطع المطلوبة:
            </span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] border border-[#ebdcca] text-xs"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.arabicName}
                        className="w-12 h-12 rounded-xl object-cover border border-[#ebdcca]"
                      />
                    )}
                    <div>
                      <span className="font-bold text-[#1c1815] block">{item.arabicName}</span>
                      {item.selectedSize && (
                        <span className="text-[10px] text-[#8c7865] block">
                          المقاس: {item.selectedSize}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left font-bold text-[#1c1815]">
                    <span>{item.quantity} × {item.price} ج.م</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financials & Payment Method */}
          <div className="p-4 rounded-2xl bg-[#f5efe6] border border-[#ebdcca] space-y-2 text-xs">
            <div className="flex justify-between text-[#8c7865]">
              <span>طريقة الدفع:</span>
              <span className="font-bold text-[#1c1815]">
                {order.paymentMethod === "cod"
                  ? "الدفع عند الاستلام (نقداً عند التوصيل)"
                  : order.paymentMethod === "wallet"
                  ? "تحويل إنستاباي / محفظة فودافون كاش ✓"
                  : "بطاقة بنكية (Paymob) ✓"}
              </span>
            </div>
            <div className="flex justify-between text-[#8c7865]">
              <span>مصاريف الشحن:</span>
              <span className="text-[#1c1815]">
                {order.shippingFee === 0 ? "مجاني" : `${order.shippingFee} ج.م`}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>الخصم المطبق:</span>
                <span>-{order.discount} ج.م</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[#ebdcca] text-[#1c1815]">
              <span className="font-bold text-sm">المبلغ المطلوب:</span>
              <span className="text-xl font-black font-alexandria">
                {order.total.toLocaleString("ar-EG")} ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <div className="p-4 rounded-2xl bg-white border border-[#ebdcca] text-center space-y-2 text-xs text-[#8c7865]">
          <div className="flex items-center justify-center gap-1 font-bold text-[#1c1815]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>فريق خدمة عملاء أَثَر في خدمتك دائماً</span>
          </div>
          <p className="text-[11px] text-[#8c7865]">
            لأي استفسار أو تعديل على العنوان أو المقاس، يمكنك التواصل معنا مباشرة:
          </p>
          <div className="flex items-center justify-center gap-3 pt-1">
            <a
              href={`tel:${storeSettings.contactPhone || storeSettings.whatsappNumber}`}
              className="px-3.5 py-1.5 rounded-lg bg-[#faf8f5] border border-[#ebdcca] text-[#1c1815] font-bold text-[11px] hover:bg-[#f5efe6] flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#8c7865]" />
              <span>اتصال هاتفي</span>
            </a>
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px] hover:bg-emerald-100 flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>محادثة واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-center p-4">
          <div className="text-xs text-[#8c7865]">جاري تحميل بيانات الطلب...</div>
        </div>
      }
    >
      <ConfirmOrderContent />
    </Suspense>
  );
}

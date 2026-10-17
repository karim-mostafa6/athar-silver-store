import type { Order } from "@/context/StoreContext";

export interface ReviewResult {
  needsReview: boolean;
  reasons: string[];
}

const digits = (s: string) => (s || "").replace(/\D/g, "");
const last10 = (s: string) => digits(s).slice(-10);

/**
 * Flags orders that deserve a quick human look BEFORE shipping.
 * The order itself is never blocked or cancelled — it is only marked.
 */
export function evaluateOrderReview(
  order: Pick<Order, "customerName" | "phone" | "address" | "total" | "items" | "paymentMethod">,
  history: Order[],
  highValueThreshold = 4000
): ReviewResult {
  const reasons: string[] = [];
  const phoneKey = last10(order.phone);
  const same = history.filter((o) => last10(o.phone) === phoneKey);

  const cancelled = same.filter((o) => o.status === "cancelled").length;
  if (cancelled >= 1) reasons.push(`عميل ملغي له ${cancelled} طلب سابق`);

  const recent = same.filter((o) => Date.now() - new Date(o.createdAt || 0).getTime() < 24 * 3600 * 1000);
  if (recent.length >= 1) reasons.push("طلب تاني من نفس الرقم خلال 24 ساعة (ممكن مكرر)");

  const addr = (order.address || "").trim();
  if (addr.length < 15) reasons.push("العنوان مختصر — اتأكد منه");
  if (!/\d/.test(addr) && addr.length < 40) reasons.push("العنوان مفيهوش رقم عقار أو شارع");

  const nameParts = (order.customerName || "").trim().split(/\s+/).filter(Boolean);
  if (nameParts.length < 2) reasons.push("الاسم كلمة واحدة بس");

  if (Number(order.total) >= highValueThreshold && same.length === 0) {
    reasons.push("طلب أول مرة بقيمة كبيرة");
  }

  const qty = (order.items || []).reduce((a, i) => a + (Number(i.quantity) || 0), 0);
  if (qty >= 6) reasons.push("كمية كبيرة (6 قطع أو أكتر)");

  return { needsReview: reasons.length > 0, reasons };
}

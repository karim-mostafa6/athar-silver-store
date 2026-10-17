import { Order } from "@/context/StoreContext";
import { getServerStoreData, patchOrderFields } from "./serverStore";
import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";

/** Clean and normalize Egyptian phone numbers to international WhatsApp format (201XXXXXXXXX) */
export function normalizeEgyptianPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("002")) cleaned = cleaned.substring(3);
  if (cleaned.startsWith("20")) return cleaned;
  if (cleaned.startsWith("01")) return "2" + cleaned;
  if (cleaned.startsWith("1") && cleaned.length === 10) return "20" + cleaned;
  return cleaned;
}

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || "https://orma-silver.vercel.app";

function paymentLabelOf(order: Order): string {
  return order.paymentMethod === "wallet"
    ? "محفظة إلكترونية (إنستاباي / فودافون كاش)"
    : order.paymentMethod === "card"
    ? "بطاقة دفع بنكية"
    : "الدفع عند الاستلام";
}

export function trackUrlFor(order: Pick<Order, "id">, origin?: string): string {
  const clean = order.id.replace(/^#/, "");
  return `${origin || SITE()}/track?id=${encodeURIComponent(clean)}`;
}

/** Friendly, short Arabic confirmation (free-text). The "silence = approval" policy. */
export function formatWhatsAppOrderMessage(order: Order, origin: string = SITE()): string {
  const name = (order.customerName || "").trim().split(/\s+/)[0] || "عميلنا";
  const num = order.id.startsWith("#") ? order.id : `#${order.id}`;
  const items =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items
          .map((i) => `• ${i.arabicName || i.name}${i.selectedSize ? ` (مقاس ${i.selectedSize})` : ""} × ${i.quantity}`)
          .join("\n")
      : "• قطع فضة إسترليني 925";
  const ship = Number(order.shippingFee || 0) === 0 ? "الشحن مجاني" : `الشحن ${Number(order.shippingFee).toLocaleString("en-US")} ج.م`;

  return `أهلاً ${name} 🤍
وصلنا طلبك رقم *${num}* من *أورما* وبنجهّزه دلوقتي ✨

🛍️ *القطع:*
${items}

💰 *الإجمالي:* ${Number(order.total || 0).toLocaleString("en-US")} ج.م (${ship})
📍 *التوصيل:* ${order.governorate} - ${order.address}
💳 *الدفع:* ${paymentLabelOf(order)}

🚚 هيوصلك خلال 2–4 أيام عمل، ومندوب الشحن هيتصل بيك قبل التسليم.
لو في أي تعديل في العنوان أو المقاس، رد على الرسالة دي 🤍

تابع طلبك: ${trackUrlFor(order, origin)}

أورما | Not Given, But Left`;
}

// ---------------------------------------------------------------------------------
// Provider resolution (accepts the env names already used on Vercel: META_*)
// ---------------------------------------------------------------------------------
type Provider =
  | { kind: "ultramsg"; instance: string; token: string }
  | { kind: "greenapi"; instance: string; token: string }
  | { kind: "cloud"; phoneId: string; token: string };

const env = (...names: string[]) => {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim().replace(/^["']|["']$/g, "");
  }
  return "";
};

export function resolveProvider(): Provider | null {
  const ui = env("ULTRAMSG_INSTANCE_ID");
  const ut = env("ULTRAMSG_TOKEN");
  if (ui && ut) return { kind: "ultramsg", instance: ui, token: ut };
  const gi = env("GREENAPI_INSTANCE_ID");
  const gt = env("GREENAPI_TOKEN");
  if (gi && gt) return { kind: "greenapi", instance: gi, token: gt };
  const cp = env("WHATSAPP_CLOUD_PHONE_ID", "META_PHONE_NUMBER_ID");
  const ct = env("WHATSAPP_CLOUD_TOKEN", "META_WHATSAPP_TOKEN");
  if (cp && ct) return { kind: "cloud", phoneId: cp, token: ct };
  return null;
}

export function providerSummary() {
  const p = resolveProvider();
  return p ? p.kind : "none";
}

export interface WaSendResult {
  ok: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  notConfigured?: boolean;
}

function explainMetaError(code?: number, msg?: string): string {
  switch (code) {
    case 190:
      return "توكن ميتا (META_WHATSAPP_TOKEN) منتهي أو غلط. اعمل توكن دائم من System User في Meta Business.";
    case 131047:
    case 131051:
      return "واتساب بيمنع الرسالة الحرة لعميل جديد (برا نافذة 24 ساعة). لازم قالب رسالة معتمد: اكتب اسمه في الداشبورد.";
    case 132001:
      return "اسم القالب أو لغته مش موجودين/غير معتمدين في Meta.";
    case 132000:
    case 132005:
    case 132012:
      return "عدد/شكل متغيرات القالب مش مطابق للقالب المعتمد.";
    case 131030:
      return "الرقم مش في قائمة الأرقام المسموحة (حساب تجريبي). ضيف الرقم أو فعّل الحساب الرسمي.";
    case 131026:
      return "الرقم ده مش على واتساب أو مش بيستقبل رسايل.";
    case 130429:
    case 131048:
      return "تجاوزت حد الرسائل المسموح مؤقتاً.";
    default:
      return msg || "خطأ غير معروف من واتساب";
  }
}

async function getTemplateConfig(): Promise<{ name: string; lang: string }> {
  let name = env("WHATSAPP_TEMPLATE_NAME");
  let lang = env("WHATSAPP_TEMPLATE_LANG");
  try {
    const data = await getServerStoreData();
    const s = (data.settings || {}) as { waTemplateName?: string; waTemplateLang?: string };
    if (s.waTemplateName && s.waTemplateName.trim()) name = s.waTemplateName.trim();
    if (s.waTemplateLang && s.waTemplateLang.trim()) lang = s.waTemplateLang.trim();
  } catch {}
  return { name, lang: lang || "ar" };
}

/** Low-level send. `template` params are used for Meta Cloud when a template name is configured. */
export async function sendWhatsAppRaw(
  phone: string,
  text: string,
  templateParams?: string[]
): Promise<WaSendResult> {
  const to = normalizeEgyptianPhone(phone);
  if (!to) return { ok: false, provider: "none", error: "رقم الهاتف غير صالح" };
  const provider = resolveProvider();
  if (!provider) {
    return {
      ok: false,
      provider: "none",
      notConfigured: true,
      error: "واتساب غير مفعّل: مفيش بيانات ربط (META_WHATSAPP_TOKEN و META_PHONE_NUMBER_ID أو UltraMsg/Green-API).",
    };
  }

  try {
    if (provider.kind === "ultramsg") {
      const res = await fetch(`https://api.ultramsg.com/${provider.instance}/messages/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: provider.token, to: `+${to}`, body: text }),
      });
      const data = (await res.json().catch(() => null)) as { sent?: string | boolean; id?: string; error?: string } | null;
      const sent = data && (data.sent === "true" || data.sent === true);
      return sent
        ? { ok: true, provider: "ultramsg", messageId: String(data?.id || "") }
        : { ok: false, provider: "ultramsg", error: data?.error || `UltraMsg HTTP ${res.status}` };
    }

    if (provider.kind === "greenapi") {
      const res = await fetch(
        `https://api.green-api.com/waInstance${provider.instance}/sendMessage/${provider.token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId: `${to}@c.us`, message: text }),
        }
      );
      const data = (await res.json().catch(() => null)) as { idMessage?: string; message?: string } | null;
      return res.ok && data?.idMessage
        ? { ok: true, provider: "greenapi", messageId: data.idMessage }
        : { ok: false, provider: "greenapi", error: data?.message || `Green-API HTTP ${res.status}` };
    }

    // Meta WhatsApp Cloud API
    const tpl = await getTemplateConfig();
    const useTemplate = Boolean(tpl.name && templateParams && templateParams.length > 0);
    const payload = useTemplate
      ? {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: tpl.name,
            language: { code: tpl.lang },
            components: [
              { type: "body", parameters: (templateParams as string[]).map((t) => ({ type: "text", text: t })) },
            ],
          },
        }
      : { messaging_product: "whatsapp", to, type: "text", text: { body: text, preview_url: true } };

    const res = await fetch(`https://graph.facebook.com/v21.0/${provider.phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as {
      messages?: { id?: string }[];
      error?: { code?: number; message?: string; error_data?: { details?: string } };
    } | null;
    const id = data?.messages?.[0]?.id;
    if (res.ok && id) return { ok: true, provider: "meta_cloud", messageId: id };
    return {
      ok: false,
      provider: "meta_cloud",
      error: explainMetaError(data?.error?.code, data?.error?.error_data?.details || data?.error?.message),
    };
  } catch (err) {
    return { ok: false, provider: provider.kind, error: err instanceof Error ? err.message : "فشل الاتصال بخدمة واتساب" };
  }
}

/** Sends the order confirmation (template params + free-text fallback body). */
export async function sendWhatsAppOrderConfirmation(
  order: Order,
  options?: { origin?: string }
): Promise<WaSendResult> {
  const phone = order.whatsapp?.trim() || order.phone?.trim();
  if (!phone) return { ok: false, provider: "none", error: "رقم هاتف العميل غير متوفر" };
  const origin = options?.origin || SITE();
  const name = (order.customerName || "").trim().split(/\s+/)[0] || "عميلنا";
  const num = order.id.startsWith("#") ? order.id : `#${order.id}`;
  return sendWhatsAppRaw(phone, formatWhatsAppOrderMessage(order, origin), [
    name,
    num,
    Number(order.total || 0).toLocaleString("en-US"),
    trackUrlFor(order, origin),
  ]);
}

// ---------------------------------------------------------------------------------
// Delayed dispatch (3 minutes) — driven by an external clock (Supabase pg_cron, every minute)
// so it survives serverless cold starts. Orders are marked wa_status='pending' on creation.
// ---------------------------------------------------------------------------------
export const WA_DELAY_MS = 3 * 60 * 1000;
const WA_MAX_AGE_MS = 48 * 60 * 60 * 1000;

async function finish(order: Order, r: WaSendResult) {
  if (r.ok) {
    const notes = order.adminNotes || "";
    await patchOrderFields(order.id, {
      waStatus: "sent",
      waSentAt: new Date().toISOString(),
      waError: "",
      adminNotes: notes.includes("[whatsapp_sent]") ? notes : `${notes} [whatsapp_sent]`.trim(),
    });
  } else {
    await patchOrderFields(order.id, {
      waStatus: r.notConfigured ? "not_configured" : "failed",
      waSentAt: new Date().toISOString(),
      waError: r.error || "فشل غير معروف",
    });
  }
}

export async function processDueWhatsApp(origin?: string): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const out = { processed: 0, sent: 0, failed: 0 };
  try {
    const now = Date.now();
    const dueBefore = new Date(now - WA_DELAY_MS).toISOString();
    const oldest = new Date(now - WA_MAX_AGE_MS).toISOString();
    let due: Order[] = [];

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      const staleClaim = new Date(now - 10 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("orders")
        .select("*")
        .or(`wa_status.eq.pending,and(wa_status.eq.sending,wa_sent_at.lt.${staleClaim})`)
        .neq("status", "cancelled")
        .lte("created_at", dueBefore)
        .gte("created_at", oldest)
        .limit(15);
      const { mapDbOrderToModel } = await import("./serverStore");
      due = (data || []).map((r) => mapDbOrderToModel(r as Record<string, unknown>));
      // Claim each row atomically so concurrent ticks can never double-send
      const claimed: Order[] = [];
      for (const o of due) {
        const { data: got } = await supabase
          .from("orders")
          .update({ wa_status: "sending", wa_sent_at: new Date().toISOString() })
          .eq("id", o.id)
          .or(`wa_status.eq.pending,and(wa_status.eq.sending,wa_sent_at.lt.${staleClaim})`)
          .select("id");
        if (got && got.length > 0) claimed.push(o);
      }
      due = claimed;
    } else {
      const store = await getServerStoreData();
      due = store.orders.filter(
        (o) =>
          o.waStatus === "pending" &&
          o.status !== "cancelled" &&
          now - new Date(o.createdAt || 0).getTime() >= WA_DELAY_MS &&
          now - new Date(o.createdAt || 0).getTime() <= WA_MAX_AGE_MS
      );
    }

    for (const order of due) {
      out.processed++;
      const r = await sendWhatsAppOrderConfirmation(order, { origin });
      await finish(order, r);
      if (r.ok) out.sent++;
      else out.failed++;
    }
  } catch (err) {
    console.error("[WhatsApp processDue]", err);
  }
  return out;
}

/** Immediate send (admin "resend" button), ignores the delay. */
export async function resendWhatsAppNow(orderId: string, origin?: string): Promise<WaSendResult> {
  const store = await getServerStoreData();
  const order = store.orders.find((o) => o.id === orderId || o.id === orderId.replace(/^#/, ""));
  if (!order) return { ok: false, provider: "none", error: "الطلب غير موجود" };
  const r = await sendWhatsAppOrderConfirmation(order, { origin });
  await finish(order, r);
  return r;
}

// Backwards-compatible no-ops (old in-memory queue was removed; cancelled orders are skipped by the dispatcher)
export function cancelDelayedWhatsAppJob(_orderId: string): boolean {
  void _orderId;
  return false;
}
export async function reconcilePendingWhatsAppConfirmations(origin?: string) {
  const r = await processDueWhatsApp(origin);
  return { processed: r.processed, successes: r.sent, errors: r.failed };
}

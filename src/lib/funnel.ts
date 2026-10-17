import { getSupabaseAdminClient, isSupabaseConfigured } from "./supabase";
import { normalizeEgyptianPhone } from "./whatsapp";

export const SOURCES = ["instagram", "tiktok", "facebook", "google", "whatsapp", "youtube", "snapchat", "twitter", "direct", "other"] as const;

export function sanitizeSource(raw: unknown): string {
  const v = String(raw || "").toLowerCase().trim();
  if (!v) return "direct";
  return (SOURCES as readonly string[]).includes(v) ? v : "other";
}

const FUNNEL_TYPES = ["view", "add_to_cart", "checkout_start", "purchase"];

export async function recordFunnelEvent(sid: string, type: string, source?: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const cleanSid = String(sid || "").slice(0, 64);
  if (!cleanSid || !FUNNEL_TYPES.includes(type)) return;
  try {
    const supabase = getSupabaseAdminClient();
    await supabase
      .from("funnel_events")
      .upsert({ sid: cleanSid, type, source: sanitizeSource(source) }, { onConflict: "sid,type", ignoreDuplicates: true });
  } catch {}
}

export async function markCartRecovered(phoneKey: string): Promise<void> {
  if (!isSupabaseConfigured() || !phoneKey) return;
  try {
    await getSupabaseAdminClient().from("abandoned_carts").update({ recovered: true }).eq("phone", phoneKey);
  } catch {}
}

export interface CartInput {
  phone: string;
  name?: string;
  email?: string;
  items: { productId: string; arabicName: string; quantity: number; price: number; selectedSize?: string }[];
  total: number;
  source?: string;
}

export async function upsertAbandonedCart(input: CartInput): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const phone = normalizeEgyptianPhone(String(input.phone || ""));
  if (!/^201[0125][0-9]{8}$/.test(phone)) return false;
  const items = (Array.isArray(input.items) ? input.items : [])
    .slice(0, 20)
    .map((i) => ({
      productId: String(i.productId || "").slice(0, 80),
      arabicName: String(i.arabicName || "").slice(0, 120),
      quantity: Math.max(1, Math.min(50, Number(i.quantity) || 1)),
      price: Number(i.price) || 0,
      selectedSize: i.selectedSize ? String(i.selectedSize).slice(0, 60) : undefined,
    }));
  if (items.length === 0) return false;
  const total = items.reduce((a, i) => a + i.price * i.quantity, 0);
  try {
    const supabase = getSupabaseAdminClient();
    const { data: existing } = await supabase.from("abandoned_carts").select("phone, notified_at, recovered").eq("phone", phone).maybeSingle();
    const nowIso = new Date().toISOString();
    const row: Record<string, unknown> = {
      phone,
      customer_name: String(input.name || "").slice(0, 80) || null,
      email: String(input.email || "").slice(0, 120) || null,
      items,
      total,
      source: sanitizeSource(input.source),
      updated_at: nowIso,
    };
    // A fresh cart after an earlier notification/recovery starts a new cycle.
    if (existing && (existing.notified_at || existing.recovered)) {
      row.notified_at = null;
      row.recovered = false;
      row.created_at = nowIso;
    }
    const { error } = await supabase.from("abandoned_carts").upsert(row, { onConflict: "phone" });
    return !error;
  } catch {
    return false;
  }
}

const cleanEnv = (v?: string) => (v ? v.trim().replace(/^["']|["']$/g, "") : "");

/** Notifies the owner on Telegram about carts left for 30+ minutes (once per cart) with a WhatsApp button. */
export async function processAbandonedCarts(): Promise<{ notified: number }> {
  let notified = 0;
  if (!isSupabaseConfigured()) return { notified };
  const botToken = cleanEnv(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanEnv(process.env.TELEGRAM_CHAT_ID);
  if (!botToken || !chatId) return { notified };
  try {
    const supabase = getSupabaseAdminClient();
    const now = Date.now();
    const { data } = await supabase
      .from("abandoned_carts")
      .select("*")
      .is("notified_at", null)
      .eq("recovered", false)
      .lte("updated_at", new Date(now - 30 * 60 * 1000).toISOString())
      .gte("updated_at", new Date(now - 24 * 3600 * 1000).toISOString())
      .limit(10);

    for (const c of data || []) {
      // Skip if the same customer already ordered after leaving the cart
      const tail = String(c.phone).slice(-10);
      const { data: ord } = await supabase
        .from("orders")
        .select("id")
        .like("phone", `%${tail}`)
        .gte("created_at", String(c.created_at))
        .limit(1);
      const claim = await supabase
        .from("abandoned_carts")
        .update({ notified_at: new Date().toISOString(), recovered: Boolean(ord && ord.length) })
        .eq("phone", c.phone)
        .is("notified_at", null)
        .select("phone");
      if (!claim.data || claim.data.length === 0) continue;
      if (ord && ord.length) continue;

      const items = (Array.isArray(c.items) ? c.items : []) as { arabicName: string; quantity: number; selectedSize?: string }[];
      const list = items.map((i) => `▫️ ${i.arabicName}${i.selectedSize ? ` (${i.selectedSize})` : ""} × ${i.quantity}`).join("\n");
      const first = (c.customer_name || "").trim().split(/\s+/)[0] || "";
      const waText = `أهلاً ${first} 🤍 أنا من أورما. لاحظت إنك كنت بتختار ${items[0]?.arabicName || "قطعة"} وما كمّلتش الطلب — محتاج مساعدة في المقاس أو أي استفسار؟ لو حابب أكمّله معاك أنا موجود ✨`;
      const text = `🛒 سلة متروكة\n👤 ${c.customer_name || "بدون اسم"}\n📞 ${c.phone}\n\n${list}\n\n💰 ${Number(c.total).toLocaleString("en-US")} ج.م${c.source ? `\n📍 المصدر: ${c.source}` : ""}`;
      try {
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            reply_markup: {
              inline_keyboard: [[{ text: "💬 كلّمه على واتساب", url: `https://wa.me/${c.phone}?text=${encodeURIComponent(waText)}` }]],
            },
          }),
        });
        if (res.ok) notified++;
      } catch {}
    }
  } catch (err) {
    console.error("[processAbandonedCarts]", err);
  }
  return { notified };
}

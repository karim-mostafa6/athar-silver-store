import crypto from "crypto";
import type { Order } from "@/context/StoreContext";
import { formatWhatsAppOrderMessage, normalizeEgyptianPhone } from "@/lib/whatsapp";

const secret = () =>
  process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "orma-wa";

export const siteOrigin = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://orma-silver.vercel.app").replace(/\/$/, "");

export function signWaToken(orderId: string): string {
  return crypto.createHmac("sha256", secret()).update(`wa:${orderId}`).digest("hex").slice(0, 24);
}

export function verifyWaToken(orderId: string, token: string): boolean {
  const expected = signWaToken(orderId);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(token || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** wa.me link that opens the customer's chat with the full confirmation text prefilled. */
export function manualWaUrl(order: Order): string {
  const phone = normalizeEgyptianPhone(order.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(formatWhatsAppOrderMessage(order, siteOrigin()))}`;
}

/** Signed one-tap link used by the Telegram button: marks the order as confirmed-by-WhatsApp, then redirects. */
export function waGoUrl(order: Order): string {
  return `${siteOrigin()}/api/wa/go?o=${encodeURIComponent(order.id)}&t=${signWaToken(order.id)}`;
}

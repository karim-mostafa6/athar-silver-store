import crypto from "crypto";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

const FLAG_KEY = "tg_webhook_secret_set";
let enforcedCache = false;

export function cleanBotToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || "").trim().replace(/^["']|["']$/g, "");
}

/** Secret Telegram must echo in the X-Telegram-Bot-Api-Secret-Token header. Derived from the bot token. */
export function webhookSecret(): string {
  return crypto.createHmac("sha256", cleanBotToken()).update("orma-telegram-webhook").digest("hex");
}

/** Once the webhook has been re-registered with the secret, every update must carry it. */
export async function isSecretEnforced(): Promise<boolean> {
  if (enforcedCache) return true;
  if (!isSupabaseConfigured()) return false;
  try {
    const { data } = await getSupabaseAdminClient().from("app_config").select("value").eq("key", FLAG_KEY).maybeSingle();
    if (data?.value === "1") enforcedCache = true;
  } catch {}
  return enforcedCache;
}

/** Idempotent: re-registers the existing webhook URL with the secret token, then turns enforcement on. */
export async function ensureWebhookSecret(): Promise<void> {
  const token = cleanBotToken();
  if (!token || !isSupabaseConfigured() || (await isSecretEnforced())) return;
  const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) => r.json()).catch(() => null);
  const url: string = info?.result?.url || "";
  if (!url) return; // no webhook registered yet; nothing to protect
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, secret_token: webhookSecret(), allowed_updates: ["message", "callback_query"] }),
  })
    .then((r) => r.json())
    .catch(() => null);
  if (res?.ok) {
    await getSupabaseAdminClient().from("app_config").upsert({ key: FLAG_KEY, value: "1" });
    enforcedCache = true;
  }
}

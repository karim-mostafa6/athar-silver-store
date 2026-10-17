import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { safeEqual } from "@/lib/rateLimit";
import { ensureWebhookSecret } from "@/lib/tgWebhook";
import { processAbandonedCarts } from "@/lib/funnel";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Called every minute by Supabase pg_cron (via pg_net) with the shared secret stored in
 * public.app_config('cron_secret'). Sends due WhatsApp confirmations and abandoned-cart alerts.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ok: false }, { status: 503 });
    const provided = request.headers.get("x-cron-secret") || "";
    if (!provided) return NextResponse.json({ ok: false }, { status: 401 });
    const { data } = await getSupabaseAdminClient().from("app_config").select("value").eq("key", "cron_secret").maybeSingle();
    if (!data || !safeEqual(String(data.value), provided)) return NextResponse.json({ ok: false }, { status: 401 });

    await ensureWebhookSecret().catch(() => {});
    const carts = await processAbandonedCarts();
    return NextResponse.json({ ok: true, carts });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "error" }, { status: 500 });
  }
}

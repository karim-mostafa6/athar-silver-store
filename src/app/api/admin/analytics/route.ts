import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Admin-only: funnel counts per source (last N days) + abandoned-cart stats. */
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isSupabaseConfigured()) return NextResponse.json({ ok: true, funnel: {}, bySource: {}, carts: { total: 0, notified: 0, recovered: 0 } });
  const days = Math.max(1, Math.min(180, Number(new URL(request.url).searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const supabase = getSupabaseAdminClient();

  const funnel: Record<string, number> = { view: 0, add_to_cart: 0, checkout_start: 0, purchase: 0 };
  const bySource: Record<string, Record<string, number>> = {};
  const { data: events } = await supabase
    .from("funnel_events")
    .select("type, source")
    .gte("created_at", since)
    .limit(50000);
  for (const e of events || []) {
    funnel[e.type] = (funnel[e.type] || 0) + 1;
    const src = e.source || "direct";
    bySource[src] = bySource[src] || { view: 0, add_to_cart: 0, checkout_start: 0, purchase: 0 };
    bySource[src][e.type] = (bySource[src][e.type] || 0) + 1;
  }

  const { data: carts } = await supabase.from("abandoned_carts").select("notified_at, recovered, created_at").gte("created_at", since);
  const list = carts || [];
  return NextResponse.json({
    ok: true,
    days,
    funnel,
    bySource,
    carts: {
      total: list.length,
      notified: list.filter((c) => c.notified_at).length,
      recovered: list.filter((c) => c.recovered).length,
    },
  });
}

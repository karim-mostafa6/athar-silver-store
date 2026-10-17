import { NextRequest, NextResponse } from "next/server";
import { recordFunnelEvent } from "@/lib/funnel";

export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();

/** Public, anonymous funnel counter: one row per (session, event type). */
export async function POST(request: NextRequest) {
  try {
    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const now = Date.now();
    const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
    if (arr.length >= 60) return NextResponse.json({ ok: false }, { status: 429 });
    arr.push(now);
    hits.set(ip, arr);
    const body = await request.json().catch(() => ({}));
    if (body.type === "purchase") return NextResponse.json({ ok: false }, { status: 400 }); // server-side only
    await recordFunnelEvent(body.sid, body.type, body.source);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

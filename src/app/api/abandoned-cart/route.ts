import { NextRequest, NextResponse } from "next/server";
import { upsertAbandonedCart } from "@/lib/funnel";

export const dynamic = "force-dynamic";

const hits = new Map<string, number[]>();
function allowed(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  hits.set(key, arr);
  return true;
}

/** Public: the checkout page reports a cart once the customer has typed a valid phone number. */
export async function POST(request: NextRequest) {
  try {
    const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    if (!allowed(ip, 20, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
    const body = await request.json().catch(() => ({}));
    const ok = await upsertAbandonedCart(body);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

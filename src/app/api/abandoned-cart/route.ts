import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { upsertAbandonedCart } from "@/lib/funnel";

export const dynamic = "force-dynamic";


/** Public: the checkout page reports a cart once the customer has typed a valid phone number. */
export async function POST(request: NextRequest) {
  try {
    if (!(await rateLimit("cart", clientIp(request), 20, 600))) return NextResponse.json({ ok: false }, { status: 429 });
    const body = await request.json().catch(() => ({}));
    const ok = await upsertAbandonedCart(body);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

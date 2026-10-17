import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { resendWhatsAppNow } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) return NextResponse.json({ ok: false, error: "غير مصرح." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.orderId || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "رقم الطلب مطلوب" }, { status: 400 });
  const r = await resendWhatsAppNow(id, process.env.NEXT_PUBLIC_SITE_URL || "https://orma-silver.vercel.app");
  return NextResponse.json(r);
}

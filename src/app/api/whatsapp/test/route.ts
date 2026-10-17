import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { providerSummary, sendWhatsAppRaw } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

/** Admin-only: sends a real test message and returns the true provider result/error. */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) return NextResponse.json({ ok: false, error: "غير مصرح." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const phone = String(body.phone || "").trim();
  if (!phone) return NextResponse.json({ ok: false, error: "اكتب رقم موبايل للتجربة." }, { status: 400 });
  const r = await sendWhatsAppRaw(
    phone,
    "رسالة تجريبية من أورما ✨ لو وصلتك يبقى الربط شغال 🤍",
    ["كريم", "#TEST-0000", "1,250", "https://orma-silver.vercel.app/track"]
  );
  return NextResponse.json({ ...r, configured: providerSummary() });
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, configured: providerSummary() });
}

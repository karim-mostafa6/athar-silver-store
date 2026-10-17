import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { findOrderById, patchOrderFields } from "@/lib/serverStore";
import { manualWaUrl } from "@/lib/waLink";

export const dynamic = "force-dynamic";

/** Admin dashboard: mark an order as WhatsApp-confirmed (manual send) and get the wa.me link to open. */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) return NextResponse.json({ ok: false, error: "غير مصرح." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const order = await findOrderById(String(body.orderId || ""));
  if (!order) return NextResponse.json({ ok: false, error: "الطلب غير موجود." }, { status: 404 });
  const notes = order.adminNotes || "";
  await patchOrderFields(order.id, {
    waStatus: "sent",
    waSentAt: new Date().toISOString(),
    waError: "",
    adminNotes: notes.includes("[whatsapp_sent]") ? notes : `${notes} [whatsapp_sent]`.trim(),
  });
  return NextResponse.json({ ok: true, url: manualWaUrl(order) });
}

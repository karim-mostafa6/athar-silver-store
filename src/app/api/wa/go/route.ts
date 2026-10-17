import { NextRequest, NextResponse } from "next/server";
import { findOrderById, patchOrderFields } from "@/lib/serverStore";
import { manualWaUrl, verifyWaToken } from "@/lib/waLink";

export const dynamic = "force-dynamic";

const page = (body: string) =>
  new NextResponse(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ORMA</title></head><body style="font-family:system-ui,Arial;background:#F5F0E7;color:#292722;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px"><div style="max-width:380px;text-align:center;line-height:1.8">${body}</div></body></html>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } }
  );

/**
 * One-tap link behind the Telegram "تأكيد واتساب" button.
 * Marks the order as WhatsApp-confirmed (dashboard updates itself) and redirects to wa.me with the text prefilled.
 * If it was already sent once, asks before sending again (?again=1) so a customer is never messaged twice by accident.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("o") || "";
  const token = request.nextUrl.searchParams.get("t") || "";
  const again = request.nextUrl.searchParams.get("again") === "1";
  if (!id || !verifyWaToken(id, token)) return page("<h3>الرابط غير صالح</h3>");

  const order = await findOrderById(id);
  if (!order) return page("<h3>الطلب غير موجود</h3>");

  if (order.waStatus === "sent" && !again) {
    const when = order.waSentAt
      ? new Date(order.waSentAt).toLocaleString("ar-EG", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", day: "numeric", month: "long" })
      : "";
    return page(
      `<h3>✓ التأكيد اتبعت قبل كده</h3><p>${when}</p><a href="?o=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}&again=1" style="display:inline-block;background:#292722;color:#F5F0E7;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:700">ابعته تاني</a>`
    );
  }

  if (order.waStatus !== "sent") {
    const notes = order.adminNotes || "";
    await patchOrderFields(order.id, {
      waStatus: "sent",
      waSentAt: new Date().toISOString(),
      waError: "",
      adminNotes: notes.includes("[whatsapp_sent]") ? notes : `${notes} [whatsapp_sent]`.trim(),
    });
  }
  return NextResponse.redirect(manualWaUrl(order), 302);
}

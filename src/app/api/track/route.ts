import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const STEP_LABEL: Record<string, string> = {
  pending: "تم استلام الطلب",
  confirmed_phone: "تم تأكيد الطلب",
  confirmed_whatsapp: "تم تأكيد الطلب",
  processing: "جاري التجهيز والتغليف",
  shipped: "تم الشحن وفي الطريق إليك",
  completed: "تم التسليم",
  cancelled: "تم إلغاء الطلب",
};

/** Public tracking: requires order number + the phone used on the order. Returns minimal data only. */
export async function POST(request: NextRequest) {
  try {
    if (!(await rateLimit("track", clientIp(request), 15, 600))) {
      return NextResponse.json({ ok: false, error: "محاولات كتير. جرّب بعد شوية." }, { status: 429 });
    }

    if (!isSupabaseConfigured()) return NextResponse.json({ ok: false, error: "الخدمة غير متاحة حالياً" }, { status: 503 });
    const body = await request.json().catch(() => ({}));
    const rawId = String(body.id || "").trim().replace(/^#/, "").toUpperCase();
    const phoneTail = String(body.phone || "").replace(/\D/g, "").slice(-10);
    if (!rawId || !/^[A-Z0-9-]{1,24}$/.test(rawId) || phoneTail.length < 10) {
      return NextResponse.json({ ok: false, error: "اكتب رقم الطلب ورقم الموبايل اللي طلبت بيه." }, { status: 400 });
    }
    const { data } = await getSupabaseAdminClient()
      .from("orders")
      .select("id, status, items, total, shipping_fee, created_at, phone, governorate")
      .or(`id.eq.${rawId},id.eq.#${rawId}`)
      .limit(1);
    const row = data && data[0];
    if (!row || String(row.phone).replace(/\D/g, "").slice(-10) !== phoneTail) {
      return NextResponse.json({ ok: false, error: "مالقيناش طلب بالبيانات دي. اتأكد من الرقم والموبايل." }, { status: 404 });
    }
    const items = (Array.isArray(row.items) ? row.items : []) as { arabicName?: string; name?: string; quantity?: number; selectedSize?: string; image?: string }[];
    const status = String(row.status);
    return NextResponse.json({
      ok: true,
      order: {
        id: row.id,
        status,
        statusLabel: STEP_LABEL[status] || "قيد المتابعة",
        createdAt: row.created_at,
        governorate: row.governorate,
        total: Number(row.total) || 0,
        items: items.map((i) => ({ name: i.arabicName || i.name || "", quantity: i.quantity || 1, size: i.selectedSize, image: i.image })),
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "حصل خطأ، جرّب تاني." }, { status: 500 });
  }
}

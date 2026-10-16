import { NextRequest, NextResponse } from "next/server";
import { sendTelegramOrderNotification } from "@/lib/telegram";
import { getServerStoreData } from "@/lib/serverStore";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/notify
 * Triggers a Telegram notification for a specific order by orderId or by order body.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json({ success: false, error: "غير مصرح." }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const { order, orderId } = body;

    let targetOrder = order;

    if (!targetOrder && orderId) {
      const data = await getServerStoreData();
      targetOrder = data.orders.find((o) => o.id === orderId);
      if (!targetOrder) {
        return NextResponse.json(
          { success: false, error: `الطلب رقم ${orderId} غير موجود` },
          { status: 404 }
        );
      }
    }

    if (!targetOrder || !targetOrder.id) {
      return NextResponse.json(
        { success: false, error: "يرجى تزويد بيانات الطلب أو رقم الطلب (orderId)" },
        { status: 400 }
      );
    }

    const result = await sendTelegramOrderNotification(targetOrder);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال إشعار التليجرام بنجاح",
      orderId: targetOrder.id,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error sending telegram notification" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatusOnServer } from "@/lib/serverStore";
import { cleanPhoneForWhatsApp } from "@/lib/telegram";
import { Order } from "@/context/StoreContext";

export const dynamic = "force-dynamic";

/**
 * Answer Telegram Callback Query to dismiss the loading spinner and show a toast alert in chat
 */
async function answerCallbackQuery(botToken: string, callbackQueryId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: false,
      }),
    });
  } catch (err) {
    console.error("[Telegram Webhook] Error answering callback query:", err);
  }
}

/**
 * POST /api/telegram/webhook
 * Receives incoming updates from Telegram (specifically Callback Queries when buttons are clicked)
 */
export async function POST(request: NextRequest) {
  try {
    const rawBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const botToken = rawBotToken ? rawBotToken.trim().replace(/^["']|["']$/g, "") : "";

    if (!botToken) {
      console.error("[Telegram Webhook] TELEGRAM_BOT_TOKEN is not configured");
      return NextResponse.json({ ok: false, error: "Bot token not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));

    // 1. Handle Callback Queries (when a button is clicked)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const queryId = callbackQuery.id;
      const dataStr = String(callbackQuery.data || "").trim();
      const message = callbackQuery.message;
      const chatId = message?.chat?.id || process.env.TELEGRAM_CHAT_ID;
      const messageId = message?.message_id;
      const currentText = String(message?.text || "");

      if (!dataStr.startsWith("status:")) {
        await answerCallbackQuery(botToken, queryId, "إجراء غير معروف");
        return NextResponse.json({ ok: true });
      }

      const parts = dataStr.split(":");
      const newStatus = parts[1] as Order["status"];
      const orderId = parts.slice(2).join(":").trim();

      const validStatuses: Record<string, { label: string; badge: string }> = {
        processing: { label: "جاري التجهيز", badge: "📦" },
        shipped: { label: "تم الشحن", badge: "🚚" },
        cancelled: { label: "ملغي", badge: "❌" },
      };

      const statusMeta = validStatuses[newStatus];
      if (!statusMeta || !orderId) {
        await answerCallbackQuery(botToken, queryId, "حالة أو رقم طلب غير صالح");
        return NextResponse.json({ ok: true });
      }

      // Update the order directly in the database (Supabase + local store fallback)
      const updateResult = await updateOrderStatusOnServer(orderId, newStatus);

      if (!updateResult.success || !updateResult.order) {
        await answerCallbackQuery(
          botToken,
          queryId,
          `⚠️ ${updateResult.error || "تعذر العثور على الطلب لتحديثه"}`
        );
        return NextResponse.json({ ok: true });
      }

      const updatedOrder = updateResult.order;
      const orderNum = updatedOrder.id.startsWith("#") ? updatedOrder.id : `#${updatedOrder.id}`;

      // Acknowledge callback query immediately with toast in Telegram
      await answerCallbackQuery(
        botToken,
        queryId,
        `✅ تم تحديث حالة الطلب ${orderNum} إلى: ${statusMeta.label}`
      );

      // Edit message text in Telegram to display the updated status and Cairo timestamp
      if (chatId && messageId && currentText) {
        const dateStr = new Date().toLocaleString("ar-EG", {
          timeZone: "Africa/Cairo",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const statusBanner = `\n\n📌 الحالة الحالية: ${statusMeta.badge} ${statusMeta.label}\n🕒 تاريخ التحديث: ${dateStr}`;
        const baseText = currentText.split("\n\n📌 الحالة الحالية:")[0].trim();
        const updatedText = `${baseText}${statusBanner}`;

        // Build updated inline keyboard with active state indicators
        const cleanPhone = updatedOrder.phone ? cleanPhoneForWhatsApp(updatedOrder.phone) : "";
        const keyboard = [];

        if (cleanPhone) {
          keyboard.push([
            {
              text: `💬 مراسلة العميل واتساب (${orderNum})`,
              url: `https://wa.me/${cleanPhone}`,
            },
          ]);
        }

        keyboard.push([
          {
            text: newStatus === "processing" ? "✅ 📦 جاري التجهيز" : "📦 جاري التجهيز",
            callback_data: `status:processing:${updatedOrder.id}`,
          },
          {
            text: newStatus === "shipped" ? "✅ 🚚 تم الشحن" : "🚚 تم الشحن",
            callback_data: `status:shipped:${updatedOrder.id}`,
          },
          {
            text: newStatus === "cancelled" ? "✅ ❌ ملغي" : "❌ إلغاء الطلب",
            callback_data: `status:cancelled:${updatedOrder.id}`,
          },
        ]);

        try {
          await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: messageId,
              text: updatedText,
              reply_markup: {
                inline_keyboard: keyboard,
              },
            }),
          });
        } catch (editErr) {
          console.error("[Telegram Webhook] Failed to edit message:", editErr);
        }
      }

      return NextResponse.json({
        ok: true,
        orderId: updatedOrder.id,
        newStatus: updatedOrder.status,
      });
    }

    // 2. Handle /start or general bot messages
    if (body.message?.text && body.message.chat?.id) {
      const chatId = body.message.chat.id;
      const text = String(body.message.text).trim();

      if (text.startsWith("/start") || text.startsWith("/help")) {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "مرحباً بك في بوت متجر أَثَـر للفضة الإسترليني 925 👑⚡\n\nيصلك إشعار فوري عند كل طلب شراء جديد، ويمكنك تغيير حالة أي طلب مباشرة عبر الأزرار التفاعلية أسفل رسالة كل طلب.",
          }),
        }).catch(() => null);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("[Telegram Webhook Error]:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/telegram/webhook
 * Diagnostics & One-Click Telegram Webhook Registration
 */
export async function GET(request: NextRequest) {
  try {
    const rawBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const botToken = rawBotToken ? rawBotToken.trim().replace(/^["']|["']$/g, "") : "";

    if (!botToken) {
      return NextResponse.json(
        { success: false, error: "TELEGRAM_BOT_TOKEN is not configured in environment variables" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const setUrl = searchParams.get("set_url");

    // 1. One-Click Register Webhook
    if (setUrl) {
      const setRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: setUrl,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: false,
        }),
      });
      const setResult = await setRes.json();
      return NextResponse.json({
        success: true,
        action: "setWebhook",
        url: setUrl,
        result: setResult,
      });
    }

    // 2. Fetch current Webhook status
    const infoRes = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    const infoResult = await infoRes.json();

    const host = request.headers.get("host") || "your-domain.vercel.app";
    const protocol = host.includes("localhost") ? "http" : "https";
    const currentWebhookEndpoint = `${protocol}://${host}/api/telegram/webhook`;

    return NextResponse.json({
      success: true,
      currentWebhookEndpoint,
      telegramWebhookInfo: infoResult,
      quickSetupUrl: `${currentWebhookEndpoint}?set_url=${encodeURIComponent(currentWebhookEndpoint)}`,
      instructions: "To register or refresh this webhook with Telegram, simply open the `quickSetupUrl` in your browser.",
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error querying webhook info" },
      { status: 500 }
    );
  }
}

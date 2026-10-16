import { Order } from "@/context/StoreContext";
import os from "os";
import path from "path";
import fs from "fs";

/**
 * Format Egyptian phone number for WhatsApp link (e.g. 201012345678)
 */
export function cleanPhoneForWhatsApp(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return "2" + digits;
  return "20" + digits;
}

/**
 * Formats order as a clean, compact Plain Text invoice for Telegram.
 * Sent WITHOUT parse_mode to guarantee 100% delivery without parsing errors.
 */
export function formatOrderInvoiceTelegramMessage(order: Order): string {
  const orderNum = order.id ? (order.id.startsWith("#") ? order.id : `#${order.id}`) : "#ORM";

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleString("ar-EG", {
        timeZone: "Africa/Cairo",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });

  const addressLine = order.governorate
    ? `${order.governorate} - ${order.address}`
    : order.address;

  // Build items section:
  // ▫️ [اسم المنتج]
  //    (الكمية: [الكمية] | المقاس: [المقاس إن وجد] | السعر: [السعر] ج.م)
  const itemsText = (order.items || [])
    .map((item) => {
      const itemName = item.arabicName || item.name || "قطعة فضة";
      const sizeText = item.selectedSize ? ` | المقاس: ${item.selectedSize}` : "";
      const priceText = Number(item.price || 0).toLocaleString("en-US");

      return `▫️ ${itemName}\n   (الكمية: ${item.quantity}${sizeText} | السعر: ${priceText} ج.م)`;
    })
    .join("\n");

  const totalFormatted = Number(order.total || 0).toLocaleString("en-US");
  const shippingFormatted =
    order.shippingFee === 0
      ? "شحن مجاني 🎁"
      : `${Number(order.shippingFee || 0).toLocaleString("en-US")} ج.م شحن`;
  const discountLine =
    order.discount && order.discount > 0
      ? ` | خصم: -${Number(order.discount).toLocaleString("en-US")} ج.م`
      : "";

  const notesLine = order.notes ? `\n📝 ملاحظات: ${order.notes}` : "";
  const giftLine = order.isGift
    ? `\n🎁 طلب كهدية${order.giftMessage ? `: "${order.giftMessage}"` : ""}`
    : "";
  let paymentLine = "";
  if (order.paymentMethod === "wallet") {
    paymentLine = `\n💳 طريقة الدفع: محفظة إلكترونية${order.senderWalletNumber ? ` (${order.senderWalletNumber})` : ""}`;
  } else if (order.paymentMethod === "card") {
    paymentLine = `\n💳 طريقة الدفع: بطاقة بنكية`;
  }

  return `🟢🟢 طلب جديد | ${orderNum} 🟢🟢
📅 ${dateStr}

👤 العميل: ${order.customerName}
📞 الهاتف: ${order.phone}
📍 العنوان: ${addressLine}${notesLine}${giftLine}${paymentLine}

📦 القطع المطلوبة:
${itemsText}

💰 الإجمالي للتحصيل: ${totalFormatted} ج.م (شامل ${shippingFormatted}${discountLine})
🏁━━━━━━━━━━━━━━━━━━🏁`;
}

// In-memory deduplication set to avoid double notifications within warm runtime
const notifiedOrderIds = new Set<string>();
// In-memory mutex lock for active dispatches to guarantee strict single execution under high concurrency
const inFlightDispatches = new Set<string>();

function getSentOrdersCacheFilePath(): string {
  try {
    return path.join(os.tmpdir(), "orma_telegram_notified_orders.json");
  } catch {
    return "";
  }
}

function hasOrderBeenNotified(orderId: string): boolean {
  if (!orderId) return false;
  if (notifiedOrderIds.has(orderId)) return true;

  try {
    const filePath = getSentOrdersCacheFilePath();
    if (filePath && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const list = JSON.parse(content);
      if (Array.isArray(list) && list.includes(orderId)) {
        notifiedOrderIds.add(orderId);
        return true;
      }
    }
  } catch {}

  return false;
}

function markOrderAsNotified(orderId: string): void {
  if (!orderId) return;
  notifiedOrderIds.add(orderId);

  try {
    const filePath = getSentOrdersCacheFilePath();
    if (filePath) {
      let list: string[] = [];
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        list = JSON.parse(content);
        if (!Array.isArray(list)) list = [];
      }
      if (!list.includes(orderId)) {
        list.push(orderId);
        // Retain last 500 order notifications to keep file light
        if (list.length > 500) list = list.slice(-500);
        fs.writeFileSync(filePath, JSON.stringify(list), "utf-8");
      }
    }
  } catch {}
}

/**
 * Sends order notification to Telegram Bot with an interactive WhatsApp inline button.
 * STRICTLY for the single target order provided.
 * Awaits completion and handles errors with detailed console.error logs for Vercel.
 */
export async function sendTelegramOrderNotification(order: Order): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  if (!order || !order.id) {
    return { success: false, error: "بيانات الطلب غير صالحة لإرسال إشعار تليجرام" };
  }

  // Prevent duplicate notifications across multiple invocations, cold starts, or concurrent in-flight calls
  if (
    hasOrderBeenNotified(order.id) ||
    order.adminNotes?.includes("[telegram_sent]") ||
    inFlightDispatches.has(order.id)
  ) {
    console.log(`[Telegram Notice] Notification for order #${order.id} was already dispatched or is currently in flight. Skipping duplicate.`);
    return { success: true, message: "Notification already sent or in flight" };
  }

  // Acquire concurrency lock immediately
  inFlightDispatches.add(order.id);
  // Mark in disk cache immediately so parallel processes detect reservation
  markOrderAsNotified(order.id);

  const rawBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatId = process.env.TELEGRAM_CHAT_ID;

  const botToken = rawBotToken ? rawBotToken.trim().replace(/^["']|["']$/g, "") : "";
  const chatId = rawChatId ? rawChatId.trim().replace(/^["']|["']$/g, "") : "";

  if (!botToken || !chatId) {
    const warning = `[Telegram Config Warning] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in environment variables. (botToken: ${Boolean(
      botToken
    )}, chatId: ${Boolean(chatId)})`;
    console.error(warning);
    return { success: false, error: warning };
  }

  try {
    const text = formatOrderInvoiceTelegramMessage(order);
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📦 جاري التجهيز",
                callback_data: `status:processing:${order.id}`,
              },
              {
                text: "🚚 تم الشحن",
                callback_data: `status:shipped:${order.id}`,
              },
              {
                text: "❌ إلغاء الطلب",
                callback_data: `status:cancelled:${order.id}`,
              },
            ],
          ],
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || !data.ok) {
      const errMsg =
        data?.description || `Telegram API responded with HTTP status ${response.status}`;
      console.error(
        "[Telegram API Error] Failed to send message to chatId:",
        chatId,
        "HTTP Status:",
        response.status,
        "Response body:",
        data
      );
      return { success: false, error: errMsg };
    }

    // Mark as notified in both memory cache and disk cache
    markOrderAsNotified(order.id);

    // Also stamp the order object in-memory
    if (order.adminNotes) {
      if (!order.adminNotes.includes("[telegram_sent]")) {
        order.adminNotes = `${order.adminNotes} [telegram_sent]`.trim();
      }
    } else {
      order.adminNotes = "[telegram_sent]";
    }

    console.log(
      `[Telegram Success] Order notification sent successfully for single order #${order.id}! Telegram Message ID:`,
      data.result?.message_id
    );
    return { success: true, message: "تم إرسال إشعار التليجرام بنجاح" };
  } catch (err: unknown) {
    const errMsg =
      err instanceof Error ? err.message : "Unknown error sending Telegram notification";
    console.error("[Telegram Network/Fetch Exception]:", err);
    return { success: false, error: errMsg };
  } finally {
    // Release in-flight mutex after 1500ms to absorb any concurrent duplicate bursts
    setTimeout(() => {
      if (order.id) {
        inFlightDispatches.delete(order.id);
      }
    }, 1500);
  }
}

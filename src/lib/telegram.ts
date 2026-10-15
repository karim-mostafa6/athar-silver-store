import { Order } from "@/context/StoreContext";

/**
 * Format Egyptian phone number for WhatsApp link
 */
function cleanPhoneForWhatsApp(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("20")) return digits;
  if (digits.startsWith("0")) return "2" + digits;
  return "20" + digits;
}

/**
 * Get readable payment method in Arabic
 */
function getPaymentMethodLabel(method?: string): string {
  switch (method) {
    case "cod":
      return "الدفع عند الاستلام (COD)";
    case "wallet":
      return "محفظة إلكترونية (InstaPay / فودافون كاش)";
    case "card":
      return "بطاقة بنكية / فيزا (Paymob)";
    default:
      return "الدفع عند الاستلام (COD)";
  }
}

/**
 * Formats order as a clean Plain Text invoice for Telegram.
 * Sent WITHOUT parse_mode to guarantee 100% delivery without parsing errors from symbols (#, _, -, etc.).
 */
export function formatOrderInvoiceTelegramMessage(order: Order): string {
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

  const cleanPhone = cleanPhoneForWhatsApp(order.phone);
  const paymentLabel = getPaymentMethodLabel(order.paymentMethod);

  // Build items section
  const itemsText = (order.items || [])
    .map((item, index) => {
      const num = index + 1;
      const itemName = item.arabicName || item.name || "قطعة فضة";
      const sizeText = item.selectedSize ? `\n   📏 المقاس: ${item.selectedSize}` : "";
      const priceText = Number(item.price || 0).toLocaleString("en-US");
      const totalItemPrice = (Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-US");

      return `▫️ ${num}. ${itemName}
   🔢 الكمية: ${item.quantity}${sizeText}
   💰 السعر: ${priceText} ج.م (الإجمالي: ${totalItemPrice} ج.م)`;
    })
    .join("\n\n");

  const subtotalFormatted = Number(order.subtotal || 0).toLocaleString("en-US");
  const shippingFormatted =
    order.shippingFee === 0 ? "مجاني 🎁" : `${Number(order.shippingFee || 0).toLocaleString("en-US")} ج.م`;
  const discountLine =
    order.discount && order.discount > 0
      ? `\n🔖 الخصم المطبق: -${Number(order.discount).toLocaleString("en-US")} ج.م`
      : "";
  const totalFormatted = Number(order.total || 0).toLocaleString("en-US");

  // Optional notes / gift message
  const notesLine = order.notes ? `\n📝 ملاحظات العميل: ${order.notes}` : "";
  const giftLine = order.isGift
    ? `\n🎁 طلب كهدية: نعم${order.giftMessage ? `\n💌 رسالة الإهداء: ${order.giftMessage}` : ""}`
    : "";
  const walletNumberLine = order.senderWalletNumber
    ? `\n📱 رقم المحفظة المحول منها: ${order.senderWalletNumber}`
    : "";
  const receiptLine = order.paymentReceiptImage
    ? `\n🧾 صورة إيصال التحويل: ${order.paymentReceiptImage}`
    : "";

  return `👑 فاتورة طلب جديد • ORMA SILVER 👑
Not Given, But Left • صياغة فضة إسترليني 925
━━━━━━━━━━━━━━━━━━━━━━
🏷️ رقم الطلب: #${order.id}
📅 تاريخ الطلب: ${dateStr}
💳 طريقة الدفع: ${paymentLabel}${walletNumberLine}${receiptLine}
📊 حالة الطلب: ⏳ قيد الانتظار (جديد)
━━━━━━━━━━━━━━━━━━━━━━
👤 بيانات العميل والشحن:
• الاسم: ${order.customerName}
• رقم الهاتف: ${order.phone}
• المحافظة: ${order.governorate}
• العنوان التفصيلي: ${order.address}${notesLine}${giftLine}
━━━━━━━━━━━━━━━━━━━━━━
📦 تفاصيل المنتجات المطلوبة (${order.items?.length || 0} قطعة):

${itemsText}
━━━━━━━━━━━━━━━━━━━━━━
💵 الملخص المالي للفاتورة:
• قيمة المنتجات: ${subtotalFormatted} ج.م
• مصاريف الشحن: ${shippingFormatted}${discountLine}
━━━━━━━━━━━━━━━━━━━━━━
💎 إجمالي المبلغ المطلوب تحصيله: ${totalFormatted} ج.م
━━━━━━━━━━━━━━━━━━━━━━
⚡ تم حفظ الطلب بنجاح وهو بانتظار التجهيز والشحن من الورشة.
💬 رابط واتساب العميل المباشر:
https://wa.me/${cleanPhone}`;
}

/**
 * Sends order notification to Telegram Bot.
 * Awaits completion and handles errors with detailed console.error logs for Vercel.
 */
export async function sendTelegramOrderNotification(order: Order): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
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
        // No parse_mode specified: Plain Text mode prevents any Markdown/HTML parsing rejection
        disable_web_page_preview: true,
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

    console.log(
      "[Telegram Success] Order notification sent successfully! Telegram Message ID:",
      data.result?.message_id
    );
    return { success: true, message: "تم إرسال إشعار التليجرام بنجاح" };
  } catch (err: unknown) {
    const errMsg =
      err instanceof Error ? err.message : "Unknown error sending Telegram notification";
    console.error("[Telegram Network/Fetch Exception]:", err);
    return { success: false, error: errMsg };
  }
}

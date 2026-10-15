import { Order } from "@/context/StoreContext";

/**
 * Escape HTML characters for Telegram Bot API HTML mode.
 * Guarantees no parse errors from user input (customer name, address, notes, etc.)
 */
function escapeHtml(text: unknown): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Format Egyptian phone number for WhatsApp link
 */
function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
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
 * Formats order as a luxury invoice message for Telegram
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
      const itemName = escapeHtml(item.arabicName || item.name || "قطعة فضة");
      const sizeText = item.selectedSize ? `\n   📏 المقاس: <b>${escapeHtml(item.selectedSize)}</b>` : "";
      const priceText = Number(item.price || 0).toLocaleString("en-US");
      const totalItemPrice = (Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-US");

      return `▫️ <b>${num}. ${itemName}</b>
   🔢 الكمية: <b>${item.quantity}</b>${sizeText}
   💰 السعر: <b>${priceText} ج.م</b> (الإجمالي: <b>${totalItemPrice} ج.م</b>)`;
    })
    .join("\n\n");

  const subtotalFormatted = Number(order.subtotal || 0).toLocaleString("en-US");
  const shippingFormatted =
    order.shippingFee === 0 ? "مجاني 🎁" : `${Number(order.shippingFee || 0).toLocaleString("en-US")} ج.م`;
  const discountLine =
    order.discount && order.discount > 0
      ? `\n🔖 <b>الخصم المطبق:</b> -${Number(order.discount).toLocaleString("en-US")} ج.م`
      : "";
  const totalFormatted = Number(order.total || 0).toLocaleString("en-US");

  // Optional notes / gift message
  const notesLine = order.notes
    ? `\n📝 <b>ملاحظات العميل:</b> <i>${escapeHtml(order.notes)}</i>`
    : "";
  const giftLine = order.isGift
    ? `\n🎁 <b>طلب كهدية:</b> نعم${order.giftMessage ? `\n💌 <b>رسالة الإهداء:</b> <i>${escapeHtml(order.giftMessage)}</i>` : ""}`
    : "";
  const walletNumberLine = order.senderWalletNumber
    ? `\n📱 <b>رقم المحفظة المحول منها:</b> <code>${escapeHtml(order.senderWalletNumber)}</code>`
    : "";
  const receiptLine = order.paymentReceiptImage
    ? `\n🧾 <b>إيصال التحويل:</b> <a href="${escapeHtml(order.paymentReceiptImage)}">عرض صورة الإيصال 📎</a>`
    : "";

  return `👑 <b>فاتورة طلب جديد • ORMA SILVER</b> 👑
<i>Not Given, But Left • صياغة فضة إسترليني 925</i>
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ <b>رقم الطلب:</b> <code>#${escapeHtml(order.id)}</code>
📅 <b>تاريخ الطلب:</b> ${dateStr}
💳 <b>طريقة الدفع:</b> ${escapeHtml(paymentLabel)}${walletNumberLine}${receiptLine}
📊 <b>حالة الطلب:</b> ⏳ قيد الانتظار (جديد)
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>بيانات العميل والشحن:</b>
• <b>الاسم:</b> ${escapeHtml(order.customerName)}
• <b>رقم الهاتف:</b> <code>${escapeHtml(order.phone)}</code>
• <b>المحافظة:</b> ${escapeHtml(order.governorate)}
• <b>العنوان التفصيلي:</b> ${escapeHtml(order.address)}${notesLine}${giftLine}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 <b>تفاصيل المنتجات المطلوبة (${order.items?.length || 0} قطعة):</b>

${itemsText}
━━━━━━━━━━━━━━━━━━━━━━━━━━
💵 <b>الملخص المالي للفاتورة:</b>
• قيمة المنتجات: <b>${subtotalFormatted} ج.م</b>
• مصاريف الشحن: <b>${shippingFormatted}</b>${discountLine}
━━━━━━━━━━━━━━━━━━━━━━━━━━
💎 <b>إجمالي المبلغ المطلوب تحصيله:</b> <b>${totalFormatted} ج.م</b>
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ <i>تم حفظ الطلب بنجاح وهو بانتظار التجهيز والشحن من الورشة.</i>
📱 <a href="https://wa.me/${cleanPhone}">فتح محادثة واتساب فورية مع العميل 💬</a>`;
}

/**
 * Sends order notification to Telegram Bot
 */
export async function sendTelegramOrderNotification(order: Order): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    const warning =
      "Telegram bot notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in environment variables.";
    console.warn(warning);
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
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      const errMsg = data.description || `Telegram API error: ${response.status}`;
      console.error("Failed to send Telegram notification:", errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, message: "تم إرسال إشعار التليجرام بنجاح" };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Unknown error sending Telegram notification";
    console.error("Telegram notification exception:", errMsg);
    return { success: false, error: errMsg };
  }
}

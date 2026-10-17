import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSettings, saveServerSettings } from "@/lib/serverSettings";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

interface EmailRequestBody {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  governorate?: string;
  address?: string;
  total: number;
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  paymentMethod?: string;
  isGift?: boolean;
  giftMessage?: string;
  items?: Array<{
    arabicName: string;
    quantity: number;
    price: number;
    selectedSize?: string;
  }>;
  status?: "new_order" | "confirmed_phone" | "shipped" | "completed" | "cancelled" | "status_update";
  notes?: string;
  senderEmail?: string;
  senderName?: string;
  gmailAppPassword?: string;
  isTest?: boolean;
  logoImageUrl?: string;
  logoType?: "text" | "image" | "both";
  logoHeight?: number;
  brandNameArabic?: string;
  brandNameEnglish?: string;
  brandSubtitle?: string;
}

// ---- Abuse protection -------------------------------------------------------------------
// This endpoint is called by customers at checkout (no login), so it cannot require admin auth.
// Anonymous callers therefore get a locked-down version: no credential/sender/branding
// overrides, no test mails, only the order-confirmation template, HTML stripped from every
// field, and a small per-IP / per-recipient rate limit so it cannot be used as a spam relay.
const ipHits = new Map<string, number[]>();
const recipientHits = new Map<string, number[]>();

function withinLimit(map: Map<string, number[]>, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (map.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    map.set(key, hits);
    return false;
  }
  hits.push(now);
  map.set(key, hits);
  return true;
}

function stripHtml<T>(value: T): T {
  if (typeof value === "string") return value.replace(/</g, "&lt;").replace(/>/g, "&gt;") as unknown as T;
  if (Array.isArray(value)) return value.map(stripHtml) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = stripHtml(v);
    return out as T;
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    let body: EmailRequestBody = await request.json();

    if (!isAuthorizedAdmin(request)) {
      const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
      const recipient = String(body.email || "").trim().toLowerCase();
      if (!withinLimit(ipHits, ip, 6, 10 * 60 * 1000) || !withinLimit(recipientHits, recipient, 4, 60 * 60 * 1000)) {
        return NextResponse.json({ success: false, error: "تم تجاوز الحد المسموح لإرسال الرسائل. حاول لاحقاً." }, { status: 429 });
      }
      body = stripHtml(body);
      body.status = "new_order";
      body.isTest = false;
      delete body.senderEmail;
      delete body.senderName;
      delete body.gmailAppPassword;
      delete body.logoImageUrl;
      delete body.logoType;
      delete body.logoHeight;
      delete body.brandNameArabic;
      delete body.brandNameEnglish;
      delete body.brandSubtitle;
    }
    const {
      orderId,
      customerName,
      email,
      phone,
      governorate = "",
      address = "",
      total = 0,
      subtotal,
      shippingFee,
      discount,
      paymentMethod = "cod",
      isGift = false,
      giftMessage = "",
      items = [],
      status = "new_order",
      senderEmail: bodySenderEmail,
      senderName: bodySenderName,
      gmailAppPassword: bodyAppPassword,
      isTest = false,
      logoImageUrl: bodyLogoImageUrl,
      logoType: bodyLogoType,
      logoHeight: bodyLogoHeight,
      brandNameArabic: bodyBrandNameArabic,
      brandNameEnglish: bodyBrandNameEnglish,
      brandSubtitle: bodyBrandSubtitle,
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "عنوان البريد الإلكتروني غير صحيح أو مفقود" },
        { status: 400 }
      );
    }

    const serverConfig = getServerSettings();

    // If an app password was explicitly passed and valid, persist it to server config
    if (
      bodyAppPassword &&
      bodyAppPassword.trim().length >= 8 &&
      bodyAppPassword.replace(/\s+/g, "") !== serverConfig.gmailAppPassword
    ) {
      saveServerSettings({
        gmailAppPassword: bodyAppPassword.trim(),
        senderEmail: bodySenderEmail || serverConfig.senderEmail,
        senderEmailName: bodySenderName || serverConfig.senderEmailName,
      });
    }

    const effectiveLogoImageUrl = (
      bodyLogoImageUrl ||
      serverConfig.logoImageUrl ||
      ""
    ).trim();
    const effectiveLogoType =
      bodyLogoType ||
      serverConfig.logoType ||
      (effectiveLogoImageUrl ? "both" : "text");
    const effectiveLogoHeight = Number(
      bodyLogoHeight ||
      serverConfig.logoHeight ||
      44
    );
    const effectiveBrandNameArabic =
      bodyBrandNameArabic ||
      serverConfig.brandNameArabic ||
      "أورما";
    const effectiveBrandNameEnglish =
      bodyBrandNameEnglish ||
      serverConfig.brandNameEnglish ||
      "ORMA";
    const effectiveBrandSubtitle =
      bodyBrandSubtitle ||
      serverConfig.brandSubtitle ||
      "Not Given, But Left";

    const officialSenderEmail =
      process.env.GMAIL_USER ||
      serverConfig.senderEmail ||
      bodySenderEmail ||
      "";
    const officialSenderName =
      process.env.GMAIL_SENDER_NAME ||
      serverConfig.senderEmailName ||
      bodySenderName ||
      `${effectiveBrandNameEnglish} للفضة 925`;
    const effectiveAppPassword = (
      process.env.GMAIL_APP_PASSWORD ||
      serverConfig.gmailAppPassword ||
      bodyAppPassword ||
      ""
    ).replace(/\s+/g, "");

    // Safe financial calculations
    const computedSubtotal =
      subtotal !== undefined
        ? subtotal
        : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const computedDiscount = discount !== undefined ? discount : 0;
    const computedShipping =
      shippingFee !== undefined
        ? shippingFee
        : Math.max(0, total - (computedSubtotal - computedDiscount));
    const finalTotal = total > 0 ? total : Math.max(0, computedSubtotal - computedDiscount + computedShipping);

    const paymentMethodLabel =
      paymentMethod === "wallet"
        ? "تحويل محفظة إلكترونية (إنستاباي / فودافون كاش)"
        : paymentMethod === "card"
        ? "بطاقة دفع إلكترونية بنكية"
        : "الدفع عند الاستلام (نقداً عند التوصيل)";

    const statusTitle = isTest
      ? "رسالة تجريبية لاختبار البريد الإلكتروني"
      : status === "confirmed_phone"
      ? "تم تأكيد طلبك هاتفياً بنجاح"
      : status === "shipped"
      ? "تم شحن طلبك وفي الطريق إليك"
      : status === "completed"
      ? "تم تسليم الطلب بنجاح"
      : status === "cancelled"
      ? "تم إلغاء الطلب"
      : `فاتورة تأكيد استلام طلبك من متجر ${effectiveBrandNameEnglish}`;

    const subject = isTest
      ? `${effectiveBrandNameEnglish} | تجربة إرسال ناجحة من الحساب الرسمي (${officialSenderEmail})`
      : `${effectiveBrandNameEnglish} | ${status === "new_order" ? "تم استلام طلبك" : statusTitle} #${orderId}`;

    const GOLD = "#8E7545";
    const INK = "#292722";
    const IVORY = "#F5F0E7";
    const CARD = "#fbf8f3";
    const LINE = "#e4dccd";
    const money = (n: number) => `${n.toLocaleString("en-US")} ج.م`;
    const intro =
      status === "new_order"
        ? "وصلنا طلبك وإحنا بنجهّزه. هنكلمك على رقم الموبايل لتأكيد المقاس والعنوان قبل ما الشحنة تخرج."
        : status === "confirmed_phone"
        ? "اتأكد طلبك وبدأنا نجهّز القطع بعناية."
        : status === "shipped"
        ? "طلبك خرج مع مندوب الشحن وفي الطريق ليك."
        : status === "completed"
        ? "الطلب اتسلّم. نتمنى القطع تعجبك وتفضل معاك."
        : status === "cancelled"
        ? "اتلغى الطلب. لو ده مش المقصود كلمنا على واتساب ونظبطه معاك."
        : "";
    const headline =
      isTest
        ? "رسالة تجريبية"
        : status === "new_order"
        ? "تم استلام طلبك"
        : status === "confirmed_phone"
        ? "تم تأكيد طلبك"
        : status === "shipped"
        ? "طلبك في الطريق"
        : status === "completed"
        ? "تم تسليم طلبك"
        : status === "cancelled"
        ? "تم إلغاء الطلب"
        : "تحديث على طلبك";
    const firstName = String(customerName || "").trim().split(/\s+/)[0] || "";
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};line-height:1.6;">
            <b>${item.arabicName}</b>
            <div style="font-size:12px;color:#7d6c5c;">${item.selectedSize ? `مقاس ${item.selectedSize} · ` : ""}الكمية ${item.quantity}</div>
          </td>
          <td style="padding:14px 0;border-bottom:1px solid ${LINE};font-size:14px;font-weight:bold;color:${INK};text-align:left;white-space:nowrap;">${money(item.price * item.quantity)}</td>
        </tr>`
      )
      .join("");
    const addressLine = [governorate, address].filter(Boolean).join(" — ");
    const infoRow = (k: string, v: string) =>
      `<tr><td style="padding:6px 0;font-size:13px;color:#7d6c5c;width:34%;vertical-align:top;">${k}</td><td style="padding:6px 0;font-size:14px;color:${INK};font-weight:bold;">${v}</td></tr>`;
    const logoBlock =
      effectiveLogoImageUrl && effectiveLogoType !== "text"
        ? `<img src="${effectiveLogoImageUrl}" alt="${effectiveBrandNameArabic}" style="max-height:${effectiveLogoHeight}px;max-width:200px;height:auto;display:inline-block;" />`
        : `<div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:8px;color:${IVORY};">${effectiveBrandNameEnglish}</div>`;
    const contactLine = officialSenderEmail
      ? `واتساب: <b>01143837730</b> · ${officialSenderEmail}`
      : `واتساب: <b>01143837730</b>`;

    const plainText = [
      `${headline}${firstName ? ` يا ${firstName}` : ""}`,
      `طلب رقم #${orderId}`,
      intro,
      "",
      ...items.map((i) => `- ${i.arabicName}${i.selectedSize ? ` (مقاس ${i.selectedSize})` : ""} × ${i.quantity} — ${money(i.price * i.quantity)}`),
      "",
      `المجموع الفرعي: ${money(computedSubtotal)}`,
      computedDiscount > 0 ? `الخصم: -${money(computedDiscount)}` : "",
      `الشحن: ${computedShipping === 0 ? "مجاني" : money(computedShipping)}`,
      `الإجمالي: ${money(finalTotal)}`,
      "",
      `الاسم: ${customerName}`,
      `الموبايل: ${phone}`,
      addressLine ? `العنوان: ${addressLine}` : "",
      `الدفع: ${paymentMethodLabel}`,
      "",
      `للمتابعة على واتساب: 01143837730`,
      `${effectiveBrandNameEnglish}`,
    ]
      .filter((l, i, a) => l !== "" || a[i - 1] !== "")
      .join("\n");

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${subject}</title></head>
<body style="margin:0;padding:24px 12px;background:${IVORY};font-family:Tahoma,'Segoe UI',Arial,sans-serif;direction:rtl;text-align:right;color:${INK};">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;">
    <tr><td style="background:${INK};border-radius:20px 20px 0 0;padding:34px 24px;text-align:center;">
      ${logoBlock}
      <div style="margin-top:8px;font-size:12px;color:#B7A078;letter-spacing:1px;">${effectiveBrandSubtitle}</div>
    </td></tr>
    <tr><td style="background:${CARD};padding:34px 28px 10px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
      <div style="font-size:12px;color:${GOLD};font-weight:bold;letter-spacing:1px;margin-bottom:8px;">طلب رقم #${orderId}</div>
      <h1 style="margin:0 0 12px;font-size:26px;line-height:1.4;color:${INK};">${headline}${firstName ? ` يا ${firstName}` : ""}</h1>
      ${intro ? `<p style="margin:0 0 6px;font-size:15px;line-height:1.9;color:#5c5346;">${intro}</p>` : ""}
    </td></tr>

    <tr><td style="background:${CARD};padding:18px 28px 6px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
      <div style="font-size:13px;font-weight:bold;color:${GOLD};margin-bottom:4px;">القطع</div>
      <table width="100%" cellspacing="0" cellpadding="0">${itemsHtml}</table>
      <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px;">
        <tr><td style="padding:4px 0;font-size:14px;color:#5c5346;">المجموع الفرعي</td><td style="padding:4px 0;font-size:14px;text-align:left;">${money(computedSubtotal)}</td></tr>
        ${computedDiscount > 0 ? `<tr><td style="padding:4px 0;font-size:14px;color:#5c5346;">الخصم</td><td style="padding:4px 0;font-size:14px;text-align:left;color:#2f6b4a;">-${money(computedDiscount)}</td></tr>` : ""}
        <tr><td style="padding:4px 0;font-size:14px;color:#5c5346;">الشحن</td><td style="padding:4px 0;font-size:14px;text-align:left;${computedShipping === 0 ? "color:#2f6b4a;" : ""}">${computedShipping === 0 ? "مجاني" : money(computedShipping)}</td></tr>
        <tr><td style="padding:12px 0 4px;border-top:1px solid ${LINE};font-size:17px;font-weight:bold;">الإجمالي</td><td style="padding:12px 0 4px;border-top:1px solid ${LINE};font-size:19px;font-weight:bold;text-align:left;">${money(finalTotal)}</td></tr>
      </table>
    </td></tr>

    <tr><td style="background:${CARD};padding:22px 28px 8px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
      <div style="font-size:13px;font-weight:bold;color:${GOLD};margin-bottom:4px;">بيانات التوصيل</div>
      <table width="100%" cellspacing="0" cellpadding="0">
        ${infoRow("الاسم", customerName)}
        ${infoRow("الموبايل", `<span dir="ltr">${phone}</span>`)}
        ${addressLine ? infoRow("العنوان", addressLine) : ""}
        ${infoRow("الدفع", paymentMethodLabel)}
        ${isGift ? infoRow("هدية", `تغليف هدية${giftMessage ? ` — "${giftMessage}"` : ""}`) : ""}
      </table>
    </td></tr>

    <tr><td style="background:${CARD};padding:22px 28px 34px;border-left:1px solid ${LINE};border-right:1px solid ${LINE};text-align:center;">
      <a href="https://wa.me/201143837730?text=${encodeURIComponent(`أهلاً أورما، عايز أتابع طلبي رقم #${orderId}`)}" style="display:inline-block;background:${INK};color:${IVORY};text-decoration:none;padding:15px 34px;border-radius:999px;font-size:14px;font-weight:bold;">تابع طلبك على واتساب</a>
    </td></tr>

    <tr><td style="background:${INK};border-radius:0 0 20px 20px;padding:24px;text-align:center;font-size:12px;line-height:1.9;color:#D8C8B3;">
      <div style="color:${IVORY};font-weight:bold;font-size:13px;">${effectiveBrandNameEnglish} · فضة إسترليني عيار 925</div>
      <div>${contactLine}</div>
    </td></tr>
  </table>
</body>
</html>`;

    let deliveryStatus = "simulated";
    let messageId: string | undefined = undefined;

    // Send real email via Gmail SMTP if App Password is provided
    if (effectiveAppPassword && !officialSenderEmail) {
      return NextResponse.json(
        { success: false, error: "عنوان الإيميل المرسِل (GMAIL_USER) غير مضبوط. أضفه في إعدادات الإيميل أو في Vercel." },
        { status: 500 }
      );
    }
    if (effectiveAppPassword) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: officialSenderEmail,
            pass: effectiveAppPassword,
          },
        });

        const info = await transporter.sendMail({
          from: `"${officialSenderName}" <${officialSenderEmail}>`,
          to: email,
          replyTo: officialSenderEmail,
          subject,
          html: htmlContent,
          text: plainText,
        });

        deliveryStatus = "sent_via_gmail_smtp";
        messageId = info.messageId;
        console.log(`[Gmail SMTP Success] MessageId: ${info.messageId} sent to ${email} via ${officialSenderEmail}`);
      } catch (smtpErr: unknown) {
        console.error("[Gmail SMTP Error]:", smtpErr);
        const errMessage = smtpErr instanceof Error ? smtpErr.message : "فشل الاتصال بخادم Gmail";
        return NextResponse.json(
          {
            success: false,
            error: `فشل الإرسال عبر Gmail (${officialSenderEmail}): ${errMessage}. تأكد من صحة كلمة مرور التطبيقات (App Password).`,
            senderEmail: officialSenderEmail,
          },
          { status: 500 }
        );
      }
    } else {
      console.log(`[Email Order Dispatch] Prepared "${subject}" to ${email} from ${officialSenderEmail} (Awaiting Gmail App Password)`);
    }

    return NextResponse.json({
      success: true,
      message:
        deliveryStatus === "sent_via_gmail_smtp"
          ? `تم إرسال الفاتورة بنجاح من الحساب الرسمي (${officialSenderEmail}) إلى بريد العميل!`
          : `تم تجهيز الفاتورة بنجاح للإرسال من (${officialSenderEmail}). يرجى إدخال كلمة مرور التطبيقات (App Password) في لوحة التحكم للاتصال الفوري بـ Gmail.`,
      deliveryStatus,
      messageId,
      sender: officialSenderEmail,
      recipient: email,
      orderId,
      subject,
      previewLength: htmlContent.length,
    });
  } catch (error: unknown) {
    console.error("Email send route error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Error" },
      { status: 500 }
    );
  }
}

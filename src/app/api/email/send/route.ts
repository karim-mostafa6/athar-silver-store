import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSettings, saveServerSettings } from "@/lib/serverSettings";

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
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequestBody = await request.json();
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

    const officialSenderEmail =
      process.env.GMAIL_USER ||
      serverConfig.senderEmail ||
      bodySenderEmail ||
      "contact@ormasilver.com";
    const officialSenderName =
      process.env.GMAIL_SENDER_NAME ||
      serverConfig.senderEmailName ||
      bodySenderName ||
      "ORMA للفضة 925";
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

    const itemsRows = items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #ebdcca;">
          <td style="padding: 12px 10px; font-weight: bold; color: #161412; font-size: 13px;">
            ${item.arabicName}
            ${item.selectedSize ? `<span style="display: block; font-size: 11px; color: #8c7865; font-weight: normal; margin-top: 3px;">المقاس: ${item.selectedSize}</span>` : ""}
          </td>
          <td style="padding: 12px 10px; text-align: center; color: #5a4c3e; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 12px 10px; text-align: left; font-weight: bold; color: #161412; font-size: 13px; font-family: Tahoma, sans-serif;">
            ${(item.price * item.quantity).toLocaleString("ar-EG")} ج.م
          </td>
        </tr>`
      )
      .join("");

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
      : "فاتورة تأكيد استلام طلبك من متجر أَثَر";

    const subject = isTest
      ? `أَثَر للفضة 925 | تجربة إرسال ناجحة من الحساب الرسمي (${officialSenderEmail})`
      : `أَثَر للفضة 925 | ${statusTitle} - طلب #${orderId}`;

    const orderDate = new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${subject}</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f4ee; margin: 0; padding: 25px 15px; direction: rtl; text-align: right; color: #161412;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #ebdcca; overflow: hidden; box-shadow: 0 10px 30px rgba(22, 20, 18, 0.06);">
        
        <!-- Luxury Brand Header -->
        <tr>
          <td style="background-color: #161412; padding: 35px 25px 30px 25px; text-align: center; border-bottom: 3px solid #c5a880;">
            <div style="font-size: 11px; letter-spacing: 4px; color: #c5a880; font-family: monospace; text-transform: uppercase; margin-bottom: 8px;">
              OFFICIAL ORDER INVOICE
            </div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 2px;">
              ORMA • SILVER
            </h1>
            <p style="color: #d4b896; margin: 8px 0 0 0; font-size: 13px; font-weight: 300;">
              فضة إسترليني عيار 925 • Not Given, But Left
            </p>
          </td>
        </tr>

        <!-- Body Container -->
        <tr>
          <td style="padding: 30px 25px;">
            
            <!-- Status Greeting Banner -->
            <div style="background-color: #faf8f5; padding: 18px 20px; border-radius: 14px; margin-bottom: 24px; border: 1px solid #ebdcca; border-right: 4px solid #c5a880;">
              <div style="font-size: 11px; color: #8c7865; font-weight: bold; margin-bottom: 4px;">حالة الطلب الرسمية:</div>
              <h2 style="margin: 0 0 6px 0; font-size: 19px; color: #161412; font-weight: bold;">${statusTitle}</h2>
              <p style="margin: 0; font-size: 13px; color: #5c4f42; line-height: 1.6;">
                أهلاً بك يا <strong>${customerName}</strong>، يسعدنا إشعارك بتفاصيل وفاتورة طلبك رقم <strong>#${orderId}</strong> المؤرخ في ${orderDate}.
              </p>
            </div>

            <!-- Official Order Reference Box -->
            <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #161412; border-radius: 12px; margin-bottom: 24px;">
              <tr>
                <td style="padding: 16px 20px; text-align: center;">
                  <span style="display: block; font-size: 11px; color: #d4b896; margin-bottom: 4px; letter-spacing: 1px;">
                    رقم الطلب الرسمي للمتابعة والشحن
                  </span>
                  <span style="display: inline-block; font-size: 24px; font-weight: bold; font-family: monospace; color: #ffffff; letter-spacing: 2px; direction: ltr;">
                    #${orderId}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Customer & Shipping Information Card -->
            <div style="background-color: #ffffff; border: 1px solid #ebdcca; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: bold; color: #161412; border-bottom: 1px solid #ebdcca; padding-bottom: 8px; margin-bottom: 12px;">
                بيانات العميل وعنوان التسليم
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.8;">
                <tr>
                  <td style="color: #756555; width: 35%;">اسم المستلم:</td>
                  <td style="font-weight: bold; color: #161412;">${customerName}</td>
                </tr>
                <tr>
                  <td style="color: #756555;">رقم الهاتف:</td>
                  <td style="font-weight: bold; color: #161412; direction: ltr; text-align: right;">${phone}</td>
                </tr>
                ${governorate ? `
                <tr>
                  <td style="color: #756555;">المحافظة والعنوان:</td>
                  <td style="font-weight: bold; color: #161412;">${governorate} - ${address}</td>
                </tr>` : ""}
                <tr>
                  <td style="color: #756555;">طريقة الدفع:</td>
                  <td style="font-weight: bold; color: #161412;">${paymentMethodLabel}</td>
                </tr>
                ${isGift ? `
                <tr>
                  <td style="color: #c5a880; font-weight: bold;">تغليف كهدية:</td>
                  <td style="font-weight: bold; color: #161412;">نعم (تغليف ملكي مجاني)${giftMessage ? ` - "${giftMessage}"` : ""}</td>
                </tr>` : ""}
              </table>
            </div>

            <!-- Items Table -->
            ${items.length > 0 ? `
            <div style="margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: bold; color: #161412; margin-bottom: 10px;">
                تفاصيل القطع المختارة في طلبك:
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; width: 100%; border: 1px solid #ebdcca; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #faf8f5; border-bottom: 2px solid #ebdcca;">
                    <th style="padding: 10px; text-align: right; color: #756555; font-size: 12px;">القطعة</th>
                    <th style="padding: 10px; text-align: center; color: #756555; font-size: 12px; width: 15%;">الكمية</th>
                    <th style="padding: 10px; text-align: left; color: #756555; font-size: 12px; width: 25%;">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </div>
            ` : ""}

            <!-- Financial Summary Card (Subtotal + Shipping + Discount + Grand Total) -->
            <div style="background-color: #faf8f5; border: 1px solid #ebdcca; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 2;">
                <tr>
                  <td style="color: #756555;">المجموع الفرعي للقطع:</td>
                  <td style="text-align: left; font-weight: bold; color: #161412; font-family: Tahoma, sans-serif;">
                    ${computedSubtotal.toLocaleString("ar-EG")} ج.م
                  </td>
                </tr>
                <tr>
                  <td style="color: #756555;">مصاريف الشحن والتوصيل:</td>
                  <td style="text-align: left; font-weight: bold; color: ${computedShipping === 0 ? "#15803d" : "#161412"}; font-family: Tahoma, sans-serif;">
                    ${computedShipping === 0 ? "شحن مجاني لكافة المحافظات" : `${computedShipping.toLocaleString("ar-EG")} ج.م`}
                  </td>
                </tr>
                ${computedDiscount > 0 ? `
                <tr>
                  <td style="color: #b91c1c;">قيمة الخصم الترويجي:</td>
                  <td style="text-align: left; font-weight: bold; color: #b91c1c; font-family: Tahoma, sans-serif;">
                    -${computedDiscount.toLocaleString("ar-EG")} ج.م
                  </td>
                </tr>` : ""}
                <tr style="border-top: 2px solid #ebdcca;">
                  <td style="padding-top: 10px; font-size: 15px; font-weight: bold; color: #161412;">
                    الإجمالي النهائي المطلوب دفعه:
                  </td>
                  <td style="padding-top: 10px; text-align: left; font-size: 17px; font-weight: bold; color: #161412; font-family: Tahoma, sans-serif;">
                    ${finalTotal.toLocaleString("ar-EG")} ج.م
                  </td>
                </tr>
              </table>
            </div>

            <!-- Next Steps & Reassurance -->
            <div style="background-color: #f5efe6; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px; font-size: 12px; color: #5c4f42; line-height: 1.6;">
              <strong style="color: #161412; display: block; margin-bottom: 4px;">الخطوة القادمة للتأكيد والتسليم:</strong>
              سيتواصل معك ممثل خدمة العملاء هاتفياً لتأكيد تفاصيل المقاسات والعنوان وموعد خروج الشحنة المناسب لك قبل توجه مندوب الشحن لمنزلك.
            </div>

            <!-- WhatsApp Direct Button -->
            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
              <tr>
                <td style="text-align: center;">
                  <a href="https://wa.me/201143837730?text=${encodeURIComponent(`أهلاً متجر أَثَر، أرغب في متابعة طلبي رقم #${orderId}`)}" style="display: inline-block; background-color: #161412; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 13px; font-weight: bold; border: 1px solid #c5a880;">
                    متابعة الطلب مباشرة عبر واتساب المتجر
                  </a>
                </td>
              </tr>
            </table>

            <!-- Royal Guarantee Footer Strip -->
            <table width="100%" cellspacing="0" cellpadding="0" style="border-top: 1px solid #ebdcca; padding-top: 20px; text-align: center; font-size: 11px; color: #8c7865; line-height: 1.8;">
              <tr>
                <td>
                  <p style="margin: 2px 0; font-weight: bold; color: #161412;">
                    دار ORMA للفضة 925 • صياغة إيطالية وتركية فاخرة
                  </p>
                  <p style="margin: 2px 0;">
                    خدمة العملاء هاتفياً وواتساب: <strong>01143837730</strong> | البريد الرسمي: <strong>${officialSenderEmail}</strong>
                  </p>
                  <p style="margin: 6px 0 0 0; color: #c5a880; font-weight: bold;">
                    Not Given, But Left • مش بتتهدي.. بتتساب
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    let deliveryStatus = "simulated";
    let messageId: string | undefined = undefined;

    // Send real email via Gmail SMTP if App Password is provided
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

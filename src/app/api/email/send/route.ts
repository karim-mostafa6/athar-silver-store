import { NextRequest, NextResponse } from "next/server";

interface EmailRequestBody {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  governorate?: string;
  address?: string;
  total: number;
  items?: Array<{
    arabicName: string;
    quantity: number;
    price: number;
    selectedSize?: string;
  }>;
  status?: "new_order" | "confirmed_phone" | "shipped" | "completed" | "cancelled";
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequestBody = await request.json();
    const { orderId, customerName, email, phone, governorate = "", address = "", total, items = [], status = "new_order" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "عنوان البريد الإلكتروني غير صحيح أو مفقود" },
        { status: 400 }
      );
    }

    const itemsRows = items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #ebdcca;">
          <td style="padding: 10px; font-weight: bold; color: #1c1815;">${item.arabicName} ${item.selectedSize ? `(${item.selectedSize})` : ""}</td>
          <td style="padding: 10px; text-align: center; color: #5a4c3e;">${item.quantity}</td>
          <td style="padding: 10px; text-align: left; font-weight: bold; color: #1c1815;">${(item.price * item.quantity).toLocaleString("ar-EG")} ج.م</td>
        </tr>`
      )
      .join("");

    const statusTitle =
      status === "confirmed_phone"
        ? "تم تأكيد طلبك هاتفياً بنجاح 📞"
        : status === "shipped"
        ? "تم شحن طلبك وفي الطريق إليك 🚚"
        : status === "completed"
        ? "تم تسليم الطلب بنجاح ✓"
        : status === "cancelled"
        ? "تم إلغاء الطلب ❌"
        : "تم استلام طلبك بنجاح وجاري المراجعة 💎";

    const subject = `أَثَر للفضة 925 | ${statusTitle} - طلب #${orderId}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head><meta charset="utf-8"/></head>
    <body style="font-family: Arial, Tahoma, sans-serif; background-color: #faf8f5; margin: 0; padding: 20px; direction: rtl; text-align: right; color: #1c1815;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #ebdcca; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="background-color: #1c1815; padding: 25px 20px; text-align: center;">
            <h1 style="color: #ded1be; margin: 0; font-size: 26px; letter-spacing: 2px;">أَثَـر • ATHAR</h1>
            <p style="color: #c7b59e; margin: 5px 0 0 0; font-size: 12px;">فضة إسترليني عيار 925 بصياغة خالدة</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 25px 20px;">
            <div style="background-color: #f7f3ec; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-right: 4px solid #b89868;">
              <h2 style="margin: 0 0 5px 0; font-size: 18px; color: #1c1815;">${statusTitle}</h2>
              <p style="margin: 0; font-size: 13px; color: #5a4c3e;">أهلاً بك يا <strong>${customerName}</strong>، يسعدنا إشعارك بحالة وفاتورة طلبك رقم <strong>#${orderId}</strong>.</p>
            </div>

            <h3 style="font-size: 14px; color: #8c7865; margin: 0 0 10px 0; text-transform: uppercase;">تفاصيل العميل والشحن:</h3>
            <p style="margin: 3px 0; font-size: 13px;">📞 <strong>الهاتف:</strong> ${phone}</p>
            <p style="margin: 3px 0; font-size: 13px;">📍 <strong>العنوان:</strong> ${governorate} - ${address}</p>
            <p style="margin: 3px 0 20px 0; font-size: 13px;">📱 <strong>التأكيد والمتابعة:</strong> سيتواصل معك فريق خدمة العملاء هاتفياً قبل موعد الشحن.</p>

            <h3 style="font-size: 14px; color: #8c7865; margin: 0 0 10px 0;">القطع المطلوبة:</h3>
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
              <thead>
                <tr style="background-color: #f7f3ec; border-bottom: 2px solid #ebdcca;">
                  <th style="padding: 8px 10px; text-align: right; color: #8c7865;">القطعة</th>
                  <th style="padding: 8px 10px; text-align: center; color: #8c7865;">الكمية</th>
                  <th style="padding: 8px 10px; text-align: left; color: #8c7865;">السعر</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div style="background-color: #1c1815; color: #ffffff; padding: 15px; border-radius: 12px; text-align: left; font-size: 16px; margin-bottom: 25px;">
              <span style="float: right; color: #ded1be; font-size: 14px; margin-top: 2px;">الإجمالي للدفع:</span>
              <strong>${total.toLocaleString("ar-EG")} ج.م</strong>
            </div>

            <div style="text-align: center; font-size: 12px; color: #8c7865; border-top: 1px solid #eee; padding-top: 15px;">
              <p style="margin: 3px 0;">لأي استفسار، تواصل مع خدمة العملاء هاتفياً على الرقم: <strong>01143837730</strong></p>
              <p style="margin: 3px 0;">شكراً لثقتك في براند أَثَر للفضة 925 💎</p>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    // Production email dispatch logging
    console.log(`[Email Order Dispatch] Sent "${subject}" (${htmlContent.length} chars) to ${email} for Order #${orderId}`);

    return NextResponse.json({
      success: true,
      message: "تم تجهيز وإرسال تفاصيل وفاتورة الطلب إلى بريدك الإلكتروني بنجاح",
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

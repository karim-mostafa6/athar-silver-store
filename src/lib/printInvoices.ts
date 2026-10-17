// Printable shipping invoices (single order / multiple orders) opened in a new window.
// Extracted from the admin page so that file stays focused on UI; output is unchanged.
import type { Order } from "@/context/StoreContext";

export const printOrderInvoice = (order: Order) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: right; font-weight: bold;">
        ${item.arabicName} ${item.selectedSize ? `<span style="font-size: 11px; color: #756555; display: block;">مقاس: ${item.selectedSize}</span>` : ""}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: left;">${item.price.toLocaleString("en-US")} ج.م</td>
      <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: left; font-weight: bold;">${(item.price * item.quantity).toLocaleString("en-US")} ج.م</td>
    </tr>`
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>بوليصة شحن طلب #${order.id} - دار أورما</title>
      <style>
        body { font-family: 'Cairo', Tahoma, sans-serif; padding: 30px; color: #161412; background: #fff; }
        .header { text-align: center; border-bottom: 2px solid #161412; padding-bottom: 14px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
        .subtitle { font-size: 12px; color: #756555; margin-top: 4px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; background: #fbf9f5; border: 1px solid #e8ded0; padding: 14px; border-radius: 8px; font-size: 13px; line-height: 1.8; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th { background: #f7f4ee; padding: 10px; text-align: right; border-bottom: 2px solid #161412; font-size: 12px; }
        .total-box { background: #f7f4ee; border: 1px solid #ded2c0; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; line-height: 1.8; }
        .total-amount { font-size: 18px; font-weight: bold; color: #161412; border-top: 1px solid #ded2c0; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between; }
        .footer { text-align: center; font-size: 11px; color: #756555; border-top: 1px dashed #ccc; padding-top: 14px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">ORMA للفضة الإسترليني 925</div>
        <div class="subtitle">بوليصة تسليم الشحنة للعميل • فاتورة رسمية</div>
      </div>
      <div class="meta-grid">
        <div>
          <div><strong>رقم الطلب:</strong> #${order.id}</div>
          <div><strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleDateString("ar-EG")}</div>
          <div><strong>اسم العميل:</strong> ${order.customerName}</div>
          <div><strong>رقم الهاتف:</strong> ${order.phone}</div>
        </div>
        <div>
          <div><strong>المحافظة:</strong> ${order.governorate}</div>
          <div><strong>العنوان بالتفصيل:</strong> ${order.address}</div>
          <div><strong>طريقة الدفع:</strong> ${order.paymentMethod === "cod" ? "الدفع عند الاستلام" : order.paymentMethod === "wallet" ? "محفظة إلكترونية" : "بطاقة بنكية"}</div>
          <div><strong>ملاحظات العميل:</strong> ${order.notes || "لا توجد"}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>القطعة والمواصفات</th>
            <th style="text-align: center;">الكمية</th>
            <th style="text-align: left;">سعر القطعة</th>
            <th style="text-align: left;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="total-box">
        <div style="display: flex; justify-content: space-between;">
          <span>قيمة المنتجات:</span>
          <span>${order.subtotal.toLocaleString("en-US")} ج.م</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>رسوم الشحن والتوصيل:</span>
          <span>${order.shippingFee.toLocaleString("en-US")} ج.م</span>
        </div>
        ${order.discount ? `
        <div style="display: flex; justify-content: space-between; color: #b91c1c;">
          <span>كوبون الخصم:</span>
          <span>-${order.discount.toLocaleString("en-US")} ج.م</span>
        </div>` : ""}
        <div class="total-amount">
          <span>المبلغ المطلوب تحصيله من العميل:</span>
          <span>${order.total.toLocaleString("en-US")} ج.م</span>
        </div>
      </div>
      <div class="footer">
        ضمان أورما المعتمد على الفضة الإسترليني عيار 925 • سياسة استبدال واسترجاع مرنة خلال 14 يوماً<br>
        خدمة العملاء والدعم: 01143837730
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

export const printOrdersInvoices = (ordersToPrint: Order[]) => {
  if (!ordersToPrint || ordersToPrint.length === 0) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const sheetsHtml = ordersToPrint.map((order, idx) => {
    const itemsRows = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: right; font-weight: bold;">
          ${item.arabicName} ${item.selectedSize ? `<span style="font-size: 11px; color: #756555; display: block;">مقاس: ${item.selectedSize}</span>` : ""}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: left;">${item.price.toLocaleString("en-US")} ج.م</td>
        <td style="padding: 10px; border-bottom: 1px solid #e8ded0; text-align: left; font-weight: bold;">${(item.price * item.quantity).toLocaleString("en-US")} ج.م</td>
      </tr>`
      )
      .join("");

    return `
      <div class="sheet" style="${idx > 0 ? "page-break-before: always; margin-top: 40px;" : ""}">
        <div class="header">
          <div class="brand">ORMA | أورما</div>
          <div class="subtitle">الفضة الإسترليني عيار 925 • وثيقة الشحن والتسليم الرسمية</div>
        </div>
        <div class="meta-grid">
          <div>
            <div><strong>رقم الطلب:</strong> #${order.id}</div>
            <div><strong>اسم العميل:</strong> ${order.customerName}</div>
            <div><strong>رقم الهاتف:</strong> ${order.phone}</div>
            <div><strong>تاريخ الطلب:</strong> ${new Date(order.createdAt).toLocaleString("ar-EG")}</div>
          </div>
          <div>
            <div><strong>المحافظة:</strong> ${order.governorate}</div>
            <div><strong>العنوان بالتفصيل:</strong> ${order.address}</div>
            <div><strong>طريقة الدفع:</strong> ${order.paymentMethod === "cod" ? "الدفع عند الاستلام" : order.paymentMethod === "wallet" ? "محفظة إلكترونية" : "بطاقة بنكية"}</div>
            <div><strong>ملاحظات العميل:</strong> ${order.notes || "لا توجد"}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>القطعة والمواصفات</th>
              <th style="text-align: center;">الكمية</th>
              <th style="text-align: left;">سعر القطعة</th>
              <th style="text-align: left;">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <div class="total-box">
          <div style="display: flex; justify-content: space-between;">
            <span>قيمة المنتجات:</span>
            <span>${order.subtotal.toLocaleString("en-US")} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>رسوم الشحن والتوصيل:</span>
            <span>${order.shippingFee.toLocaleString("en-US")} ج.م</span>
          </div>
          ${order.discount ? `
          <div style="display: flex; justify-content: space-between; color: #b91c1c;">
            <span>كوبون الخصم:</span>
            <span>-${order.discount.toLocaleString("en-US")} ج.م</span>
          </div>` : ""}
          <div class="total-amount">
            <span>المبلغ المطلوب تحصيله من العميل:</span>
            <span>${order.total.toLocaleString("en-US")} ج.م</span>
          </div>
        </div>
        <div class="footer">
          ضمان أورما المعتمد على الفضة الإسترليني عيار 925 • سياسة استبدال واسترجاع مرنة خلال 14 يوماً<br>
          خدمة العملاء والدعم: 01143837730
        </div>
      </div>
    `;
  }).join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>طباعة بوالص الشحن المحددة (${ordersToPrint.length} طلب) - دار أورما</title>
      <style>
        body { font-family: 'Cairo', Tahoma, sans-serif; padding: 25px; color: #161412; background: #fff; }
        .header { text-align: center; border-bottom: 2px solid #161412; padding-bottom: 12px; margin-bottom: 16px; }
        .brand { font-size: 22px; font-weight: bold; letter-spacing: 2px; }
        .subtitle { font-size: 11px; color: #756555; margin-top: 3px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; background: #fbf9f5; border: 1px solid #e8ded0; padding: 12px; border-radius: 8px; font-size: 12px; line-height: 1.7; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
        th { background: #161412; color: #f7f4ee; padding: 8px 10px; text-align: right; }
        .total-box { background: #fbf9f5; border: 1px solid #e8ded0; padding: 12px; border-radius: 8px; max-width: 300px; margin-right: auto; margin-bottom: 16px; font-size: 12px; line-height: 1.8; }
        .total-amount { border-top: 2px solid #161412; padding-top: 6px; margin-top: 6px; font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; }
        .footer { text-align: center; font-size: 10px; color: #756555; border-top: 1px solid #e8ded0; padding-top: 10px; }
        @media print {
          body { padding: 0; }
          .sheet { page-break-after: always; }
        }
      </style>
    </head>
    <body>
      ${sheetsHtml}
      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

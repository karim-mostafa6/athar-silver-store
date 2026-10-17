import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getServerStoreData,
  saveServerStoreData,
  saveOrdersDelta,
  getNextSequentialOrderId,
  extractOrderSequence,
} from "@/lib/serverStore";
import { Order, OrderItem } from "@/context/StoreContext";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { sendTelegramOrderNotification } from "@/lib/telegram";
import { reconcilePendingWhatsAppConfirmations, normalizeEgyptianPhone, waAutoEnabled } from "@/lib/whatsapp";
import { evaluateOrderReview } from "@/lib/orderReview";
import { patchOrderFields } from "@/lib/serverStore";
import { recordFunnelEvent, markCartRecovered, sanitizeSource } from "@/lib/funnel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory atomic async lock to serialize single order checkouts under high concurrency
class OrderCreationLock {
  private promise: Promise<void> = Promise.resolve();

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const next = new Promise<void>((resolve) => {
      release = resolve;
    });
    const current = this.promise;
    this.promise = next;

    try {
      await current;
      return await fn();
    } finally {
      release!();
    }
  }
}

const singleOrderCreationLock = new OrderCreationLock();

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Expires": "0",
};

// In-memory rate limiting for checkout anti-spam (5 orders per 10 minutes per IP)
const orderRateLimitMap = new Map<string, { count: number; firstAttempt: number }>();

function checkOrderRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const record = orderRateLimitMap.get(ip);

  if (!record) {
    orderRateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - record.firstAttempt > windowMs) {
    orderRateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (record.count >= 6) {
    return false;
  }

  record.count += 1;
  return true;
}

// --------------------------------------------------------------------------
// 1. GET ORDERS (Strictly Admin Only)
// --------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بعرض الطلبات. يرجى تسجيل الدخول كمسؤول." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const data = await getServerStoreData();

    // Vercel Resilience: Trigger background reconciliation for any pending delayed WhatsApp confirmations
    const origin =
      request.headers.get("origin") ||
      (request.headers.get("host")?.startsWith("localhost")
        ? "http://localhost:3000"
        : `https://${request.headers.get("host") || "orma-silver.vercel.app"}`);

    (async () => {
      try {
        await reconcilePendingWhatsAppConfirmations(origin);
      } catch {}
    })();

    return NextResponse.json(
      {
        success: true,
        orders: data.orders,
        lastOrderSeq: data.lastOrderSeq || 999,
        deletedOrderIds: data.deletedOrderIds || [],
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading orders" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// --------------------------------------------------------------------------
// 2. CREATE OR SYNC ORDERS (Protected & Price-Tampering Proof)
// --------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const body = await request.json();
    const { order, orders, lastOrderSeq, deletedOrderIds, honeypot, website } = body;

    // A) Bulk Orders Sync (Admin Only)
    if (Array.isArray(orders)) {
      if (!isAuthorizedAdmin(request)) {
        return NextResponse.json(
          { success: false, error: "غير مصرح لك بتحديث قائمة الطلبات جماعياً." },
          { status: 401, headers: NO_CACHE_HEADERS }
        );
      }

      const saved = await saveServerStoreData({
        orders,
        lastOrderSeq: typeof lastOrderSeq === "number" ? lastOrderSeq : undefined,
        deletedOrderIds: Array.isArray(deletedOrderIds) ? deletedOrderIds : undefined,
      });

      return NextResponse.json(
        {
          success: true,
          message: "تم تحديث كافة الطلبات بنجاح!",
          ordersCount: saved.orders.length,
          lastOrderSeq: saved.lastOrderSeq,
          updatedAt: saved.updatedAt,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // B) Single New Order (From Customer Checkout)
    const rawOrder = order || body;
    if (!rawOrder || typeof rawOrder !== "object") {
      return NextResponse.json(
        { success: false, error: "بيانات الطلب غير صالحة" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 1. Anti-Spam Check: Honeypot trap
    if (honeypot || website || rawOrder.honeypot || rawOrder.website) {
      return NextResponse.json(
        { success: false, error: "طلب غير صالح" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 2. Anti-Spam Check: Rate Limit per IP
    if (!checkOrderRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "تم تجاوز الحد المسموح به لإرسال الطلبات مؤقتاً. يرجى الانتظار بضع دقائق.",
        },
        { status: 429, headers: NO_CACHE_HEADERS }
      );
    }

    // 3. Server-Side Data Validation
    const customerName = String(rawOrder.customerName || "").trim();
    if (!customerName || customerName.length < 3) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال اسم العميل بشكل صحيح (3 أحرف على الأقل)." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const rawPhone = String(rawOrder.phone || "").replace(/\s+/g, "");
    // Egyptian phone format: 010, 011, 012, 015 followed by 8 digits
    const phoneRegex = /^(?:\+?20|0)?1[0125][0-9]{8}$/;
    if (!phoneRegex.test(rawPhone)) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال رقم هاتف محمول مصري صحيح مكون من 11 رقماً (مثال: 01012345678)." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const governorate = String(rawOrder.governorate || "").trim();
    if (!governorate) {
      return NextResponse.json(
        { success: false, error: "يرجى تحديد محافظة التوصيل." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const address = String(rawOrder.address || "").trim();
    if (!address || address.length < 5) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة عنوان التوصيل بالتفصيل (اسم الشارع ورقم العقار)." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const items = rawOrder.items;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "سلة المشتريات فارغة، لا يمكن تسجيل طلب فارغ." },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // 4. Server-Side Price Tampering Protection
    // Query actual products from server database to recalculate true prices!
    const currentData = await getServerStoreData();
    const productCatalogMap = new Map<string, (typeof currentData.products)[0]>();
    currentData.products.forEach((p) => productCatalogMap.set(p.id, p));

    let serverSubtotal = 0;
    const verifiedItems: OrderItem[] = [];

    for (const item of items) {
      const realProduct = productCatalogMap.get(item.productId);
      const qty = Math.max(1, Math.min(50, Number(item.quantity) || 1));

      if (!realProduct) {
        return NextResponse.json(
          { success: false, error: `المنتج المختار "${item.arabicName || item.productId}" لم يعد متاحاً في المتجر.` },
          { status: 400, headers: NO_CACHE_HEADERS }
        );
      }

      const verifiedPrice = Number(realProduct.price);
      serverSubtotal += verifiedPrice * qty;

      verifiedItems.push({
        productId: realProduct.id,
        name: realProduct.name || "",
        arabicName: realProduct.arabicName,
        quantity: qty,
        price: verifiedPrice,
        selectedSize: item.selectedSize || undefined,
        image: realProduct.images?.[0] || item.image || "",
        costPrice: realProduct.costPrice ? Number(realProduct.costPrice) : undefined,
        sku: realProduct.sku || undefined,
      });
    }

    // 5. Server-Side Shipping Calculation
    const settings = currentData.settings || {};
    const freeThreshold = Number(settings.freeShippingThreshold) || 1500;
    let verifiedShippingFee = 50;

    if (serverSubtotal >= freeThreshold) {
      verifiedShippingFee = 0;
    } else if (settings.governorateShippingRates && settings.governorateShippingRates[governorate] !== undefined) {
      verifiedShippingFee = Number(settings.governorateShippingRates[governorate]);
    } else {
      // Region-based fallback
      if (governorate.includes("القاهرة") || governorate.includes("الجيزة")) {
        verifiedShippingFee = Number(settings.shippingCairoGiza) || 45;
      } else if (governorate.includes("الإسكندرية")) {
        verifiedShippingFee = Number(settings.shippingAlex) || 50;
      } else {
        verifiedShippingFee = 55;
      }
    }

    // 6. Server-Side Promo Discount Calculation
    let verifiedDiscount = 0;
    const promoCodeInput = String(rawOrder.promoCode || "").trim().toUpperCase();
    const storePromo = String(settings.promoCode || "").trim().toUpperCase();
    const promoPercent = Number(settings.promoDiscountPercent) || 0;

    if (promoCodeInput && storePromo && promoCodeInput === storePromo && promoPercent > 0) {
      verifiedDiscount = Math.round((serverSubtotal * promoPercent) / 100);
    }

    const verifiedTotal = Math.max(0, serverSubtotal + verifiedShippingFee - verifiedDiscount);

    // 7. Atomic Sequential Order Number Assignment, Inventory Deduction & Persistence
    // Wrapped in singleOrderCreationLock to guarantee absolute thread-safety under high concurrency
    const creationResult = await singleOrderCreationLock.acquire(async () => {
      // Re-fetch latest store snapshot inside lock to guarantee up-to-the-millisecond freshness
      const freshData = await getServerStoreData();

      // Server-Side Atomic Order ID Generation:
      // Strictly ignore any client-provided ID or order number (e.g. ORM-1000 generated by un-synced phones).
      // The server is the SOLE authority that determines the next sequential order ID.
      const newId = getNextSequentialOrderId(
        freshData.orders,
        freshData.lastOrderSeq,
        freshData.deletedOrderIds
      );

      let newSeq = Math.max(freshData.lastOrderSeq || 999, Number(lastOrderSeq) || 999);
      const seq = extractOrderSequence(newId);
      if (seq !== null) {
        newSeq = Math.max(newSeq, seq);
      }

      const finalOrder: Order = {
        id: newId,
        customerName,
        phone: rawPhone,
        email: rawOrder.email ? String(rawOrder.email).trim() : undefined,
        whatsapp: rawOrder.whatsapp ? String(rawOrder.whatsapp).trim() : undefined,
        governorate,
        address,
        notes: rawOrder.notes ? String(rawOrder.notes).trim() : undefined,
        isGift: Boolean(rawOrder.isGift),
        giftMessage: rawOrder.giftMessage ? String(rawOrder.giftMessage).trim() : undefined,
        items: verifiedItems,
        subtotal: serverSubtotal,
        shippingFee: verifiedShippingFee,
        discount: verifiedDiscount,
        total: verifiedTotal,
        status: "pending",
        paymentMethod: ["cod", "wallet", "card"].includes(rawOrder.paymentMethod) ? rawOrder.paymentMethod : "cod",
        senderWalletNumber: rawOrder.senderWalletNumber || undefined,
        paymentReceiptImage: rawOrder.paymentReceiptImage || undefined,
        cardDetails: rawOrder.cardDetails || undefined,
        adminNotes: rawOrder.adminNotes || undefined,
        createdAt: new Date().toISOString(),
        source: sanitizeSource(rawOrder.source),
        waStatus: waAutoEnabled() ? "pending" : "manual",
      };

      const review = evaluateOrderReview(
        finalOrder,
        freshData.orders,
        Number(settings.highValueReviewThreshold) || 4000
      );
      finalOrder.needsReview = review.needsReview;
      finalOrder.reviewReasons = review.reasons.length ? review.reasons.join(" • ") : undefined;

      // Automated Inventory Management: Deduct purchased quantity and auto-mark SOLD OUT if stock reaches 0
      const updatedProducts = freshData.products.map((p) => {
        const purchasedItem = verifiedItems.find((it) => it.productId === p.id);
        if (!purchasedItem) return p;

        const purchasedQty = Math.max(1, Math.min(50, Number(purchasedItem.quantity) || 1));
        const currentStock = p.stockQuantity !== undefined ? p.stockQuantity : (p.inStock ? 10 : 0);
        const newStock = Math.max(0, currentStock - purchasedQty);

        return {
          ...p,
          stockQuantity: newStock,
          inStock: newStock > 0,
        };
      });

      const updatedOrders = [finalOrder, ...freshData.orders.filter((o) => o.id !== finalOrder.id)];

      const saved = await saveServerStoreData({
        orders: updatedOrders,
        products: updatedProducts,
        lastOrderSeq: newSeq,
      });

      return {
        finalOrder,
        saved,
        isExisting: false,
      };
    });

    const { finalOrder, saved, isExisting } = creationResult;

    // --------------------------------------------------------------------------
    // 8. Isolated Background Notifications (Non-blocking: instant customer response)
    // --------------------------------------------------------------------------
    const orderSnapshot: Order = JSON.parse(JSON.stringify(finalOrder));

    // A) Asynchronous Isolated Telegram Notification Dispatch
    if (!isExisting && !orderSnapshot.adminNotes?.includes("[telegram_sent]")) {
      (async () => {
        try {
          const tgResult = await sendTelegramOrderNotification(orderSnapshot);
          if (tgResult.success) {
            console.log(`[Orders Route] Telegram notification dispatched for single order #${orderSnapshot.id}`);
          }
        } catch (telegramErr) {
          console.error(`[Orders Route] Isolated Telegram notification error for #${orderSnapshot.id}:`, telegramErr);
        }
      })();
    }

    // B) WhatsApp confirmation is sent ~3 minutes later by the external scheduler (pg_cron -> /api/cron/tick).
    //    wa_status is owned by the dispatcher, so mark it "pending" explicitly here.
    if (!isExisting) {
      // No automatic provider connected -> "manual": the Telegram button / dashboard sends it with one tap.
      const initialWa = waAutoEnabled() ? "pending" : "manual";
      await patchOrderFields(finalOrder.id, { waStatus: initialWa });
      finalOrder.waStatus = initialWa;

      // C) Funnel + abandoned-cart bookkeeping (best effort, never blocks the customer)
      (async () => {
        try {
          await recordFunnelEvent(String(rawOrder.sid || ""), "purchase", finalOrder.source);
          await markCartRecovered(normalizeEgyptianPhone(finalOrder.phone));
        } catch {}
      })();
    }

    // 9. Instant Path Revalidation to keep admin and customer views completely fresh
    try {
      revalidatePath("/admin");
      revalidatePath("/");
      revalidatePath("/collection/[slug]", "page");
      revalidatePath("/product/[id]", "page");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "تم استلام الطلب وتأكيده بنجاح!",
        orderId: finalOrder.id,
        order: finalOrder,
        ordersCount: saved.orders.length,
        lastOrderSeq: saved.lastOrderSeq,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving order" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// --------------------------------------------------------------------------
// 3. UPDATE ORDER STATUS & DETAILS (Strictly Admin Only)
// --------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتحديث الطلبات." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { orders, order, lastOrderSeq, deletedOrderIds } = body;

    let ordersToUpdate: Order[] | undefined = undefined;
    if (order && typeof order === "object" && order.id) {
      ordersToUpdate = [order];
    } else if (Array.isArray(orders)) {
      ordersToUpdate = orders;
    }

    if (!ordersToUpdate && !deletedOrderIds) {
      return NextResponse.json(
        { success: false, error: "بيانات الطلبات غير صالحة" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Only the changed orders are written (see saveOrdersDelta). Orders never affect the
    // storefront catalog version, so no updatedAt is returned and no page revalidation is needed.
    const saved = await saveOrdersDelta({
      orders: ordersToUpdate,
      lastOrderSeq: typeof lastOrderSeq === "number" ? lastOrderSeq : undefined,
      deletedOrderIds: Array.isArray(deletedOrderIds) ? deletedOrderIds : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم تحديث الطلبات في السيرفر بنجاح!",
        ordersCount: saved.savedCount,
        lastOrderSeq: saved.lastOrderSeq,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error updating orders" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// --------------------------------------------------------------------------
// 4. DELETE ORDER (Strictly Admin Only)
// --------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بحذف الطلبات." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order ID" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const current = await getServerStoreData();
    const updatedOrders = current.orders.filter((o) => o.id !== orderId);

    let maxSeq = current.lastOrderSeq || 999;
    const seq = extractOrderSequence(orderId);
    if (seq !== null) {
      maxSeq = Math.max(maxSeq, seq);
    }

    const updatedDeletedIds = Array.from(new Set([...(current.deletedOrderIds || []), orderId]));

    const saved = await saveServerStoreData({
      orders: updatedOrders,
      lastOrderSeq: maxSeq,
      deletedOrderIds: updatedDeletedIds,
    });

    return NextResponse.json(
      {
        success: true,
        message: `تم حذف الطلب #${orderId} بنجاح`,
        ordersCount: saved.orders.length,
        lastOrderSeq: saved.lastOrderSeq,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error deleting order" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

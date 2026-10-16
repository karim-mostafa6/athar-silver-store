import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { BUILD_ID, BUILD_TIMESTAMP, STORE_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PRIVATE_SETTING_KEYS = ["gmailAppPassword", "paymobApiKey", "adminUsers"];

function stripPrivateSettings<T extends Record<string, unknown> | undefined>(settings: T): T {
  if (!settings || typeof settings !== "object") return settings;
  const copy: Record<string, unknown> = { ...settings };
  for (const key of PRIVATE_SETTING_KEYS) delete copy[key];
  return copy as T;
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = isAuthorizedAdmin(request);
    const data = await getServerStoreData();

    // Data Privacy: Only authenticated admin can view orders & customer data
    const safeOrders = isAdmin ? data.orders : [];

    // Secrets (mail password, payment API keys, sub-admin accounts) live in the same settings
    // document the storefront reads. They must never be sent to anonymous visitors.
    const safeSettings = isAdmin ? data.settings : stripPrivateSettings(data.settings);

    const headers: Record<string, string> = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0",
    };

    return NextResponse.json(
      {
        success: true,
        isDefault: Boolean(data.isDefault),
        products: data.products,
        settings: safeSettings,
        orders: safeOrders,
        lastOrderSeq: data.lastOrderSeq || 999,
        deletedOrderIds: isAdmin ? (data.deletedOrderIds || []) : [],
        updatedAt: data.updatedAt,
        catalogVersion: data.updatedAt,
        buildId: BUILD_ID,
        buildTimestamp: BUILD_TIMESTAMP,
        version: STORE_VERSION,
      },
      {
        headers,
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading server data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security Gate: Only authenticated admin can modify server data
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل بيانات المتجر والسيرفر." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { products, settings, orders, lastOrderSeq, deletedOrderIds } = body;

    const saved = await saveServerStoreData({
      products: Array.isArray(products) ? products : undefined,
      settings: settings && typeof settings === "object" ? settings : undefined,
      orders: Array.isArray(orders) ? orders : undefined,
      lastOrderSeq: typeof lastOrderSeq === "number" ? lastOrderSeq : undefined,
      deletedOrderIds: Array.isArray(deletedOrderIds) ? deletedOrderIds : undefined,
    });

    // Instant Cache Invalidation across all Next.js rendered pages
    try {
      revalidatePath("/");
      revalidatePath("/(store)", "layout");
      revalidatePath("/admin");
      revalidatePath("/collection/[slug]", "page");
      revalidatePath("/product/[id]", "page");
    } catch (e) {
      console.warn("Revalidation notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ البيانات وتحديثها في Supabase بنجاح!",
      productsCount: saved.products.length,
      ordersCount: saved.orders.length,
      lastOrderSeq: saved.lastOrderSeq,
      updatedAt: saved.updatedAt,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving server data" },
      { status: 500 }
    );
  }
}

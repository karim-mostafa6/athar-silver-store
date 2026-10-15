import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET(request: NextRequest) {
  try {
    const isAdmin = isAuthorizedAdmin(request);
    const data = await getServerStoreData();

    // Data Privacy: Only authenticated admin can view orders & customer data
    const safeOrders = isAdmin ? data.orders : [];

    return NextResponse.json(
      {
        success: true,
        isDefault: Boolean(data.isDefault),
        products: data.products,
        settings: data.settings,
        orders: safeOrders,
        lastOrderSeq: data.lastOrderSeq || 999,
        deletedOrderIds: isAdmin ? (data.deletedOrderIds || []) : [],
        updatedAt: data.updatedAt,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading server data" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security Gate: Only authenticated admin can modify server data
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل بيانات المتجر والسيرفر." },
        { status: 401, headers: NO_CACHE_HEADERS }
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

    return NextResponse.json(
      {
        success: true,
        message: "تم حفظ البيانات وتحديثها في Supabase بنجاح!",
        productsCount: saved.products.length,
        ordersCount: saved.orders.length,
        lastOrderSeq: saved.lastOrderSeq,
        updatedAt: saved.updatedAt,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving server data" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

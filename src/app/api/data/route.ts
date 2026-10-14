import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function GET() {
  try {
    const data = await getServerStoreData();
    return NextResponse.json(
      {
        success: true,
        isDefault: Boolean(data.isDefault),
        products: data.products,
        settings: data.settings,
        orders: data.orders,
        lastOrderSeq: data.lastOrderSeq || 999,
        deletedOrderIds: data.deletedOrderIds || [],
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
        message: "تم حفظ البيانات وتحديثها مركزياً بنجاح!",
        productsCount: saved.products.length,
        ordersCount: saved.orders.length,
        lastOrderSeq: saved.lastOrderSeq,
        updatedAt: saved.updatedAt,
      },
      {
        headers: NO_CACHE_HEADERS,
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving server data" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

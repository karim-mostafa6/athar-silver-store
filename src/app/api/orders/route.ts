import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";
import { Order } from "@/context/StoreContext";

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
        orders: data.orders,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order, orders } = body;

    const current = await getServerStoreData();
    let updatedOrders: Order[];

    if (order && typeof order === "object") {
      // Append single new order to top
      updatedOrders = [order, ...current.orders.filter((o) => o.id !== order.id)];
    } else if (Array.isArray(orders)) {
      // Replace entire list
      updatedOrders = orders;
    } else {
      return NextResponse.json({ success: false, error: "Invalid order payload" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const saved = await saveServerStoreData({ orders: updatedOrders });

    return NextResponse.json(
      {
        success: true,
        message: "تم حفظ الطلب في السيرفر بنجاح!",
        ordersCount: saved.orders.length,
        updatedAt: saved.updatedAt,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving order" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: "Invalid orders array" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const saved = await saveServerStoreData({ orders });

    return NextResponse.json(
      {
        success: true,
        message: "تم تحديث كافة الطلبات مركزياً بنجاح!",
        ordersCount: saved.orders.length,
        updatedAt: saved.updatedAt,
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

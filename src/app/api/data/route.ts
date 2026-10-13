import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getServerStoreData();
    return NextResponse.json({
      success: true,
      isDefault: Boolean(data.isDefault),
      products: data.products,
      settings: data.settings,
      orders: data.orders,
      updatedAt: data.updatedAt,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading server data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products, settings, orders } = body;

    const saved = await saveServerStoreData({
      products: Array.isArray(products) ? products : undefined,
      settings: settings && typeof settings === "object" ? settings : undefined,
      orders: Array.isArray(orders) ? orders : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ البيانات وتحديثها مركزياً بنجاح!",
      productsCount: saved.products.length,
      ordersCount: saved.orders.length,
      updatedAt: saved.updatedAt,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving server data" },
      { status: 500 }
    );
  }
}

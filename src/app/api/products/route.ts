import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getServerStoreData();
    return NextResponse.json({
      success: true,
      products: data.products,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json({ success: false, error: "Invalid products array" }, { status: 400 });
    }

    const saved = await saveServerStoreData({ products });

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث كتالوج المنتجات مركزياً في السيرفر!",
      productsCount: saved.products.length,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving products" },
      { status: 500 }
    );
  }
}

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
        products: data.products,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading products" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json({ success: false, error: "Invalid products array" }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const saved = await saveServerStoreData({ products });

    return NextResponse.json(
      {
        success: true,
        message: "تم حفظ وتحديث كتالوج المنتجات مركزياً في السيرفر!",
        productsCount: saved.products.length,
        updatedAt: saved.updatedAt,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving products" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerStoreData, saveServerStoreData, saveProductsDelta, toPublicProduct } from "@/lib/serverStore";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { BUILD_ID, BUILD_TIMESTAMP, STORE_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const data = await getServerStoreData();
    const isAdmin = isAuthorizedAdmin(request);
    return NextResponse.json(
      {
        success: true,
        products: isAdmin ? data.products : data.products.map(toPublicProduct),
        buildId: BUILD_ID,
        buildTimestamp: BUILD_TIMESTAMP,
        version: STORE_VERSION,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Security Check: Only authenticated admin can update products
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل أو إضافة منتجات" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { products, upserts, deletedIds } = body;

    // Preferred: delta save (only the products that changed / were deleted).
    if (Array.isArray(upserts) || Array.isArray(deletedIds)) {
      const saved = await saveProductsDelta({
        upserts: Array.isArray(upserts) ? upserts : [],
        deletedIds: Array.isArray(deletedIds) ? deletedIds : [],
      });
      return NextResponse.json({
        success: true,
        message: "تم حفظ التعديل في قاعدة البيانات.",
        productsCount: saved.savedCount,
        deletedCount: saved.deletedCount,
        updatedAt: saved.catalogVersion,
      });
    }

    // Legacy / explicit "replace the whole catalog" (e.g. reset to defaults).
    if (!Array.isArray(products)) {
      return NextResponse.json(
        { success: false, error: "Invalid products array" },
        { status: 400 }
      );
    }

    const saved = await saveServerStoreData({ products });

    // 2. Next.js High-Performance Cache Invalidation
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
      message: "تم حفظ وتحديث كتالوج المنتجات في قاعدة بيانات Supabase وتحديث الكاش فورياً!",
      productsCount: saved.products.length,
      updatedAt: saved.updatedAt,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving products" },
      { status: 500 }
    );
  }
}

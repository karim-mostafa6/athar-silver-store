import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { externalizeInlineImages, hasInlineImages } from "@/lib/imageStorage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One-off / idempotent: moves any inline base64 images stored in the database (site settings and
 * products) to Supabase Storage and replaces them with their public URLs. Safe to call repeatedly;
 * it does nothing when there is nothing left to move.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ success: false, error: "غير مصرح." }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, migrated: 0, note: "Supabase not configured" });
  }

  try {
    const supabase = getSupabaseAdminClient();
    let migrated = 0;
    let failed = 0;

    // 1. Site settings
    const { data: row, error: readErr } = await supabase
      .from("store_settings")
      .select("settings")
      .eq("id", "primary")
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (row?.settings && hasInlineImages(row.settings)) {
      const res = await externalizeInlineImages(row.settings, "site");
      migrated += res.migrated;
      failed += res.failed;
      if (res.migrated > 0) {
        const { error } = await supabase
          .from("store_settings")
          .update({ settings: res.value, updated_at: new Date().toISOString() })
          .eq("id", "primary");
        if (error) throw new Error(error.message);
      }
    }

    // 2. Products
    const { data: prodRows, error: prodErr } = await supabase.from("products").select("id, images");
    if (prodErr) throw new Error(prodErr.message);
    for (const p of prodRows || []) {
      if (!hasInlineImages(p.images)) continue;
      const res = await externalizeInlineImages(p.images, "products");
      migrated += res.migrated;
      failed += res.failed;
      if (res.migrated > 0) {
        const { error } = await supabase
          .from("products")
          .update({ images: res.value, updated_at: new Date().toISOString() })
          .eq("id", p.id);
        if (error) throw new Error(error.message);
      }
    }

    return NextResponse.json({ success: true, migrated, failed });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Migration failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import { isAuthorizedAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type") as string) || "product";

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
    }

    // 1. Security Check: Customers can upload payment receipts; general product uploads require admin auth
    const isReceipt = uploadType === "receipt";
    if (!isReceipt && !isAuthorizedAdmin(request)) {
      return NextResponse.json({ error: "غير مصرح لك برفع صور المنتجات" }, { status: 401 });
    }

    // 2. Strict File Validation
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const mime = file.type || "image/jpeg";
    if (!allowedMimes.includes(mime.toLowerCase())) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WebP" },
        { status: 400 }
      );
    }

    // Limit size to 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique safe filename
    const originalName = file.name || "image.jpg";
    const ext = path.extname(originalName) || ".jpg";
    const cleanExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : ".jpg";
    const uniqueName = `athar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;

    // 3. Upload to Supabase Storage (product-images bucket)
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdminClient();
      const storagePath = isReceipt ? `receipts/${uniqueName}` : `products/${uniqueName}`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(storagePath, buffer, {
          contentType: mime,
          upsert: true,
          cacheControl: "31536000", // 1 year cache
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          fileName: uniqueName,
          size: file.size,
          storage: "supabase",
        });
      } else if (error) {
        console.warn("Supabase Storage upload warning:", error);
      }
    }

    // 4. Local Disk Fallback (For local development if Supabase Storage bucket is not ready)
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueName}`,
        fileName: uniqueName,
        size: file.size,
        storage: "local",
      });
    } catch {
      return NextResponse.json(
        { error: "فشل حفظ الصورة في السيرفر أو السحابة. تأكد من تفعيل Storage في Supabase" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "حدث خطأ غير متوقع أثناء رفع الصورة" }, { status: 500 });
  }
}

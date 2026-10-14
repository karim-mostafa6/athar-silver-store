import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize extension and create unique filename
    const originalName = file.name || "image.jpg";
    const ext = path.extname(originalName) || ".jpg";
    const cleanExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : ".jpg";
    const uniqueName = `athar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;

    // Try saving to disk (works in local dev), fallback to base64 DataURL (works on Vercel)
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
      });
    } catch (fsErr) {
      // Running on Vercel or read-only container: convert to Base64 Data URL
      console.warn("Filesystem read-only (e.g. Vercel), returning Data URL fallback:", fsErr);
      const mime = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${mime};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: uniqueName,
        size: file.size,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

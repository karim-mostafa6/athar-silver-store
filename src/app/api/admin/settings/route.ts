import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSettings, saveServerSettings } from "@/lib/serverSettings";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { hashAdminUserPasswords } from "@/lib/passwordHash";

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
    const emailSettings = getServerSettings();
    const storeData = await getServerStoreData({ skipOrders: true });

    return NextResponse.json(
      {
        success: true,
        senderEmail: emailSettings.senderEmail,
        senderEmailName: emailSettings.senderEmailName,
        hasAppPassword: Boolean(emailSettings.gmailAppPassword && emailSettings.gmailAppPassword.length >= 10),
        // Only return real app password if authorized admin
        gmailAppPassword: isAdmin ? emailSettings.gmailAppPassword : "",
        // Anonymous visitors must never receive secrets stored inside the settings document.
        settings: isAdmin
          ? storeData.settings
          : Object.fromEntries(
              Object.entries(storeData.settings || {}).filter(
                ([k]) => !["gmailAppPassword", "paymobApiKey", "adminUsers"].includes(k)
              )
            ),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading settings" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security check: Only authorized admin can update settings
    if (!isAuthorizedAdmin(request)) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل إعدادات المتجر." },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { senderEmail, senderEmailName, gmailAppPassword, settings } = body;

    const savedEmail = saveServerSettings({
      senderEmail: senderEmail || (settings && settings.senderEmail),
      senderEmailName: senderEmailName || (settings && settings.senderEmailName),
      gmailAppPassword: gmailAppPassword || (settings && settings.gmailAppPassword),
      logoImageUrl: settings && settings.logoImageUrl,
      logoType: settings && settings.logoType,
      logoHeight: settings && settings.logoHeight,
      brandNameArabic: settings && settings.brandNameArabic,
      brandNameEnglish: settings && settings.brandNameEnglish,
      brandSubtitle: settings && settings.brandSubtitle,
    });

    let savedData;
    if (settings && typeof settings === "object") {
      // Never persist plain-text sub-admin passwords.
      if (Array.isArray(settings.adminUsers)) {
        settings.adminUsers = hashAdminUserPasswords(settings.adminUsers);
      }
      savedData = await saveServerStoreData({ settings });
    }

    try {
      revalidatePath("/");
      revalidatePath("/(store)", "layout");
      revalidatePath("/admin");
      revalidatePath("/collection/[slug]", "page");
      revalidatePath("/product/[id]", "page");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "تم حفظ الإعدادات وتحديثها في Supabase بنجاح!",
        senderEmail: savedEmail.senderEmail,
        senderEmailName: savedEmail.senderEmailName,
        hasAppPassword: Boolean(savedEmail.gmailAppPassword && savedEmail.gmailAppPassword.length >= 10),
        updatedAt: savedData ? savedData.updatedAt : new Date().toISOString(),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving settings" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSettings, saveServerSettings } from "@/lib/serverSettings";
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
    const emailSettings = getServerSettings();
    const storeData = await getServerStoreData();

    return NextResponse.json(
      {
        success: true,
        senderEmail: emailSettings.senderEmail,
        senderEmailName: emailSettings.senderEmailName,
        hasAppPassword: Boolean(emailSettings.gmailAppPassword && emailSettings.gmailAppPassword.length >= 10),
        gmailAppPassword: emailSettings.gmailAppPassword,
        settings: storeData.settings,
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
    const body = await request.json();
    const { senderEmail, senderEmailName, gmailAppPassword, settings } = body;

    const savedEmail = saveServerSettings({
      senderEmail: senderEmail || (settings && settings.senderEmail),
      senderEmailName: senderEmailName || (settings && settings.senderEmailName),
      gmailAppPassword: gmailAppPassword || (settings && settings.gmailAppPassword),
    });

    let savedData;
    if (settings && typeof settings === "object") {
      savedData = await saveServerStoreData({ settings });
    }

    return NextResponse.json(
      {
        success: true,
        message: "تم حفظ الإعدادات وتحديثها مركزياً بنجاح!",
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

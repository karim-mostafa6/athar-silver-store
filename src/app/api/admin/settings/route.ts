import { NextRequest, NextResponse } from "next/server";
import { getServerSettings, saveServerSettings } from "@/lib/serverSettings";

export async function GET() {
  try {
    const settings = getServerSettings();
    return NextResponse.json({
      success: true,
      senderEmail: settings.senderEmail,
      senderEmailName: settings.senderEmailName,
      hasAppPassword: Boolean(settings.gmailAppPassword && settings.gmailAppPassword.length >= 10),
      gmailAppPassword: settings.gmailAppPassword,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error reading settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderEmail, senderEmailName, gmailAppPassword } = body;

    const saved = saveServerSettings({
      senderEmail,
      senderEmailName,
      gmailAppPassword,
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ إعدادات البريد وكلمة المرور في السيرفر بنجاح!",
      senderEmail: saved.senderEmail,
      senderEmailName: saved.senderEmailName,
      hasAppPassword: Boolean(saved.gmailAppPassword && saved.gmailAppPassword.length >= 10),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error saving settings" },
      { status: 500 }
    );
  }
}

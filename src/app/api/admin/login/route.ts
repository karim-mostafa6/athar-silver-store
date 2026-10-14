import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    
    // Check rate limit
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم قفل محاولات تسجيل الدخول مؤقتاً لحماية المتجر. يرجى الانتظار ${rateCheck.waitSeconds} ثانية.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    const trimmedUser = (username || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const isValid =
      (trimmedUser === "karim mostafa" && cleanPass === "Kk5019Kk@#$&") ||
      (trimmedUser === "admin" && cleanPass === "athar2026") ||
      (trimmedUser === "admin" && cleanPass === "admin");

    if (!isValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    // Success! Reset failed attempts and issue signed secure token
    resetFailedAttempts(ip);
    const token = generateAdminToken(trimmedUser);

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: trimmedUser,
    });

    // Set secure cookie
    response.cookies.set("athar_admin_token", token, {
      httpOnly: false, // Accessible to client if needed
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء معالجة تسجيل الدخول" },
      { status: 500 }
    );
  }
}

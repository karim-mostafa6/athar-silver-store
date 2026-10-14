import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from "@/lib/adminAuth";

import { getServerStoreData } from "@/lib/serverStore";

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

    // Strictly block generic 'admin' usernames
    if (!trimmedUser || !cleanPass || trimmedUser === "admin") {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    let authenticatedUser: {
      username: string;
      name: string;
      role: "super_admin" | "orders_customers" | "store_editor" | "all";
    } | null = null;

    // 1. Check Primary Master Super Admin (Karim Mostafa)
    if (trimmedUser === "karim mostafa" && cleanPass === "Kk5019Kk@#$&") {
      authenticatedUser = {
        username: "karim mostafa",
        name: "كريم مصطفى",
        role: "super_admin",
      };
    } else {
      // 2. Check Custom Sub-Admins in Central Store Settings
      try {
        const storeData = await getServerStoreData();
        const subUsers = storeData.settings?.adminUsers || [];
        const found = subUsers.find(
          (u) =>
            u.username.toLowerCase().trim() === trimmedUser &&
            u.password === cleanPass &&
            u.isActive !== false
        );

        if (found) {
          authenticatedUser = {
            username: found.username,
            name: found.name || found.username,
            role: found.role,
          };
        }
      } catch (err) {
        console.error("Error reading store settings for user authentication:", err);
      }
    }

    if (!authenticatedUser) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: "اسم المستخدم أو كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    // Success! Reset failed attempts and issue signed secure token
    resetFailedAttempts(ip);
    const token = generateAdminToken(authenticatedUser.username);

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: authenticatedUser,
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

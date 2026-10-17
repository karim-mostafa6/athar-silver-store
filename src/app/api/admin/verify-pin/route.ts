import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData } from "@/lib/serverStore";
import { generateAdminToken, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from "@/lib/adminAuth";
import { rateLimit, clientIp, safeEqual } from "@/lib/rateLimit";
import { verifyPassword } from "@/lib/passwordHash";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!(await rateLimit("pin", ip, 12, 900))) {
      return NextResponse.json({ success: false, valid: false, error: "محاولات كتير. استنى 15 دقيقة." }, { status: 429 });
    }
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, valid: false, error: `تم قفل المحاولات مؤقتاً. يرجى الانتظار ${rate.waitSeconds} ثانية.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = body;

    const entered = (password || "").trim();
    // Only the ADMIN_PASSWORD env var is accepted; no built-in fallback passwords exist.
    const masterPassword = (process.env.ADMIN_PASSWORD || "").trim();

    let username = "karim mostafa";

    // 1. Check Master Super Admin Password
    let isValid = masterPassword.length > 0 && safeEqual(entered, masterPassword);

    // 2. Check Sub-users if not matched
    if (!isValid) {
      try {
        const storeData = await getServerStoreData({ skipOrders: true });
        const subUsers = storeData.settings?.adminUsers || [];
        const found = subUsers.find((u) => u.isActive !== false && verifyPassword(entered, u.password).ok);
        if (found) {
          isValid = true;
          username = found.username;
        }
      } catch {}
    }

    if (isValid) {
      resetFailedAttempts(ip);
      const token = generateAdminToken(username);
      const res = NextResponse.json({ success: true, valid: true, token });
      res.cookies.set("orma_admin_token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
      res.cookies.set("athar_admin_token", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
      return res;
    } else {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, valid: false, error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, error: "فشل التحقق من كلمة المرور" }, { status: 500 });
  }
}

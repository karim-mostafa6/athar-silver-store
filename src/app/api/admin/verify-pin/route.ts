import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData } from "@/lib/serverStore";
import { generateAdminToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const entered = (password || "").trim();
    const masterPassword = process.env.ADMIN_PASSWORD || "Kk5019Kk@#$&";

    let username = "karim mostafa";

    // 1. Check Master Super Admin Password
    let isValid =
      entered === masterPassword ||
      entered === "athar2026" ||
      entered === "orma2026" ||
      entered === "admin";

    // 2. Check Sub-users if not matched
    if (!isValid) {
      try {
        const storeData = await getServerStoreData();
        const subUsers = storeData.settings?.adminUsers || [];
        const found = subUsers.find((u) => u.password === entered && u.isActive !== false);
        if (found) {
          isValid = true;
          username = found.username;
        }
      } catch {}
    }

    if (isValid) {
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
      return NextResponse.json(
        { success: false, valid: false, error: "كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, error: "فشل التحقق من كلمة المرور" }, { status: 500 });
  }
}

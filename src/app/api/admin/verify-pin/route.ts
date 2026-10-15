import { NextRequest, NextResponse } from "next/server";
import { getServerStoreData } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const entered = (password || "").trim();
    const masterPassword = process.env.ADMIN_PASSWORD || "Kk5019Kk@#$&";

    // 1. Check Master Super Admin Password
    let isValid = entered === masterPassword;

    // 2. Check Sub-users if not matched
    if (!isValid) {
      try {
        const storeData = await getServerStoreData();
        const subUsers = storeData.settings?.adminUsers || [];
        isValid = subUsers.some((u) => u.password === entered && u.isActive !== false);
      } catch {}
    }

    if (isValid) {
      return NextResponse.json({ success: true, valid: true });
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

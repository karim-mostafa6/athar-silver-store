import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from "@/lib/adminAuth";
import { getServerStoreData, saveServerStoreData } from "@/lib/serverStore";
import { verifyPassword, hashPassword } from "@/lib/passwordHash";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";

    // 1. Check brute-force rate limit
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

    // Block empty usernames or passwords
    if (!trimmedUser || !cleanPass) {
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

    // 2. Option A: Authenticate via Supabase Auth (if user passed email & Supabase is enabled)
    if (isSupabaseConfigured() && trimmedUser.includes("@")) {
      try {
        const supabase = getSupabaseAdminClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password: cleanPass,
        });

        if (!error && data?.user) {
          authenticatedUser = {
            username: data.user.email || trimmedUser,
            name: data.user.user_metadata?.full_name || "مدير النظام",
            role: "super_admin",
          };
        }
      } catch (authErr) {
        console.warn("Supabase auth check notice:", authErr);
      }
    }

    // 3. Option B: Check Server-Side Master Admin Credentials (from Environment Variables)
    if (!authenticatedUser) {
      // The master password only ever comes from the ADMIN_PASSWORD environment variable.
      // There are no built-in fallback passwords: if it is not set, master login is disabled.
      const expectedMasterUser = (process.env.ADMIN_USER || "karim mostafa").trim().toLowerCase();
      const expectedMasterPass = (process.env.ADMIN_PASSWORD || "").trim();

      if (
        expectedMasterPass.length > 0 &&
        ((trimmedUser === expectedMasterUser && cleanPass === expectedMasterPass) ||
          (trimmedUser === "admin" && cleanPass === expectedMasterPass))
      ) {
        authenticatedUser = {
          username: trimmedUser === "admin" ? "admin" : "karim mostafa",
          name: trimmedUser === "admin" ? "مدير المتجر" : "كريم مصطفى",
          role: "super_admin",
        };
      }
    }

    // 4. Option C: Check Custom Sub-Admins stored in Supabase / Store Settings
    if (!authenticatedUser) {
      try {
        const storeData = await getServerStoreData();
        const subUsers = storeData.settings?.adminUsers || [];
        let legacyMatch = false;
        const found = subUsers.find((u) => {
          if (u.username.toLowerCase().trim() !== trimmedUser || u.isActive === false) return false;
          const check = verifyPassword(cleanPass, u.password);
          if (check.ok && check.legacy) legacyMatch = true;
          return check.ok;
        });

        // First successful login of an old plain-text account: store it hashed from now on.
        if (found && legacyMatch && storeData.settings) {
          try {
            const upgraded = subUsers.map((u) =>
              u.id === found.id ? { ...u, password: hashPassword(cleanPass) } : u
            );
            await saveServerStoreData({ settings: { ...storeData.settings, adminUsers: upgraded } });
          } catch (upErr) {
            console.warn("Could not upgrade sub-admin password hash:", upErr);
          }
        }

        if (found) {
          authenticatedUser = {
            username: found.username,
            name: found.name || found.username,
            role: found.role,
          };
        }
      } catch (err) {
        console.error("Error checking sub-users:", err);
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

    // Set secure cookies for both orma and athar namespaces
    response.cookies.set("orma_admin_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("athar_admin_token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ غير متوقع أثناء تسجيل الدخول." }, { status: 500 });
  }
}

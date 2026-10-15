import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read Supabase credentials securely from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 20
  );
}

// 1. Client-Side / Public Supabase Client (Protected by Row Level Security)
let publicClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (publicClientInstance) return publicClientInstance;

  if (!isSupabaseConfigured()) {
    // Return a dummy client in dev/build if not configured yet to prevent build crashes
    publicClientInstance = createClient(
      supabaseUrl || "https://placeholder-project.supabase.co",
      supabaseAnonKey || "placeholder-anon-key",
      {
        auth: {
          persistSession: typeof window !== "undefined",
        },
      }
    );
    return publicClientInstance;
  }

  publicClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: typeof window !== "undefined",
    },
  });

  return publicClientInstance;
}

export const supabase = getSupabaseClient();

// 2. Server-Side Admin Supabase Client (Uses SERVICE_ROLE_KEY - Never exposed to browser!)
let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (adminClientInstance) return adminClientInstance;

  const key = supabaseServiceKey || supabaseAnonKey;

  adminClientInstance = createClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    key || "placeholder-service-key",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return adminClientInstance;
}

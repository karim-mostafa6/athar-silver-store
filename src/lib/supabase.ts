import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getCleanSupabaseConfig() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  const isValidUrl =
    url.length > 0 &&
    (url.startsWith("https://") || url.startsWith("http://")) &&
    !url.includes("your-project-id");

  const isValidAnonKey = anonKey.length > 20 && !anonKey.includes("your-anon-public-key");
  const isValidServiceKey = serviceKey.length > 20 && !serviceKey.includes("your-service-role-secret-key");

  return {
    url,
    anonKey,
    serviceKey,
    isConfigured: isValidUrl && (isValidAnonKey || isValidServiceKey),
  };
}

export function isSupabaseConfigured(): boolean {
  return getCleanSupabaseConfig().isConfigured;
}

// 1. Client-Side / Public Supabase Client (Protected by Row Level Security)
let publicClientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (publicClientInstance) return publicClientInstance;

  const { url, anonKey, isConfigured } = getCleanSupabaseConfig();

  if (!isConfigured) {
    // Return a dummy safe client in build / unconfigured environments
    publicClientInstance = createClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key-placeholder-anon-key",
      {
        auth: {
          persistSession: typeof window !== "undefined",
        },
      }
    );
    return publicClientInstance;
  }

  publicClientInstance = createClient(url, anonKey, {
    auth: {
      persistSession: typeof window !== "undefined",
    },
  });

  return publicClientInstance;
}

// Lazy proxy for supabase singleton so createClient is NEVER called at top-level import time!
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

// 2. Server-Side Admin Supabase Client (Uses SERVICE_ROLE_KEY - Never exposed to browser!)
let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (adminClientInstance) return adminClientInstance;

  const { url, anonKey, serviceKey, isConfigured } = getCleanSupabaseConfig();
  const effectiveKey = serviceKey || anonKey;

  if (!isConfigured || !effectiveKey) {
    adminClientInstance = createClient(
      "https://placeholder-project.supabase.co",
      "placeholder-service-key-placeholder-service-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
    return adminClientInstance;
  }

  adminClientInstance = createClient(url, effectiveKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClientInstance;
}


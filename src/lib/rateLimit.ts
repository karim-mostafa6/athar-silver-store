import { NextRequest } from "next/server";
import crypto from "crypto";
import { getSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase";

const mem = new Map<string, number[]>();

function memLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (mem.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    mem.set(key, arr);
    return false;
  }
  arr.push(now);
  mem.set(key, arr);
  if (mem.size > 5000) for (const k of Array.from(mem.keys()).slice(0, 1000)) mem.delete(k);
  return true;
}

/** Client IP as seen by the platform (Vercel overwrites x-forwarded-for, so the first hop is trustworthy). */
export function clientIp(request: NextRequest): string {
  return (
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Shared (database-backed) rate limit, so the limit holds across all serverless instances.
 * Returns true when the request is allowed. Falls back to per-instance memory if the DB is unreachable.
 */
export async function rateLimit(bucket: string, id: string, max: number, windowSec: number): Promise<boolean> {
  const key = `${bucket}:${crypto.createHash("sha256").update(id).digest("hex").slice(0, 24)}`;
  if (!isSupabaseConfigured()) return memLimit(key, max, windowSec * 1000);
  try {
    const { data, error } = await getSupabaseAdminClient().rpc("rl_hit", {
      p_key: key,
      p_max: max,
      p_window_sec: windowSec,
    });
    if (error) return memLimit(key, max, windowSec * 1000);
    return data !== false;
  } catch {
    return memLimit(key, max, windowSec * 1000);
  }
}

/** Constant-time string comparison (hashes first so lengths never leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

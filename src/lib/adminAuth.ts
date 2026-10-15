import { NextRequest } from "next/server";
import crypto from "crypto";

// Server-side secure secret
const ADMIN_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_JWT_SECRET ||
  "athar-silver-store-hyper-secure-key-2026";

// Rate limiting state for login attempts (in-memory per serverless instance)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function generateAdminToken(username: string): string {
  const timestamp = Date.now();
  const cleanUser = username.trim().toLowerCase();
  const b64User = Buffer.from(cleanUser).toString("base64");
  const raw = `${cleanUser}:${timestamp}:${ADMIN_SECRET}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return `${timestamp}.${b64User}.${hash}`;
}

export function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    // Support 3-part token: timestamp.b64User.hash
    if (parts.length === 3) {
      const [timestampStr, b64User, providedHash] = parts;
      const timestamp = parseInt(timestampStr, 10);
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > maxAge) return false;

      const username = Buffer.from(b64User, "base64").toString("utf-8").toLowerCase().trim();
      if (!username) return false;

      const raw = `${username}:${timestamp}:${ADMIN_SECRET}`;
      const expectedHash = crypto.createHash("sha256").update(raw).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash));
    }

    // Support legacy 2-part token: only allow master admin "karim mostafa" or "admin"
    if (parts.length === 2) {
      const [timestampStr, providedHash] = parts;
      const timestamp = parseInt(timestampStr, 10);
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > maxAge) return false;

      const raw = `karim mostafa:${timestamp}:${ADMIN_SECRET}`;
      const expectedHash = crypto.createHash("sha256").update(raw).digest("hex");
      if (crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHash))) return true;

      const rawAdmin = `admin:${timestamp}:${ADMIN_SECRET}`;
      const expectedHashAdmin = crypto.createHash("sha256").update(rawAdmin).digest("hex");
      return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedHashAdmin));
    }

    return false;
  } catch {
    return false;
  }
}

export function isAuthorizedAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (verifyAdminToken(token)) return true;
  }

  const customHeader =
    request.headers.get("x-orma-admin-token") ||
    request.headers.get("x-athar-admin-token");
  if (customHeader && verifyAdminToken(customHeader)) return true;

  const cookieToken =
    request.cookies.get("orma_admin_token")?.value ||
    request.cookies.get("athar_admin_token")?.value;
  if (cookieToken && verifyAdminToken(cookieToken)) return true;

  return false;
}

export function checkRateLimit(ip: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return { allowed: true };

  // If locked for 15 minutes after 5 failed attempts
  if (record.count >= 5) {
    const timePassed = now - record.lastAttempt;
    const lockDuration = 15 * 60 * 1000;
    if (timePassed < lockDuration) {
      const waitSeconds = Math.ceil((lockDuration - timePassed) / 1000);
      return { allowed: false, waitSeconds };
    } else {
      // Reset after lock period expires
      failedAttempts.delete(ip);
      return { allowed: true };
    }
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  failedAttempts.set(ip, record);
}

export function resetFailedAttempts(ip: string) {
  failedAttempts.delete(ip);
}

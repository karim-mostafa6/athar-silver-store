import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Sub-admin passwords are stored as "scrypt$<salt hex>$<hash hex>" instead of plain text.
const PREFIX = "scrypt$";

export function isHashedPassword(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PREFIX) && value.split("$").length === 3;
}

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 32);
  return `${PREFIX}${salt.toString("hex")}$${hash.toString("hex")}`;
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Checks a password against a stored value. Accepts the hashed format and, for
 * accounts that have not been migrated yet, the old plain-text value.
 */
export function verifyPassword(plain: string, stored: unknown): { ok: boolean; legacy: boolean } {
  if (typeof stored !== "string" || !stored || !plain) return { ok: false, legacy: false };
  if (isHashedPassword(stored)) {
    const [, saltHex, hashHex] = stored.split("$");
    try {
      const expected = Buffer.from(hashHex, "hex");
      const actual = scryptSync(plain, Buffer.from(saltHex, "hex"), expected.length);
      return { ok: safeEqual(actual, expected), legacy: false };
    } catch {
      return { ok: false, legacy: false };
    }
  }
  return { ok: safeEqual(Buffer.from(plain), Buffer.from(stored)), legacy: true };
}

/** Hashes every plain-text sub-admin password in a settings object (already hashed ones are kept). */
export function hashAdminUserPasswords<T extends { password?: string }>(users: T[] | undefined): T[] | undefined {
  if (!Array.isArray(users)) return users;
  return users.map((u) =>
    u && typeof u.password === "string" && u.password && !isHashedPassword(u.password)
      ? { ...u, password: hashPassword(u.password) }
      : u
  );
}

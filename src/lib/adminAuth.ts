import crypto from "crypto";

export const ADMIN_COOKIE = "admin_session";

export function adminToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const expected = adminToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

// The cookie check every admin route starts with, in one place.
export async function isAdminRequest(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
}

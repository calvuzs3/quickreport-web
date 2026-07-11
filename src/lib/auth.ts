import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev_secret_change_in_production"
);

// quickreport_session: HMAC-signed JWT containing { role } — the role value was
// obtained from Ktor at login time and cannot be tampered without SESSION_SECRET.
// quickreport_token:   raw Ktor JWT forwarded on every backend call.
const SESSION_COOKIE = "quickreport_session";
const TOKEN_COOKIE = "quickreport_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days, matching Ktor expiry

export interface Session {
  token: string;
  role: string;
}

// ─── Save session ─────────────────────────────────────────────────────────────

export async function saveSession(token: string, role = "TECHNICIAN"): Promise<void> {
  // Sign { role } with our own secret. The role value came directly from Ktor's
  // /auth/login response — this is the "real" value, now cryptographically bound.
  const signed = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);

  const store = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
  store.set(SESSION_COOKIE, signed, opts);
  store.set(TOKEN_COOKIE, token, opts);
}

// ─── Clear session ────────────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(TOKEN_COOKIE);
}

// ─── Verified session ─────────────────────────────────────────────────────────

// Verifies the HMAC signature of the session cookie. Returns null if missing,
// tampered, or expired — never trusts the raw JWT payload without verification.
export async function getVerifiedSession(): Promise<Session | null> {
  const store = await cookies();
  const signed = store.get(SESSION_COOKIE)?.value;
  const token = store.get(TOKEN_COOKIE)?.value;

  if (!signed || !token) return null;

  try {
    const { payload } = await jwtVerify(signed, SECRET);
    return { token, role: (payload.role as string) ?? "TECHNICIAN" };
  } catch {
    return null;
  }
}

// ─── Raw Ktor token (for proxy.ts and api.ts) ────────────────────────────────

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

// ─── Guards ───────────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<Session> {
  const session = await getVerifiedSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export function isAdminRole(role: string): boolean {
  return role === "ADMIN";
}

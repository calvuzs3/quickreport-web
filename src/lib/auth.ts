import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev_secret_change_in_production"
);

const COOKIE_NAME = "qreport_token";
const COOKIE_ROLE = "qreport_role";
// 30 days, matching Ktor token expiry
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// ─── Save the Ktor JWT token + role in secure cookies ────────────────────────

export async function saveSession(token: string, role = "TECHNICIAN"): Promise<void> {
  const store = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
  store.set(COOKIE_NAME, token, opts);
  store.set(COOKIE_ROLE, role, opts);
}

// ─── Clear session cookies ────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(COOKIE_ROLE);
}

// ─── Get role (ADMIN | TECHNICIAN) ───────────────────────────────────────────

export async function getSessionRole(): Promise<string> {
  const store = await cookies();
  return store.get(COOKIE_ROLE)?.value ?? "TECHNICIAN";
}

// ─── Get raw token (used by api.ts) ──────────────────────────────────────────

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

// ─── Require auth — redirect to /login if no token ───────────────────────────

export async function requireAuth(): Promise<string> {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }
  return token;
}
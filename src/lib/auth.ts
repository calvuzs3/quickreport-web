import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev_secret_change_in_production"
);

const COOKIE_NAME = "qreport_token";
// 30 days, matching Ktor token expiry
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

// ─── Save the Ktor JWT token in a secure cookie ───────────────────────────────

export async function saveSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

// ─── Clear session cookie ─────────────────────────────────────────────────────

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
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
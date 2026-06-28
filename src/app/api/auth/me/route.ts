import { NextResponse } from "next/server";
import { getVerifiedSession, clearSession } from "@/lib/auth";
import { KTOR_URL } from "@/lib/config";

// Verifies the current session and confirms the Ktor token is still accepted.
// Returns { role } on success or 401 if the session is invalid/expired.
//
// Ktor verification: a lightweight GET on /api/clients (size=1) is used to
// confirm the bearer token is still valid server-side, without reading JWT
// claims from the token itself. If Ktor rejects it, the session is cleared.
export async function GET() {
  const session = await getVerifiedSession();

  if (!session) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  // Verify the Ktor token is still accepted (not expired/revoked on the server)
  try {
    const ktorRes = await fetch(`${KTOR_URL}/api/clients?size=1`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });

    if (ktorRes.status === 401) {
      await clearSession();
      return NextResponse.json(
        { error: "Sessione scaduta. Esegui nuovamente il login." },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error(`[auth/me] Impossibile raggiungere ${KTOR_URL}:`, err);
    return NextResponse.json(
      { error: `Impossibile raggiungere il server Ktor (${KTOR_URL}). Verificare che il server sia attivo.` },
      { status: 502 }
    );
  }

  return NextResponse.json({ role: session.role, ktorReachable: true });
}

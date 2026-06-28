import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";
import { KTOR_URL } from "@/lib/config";

// ─── Forward a request to the Ktor backend ────────────────────────────────────

export async function proxyRequest(
  req: NextRequest,
  ktorPath: string
): Promise<NextResponse> {
  const token = await getSessionToken();

  if (!token) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  // Preserve query string
  const url = new URL(req.url);
  const targetUrl = `${KTOR_URL}${ktorPath}${url.search}`;

  try {
    const body =
      req.method !== "GET" && req.method !== "DELETE"
        ? await req.text()
        : undefined;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err) {
    console.error(`[proxy] Impossibile raggiungere ${KTOR_URL}${ktorPath}:`, err);
    return NextResponse.json(
      { error: `Impossibile raggiungere il server Ktor (${KTOR_URL}). Verificare che il server sia attivo.` },
      { status: 502 }
    );
  }
}
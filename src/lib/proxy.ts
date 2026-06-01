import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth";

const KTOR_URL = process.env.KTOR_API_URL ?? "http://192.168.0.191:8080";

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
    console.error("[proxy]", ktorPath, err);
    return NextResponse.json(
      { error: "Errore di connessione al server" },
      { status: 502 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "@/lib/auth";

const KTOR_URL = process.env.KTOR_API_URL ?? "http://192.168.0.191:8080";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const ktorRes = await fetch(`${KTOR_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!ktorRes.ok) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    const { token } = await ktorRes.json();
    await saveSession(token);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json(
      { error: "Errore di connessione al server" },
      { status: 502 }
    );
  }
}
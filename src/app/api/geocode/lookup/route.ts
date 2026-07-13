import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth";
import { reverseGeocode, forwardGeocode } from "@/lib/nominatim";

// Resolves a pasted Google Maps link or free-text address into structured
// address fields + coordinates. Links are matched for embedded coordinates
// first (most accurate); short links (maps.app.goo.gl) are resolved via a
// server-side redirect fetch first since they carry no coordinates themselves.

const COORD_PATTERNS = [
  /@(-?\d+\.\d+),(-?\d+\.\d+)/, // .../place/.../@45.4642,9.19,17z/...
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // coords embedded in the data blob
  /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, // maps.google.com/?q=45.4642,9.19
];

function extractCoords(url: string): { lat: number; lon: number } | null {
  for (const pattern of COORD_PATTERNS) {
    const m = url.match(pattern);
    if (m) return { lat: parseFloat(m[1]), lon: parseFloat(m[2]) };
  }
  return null;
}

function extractPlaceName(url: string): string | null {
  const m = url.match(/\/maps\/place\/([^/@]+)/);
  if (!m) return null;
  return decodeURIComponent(m[1].replace(/\+/g, " "));
}

async function resolveShortLink(url: string): Promise<string> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.url || url;
  } catch {
    return url;
  }
}

function looksLikeUrl(input: string): boolean {
  return /^https?:\/\//i.test(input.trim());
}

export async function GET(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Parametro q mancante" }, { status: 400 });
  }

  try {
    if (looksLikeUrl(q)) {
      const url = /goo\.gl/i.test(q) ? await resolveShortLink(q) : q;

      const coords = extractCoords(url);
      if (coords) {
        return NextResponse.json(await reverseGeocode(coords.lat, coords.lon));
      }

      const placeName = extractPlaceName(url);
      if (placeName) {
        const result = await forwardGeocode(placeName);
        if (result) return NextResponse.json(result);
      }

      return NextResponse.json({ error: "Impossibile estrarre un indirizzo dal link" }, { status: 422 });
    }

    const result = await forwardGeocode(q);
    if (!result) {
      return NextResponse.json({ error: "Nessun indirizzo trovato" }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Errore di geocoding" },
      { status: 502 }
    );
  }
}

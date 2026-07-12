import { NextRequest, NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth";
import { reverseGeocode } from "@/lib/nominatim";

// Reverse-geocodes GPS coordinates into an address via Nominatim (OpenStreetMap).

export async function GET(req: NextRequest) {
  const session = await getVerifiedSession();
  if (!session) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "Parametri lat/lon mancanti" }, { status: 400 });
  }

  try {
    const result = await reverseGeocode(parseFloat(lat), parseFloat(lon));
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Errore di connessione al servizio di geocoding" },
      { status: 502 }
    );
  }
}

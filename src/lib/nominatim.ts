// Server-only helpers for Nominatim (OpenStreetMap) geocoding — free, no API key,
// but requires an identifying User-Agent per their usage policy.

const USER_AGENT = "quickreport-web/1.0 (+https://github.com/calvuzs3/quickreport-web)";

interface NominatimAddress {
  road?: string;
  house_number?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  province?: string;
  county?: string;
  country?: string;
}

export interface GeocodeResult {
  street: string | null;
  streetNumber: string | null;
  postalCode: string | null;
  city: string | null;
  province: string | null;
  country: string;
  latitude: number;
  longitude: number;
}

function mapAddress(a: NominatimAddress) {
  return {
    street: a.road ?? null,
    streetNumber: a.house_number ?? null,
    postalCode: a.postcode ?? null,
    city: a.city ?? a.town ?? a.village ?? a.municipality ?? null,
    province: (a.province ?? a.county ?? "").replace(/^Provincia di\s+/i, "") || null,
    country: a.country ?? "Italia",
  };
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=it`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!res.ok) throw new Error("Servizio di geocoding non disponibile");
  const data = await res.json();
  return { ...mapAddress(data.address ?? {}), latitude: lat, longitude: lon };
}

export async function forwardGeocode(query: string): Promise<GeocodeResult | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&addressdetails=1&limit=1&accept-language=it`,
    { headers: { "User-Agent": USER_AGENT } }
  );
  if (!res.ok) throw new Error("Servizio di geocoding non disponibile");
  const results = await res.json();
  const first = results?.[0];
  if (!first) return null;
  return { ...mapAddress(first.address ?? {}), latitude: parseFloat(first.lat), longitude: parseFloat(first.lon) };
}

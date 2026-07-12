import type { Address, GeoCoordinates } from "@/types";

// Mirrors AddressConverter.kt in the Android app: only non-blank fields are
// kept, country defaults to "Italia", entirely empty addresses serialize to null.

export function parseAddress(json: string | null | undefined): Address | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as Address;
  } catch {
    return null;
  }
}

export function serializeAddress(address: Address | null | undefined): string | null {
  if (!address) return null;
  const { street, streetNumber, postalCode, city, province, country, coordinates, notes } = address;
  if (!street && !streetNumber && !postalCode && !city && !province && !coordinates && !notes) {
    return null;
  }
  const payload: Address = { country: country || "Italia" };
  if (street) payload.street = street;
  if (streetNumber) payload.streetNumber = streetNumber;
  if (postalCode) payload.postalCode = postalCode;
  if (city) payload.city = city;
  if (province) payload.province = province;
  if (coordinates) payload.coordinates = coordinates;
  if (notes) payload.notes = notes;
  return JSON.stringify(payload);
}

// Mirrors Address.toDisplayString() in the Android app.
export function formatAddress(address: Address | null | undefined): string {
  if (!address) return "";
  const parts: string[] = [];

  let line = address.street ?? "";
  if (line && address.streetNumber) line += ` ${address.streetNumber}`;
  if (line) parts.push(line);

  let cityLine = address.city ?? "";
  if (address.postalCode) cityLine = cityLine ? `${cityLine} (${address.postalCode})` : `(${address.postalCode})`;
  if (address.province) cityLine = cityLine ? `${cityLine} - ${address.province}` : address.province;
  if (cityLine) parts.push(cityLine);

  if (address.country && address.country !== "Italia") parts.push(address.country);

  return parts.join(", ");
}

export function googleMapsUrl(coordinates: GeoCoordinates): string {
  return `https://maps.google.com/?q=${coordinates.latitude},${coordinates.longitude}`;
}

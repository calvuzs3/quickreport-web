// Minimum qreport-server version required by this webapp.
// Bump this when a new Ktor endpoint is added that the webapp depends on.
export const REQUIRED_SERVER_VERSION = "1.3.0";

export type CompatibilityStatus =
  | { ok: true;  version: string }
  | { ok: false; version: string; reason: string }
  | { ok: null;  reason: string }; // unknown — endpoint missing or Ktor unreachable

// Parses "major.minor.patch" into [major, minor, patch].
// Returns null for malformed strings.
function parse(v: string): [number, number, number] | null {
  const parts = v.trim().split(".").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return parts as [number, number, number];
}

// Returns true if `actual` satisfies `>= required` (semver, major.minor.patch).
export function meetsMinimum(actual: string, required: string): boolean {
  const a = parse(actual);
  const r = parse(required);
  if (!a || !r) return false;
  if (a[0] !== r[0]) return a[0] > r[0];
  if (a[1] !== r[1]) return a[1] > r[1];
  return a[2] >= r[2];
}

export function checkCompatibility(serverVersion: string | null, error?: string): CompatibilityStatus {
  if (!serverVersion) {
    return { ok: null, reason: error ?? "Impossibile ottenere la versione del server." };
  }
  if (!meetsMinimum(serverVersion, REQUIRED_SERVER_VERSION)) {
    return {
      ok: false,
      version: serverVersion,
      reason: `qreport-server v${serverVersion} non è compatibile. Versione minima richiesta: v${REQUIRED_SERVER_VERSION}.`,
    };
  }
  return { ok: true, version: serverVersion };
}

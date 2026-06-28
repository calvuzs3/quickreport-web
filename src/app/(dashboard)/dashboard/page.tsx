import { getClients, getFacilities, getIslands, getContacts, getServerVersion } from "@/lib/api";
import { checkCompatibility, REQUIRED_SERVER_VERSION } from "@/lib/compat";
import Link from "next/link";

async function StatCard({
  label, value, href, color,
}: {
  label: string; value: number; href: string; color: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="card" style={{ borderLeft: `4px solid ${color}`, cursor: "pointer" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginTop: 4 }}>{label}</div>
      </div>
    </Link>
  );
}

function CompatibilityBanner({ serverVersion }: { serverVersion: string | null }) {
  const status = checkCompatibility(serverVersion);

  if (status.ok === true) return null;

  const isError = status.ok === false;
  const bg    = isError ? "#fee2e2" : "#fefce8";
  const color = isError ? "var(--color-danger)" : "#854d0e";
  const border = isError ? "#fca5a5" : "#fde68a";
  const icon  = isError ? "⚠️" : "ℹ️";

  return (
    <div style={{
      background: bg, color, border: `1px solid ${border}`,
      borderRadius: "var(--radius)", padding: "12px 16px",
      marginBottom: 24, fontSize: 13, display: "flex", gap: 10, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div>
        <strong style={{ display: "block", marginBottom: 2 }}>
          {isError ? "Incompatibilità rilevata" : "Versione server sconosciuta"}
        </strong>
        <span>{status.reason}</span>
        {status.ok === null && (
          <span style={{ display: "block", marginTop: 4, opacity: 0.8 }}>
            Assicurarsi che qreport-server esponga{" "}
            <code style={{ fontFamily: "monospace", fontSize: 12 }}>GET /api/version</code>{" "}
            e che la versione sia ≥ {REQUIRED_SERVER_VERSION}.
          </span>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [clients, facilities, islands, contacts, serverVersion] = await Promise.allSettled([
    getClients(), getFacilities(), getIslands(), getContacts(), getServerVersion(),
  ]);

  const count = (r: PromiseSettledResult<{ total: number }>) =>
    r.status === "fulfilled" ? r.value.total : 0;

  const version = serverVersion.status === "fulfilled" ? serverVersion.value : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Panoramica del sistema QReport</p>
        </div>
        {version && (
          <span style={{ fontSize: 12, color: "var(--color-text-muted)", alignSelf: "flex-end" }}>
            Server: v{version}
          </span>
        )}
      </div>

      <CompatibilityBanner serverVersion={version} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 16, marginBottom: 32,
      }}>
        <StatCard label="Clienti" value={count(clients)} href="/clients" color="var(--color-primary)" />
        <StatCard label="Stabilimenti" value={count(facilities)} href="/facilities" color="#7c3aed" />
        <StatCard label="Isole robotizzate" value={count(islands)} href="/islands" color="var(--color-accent)" />
        <StatCard label="Contatti" value={count(contacts)} href="/contacts" color="var(--color-success)" />
      </div>

      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Azioni rapide</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Link href="/clients/new" className="btn btn-primary btn-sm">+ Nuovo cliente</Link>
          <Link href="/facilities/new" className="btn btn-secondary btn-sm">+ Nuovo stabilimento</Link>
          <Link href="/islands/new" className="btn btn-secondary btn-sm">+ Nuova isola</Link>
          <Link href="/contacts/new" className="btn btn-secondary btn-sm">+ Nuovo contatto</Link>
          <Link href="/contracts/new" className="btn btn-secondary btn-sm">+ Nuovo contratto</Link>
        </div>
      </div>
    </div>
  );
}

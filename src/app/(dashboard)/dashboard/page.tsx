import { getClients, getFacilities, getIslands, getContacts } from "@/lib/api";
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

export default async function DashboardPage() {
  const [clients, facilities, islands, contacts] = await Promise.allSettled([
    getClients(), getFacilities(), getIslands(), getContacts(),
  ]);

  const count = (r: PromiseSettledResult<{ total: number }>) =>
    r.status === "fulfilled" ? r.value.total : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Panoramica del sistema QReport</p>
        </div>
      </div>

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
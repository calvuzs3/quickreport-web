import { getClient, getFacilities, getContacts, getContracts, getCheckups } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let client, facilities, contacts, contracts;
  try {
    [client, facilities, contacts, contracts] = await Promise.all([
      getClient(id), getFacilities(id), getContacts(id), getContracts(id),
    ]);
  } catch { notFound(); }

  const checkups = await getCheckups(id).catch(() => ({ data: [] }));
  if (client.is_deleted) notFound();

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/clients" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Clienti</Link>
          <h1 className="page-title">{client.company_name}</h1>
          <p className="page-subtitle">
            <span className={`badge ${client.is_active ? "badge-green" : "badge-red"}`}>
              {client.is_active ? "Attivo" : "Inattivo"}
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/clients/${id}/edit`} className="btn btn-secondary">Modifica</Link>
          <DeleteButton id={id} name={client.company_name} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Informazioni</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Note" value={client.notes} />
            <InfoRow label="Creato" value={formatDate(client.created_at)} />
            <InfoRow label="Ultima modifica" value={formatDate(client.updated_at)} />
          </dl>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Contratti ({contracts.data.length})</h2>
            <Link href={`/contracts/new?clientId=${id}`} className="btn btn-secondary btn-sm">+ Aggiungi</Link>
          </div>
          {contracts.data.filter(c => !c.is_deleted).map(c => (
            <Link key={c.id} href={`/contracts/${c.id}`} style={{ display: "block", padding: "8px 0", borderBottom: "1px solid var(--color-border)", color: "inherit" }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name ?? "Contratto senza nome"}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {formatDate(c.start_date)} → {formatDate(c.end_date)}
              </div>
            </Link>
          ))}
          {contracts.data.length === 0 && <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Nessun contratto</p>}
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Stabilimenti ({facilities.data.length})</h2>
            <Link href={`/facilities/new?clientId=${id}`} className="btn btn-secondary btn-sm">+ Aggiungi</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {facilities.data.filter(f => !f.is_deleted).map(f => (
              <Link key={f.id} href={`/facilities/${f.id}`} className="card" style={{ cursor: "pointer" }}>
                <div style={{ fontWeight: 500 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{f.facility_type}</div>
              </Link>
            ))}
            {facilities.data.length === 0 && <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Nessuno stabilimento</p>}
          </div>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600 }}>Contatti ({contacts.data.length})</h2>
            <Link href={`/contacts/new?clientId=${id}`} className="btn btn-secondary btn-sm">+ Aggiungi</Link>
          </div>
          <table><thead><tr><th>Nome</th><th>Ruolo</th><th>Email</th><th>Telefono</th><th></th></tr></thead>
            <tbody>
              {contacts.data.filter(c => !c.is_deleted).map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.first_name} {c.last_name}</td>
                  <td style={{ color: "var(--color-text-muted)" }}>{c.role ?? "—"}</td>
                  <td>{c.email ?? "—"}</td>
                  <td>{c.mobile_phone ?? c.phone ?? "—"}</td>
                  <td><Link href={`/contacts/${c.id}`} className="btn btn-secondary btn-sm">Dettagli</Link></td>
                </tr>
              ))}
              {contacts.data.length === 0 && <tr><td colSpan={5} style={{ color: "var(--color-text-muted)" }}>Nessun contatto</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
            Checkup ({checkups?.data.filter(c => !c.is_deleted).length ?? 0})
          </h2>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tecnico</th>
                <th>Isola (S/N)</th>
                <th>Tipo isola</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              {checkups?.data.filter(c => !c.is_deleted).map(c => (
                <tr key={c.id}>
                  <td>{formatDate(c.checkup_date)}</td>
                  <td>{c.technician_name || "—"}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{c.island_serial_number || "—"}</td>
                  <td>{c.island_type || "—"}</td>
                  <td>
                    <span className={`badge ${c.status === "COMPLETED" ? "badge-green" : c.status === "DRAFT" ? "badge-orange" : "badge-blue"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!checkups || checkups.data.length === 0) && (
                <tr><td colSpan={5} style={{ color: "var(--color-text-muted)" }}>Nessun checkup sincronizzato</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <dt style={{ fontSize: 12, color: "var(--color-text-muted)", width: 120, flexShrink: 0 }}>{label}</dt>
      <dd style={{ fontSize: 13 }}>{value ?? "—"}</dd>
    </div>
  );
}
import { getContract, getClient } from "@/lib/api";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import DeleteButton from "./DeleteButton";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let contract, client;
  try {
    contract = await getContract(id);
    client = await getClient(contract.client_id).catch(() => null);
  } catch { notFound(); }
  if (contract.is_deleted) notFound();

  const now = Date.now();
  const isExpired = contract.end_date < now;
  const isExpiringSoon = !isExpired && contract.end_date - now < 30 * 24 * 60 * 60 * 1000;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/contracts" style={{ color: "var(--color-text-muted)", fontSize: 13 }}>← Contratti</Link>
          <h1 className="page-title" style={{ marginTop: 4 }}>{contract.name ?? "Contratto senza nome"}</h1>
          <p className="page-subtitle" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {isExpired && <span className="badge badge-red">Scaduto</span>}
            {isExpiringSoon && <span className="badge badge-orange">In scadenza</span>}
            {!isExpired && !isExpiringSoon && (
              <span className={`badge ${contract.is_active ? "badge-green" : "badge-red"}`}>
                {contract.is_active ? "Attivo" : "Inattivo"}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/contracts/${id}/edit`} className="btn btn-secondary">Modifica</Link>
          <DeleteButton id={id} name={contract.name ?? "contratto"} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Dettagli</h2>
          <dl style={{ display: "grid", gap: 10 }}>
            <InfoRow label="Nome" value={contract.name} />
            <InfoRow label="Descrizione" value={contract.description} />
            <InfoRow label="Data inizio" value={formatDate(contract.start_date)} />
            <InfoRow label="Data scadenza" value={formatDate(contract.end_date)} />
            <InfoRow label="Creato" value={formatDate(contract.created_at)} />
            <InfoRow label="Ultima modifica" value={formatDateTime(contract.updated_at)} />
          </dl>
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Servizi inclusi</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ServiceRow label="Interventi prioritari" active={contract.has_priority} />
            <ServiceRow label="Assistenza remota" active={contract.has_remote_assistance} />
            <ServiceRow label="Manutenzione programmata" active={contract.has_maintenance} />
          </div>
          {contract.notes && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>NOTE</p>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>{contract.notes}</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Cliente</h2>
          {client ? (
            <Link href={`/clients/${client.id}`} style={{
              display: "block", padding: "10px 12px",
              border: "1px solid var(--color-border)", borderRadius: "var(--radius)", color: "inherit",
            }}>
              <div style={{ fontWeight: 500 }}>{client.company_name}</div>
            </Link>
          ) : (
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Cliente non trovato</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <dt style={{ fontSize: 12, color: "var(--color-text-muted)", width: 140, flexShrink: 0 }}>{label}</dt>
      <dd style={{ fontSize: 13 }}>{value ?? "—"}</dd>
    </div>
  );
}

function ServiceRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        background: active ? "var(--color-success)" : "var(--color-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {active && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
      <span style={{ fontSize: 13, color: active ? "var(--color-text)" : "var(--color-text-muted)" }}>{label}</span>
    </div>
  );
}
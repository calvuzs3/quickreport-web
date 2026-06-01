import { getContracts } from "@/lib/api";
import Link from "next/link";
import type { Contract } from "@/types";
import { formatDate } from "@/lib/utils";

export default async function ContractsPage() {
  let items: Contract[] = [];
  let error: string | null = null;
  try {
    const res = await getContracts();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) { error = e instanceof Error ? e.message : "Errore caricamento dati"; }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Contratti</h1>
          <p className="page-subtitle">{items.length} contratti</p>
        </div>
        <Link href="/contracts/new" className="btn btn-primary">+ Nuovo</Link>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Nome</th><th>Inizio</th><th>Scadenza</th><th>Servizi</th><th>Stato</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                Nessun contratto trovato
              </td></tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name ?? "—"}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{formatDate(item.start_date)}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{formatDate(item.end_date)}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {item.has_priority && <span className="badge badge-orange">Priorità</span>}
                    {item.has_remote_assistance && <span className="badge badge-blue">Remoto</span>}
                    {item.has_maintenance && <span className="badge badge-green">Manut.</span>}
                  </div>
                </td>
                <td>
                  <span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
                    {item.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/contracts/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
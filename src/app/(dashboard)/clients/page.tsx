import { getClients } from "@/lib/api";
import Link from "next/link";
import type { Client } from "@/types";

export default async function ClientsPage() {
  let clients: Client[] = [];
  let error: string | null = null;

  try {
    const res = await getClients();
    clients = res.data.filter(c => !c.is_deleted);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento clienti";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clienti</h1>
          <p className="page-subtitle">{clients.length} clienti attivi</p>
        </div>
        <Link href="/clients/new" className="btn btn-primary">+ Nuovo cliente</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ragione sociale</th>
              <th>Stato</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessun cliente trovato
                </td>
              </tr>
            )}
            {clients.map(client => (
              <tr key={client.id}>
                <td style={{ fontWeight: 500 }}>{client.company_name}</td>
                <td>
                  <span className={`badge ${client.is_active ? "badge-green" : "badge-red"}`}>
                    {client.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ color: "var(--color-text-muted)", maxWidth: 280 }}>
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {client.notes ?? "—"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/clients/${client.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { getFacilities } from "@/lib/api";
import Link from "next/link";
import type { Facility } from "@/types";

export default async function FacilitiesPage() {
  let items: Facility[] = [];
  let error: string | null = null;

  try {
    const res = await getFacilities();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento dati";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stabilimenti</h1>
          <p className="page-subtitle">{items.length} stabilimenti</p>
        </div>
        <Link href="/facilities/new" className="btn btn-primary">+ Nuovo</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Nome</th><th>Tipo</th><th>Codice</th><th>Stato</th><th></th></tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                Nessuno stabilimento trovato
              </td></tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{item.facility_type}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{item.code ?? "—"}</td>
                <td>
                  <span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
                    {item.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/facilities/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { getIslands } from "@/lib/api";
import Link from "next/link";
import type { FacilityIsland } from "@/types";

export default async function IslandsPage() {
  let items: FacilityIsland[] = [];
  let error: string | null = null;
  try {
    const res = await getIslands();
    items = res.data.filter(i => !i.is_deleted);
  } catch (e) { error = e instanceof Error ? e.message : "Errore caricamento dati"; }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Isole robotizzate</h1>
          <p className="page-subtitle">{items.length} isole</p>
        </div>
        <Link href="/islands/new" className="btn btn-primary">+ Nuova</Link>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
      <div className="table-wrapper">
        <table>
          <thead><tr><th>Nome / Seriale</th><th>Tipo</th><th>N° Commessa</th><th>Stato</th><th></th></tr></thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                Nessuna isola trovata
              </td></tr>
            )}
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.custom_name ?? item.serial_number}</td>
                <td><span className="badge badge-blue">{item.island_type}</span></td>
                <td style={{ color: "var(--color-text-muted)" }}>{item.commissioning_number ?? "—"}</td>
                <td><span className={`badge ${item.is_active ? "badge-green" : "badge-red"}`}>
                  {item.is_active ? "Attiva" : "Inattiva"}
                </span></td>
                <td style={{ textAlign: "right" }}>
                  <Link href={`/islands/${item.id}`} className="btn btn-secondary btn-sm">Dettagli</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
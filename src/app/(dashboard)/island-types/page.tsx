import { getIslandTypes } from "@/lib/api";
import Link from "next/link";
import type { IslandType } from "@/types";
import ToggleActiveButton from "./ToggleActiveButton";

export default async function IslandTypesPage() {
  let types: IslandType[] = [];
  let error: string | null = null;

  try {
    const res = await getIslandTypes(true);
    types = res.data.filter(t => !t.is_deleted);
  } catch (e) {
    error = e instanceof Error ? e.message : "Errore caricamento tipi isola";
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tipi isola</h1>
          <p className="page-subtitle">{types.length} tipi definiti</p>
        </div>
        <Link href="/island-types/new" className="btn btn-primary">+ Nuovo tipo</Link>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Codice</th>
              <th>Nome</th>
              <th>Intervallo manutenzione</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {types.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--color-text-muted)", padding: 32 }}>
                  Nessun tipo isola trovato
                </td>
              </tr>
            )}
            {types.map(type => (
              <tr key={type.id}>
                <td style={{ fontFamily: "monospace", fontSize: 13 }}>{type.code}</td>
                <td style={{ fontWeight: 500 }}>{type.label}</td>
                <td style={{ color: "var(--color-text-muted)" }}>{type.maintenance_interval_days} giorni</td>
                <td>
                  <span className={`badge ${type.is_active ? "badge-green" : "badge-red"}`}>
                    {type.is_active ? "Attivo" : "Inattivo"}
                  </span>
                </td>
                <td style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <Link href={`/island-types/${type.id}/edit`} className="btn btn-secondary btn-sm">Modifica</Link>
                  <ToggleActiveButton type={type} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
